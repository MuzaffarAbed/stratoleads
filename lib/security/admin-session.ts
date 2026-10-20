import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "strato_admin";
const SESSION_VERSION = 1;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export class AdminAuthConfigError extends Error {
  constructor() {
    super("Administrator sign-in is not configured");
    this.name = "AdminAuthConfigError";
  }
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "";
  if (secret.length < 32) {
    throw new AdminAuthConfigError();
  }
  return secret;
}

export function hashAdminPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyAdminPassword(password: string): boolean {
  if (!password || password.length > 200) return false;
  const stored = process.env.ADMIN_PASSWORD_HASH?.trim() || "";
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt" || !parts[1] || !parts[2]) {
    return false;
  }

  const expected = Buffer.from(parts[2], "hex");
  if (expected.length !== 64) return false;

  const actual = scryptSync(password, parts[1], 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function adminAuthConfigured(): boolean {
  try {
    sessionSecret();
  } catch {
    return false;
  }
  const stored = process.env.ADMIN_PASSWORD_HASH?.trim() || "";
  return stored.startsWith("scrypt:") && stored.split(":").length === 3;
}

export function createSessionToken(now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({
      v: SESSION_VERSION,
      exp: now + SESSION_MAX_AGE_SECONDS * 1000,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "";
  if (secret.length < 32) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      v?: number;
      exp?: number;
    };
    return parsed.v === SESSION_VERSION && typeof parsed.exp === "number" && parsed.exp > now;
  } catch {
    return false;
  }
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return undefined;
}

export function hasAdminSession(request: Request): boolean {
  return verifySessionToken(readCookie(request, ADMIN_COOKIE));
}

function secureAttribute(): string {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}

export function sessionCookie(token: string): string {
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secureAttribute()}`;
}

export function clearSessionCookie(): string {
  return `${ADMIN_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureAttribute()}`;
}
