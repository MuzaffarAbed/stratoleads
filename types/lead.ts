import type { ProductInterest } from "@/lib/constants";

export type LeadInput = {
  name: string;
  surname: string;
  companyName: string;
  cellNumber: string;
  emailAddress: string;
  productInterest: ProductInterest;
  comment: string;
};

export type LeadRequest = LeadInput & {
  submissionId: string;
};

export type LeadOutcome = "complete" | "failed";

export type LeadProcessingResult = {
  leadSaved: boolean;
  duplicate: boolean;
};
