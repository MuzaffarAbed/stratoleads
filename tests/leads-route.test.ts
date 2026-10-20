import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/leads/route";
import { resetRateLimits } from "@/lib/security/rate-limit";

const submissionId = "4f6d4f0e-4c1b-4e3a-8f1a-6d0e8c2b9a11";

const lead = {
  name: "Alex",
  surname: "Example",
  companyName: "Example Ltd",
  cellNumber: "+27 82 000 0000",
  emailAddress: "alex@example.com",
  productInterest: "STRATOPOD",
  comment: "",
  submissionId,
};

function request(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Host: "localhost:3000",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.LEAD_CAPTURE_ENABLED = "true";
    process.env.GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/test/exec";
    process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET = "server-only-secret";
    process.env.LEAD_SOURCE = "STRATO Convention";
    resetRateLimits();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetRateLimits();
  });

  it("rejects an invalid product and Other without a comment", async () => {
    const unknown = await POST(request({ ...lead, productInterest: "Something else" }));
    expect(unknown.status).toBe(400);
    const missing = await POST(request({ ...lead, productInterest: "Other", comment: "   " }));
    const body = (await missing.json()) as { ok: boolean; fieldErrors?: Record<string, string> };
    expect(missing.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.fieldErrors?.comment).toBeTruthy();
  });

  it("does not report success when the integration fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const response = await POST(request(lead));
    const body = (await response.json()) as { ok: boolean; message: string };
    expect(response.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.message).not.toMatch(/secret|script\.google/i);
  });

  it("reports success only after Apps Script confirms the lead was saved", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const payload = JSON.parse(String(init?.body)) as { secret?: string; submissionId?: string; operation?: string };
      expect(payload.secret).toBe("server-only-secret");
      expect(payload.submissionId).toBe(submissionId);
      expect(payload.operation).toBe("createLead");
      return new Response(
        JSON.stringify({ ok: true, leadSaved: true, duplicate: false }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(lead));
    const body = (await response.json()) as { ok: boolean; outcome: string };
    expect(body.ok).toBe(true);
    expect(body.outcome).toBe("complete");
    expect(JSON.stringify(body)).not.toContain("server-only-secret");
  });

  it("follows the Apps Script redirect and treats a duplicate submission id as saved", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes("script.google.com")) {
        return new Response(null, { status: 302, headers: { Location: "https://script.googleusercontent.com/result" } });
      }
      return new Response(
        JSON.stringify({ ok: true, leadSaved: true, duplicate: true }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(lead));
    const body = (await response.json()) as { ok: boolean; outcome: string };
    expect(body.outcome).toBe("complete");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refuses a cross-site post and a filled honeypot", async () => {
    const crossSite = await POST(request(lead, "https://example.invalid"));
    expect(crossSite.status).toBe(403);
    const honeypot = await POST(request({ ...lead, companyFax: "bot" }));
    expect(honeypot.status).toBe(400);
  });

  it("does not forward leads when capture is disabled", async () => {
    process.env.LEAD_CAPTURE_ENABLED = "false";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request(lead));
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
