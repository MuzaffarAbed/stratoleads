import type { PublicBusinessCard } from "@/types/business-card";

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldLine(line: string): string {
  if (Buffer.byteLength(line) <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

export function buildVCard(card: PublicBusinessCard): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(card.surname)};${escapeVCard(card.firstName)};;;`,
    `FN:${escapeVCard(`${card.firstName} ${card.surname}`)}`,
    `ORG:${escapeVCard(card.companyName)}`,
    `TITLE:${escapeVCard(card.jobTitle)}`,
    `EMAIL;TYPE=INTERNET;TYPE=WORK:${escapeVCard(card.workEmail)}`,
    `TEL;TYPE=CELL:${escapeVCard(card.mobilePhone)}`,
  ];

  if (card.officePhone) lines.push(`TEL;TYPE=WORK:${escapeVCard(card.officePhone)}`);
  if (card.website) lines.push(`URL:${escapeVCard(card.website)}`);
  if (card.linkedInUrl) lines.push(`URL;TYPE=LinkedIn:${escapeVCard(card.linkedInUrl)}`);
  if (card.location) lines.push(`NOTE:${escapeVCard(`Location: ${card.location}`)}`);
  if (card.profileImageUrl) lines.push(`PHOTO;VALUE=URI:${escapeVCard(card.profileImageUrl)}`);

  lines.push("END:VCARD");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function vCardFileName(slug: string): string {
  return `${slug.replace(/[^a-z0-9-]/gi, "") || "contact"}.vcf`;
}
