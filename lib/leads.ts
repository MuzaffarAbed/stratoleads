import type { LeadProcessingResult } from "@/types/lead";

export function classifyLeadResult(result: LeadProcessingResult): "complete" | "failed" {
  return result.leadSaved ? "complete" : "failed";
}
