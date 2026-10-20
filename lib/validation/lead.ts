import { z } from "zod";

import { PRODUCT_INTERESTS, type ProductInterest } from "@/lib/constants";
import type { LeadInput, LeadRequest } from "@/types/lead";
import { collapseWhitespace, digitsOnly } from "@/lib/utils";

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(max, `${label} is too long.`)
    .transform(collapseWhitespace);

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid cell number.")
  .max(32, "Enter a valid cell number.")
  .refine((value) => /^\+?[0-9][0-9\s().-]*$/.test(value), {
    message: "Enter a valid cell number, including the country code if it is not local.",
  })
  .refine((value) => {
    const count = digitsOnly(value).length;
    return count >= 7 && count <= 15;
  }, "Enter a valid cell number.")
  .transform(collapseWhitespace);

const leadFields = {
  name: requiredText("name", 80),
  surname: requiredText("surname", 80),
  companyName: requiredText("company name", 120),
  cellNumber: phoneSchema,
  emailAddress: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Enter a valid email address.")
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  productInterest: z.enum(PRODUCT_INTERESTS, {
    error: "Select a product interest.",
  }),
  comment: z
    .string()
    .trim()
    .max(1000, "Comment is too long.")
    .optional()
    .default("")
    .transform(collapseWhitespace),
};

function requireOtherComment(
  data: { productInterest: ProductInterest; comment: string },
  ctx: z.RefinementCtx,
) {
  if (data.productInterest === "Other" && data.comment.trim().length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["comment"],
      message: "Comment is required when Product Interest is Other.",
    });
  }
}

export const leadFormSchema = z.object(leadFields).superRefine(requireOtherComment);

const submissionIdSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Submission could not be verified. Refresh the page and try again.",
  );

export const leadRequestSchema = z
  .object({
    ...leadFields,
    submissionId: submissionIdSchema,
  })
  .superRefine(requireOtherComment);

export type ParsedLeadForm = z.infer<typeof leadFormSchema>;
export type ParsedLeadRequest = z.infer<typeof leadRequestSchema>;

export function parseLeadForm(input: unknown): { data: LeadInput } | { fieldErrors: Record<string, string> } {
  const parsed = leadFormSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }
  return { data: parsed.data };
}

export function parseLeadRequest(
  input: unknown,
): { data: LeadRequest } | { fieldErrors: Record<string, string> } {
  const parsed = leadRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }
  return { data: parsed.data };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
