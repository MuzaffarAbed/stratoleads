"use client";

import { useMemo, useState } from "react";

import { BusinessCardPreview } from "@/components/business-cards/BusinessCardPreview";
import { FormField } from "@/components/lead-form/FormField";
import { solidControlClass } from "@/components/ui/styles";
import { COMPANY_DEFAULT } from "@/lib/constants";
import { slugifyName } from "@/lib/utils";
import { businessCardInputSchema } from "@/lib/validation/business-card";
import type { BusinessCard, BusinessCardInput, PublicBusinessCard } from "@/types/business-card";

export type EditorValues = {
  firstName: string;
  surname: string;
  jobTitle: string;
  companyName: string;
  workEmail: string;
  mobilePhone: string;
  officePhone: string;
  website: string;
  linkedInUrl: string;
  location: string;
  profileImageUrl: string;
  slug: string;
  isActive: boolean;
};

export const emptyEditorValues: EditorValues = {
  firstName: "",
  surname: "",
  jobTitle: "",
  companyName: COMPANY_DEFAULT,
  workEmail: "",
  mobilePhone: "",
  officePhone: "",
  website: "",
  linkedInUrl: "",
  location: "",
  profileImageUrl: "",
  slug: "",
  isActive: true,
};

export function valuesFromCard(card: BusinessCard): EditorValues {
  return {
    firstName: card.firstName,
    surname: card.surname,
    jobTitle: card.jobTitle,
    companyName: card.companyName,
    workEmail: card.workEmail,
    mobilePhone: card.mobilePhone,
    officePhone: card.officePhone || "",
    website: card.website || "",
    linkedInUrl: card.linkedInUrl || "",
    location: card.location || "",
    profileImageUrl: card.profileImageUrl || "",
    slug: card.slug,
    isActive: card.isActive,
  };
}

export function BusinessCardEditor({
  initial,
  mode,
  pending,
  serverErrors,
  formError,
  onCancel,
  onSubmit,
}: {
  initial: EditorValues;
  mode: "create" | "edit";
  pending: boolean;
  serverErrors: Record<string, string>;
  formError: string;
  onCancel: () => void;
  onSubmit: (values: BusinessCardInput) => void;
}) {
  const [values, setValues] = useState<EditorValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mergedErrors = { ...errors, ...serverErrors };

  function update<K extends keyof EditorValues>(key: K, value: EditorValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const preview = useMemo(() => previewCard(values), [values]);
  const slugReady = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug);
  const qrSrc = slugReady ? `/api/admin/qr?slug=${encodeURIComponent(values.slug)}` : undefined;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = businessCardInputSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6" noValidate>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-navy">{mode === "create" ? "New card" : "Edit card"}</h2>
          <button type="button" onClick={onCancel} className="text-sm text-muted underline underline-offset-4">
            Cancel
          </button>
        </div>
        {formError ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {formError}
          </p>
        ) : null}

        <fieldset className="mt-6 space-y-4">
          <legend className="text-sm font-semibold tracking-wide text-navy">Contact details</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="firstName" label="First name" required error={mergedErrors.firstName}>
              <input className={solidControlClass} value={values.firstName} onChange={(event) => update("firstName", event.target.value)} />
            </FormField>
            <FormField id="surname" label="Surname" required error={mergedErrors.surname}>
              <input className={solidControlClass} value={values.surname} onChange={(event) => update("surname", event.target.value)} />
            </FormField>
          </div>
          <FormField id="jobTitle" label="Job title" required error={mergedErrors.jobTitle}>
            <input className={solidControlClass} value={values.jobTitle} onChange={(event) => update("jobTitle", event.target.value)} />
          </FormField>
          <FormField id="companyName" label="Company name" required error={mergedErrors.companyName}>
            <input className={solidControlClass} value={values.companyName} onChange={(event) => update("companyName", event.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="workEmail" label="Work email" required error={mergedErrors.workEmail}>
              <input className={solidControlClass} inputMode="email" value={values.workEmail} onChange={(event) => update("workEmail", event.target.value)} />
            </FormField>
            <FormField id="mobilePhone" label="Mobile phone" required error={mergedErrors.mobilePhone}>
              <input className={solidControlClass} inputMode="tel" value={values.mobilePhone} onChange={(event) => update("mobilePhone", event.target.value)} />
            </FormField>
          </div>
          <FormField id="officePhone" label="Office phone" error={mergedErrors.officePhone}>
            <input className={solidControlClass} inputMode="tel" value={values.officePhone} onChange={(event) => update("officePhone", event.target.value)} />
          </FormField>
        </fieldset>

        <fieldset className="mt-8 space-y-4">
          <legend className="text-sm font-semibold tracking-wide text-navy">Public profile</legend>
          <FormField id="website" label="Website" error={mergedErrors.website}>
            <input className={solidControlClass} placeholder="https://" value={values.website} onChange={(event) => update("website", event.target.value)} />
          </FormField>
          <FormField id="linkedInUrl" label="LinkedIn URL" error={mergedErrors.linkedInUrl}>
            <input className={solidControlClass} placeholder="https://www.linkedin.com/in/" value={values.linkedInUrl} onChange={(event) => update("linkedInUrl", event.target.value)} />
          </FormField>
          <FormField id="location" label="Location" error={mergedErrors.location}>
            <input className={solidControlClass} value={values.location} onChange={(event) => update("location", event.target.value)} />
          </FormField>
          <FormField id="profileImageUrl" label="Profile image URL" error={mergedErrors.profileImageUrl} hint="Optional https image. Initials are shown if this is empty or cannot be loaded.">
            <input className={solidControlClass} placeholder="https://" value={values.profileImageUrl} onChange={(event) => update("profileImageUrl", event.target.value)} />
          </FormField>
        </fieldset>

        <fieldset className="mt-8 space-y-4">
          <legend className="text-sm font-semibold tracking-wide text-navy">Publishing</legend>
          <FormField id="slug" label="Public slug" required error={mergedErrors.slug} hint="This becomes the card address, for example /business-cards/jane-doe.">
            <input className={solidControlClass} value={values.slug} onChange={(event) => update("slug", event.target.value)} />
          </FormField>
          <button
            type="button"
            className="text-sm font-medium text-navy underline decoration-gold underline-offset-4"
            onClick={() => update("slug", slugifyName(values.firstName, values.surname))}
          >
            Generate from name
          </button>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={values.isActive}
              onChange={(event) => update("isActive", event.target.checked)}
            />
            Active and visible on the public directory
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={pending}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-teal text-sm font-medium text-ink hover:bg-teal-dark disabled:opacity-70"
        >
          {pending ? "Saving…" : "Save card"}
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm font-medium text-navy">Preview</p>
        {preview ? (
          <BusinessCardPreview card={preview} qrDataUrl={qrSrc} preview />
        ) : (
          <p className="rounded-3xl border border-dashed border-line bg-white p-5 text-sm text-muted">
            Complete the required contact details to preview this card.
          </p>
        )}
      </div>
    </div>
  );
}

function previewCard(values: EditorValues): PublicBusinessCard | null {
  const parsed = businessCardInputSchema.safeParse(values);
  if (!parsed.success) return null;
  return {
    id: "preview",
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
