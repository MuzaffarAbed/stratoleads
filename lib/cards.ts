import "server-only";

import {
  getPublicCard as fetchPublicCard,
  IntegrationConfigError,
  listPublicCards,
} from "@/lib/integrations/google-apps-script";
import type { PublicBusinessCard } from "@/types/business-card";

export type CardLoadResult<T> =
  | { status: "ok"; data: T }
  | { status: "unavailable" };

export async function loadPublicCards(): Promise<CardLoadResult<PublicBusinessCard[]>> {
  try {
    const cards = await listPublicCards();
    return { status: "ok", data: cards };
  } catch (error) {
    if (!(error instanceof IntegrationConfigError)) {
      console.error("public_cards_unavailable", {
        reason: error instanceof Error ? error.name : "error",
      });
    }
    return { status: "unavailable" };
  }
}

export async function loadPublicCard(slug: string): Promise<CardLoadResult<PublicBusinessCard | null>> {
  try {
    const card = await fetchPublicCard(slug);
    return { status: "ok", data: card };
  } catch (error) {
    if (!(error instanceof IntegrationConfigError)) {
      console.error("public_card_unavailable", {
        reason: error instanceof Error ? error.name : "error",
      });
    }
    return { status: "unavailable" };
  }
}
