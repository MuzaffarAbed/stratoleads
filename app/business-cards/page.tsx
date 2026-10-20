import type { Metadata } from "next";

import { BusinessCardTile } from "@/components/business-cards/BusinessCardTile";
import { SiteShell } from "@/components/brand/SiteShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { loadPublicCards } from "@/lib/cards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital business cards",
  description: "Connect with the STRATO team.",
};

export default async function BusinessCardsPage() {
  const loaded = await loadPublicCards();

  return (
    <SiteShell label="Digital business cards">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium tracking-[0.08em] text-teal-deep uppercase">STRATO IT Group</p>
        <h1 className="mt-3 max-w-xl text-[clamp(2rem,1.4rem+2vw,3.25rem)] font-light leading-[1.1] tracking-[-0.035em] text-ink">
          Connect with the STRATO team.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted">
          Open a digital card to call, email, or save a contact on your phone.
        </p>
        <div className="mt-8">
          {loaded.status === "unavailable" ? (
            <ErrorState
              title="Cards are unavailable"
              body="Digital business cards cannot be loaded right now. Please try again shortly, or speak to a STRATO representative at the booth."
            />
          ) : loaded.data.length === 0 ? (
            <EmptyState
              title="No digital cards are published yet"
              body="Cards will appear here once an administrator publishes them. Public visitors cannot manage cards from this page."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {loaded.data.map((card) => (
                <BusinessCardTile key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
