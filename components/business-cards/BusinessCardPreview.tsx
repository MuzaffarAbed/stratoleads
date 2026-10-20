import Image from "next/image";

import { Avatar } from "@/components/business-cards/Avatar";
import { ContactAction } from "@/components/business-cards/ContactAction";
import { QrCodePanel } from "@/components/business-cards/QrCodePanel";
import { buttonClass } from "@/components/ui/styles";
import { cardPath } from "@/lib/site";
import { phoneHref } from "@/lib/utils";
import type { PublicBusinessCard } from "@/types/business-card";
import { CardShare } from "@/components/business-cards/CardShare";

export function BusinessCardPreview({
  card,
  qrDataUrl,
  preview = false,
}: {
  card: PublicBusinessCard;
  qrDataUrl?: string;
  preview?: boolean;
}) {
  const vcardHref = `${cardPath(card.slug)}/vcard`;
  const qrHref = `${cardPath(card.slug)}/qr`;

  return (
    <article className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      <div className="h-1.5 bg-teal" />
      <div className="px-6 py-7 text-center">
        <Image
          src="/brand/strato-wordmark.png"
          alt="STRATO"
          width={132}
          height={22}
          className="mx-auto h-5 w-auto"
          style={{ width: "auto", height: "auto" }}
        />
        <div className="mt-6 flex justify-center">
          <Avatar firstName={card.firstName} surname={card.surname} imageUrl={card.profileImageUrl} />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-navy">
          {card.firstName} {card.surname}
        </h2>
        <p className="mt-1 text-sm text-muted">{card.jobTitle}</p>
        <p className="mt-1 text-sm font-medium text-text">{card.companyName}</p>
        {card.location ? <p className="mt-2 text-sm text-muted">{card.location}</p> : null}

        <div className="mt-6">
          {preview ? (
            <p className={`${buttonClass} pointer-events-none`}>Add to contacts</p>
          ) : (
            <a className={buttonClass} href={vcardHref}>
              Add to contacts
            </a>
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <ContactAction href={phoneHref(card.mobilePhone)} label="Call" icon="call" />
          <ContactAction href={`mailto:${card.workEmail}`} label="Email" icon="email" />
          {card.officePhone ? <ContactAction href={phoneHref(card.officePhone)} label="Office" icon="office" /> : null}
          {card.website ? <ContactAction href={card.website} label="Website" icon="website" external /> : null}
          {card.linkedInUrl ? (
            <ContactAction href={card.linkedInUrl} label="LinkedIn" icon="linkedin" external />
          ) : null}
        </div>

        <div className="mt-4">
          <CardShare slug={card.slug} disabled={preview} />
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <QrCodePanel dataUrl={qrDataUrl} downloadHref={preview ? undefined : qrHref} />
        </div>
      </div>
    </article>
  );
}
