import { describe, expect, it } from "vitest";

import { buildVCard } from "@/lib/vcard";
import { parsePublicCard, toPublicCard, visiblePublicCards } from "@/lib/validation/business-card";
import type { BusinessCard, PublicBusinessCard } from "@/types/business-card";

const alex: PublicBusinessCard = {
  id: "1",
  slug: "alex-example",
  firstName: "Alex",
  surname: "Example, Jr",
  jobTitle: "Consultant",
  companyName: "STRATO IT Group",
  workEmail: "alex@example.com",
  mobilePhone: "+27 82 000 0000",
  officePhone: "+27 11 000 0000",
  website: "https://stratoitgroup.ahvashen.com/",
  linkedInUrl: "https://www.linkedin.com/in/example",
  location: "Johannesburg",
};

const sam: BusinessCard = {
  id: "2",
  slug: "sam-mokoena",
  firstName: "Sam",
  surname: "Mokoena",
  jobTitle: "Project lead",
  companyName: "STRATO IT Group",
  workEmail: "sam@example.com",
  mobilePhone: "+27 83 000 0000",
  isActive: false,
  createdAt: "2026-10-20T10:00:00.000Z",
  updatedAt: "2026-10-20T10:00:00.000Z",
};

describe("business cards", () => {
  it("writes a vCard with escaped details and omits empty optional fields", () => {
    const vcard = buildVCard(alex);
    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("N:Example\\, Jr;Alex;;;");
    expect(vcard).toContain("FN:Alex Example\\, Jr");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET;TYPE=WORK:alex@example.com");
    expect(vcard).toContain("TEL;TYPE=CELL:+27 82 000 0000");
    expect(vcard).toContain("TEL;TYPE=WORK:+27 11 000 0000");
    expect(vcard).toContain("URL:https://stratoitgroup.ahvashen.com/");
    expect(vcard).toContain("Johannesburg");
    expect(vcard.endsWith("END:VCARD\r\n")).toBe(true);

    const minimal = buildVCard({
      ...alex,
      officePhone: undefined,
      website: undefined,
      linkedInUrl: undefined,
      location: undefined,
      profileImageUrl: undefined,
    });
    expect(minimal).not.toContain("TEL;TYPE=WORK");
    expect(minimal).not.toContain("URL:");
    expect(minimal).not.toContain("NOTE:");
  });

  it("hides inactive cards and drops internal timestamps from public cards", () => {
    const active: BusinessCard = { ...sam, id: "3", slug: "alex-example", isActive: true, firstName: "Alex", surname: "Example" };
    const visible = visiblePublicCards([active, sam]);
    expect(visible).toHaveLength(1);
    expect(visible[0]?.slug).toBe("alex-example");
    expect(visible[0]).not.toHaveProperty("createdAt");
    expect(toPublicCard(sam)).toBeNull();
  });

  it("rejects an inactive or incomplete public payload", () => {
    expect(parsePublicCard({ ...alex, isActive: false })).toBeNull();
    expect(parsePublicCard({ ...alex, isActive: true })).toMatchObject({
      firstName: "Alex",
      workEmail: "alex@example.com",
    });
    expect(parsePublicCard({ id: "x", isActive: true, firstName: "Alex" })).toBeNull();
  });
});
