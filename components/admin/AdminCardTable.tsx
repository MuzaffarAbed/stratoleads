"use client";

import type { BusinessCard } from "@/types/business-card";

export function AdminCardTable({
  cards,
  onEdit,
  onDeactivate,
  onActivate,
  onCopy,
  onQr,
}: {
  cards: BusinessCard[];
  onEdit: (card: BusinessCard) => void;
  onDeactivate: (card: BusinessCard) => void;
  onActivate: (card: BusinessCard) => void;
  onCopy: (card: BusinessCard) => void;
  onQr: (card: BusinessCard) => void;
}) {
  if (cards.length === 0) {
    return (
      <p className="glass rounded-3xl border-dashed px-4 py-8 text-sm text-muted">
        No business cards yet. Create the first card to publish a public link.
      </p>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-3xl">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-line bg-page text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-medium text-navy">
                {card.firstName} {card.surname}
              </td>
              <td className="px-4 py-3">{card.jobTitle}</td>
              <td className="px-4 py-3 font-mono text-xs">{card.slug}</td>
              <td className="px-4 py-3">{card.isActive ? "Active" : "Inactive"}</td>
              <td className="px-4 py-3 text-muted">{formatUpdated(card.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="text-navy underline decoration-gold underline-offset-4" onClick={() => onEdit(card)}>
                    Edit
                  </button>
                  {card.isActive ? (
                    <a className="text-navy underline decoration-gold underline-offset-4" href={`/business-cards/${card.slug}`} target="_blank" rel="noreferrer">
                      Preview
                    </a>
                  ) : null}
                  <button type="button" className="text-navy underline decoration-gold underline-offset-4" onClick={() => onCopy(card)}>
                    Copy link
                  </button>
                  <button type="button" className="text-navy underline decoration-gold underline-offset-4" onClick={() => onQr(card)}>
                    QR
                  </button>
                  {card.isActive ? (
                    <button type="button" className="text-danger underline underline-offset-4" onClick={() => onDeactivate(card)}>
                      Deactivate
                    </button>
                  ) : (
                    <button type="button" className="text-navy underline decoration-gold underline-offset-4" onClick={() => onActivate(card)}>
                      Activate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatUpdated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
