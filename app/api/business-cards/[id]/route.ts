import {
  deactivateCard,
  updateCard,
} from "@/lib/integrations/google-apps-script";
import { IntegrationRequestError } from "@/lib/integrations/google-apps-script";
import { requireAdmin } from "@/lib/security/require-admin";
import { parseBusinessCardInput } from "@/lib/validation/business-card";
import { jsonResponse } from "@/lib/utils";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!id || id.length > 80) {
    return jsonResponse({ ok: false, message: "The business card could not be saved." }, 400);
  }

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
    const card = await updateCard({ ...parsed.data, id });
    return jsonResponse({ ok: true, card });
  } catch (error) {
    return integrationError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  if (!id || id.length > 80) {
    return jsonResponse({ ok: false, message: "The business card could not be updated." }, 400);
  }

  try {
    const card = await deactivateCard(id);
    return jsonResponse({ ok: true, card });
  } catch (error) {
    console.error("admin_card_deactivate_failed", {
      reason: error instanceof Error ? error.name : "error",
    });
    return jsonResponse({ ok: false, message: "The business card could not be deactivated." }, 502);
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
