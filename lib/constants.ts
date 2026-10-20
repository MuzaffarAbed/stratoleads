export const PRODUCT_INTERESTS = [
  "STRATOPOD",
  "STRATOPOD GO",
  "STRATOWM",
  "STRATOOB",
  "Other",
] as const;

export type ProductInterest = (typeof PRODUCT_INTERESTS)[number];

export const PRODUCT_INTEREST_LABELS: Record<ProductInterest, string> = {
  STRATOPOD: "STRATOPOD",
  "STRATOPOD GO": "STRATOPOD GO",
  STRATOWM: "STRATO WM",
  STRATOOB: "STRATO OB",
  Other: "OTHER",
};

export function productFollowUpUrl(product: ProductInterest): string {
  if (product === "STRATOPOD") return "https://www.stratoit.co.za/products/stratopod";
  if (product === "STRATOWM") return "https://www.stratoit.co.za/products/strato-wm";
  if (product === "STRATOOB") return "https://www.stratoit.co.za/products/strato-ob";
  return "https://www.stratoit.co.za/";
}

export const COMPANY_DEFAULT = "STRATO IT Group";

export const LEAD_SUCCESS_MESSAGE = "Lead submitted";

export const LEAD_FAILURE_MESSAGE =
  "We could not submit your details. Please try again.";

export const LEAD_DISABLED_MESSAGE =
  "Lead submission is turned off in this environment. Please speak to a STRATO representative at the booth.";

export const VALIDATION_MESSAGE = "Please check the highlighted fields.";
