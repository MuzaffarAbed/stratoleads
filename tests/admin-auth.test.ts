import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as listCards, POST as createCard } from "@/app/api/business-cards/route";
import { DELETE as deactivateCard } from "@/app/api/business-cards/[id]/route";
import { POST as signIn } from "@/app/api/admin/session/route";
import { createSessionToken, hashAdminPassword } from "@/lib/security/admin-session";
import { resetRateLimits } from "@/lib/security/rate-limit";

function adminRequest(path: string, method: string, token?: string, body?: unknown) {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
      ...(token ? { Cookie: `strato_admin=${encodeURIComponent(token)}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("admin authorisation", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.ADMIN_SESSION_SECRET = "test-session-secret-that-is-long-enough";
    process.env.ADMIN_PASSWORD_HASH = hashAdminPassword("correct-horse");
    process.env.GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/test/exec";
    process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET = "server-only-secret";
    resetRateLimits();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetRateLimits();
  });

  it("rejects unauthenticated card reads and writes before calling Apps Script", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const listed = await listCards(adminRequest("/api/business-cards", "GET"));
    const created = await createCard(adminRequest("/api/business-cards", "POST", undefined, { firstName: "A" }));
    const removed = await deactivateCard(adminRequest("/api/business-cards/card-1", "DELETE"), {
      params: Promise.resolve({ id: "card-1" }),
    });
    expect(listed.status).toBe(401);
    expect(created.status).toBe(401);
    expect(removed.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows a valid session to list cards and keeps the shared secret out of the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        const payload = JSON.parse(String(init?.body)) as { secret?: string; operation?: string };
        expect(payload.secret).toBe("server-only-secret");
        expect(payload.operation).toBe("adminListCards");
        return new Response(JSON.stringify({ ok: true, cards: [] }), { status: 200 });
      }),
    );
    const token = createSessionToken();
    const response = await listCards(adminRequest("/api/business-cards", "GET", token));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(JSON.stringify(body)).not.toContain("server-only-secret");
  });

  it("rejects a wrong password without a session cookie", async () => {
    const response = await signIn(adminRequest("/api/admin/session", "POST", undefined, { password: "wrong-password" }));
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("sets an HttpOnly session cookie after the correct password", async () => {
    const response = await signIn(
      adminRequest("/api/admin/session", "POST", undefined, { password: "correct-horse" }),
    );
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") || "";
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toContain("correct-horse");
  });
});
