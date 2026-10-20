import type { Metadata } from "next";

import { BusinessCardPreview } from "@/components/business-cards/BusinessCardPreview";
import { SiteShell } from "@/components/brand/SiteShell";
import { ErrorState } from "@/components/ui/ErrorState";
import { loadPublicCard } from "@/lib/cards";
import { cardQrDataUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadPublicCard(slug);
  if (loaded.status !== "ok" || !loaded.data) {
    return { title: "Card unavailable" };
  }
  const card = loaded.data;
  return {
    title: `${card.firstName} ${card.surname}`,
    description: `${card.jobTitle}, ${card.companyName}`,
  };
}

export default async function BusinessCardPage({ params }: PageProps) {
  const { slug } = await params;
  const loaded = await loadPublicCard(slug);

  return (
    <SiteShell label="Digital card" compactFooter>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {loaded.status === "unavailable" ? (
          <ErrorState
            title="This card could not be loaded"
            body="Please try again shortly. If you scanned a QR code, ask the STRATO representative to confirm the card is published."
          />
        ) : loaded.data ? (
          <BusinessCardPreview card={loaded.data} qrDataUrl={await cardQrDataUrl(loaded.data.slug)} />
        ) : (
          <ErrorState
            title="This digital card is unavailable"
            body="The card may be unpublished or the link may be incorrect."
          />
        )}
      </section>
    </SiteShell>
  );
}
