import { afterEach, describe, expect, it } from "vitest";

import { classifyLeadResult } from "@/lib/leads";
import { consumeRateLimit, resetRateLimits } from "@/lib/security/rate-limit";
import {
  createSessionToken,
  hashAdminPassword,
  verifyAdminPassword,
  verifySessionToken,
} from "@/lib/security/admin-session";

describe("lead outcomes and abuse controls", () => {
  afterEach(() => {
    resetRateLimits();
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("treats a saved sheet row as complete, including a duplicate submission id", () => {
    expect(classifyLeadResult({ leadSaved: true, duplicate: false })).toBe("complete");
    expect(classifyLeadResult({ leadSaved: true, duplicate: true })).toBe("complete");
    expect(classifyLeadResult({ leadSaved: false, duplicate: false })).toBe("failed");
  });

  it("blocks only after the configured number of attempts", () => {
    expect(consumeRateLimit("login:test", 2, 1000, 0)).toBe(true);
    expect(consumeRateLimit("login:test", 2, 1000, 10)).toBe(true);
    expect(consumeRateLimit("login:test", 2, 1000, 20)).toBe(false);
    expect(consumeRateLimit("login:test", 2, 1000, 2000)).toBe(true);
  });

  it("verifies a hashed password and a signed session, and rejects tampering", () => {
    process.env.ADMIN_PASSWORD_HASH = hashAdminPassword("correct-horse");
    process.env.ADMIN_SESSION_SECRET = "test-session-secret-that-is-long-enough";
    expect(verifyAdminPassword("correct-horse")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);

    const token = createSessionToken(1_000);
    expect(verifySessionToken(token, 1_000)).toBe(true);
    expect(verifySessionToken(token, 1_000 + 60 * 60 * 13 * 1000)).toBe(false);
    expect(verifySessionToken(`${token}x`, 1_000)).toBe(false);
    const [payload, signature] = token.split(".");
    expect(verifySessionToken(`${payload}.${signature?.slice(0, -1)}a`, 1_000)).toBe(false);
  });
});
