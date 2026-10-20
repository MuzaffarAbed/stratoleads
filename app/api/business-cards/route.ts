import { randomUUID } from "node:crypto";

import {
  createCard,
  listCards,
} from "@/lib/integrations/google-apps-script";
import { IntegrationRequestError } from "@/lib/integrations/google-apps-script";
import { requireAdmin } from "@/lib/security/require-admin";
import { parseBusinessCardInput } from "@/lib/validation/business-card";
import { jsonResponse } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const cards = await listCards();
    return jsonResponse({ ok: true, cards });
  } catch (error) {
    console.error("admin_list_cards_failed", {
      reason: error instanceof Error ? error.name : "error",
    });
    return jsonResponse({ ok: false, message: "Business cards could not be loaded." }, 502);
  }
}

export async function POST(request: Request): Promise<Response> {
  const denied = requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "Check the card details and try again." }, 400);
  }

  const parsed = parseBusinessCardInput(body);
  if ("fieldErrors" in parsed) {
    return jsonResponse(
      { ok: false, message: "Check the card details and try again.", fieldErrors: parsed.fieldErrors },
      400,
    );
  }

  try {
    const card = await createCard({ ...parsed.data, id: randomUUID() });
    return jsonResponse({ ok: true, card }, 201);
  } catch (error) {
    return integrationError(error);
  }
}

function integrationError(error: unknown): Response {
  if (error instanceof IntegrationRequestError && error.name === "slug_taken") {
    return jsonResponse(
      {
        ok: false,
        message: "This public link is already in use.",
        fieldErrors: { slug: "This public link is already in use." },
      },
      409,
    );
  }
  console.error("admin_card_write_failed", {
    reason: error instanceof Error ? error.name : "error",
  });
  return jsonResponse({ ok: false, message: "The business card could not be saved." }, 502);
}
