import { z } from "zod";

import { COMPANY_DEFAULT } from "@/lib/constants";
import { collapseWhitespace, digitsOnly } from "@/lib/utils";
import type { BusinessCard, BusinessCardInput, PublicBusinessCard } from "@/types/business-card";

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter a ${label}.`)
    .max(max, `${label} is too long.`)
    .transform(collapseWhitespace);

const phoneSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(7, `Enter a valid ${label}.`)
    .max(32, `Enter a valid ${label}.`)
    .refine((value) => /^\+?[0-9][0-9\s().-]*$/.test(value), `Enter a valid ${label}.`)
    .refine((value) => {
      const count = digitsOnly(value).length;
      return count >= 7 && count <= 15;
    }, `Enter a valid ${label}.`)
    .transform(collapseWhitespace);

const optionalPhone = z
  .string()
  .trim()
  .max(32)
  .refine((value) => {
    if (value === "") return true;
    if (!/^\+?[0-9][0-9\s().-]*$/.test(value)) return false;
    const count = digitsOnly(value).length;
    return count >= 7 && count <= 15;
  }, "Enter a valid office phone or leave it blank.")
  .transform((value) => (value === "" ? undefined : collapseWhitespace(value)));

const optionalHttps = (label: string) =>
  z
    .string()
    .trim()
    .max(400, `${label} is too long.`)
    .refine((value) => value === "" || /^https:\/\/[^\s]+$/i.test(value), `Enter a valid https link for ${label}, or leave it blank.`)
    .transform((value) => (value === "" ? undefined : value));

const optionalLinkedIn = z
  .string()
  .trim()
  .max(400)
  .refine((value) => {
    if (value === "") return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && /(^|\.)linkedin\.com$/i.test(url.hostname);
    } catch {
      return false;
    }
  }, "Enter a valid https LinkedIn profile URL, or leave it blank.")
  .transform((value) => (value === "" ? undefined : value));

export const businessCardInputSchema = z.object({
  firstName: requiredText("first name", 80),
  surname: requiredText("surname", 80),
  jobTitle: requiredText("job title", 120),
  companyName: z
    .string()
    .trim()
    .min(1, "Enter a company name.")
    .max(160)
    .transform(collapseWhitespace)
    .default(COMPANY_DEFAULT),
  workEmail: z
    .string()
    .trim()
    .min(1, "Enter a work email.")
    .max(254)
    .email("Enter a valid work email.")
    .transform((value) => value.toLowerCase()),
  mobilePhone: phoneSchema("mobile phone"),
  officePhone: optionalPhone.optional().default(""),
  website: optionalHttps("website").optional().default(""),
  linkedInUrl: optionalLinkedIn.optional().default(""),
  location: z
    .string()
    .trim()
    .max(160, "Location is too long.")
    .optional()
    .default("")
    .transform((value) => (value === "" ? undefined : collapseWhitespace(value))),
  profileImageUrl: optionalHttps("profile image").optional().default(""),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter a public link name.")
    .max(80, "Public link name is too long.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens."),
  isActive: z.boolean({ error: "Choose whether this card is active." }),
});

export const businessCardSchema = businessCardInputSchema.and(
  z.object({
    id: z.string().trim().min(1).max(80),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
  }),
);

export function parseBusinessCardInput(
  input: unknown,
): { data: BusinessCardInput } | { fieldErrors: Record<string, string> } {
  const parsed = businessCardInputSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  return { data: parsed.data };
}

export function parseBusinessCard(input: unknown): BusinessCard | null {
  const normalized = normalizeCardRecord(input);
  const parsed = businessCardSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

export function parsePublicCard(input: unknown): PublicBusinessCard | null {
  const normalized = normalizeCardRecord(input);
  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) return null;
  const record = normalized as Record<string, unknown>;
  const parsed = businessCardInputSchema.safeParse(record);
  const id = typeof record.id === "string" ? record.id.trim() : "";
  if (!parsed.success || !parsed.data.isActive || !id) return null;
  return {
    id,
    slug: parsed.data.slug,
    firstName: parsed.data.firstName,
    surname: parsed.data.surname,
    jobTitle: parsed.data.jobTitle,
    companyName: parsed.data.companyName,
    workEmail: parsed.data.workEmail,
    mobilePhone: parsed.data.mobilePhone,
    officePhone: parsed.data.officePhone,
    website: parsed.data.website,
    linkedInUrl: parsed.data.linkedInUrl,
    location: parsed.data.location,
    profileImageUrl: parsed.data.profileImageUrl,
  };
}

export function toPublicCard(card: BusinessCard): PublicBusinessCard | null {
  if (!card.isActive) return null;
  return {
    id: card.id,
    slug: card.slug,
    firstName: card.firstName,
    surname: card.surname,
    jobTitle: card.jobTitle,
    companyName: card.companyName,
    workEmail: card.workEmail,
    mobilePhone: card.mobilePhone,
    officePhone: card.officePhone,
    website: card.website,
    linkedInUrl: card.linkedInUrl,
    location: card.location,
    profileImageUrl: card.profileImageUrl,
  };
}

export function visiblePublicCards(cards: BusinessCard[]): PublicBusinessCard[] {
  return cards.flatMap((card) => {
    const pub = toPublicCard(card);
    return pub ? [pub] : [];
  });
}

function normalizeCardRecord(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const record = input as Record<string, unknown>;
  return {
    ...record,
    isActive: record.isActive === true || String(record.isActive).toLowerCase() === "true",
    officePhone: record.officePhone ?? "",
    website: record.website ?? "",
    linkedInUrl: record.linkedInUrl ?? "",
    location: record.location ?? "",
    profileImageUrl: record.profileImageUrl ?? "",
    companyName: record.companyName || COMPANY_DEFAULT,
  };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
