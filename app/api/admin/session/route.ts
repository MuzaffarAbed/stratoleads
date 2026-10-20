import {
  AdminAuthConfigError,
  clearSessionCookie,
  createSessionToken,
  hasAdminSession,
  sessionCookie,
  verifyAdminPassword,
  adminAuthConfigured,
} from "@/lib/security/admin-session";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/site";
import { clientIp, jsonResponse } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return jsonResponse({ ok: true, authenticated: hasAdminSession(request) });
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return jsonResponse({ ok: false, message: "Sign-in failed." }, 403);
  }

  const ip = clientIp(request);
  if (!consumeRateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return jsonResponse({ ok: false, message: "Too many sign-in attempts. Please wait and try again." }, 429);
  }

  if (!adminAuthConfigured()) {
    return jsonResponse({ ok: false, message: "Administrator sign-in is not configured." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "Sign-in failed." }, 400);
  }

  const password = body && typeof body === "object" && "password" in body ? String((body as { password?: unknown }).password ?? "") : "";
  let valid = false;
  try {
    valid = verifyAdminPassword(password);
  } catch (error) {
    if (error instanceof AdminAuthConfigError) {
      return jsonResponse({ ok: false, message: "Administrator sign-in is not configured." }, 503);
    }
    return jsonResponse({ ok: false, message: "Sign-in failed." }, 401);
  }

  if (!valid) {
    return jsonResponse({ ok: false, message: "Sign-in failed." }, 401);
  }

  try {
    const token = createSessionToken();
    return jsonResponse(
      { ok: true, authenticated: true },
      200,
      { "Set-Cookie": sessionCookie(token) },
    );
  } catch (error) {
    if (error instanceof AdminAuthConfigError) {
      return jsonResponse({ ok: false, message: "Administrator sign-in is not configured." }, 503);
    }
    return jsonResponse({ ok: false, message: "Sign-in failed." }, 500);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return jsonResponse({ ok: false, message: "Unauthorised" }, 403);
  }
  return jsonResponse({ ok: true, authenticated: false }, 200, {
    "Set-Cookie": clearSessionCookie(),
  });
}
