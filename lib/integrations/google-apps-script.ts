import "server-only";

import type { BusinessCard, BusinessCardInput, PublicBusinessCard } from "@/types/business-card";
import type { LeadProcessingResult, LeadRequest } from "@/types/lead";
import { parseBusinessCard, parsePublicCard } from "@/lib/validation/business-card";

export class IntegrationConfigError extends Error {
  constructor() {
    super("Google Apps Script is not configured");
    this.name = "IntegrationConfigError";
  }
}

export class IntegrationRequestError extends Error {
  constructor() {
    super("Google Apps Script request failed");
    this.name = "IntegrationRequestError";
  }
}

type ScriptFailure = {
  ok: false;
  code: string;
};

type ScriptSuccess = {
  ok: true;
  [key: string]: unknown;
};

function integrationConfig(): { url: string; secret: string; source: string } {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim() || "";
  const secret = process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET?.trim() || "";
  if (!url || !secret) throw new IntegrationConfigError();
  return {
    url,
    secret,
    source: process.env.LEAD_SOURCE?.trim() || "STRATO Convention",
  };
}

export function leadCaptureEnabled(): boolean {
  return process.env.LEAD_CAPTURE_ENABLED === "true";
}

async function postAppsScript(payload: Record<string, unknown>): Promise<ScriptSuccess> {
  const { url, secret } = integrationConfig();
  const body = JSON.stringify({ ...payload, secret });

  let response = await fetch(url, {
    method: "POST",
    redirect: "manual",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) throw new IntegrationRequestError();
    response = await fetch(location, { method: "GET", redirect: "follow", cache: "no-store" });
  }

  if (!response.ok) throw new IntegrationRequestError();

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new IntegrationRequestError();
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new IntegrationRequestError();
  }

  const record = parsed as Record<string, unknown>;
  if (record.ok !== true) {
    const failure = record as ScriptFailure;
    const error = new IntegrationRequestError();
    error.name = typeof failure.code === "string" ? failure.code : "integration_error";
    throw error;
  }

  return record as ScriptSuccess;
}

export async function createLead(lead: LeadRequest): Promise<LeadProcessingResult> {
  const { source } = integrationConfig();
  const result = await postAppsScript({
    operation: "createLead",
    submissionId: lead.submissionId,
    source,
    lead: {
      name: lead.name,
      surname: lead.surname,
      companyName: lead.companyName,
      cellNumber: lead.cellNumber,
      emailAddress: lead.emailAddress,
      productInterest: lead.productInterest,
      comment: lead.comment,
    },
  });

  return {
    leadSaved: result.leadSaved === true,
    duplicate: result.duplicate === true,
  };
}

function cardsFromResult(result: ScriptSuccess): BusinessCard[] {
  if (!Array.isArray(result.cards)) return [];
  return result.cards.flatMap((card) => {
    const parsed = parseBusinessCard(card);
    return parsed ? [parsed] : [];
  });
}

export async function listCards(): Promise<BusinessCard[]> {
  const result = await postAppsScript({ operation: "adminListCards" });
  return cardsFromResult(result);
}

export async function listPublicCards(): Promise<PublicBusinessCard[]> {
  const result = await postAppsScript({ operation: "listPublicCards" });
  if (!Array.isArray(result.cards)) return [];
  return result.cards.flatMap((card) => {
    const parsed = parsePublicCard(card);
    return parsed ? [parsed] : [];
  });
}

export async function getPublicCard(slug: string): Promise<PublicBusinessCard | null> {
  const result = await postAppsScript({ operation: "getPublicCard", slug });
  if (!result.card) return null;
  return parsePublicCard(result.card);
}

export async function createCard(card: BusinessCardInput & { id: string }): Promise<BusinessCard> {
  const result = await postAppsScript({ operation: "adminCreateCard", card });
  const parsed = parseBusinessCard(result.card);
  if (!parsed) throw new IntegrationRequestError();
  return parsed;
}

export async function updateCard(card: BusinessCardInput & { id: string }): Promise<BusinessCard> {
  const result = await postAppsScript({ operation: "adminUpdateCard", card });
  const parsed = parseBusinessCard(result.card);
  if (!parsed) throw new IntegrationRequestError();
  return parsed;
}

export async function deactivateCard(id: string): Promise<BusinessCard> {
  const result = await postAppsScript({ operation: "adminDeactivateCard", id });
  const parsed = parseBusinessCard(result.card);
  if (!parsed) throw new IntegrationRequestError();
  return parsed;
}
