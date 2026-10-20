"use client";

import { useRef, useState } from "react";

import { FormField } from "@/components/lead-form/FormField";
import { InlineError } from "@/components/lead-form/InlineError";
import { ProductInterestSelect } from "@/components/lead-form/ProductInterestSelect";
import { SubmitButton } from "@/components/lead-form/SubmitButton";
import { SuccessPanel } from "@/components/lead-form/SuccessPanel";
import { solidControlClass } from "@/components/ui/styles";
import { productFollowUpUrl, type ProductInterest } from "@/lib/constants";
import { leadFormSchema } from "@/lib/validation/lead";

type FormValues = {
  name: string;
  surname: string;
  companyName: string;
  cellNumber: string;
  emailAddress: string;
  productInterest: ProductInterest | "";
  comment: string;
};

const emptyValues: FormValues = {
  name: "",
  surname: "",
  companyName: "",
  cellNumber: "",
  emailAddress: "",
  productInterest: "",
  comment: "",
};

const fieldOrder = [
  "name",
  "surname",
  "companyName",
  "cellNumber",
  "emailAddress",
  "productInterest",
  "comment",
] as const;

type SubmitResult = {
  ok?: boolean;
  outcome?: "complete" | "failed";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function LeadCaptureForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [honeypot, setHoneypot] = useState("");
  const submissionId = useRef(crypto.randomUUID());
  const submitting = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function focusFirst(nextErrors: Record<string, string>) {
    const first = fieldOrder.find((field) => nextErrors[field]);
    if (!first) {
      summaryRef.current?.focus();
      return;
    }
    document.getElementById(first)?.focus();
  }

  async function submit() {
    if (submitting.current) return;
    setFormError("");

    const parsed = leadFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setStatus("error");
      focusFirst(nextErrors);
      return;
    }

    submitting.current = true;
    setStatus("submitting");
    setErrors({});
    const productWindow = window.open("about:blank", "_blank");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          submissionId: submissionId.current,
          companyFax: honeypot,
        }),
      });
      const result = (await response.json()) as SubmitResult;

      if (result.fieldErrors) {
        productWindow?.close();
        setErrors(result.fieldErrors);
        setFormError(result.message || "Please check the highlighted fields.");
        setStatus("error");
        focusFirst(result.fieldErrors);
        return;
      }

      if (result.ok && result.outcome === "complete") {
        const url = productFollowUpUrl(parsed.data.productInterest);
        if (productWindow) {
          productWindow.opener = null;
          productWindow.location.replace(url);
        }
        setStatus("success");
        return;
      }

      productWindow?.close();
      setFormError(result.message || "We could not submit your details. Please try again.");
      setStatus("error");
      summaryRef.current?.focus();
    } catch {
      productWindow?.close();
      setFormError("We could not submit your details. Please check your connection and try again.");
      setStatus("error");
      summaryRef.current?.focus();
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") {
    return <SuccessPanel />;
  }

  const commentRequired = values.productInterest === "Other";

  return (
    <>
    {status === "submitting" ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-6" role="status" aria-live="polite">
        <div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-white px-8 py-8 shadow-card">
          <span className="h-11 w-11 animate-spin rounded-full border-4 border-teal-soft border-t-teal" />
          <p className="mt-4 text-sm font-medium text-ink">Sending your enquiry</p>
        </div>
      </div>
    ) : null}
    <form
      className="rounded-3xl border border-line bg-white px-4 py-6 shadow-card sm:px-8 sm:py-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-[-0.03em] text-ink">Request information</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Fields marked with * are required. STRATO will use these details only to respond to this enquiry.
        </p>
      </div>

      <div ref={summaryRef} tabIndex={-1} className="mb-4 outline-none">
        <InlineError message={formError} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="name" label="Name" required error={errors.name}>
          <input
            className={solidControlClass}
            autoComplete="given-name"
            value={values.name}
            disabled={status === "submitting"}
            onChange={(event) => update("name", event.target.value)}
          />
        </FormField>
        <FormField id="surname" label="Surname" required error={errors.surname}>
          <input
            className={solidControlClass}
            autoComplete="family-name"
            value={values.surname}
            disabled={status === "submitting"}
            onChange={(event) => update("surname", event.target.value)}
          />
        </FormField>
        <div className="md:col-span-2">
          <FormField id="companyName" label="Company Name" required error={errors.companyName}>
            <input
              className={solidControlClass}
              autoComplete="organization"
              value={values.companyName}
              disabled={status === "submitting"}
              onChange={(event) => update("companyName", event.target.value)}
            />
          </FormField>
        </div>
        <FormField id="cellNumber" label="Cell Number" required error={errors.cellNumber}>
          <input
            className={solidControlClass}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+27 82 000 0000"
            value={values.cellNumber}
            disabled={status === "submitting"}
            onChange={(event) => update("cellNumber", event.target.value)}
          />
        </FormField>
        <FormField id="emailAddress" label="Email Address" required error={errors.emailAddress}>
          <input
            className={solidControlClass}
            autoComplete="email"
            inputMode="email"
            placeholder="name@company.com"
            value={values.emailAddress}
            disabled={status === "submitting"}
            onChange={(event) => update("emailAddress", event.target.value)}
          />
        </FormField>
        <div className="md:col-span-2">
          <FormField id="productInterest" label="Product Interest" required error={errors.productInterest}>
            <ProductInterestSelect
              value={values.productInterest}
              disabled={status === "submitting"}
              onChange={(value) => update("productInterest", value)}
            />
          </FormField>
        </div>
        <div className="md:col-span-2">
          <FormField
            id="comment"
            label="Comment"
            required={commentRequired}
            error={errors.comment}
            hint={
              commentRequired
                ? "Comment is required when you select Other. Tell us what you would like to discuss."
                : "Optional, unless you selected Other."
            }
          >
            <textarea
              className={`${solidControlClass} h-28 resize-y py-3`}
              value={values.comment}
              disabled={status === "submitting"}
              onChange={(event) => update("comment", event.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="absolute left-[-9999px] h-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="companyFax">Fax</label>
        <input
          id="companyFax"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="mt-6">
        <SubmitButton pending={status === "submitting"} />
        <p className="sr-only" aria-live="polite">
          {status === "submitting" ? "Sending your enquiry" : ""}
        </p>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Read the <a className="font-medium text-teal-deep underline decoration-teal underline-offset-4" href="/privacy">privacy notice</a>.
        Submitting this form is a request for follow-up. It is not a marketing subscription.
      </p>
    </form>
    </>
  );
}
