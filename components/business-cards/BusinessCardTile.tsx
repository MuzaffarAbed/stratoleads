import Link from "next/link";

import { Avatar } from "@/components/business-cards/Avatar";
import { cardPath } from "@/lib/site";
import type { PublicBusinessCard } from "@/types/business-card";

export function BusinessCardTile({ card }: { card: PublicBusinessCard }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <Avatar
          firstName={card.firstName}
          surname={card.surname}
          imageUrl={card.profileImageUrl}
          size="sm"
        />
        <div>
          <h2 className="text-lg font-semibold text-navy">
            {card.firstName} {card.surname}
          </h2>
          <p className="text-sm text-muted">{card.jobTitle}</p>
        </div>
      </div>
      <Link
        href={cardPath(card.slug)}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-line bg-white text-sm font-medium text-ink hover:bg-surface"
      >
        View digital card
      </Link>
    </article>
  );
}
