import { randomUUID } from "node:crypto";

import {
  LEAD_DISABLED_MESSAGE,
  LEAD_FAILURE_MESSAGE,
  LEAD_SUCCESS_MESSAGE,
  VALIDATION_MESSAGE,
} from "@/lib/constants";
import {
  createLead,
  IntegrationConfigError,
  IntegrationRequestError,
  leadCaptureEnabled,
} from "@/lib/integrations/google-apps-script";
import { classifyLeadResult } from "@/lib/leads";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/site";
import { parseLeadRequest } from "@/lib/validation/lead";
import { clientIp, jsonResponse } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_BODY_CHARS = 20_000;

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return jsonResponse({ ok: false, message: LEAD_FAILURE_MESSAGE }, 403);
  }

  if (!consumeRateLimit(`lead:${clientIp(request)}`, 40, 10 * 60 * 1000)) {
    return jsonResponse(
      { ok: false, message: "Too many submissions from this network. Please wait a few minutes and try again." },
      429,
    );
  }

  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) {
    return jsonResponse({ ok: false, message: LEAD_FAILURE_MESSAGE }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonResponse({ ok: false, message: VALIDATION_MESSAGE }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ ok: false, message: VALIDATION_MESSAGE }, 400);
  }

  const honeypot = "companyFax" in body ? String((body as { companyFax?: unknown }).companyFax ?? "") : "";
  if (honeypot.trim() !== "") {
    return jsonResponse({ ok: false, message: VALIDATION_MESSAGE }, 400);
  }

  const parsed = parseLeadRequest(body);
  if ("fieldErrors" in parsed) {
    return jsonResponse(
      { ok: false, message: VALIDATION_MESSAGE, fieldErrors: parsed.fieldErrors },
      400,
    );
  }

  if (!leadCaptureEnabled()) {
    return jsonResponse({ ok: false, message: LEAD_DISABLED_MESSAGE }, 503);
  }

  try {
    const result = await createLead(parsed.data);
    const outcome = classifyLeadResult(result);
    if (outcome === "failed") {
      return jsonResponse({ ok: false, outcome, message: LEAD_FAILURE_MESSAGE }, 502);
    }
    return jsonResponse({ ok: true, outcome, message: LEAD_SUCCESS_MESSAGE });
  } catch (error) {
    if (error instanceof IntegrationConfigError) {
      return jsonResponse({ ok: false, message: LEAD_DISABLED_MESSAGE }, 503);
    }
    console.error("lead_submit_failed", {
      reason: error instanceof IntegrationRequestError ? error.name : "error",
      submissionId: parsed.data.submissionId || randomUUID(),
    });
    return jsonResponse({ ok: false, message: LEAD_FAILURE_MESSAGE }, 502);
  }
}
