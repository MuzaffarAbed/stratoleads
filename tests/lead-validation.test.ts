import { describe, expect, it } from "vitest";

import { PRODUCT_INTERESTS, PRODUCT_INTEREST_LABELS, productFollowUpUrl } from "@/lib/constants";
import { leadFormSchema, leadRequestSchema } from "@/lib/validation/lead";

const valid = {
  name: " Alex ",
  surname: "Example",
  companyName: "Example Ltd",
  cellNumber: "  +27   82  000  0000 ",
  emailAddress: " Alex@Example.com ",
  productInterest: "STRATOPOD",
  comment: "",
};

describe("lead validation", () => {
  it("keeps the product list in the required order", () => {
    expect(PRODUCT_INTERESTS).toEqual([
      "STRATOPOD",
      "STRATOPOD GO",
      "STRATOWM",
      "STRATOOB",
      "Other",
    ]);
    expect(PRODUCT_INTEREST_LABELS).toEqual({
      STRATOPOD: "STRATOPOD",
      "STRATOPOD GO": "STRATOPOD GO",
      STRATOWM: "STRATO WM",
      STRATOOB: "STRATO OB",
      Other: "OTHER",
    });
    expect(productFollowUpUrl("STRATOPOD")).toBe("https://www.stratoit.co.za/products/stratopod");
    expect(productFollowUpUrl("STRATOWM")).toBe("https://www.stratoit.co.za/products/strato-wm");
    expect(productFollowUpUrl("STRATOOB")).toBe("https://www.stratoit.co.za/products/strato-ob");
    expect(productFollowUpUrl("STRATOPOD GO")).toBe("https://www.stratoit.co.za/");
    expect(productFollowUpUrl("Other")).toBe("https://www.stratoit.co.za/");
  });

  it("accepts a named product with an empty comment and normalizes fields", () => {
    const parsed = leadFormSchema.parse(valid);
    expect(parsed.name).toBe("Alex");
    expect(parsed.cellNumber).toBe("+27 82 000 0000");
    expect(parsed.emailAddress).toBe("alex@example.com");
    expect(parsed.comment).toBe("");
  });

  it("accepts an optional comment for the four named products", () => {
    for (const productInterest of PRODUCT_INTERESTS.filter((item) => item !== "Other")) {
      expect(leadFormSchema.safeParse({ ...valid, productInterest, comment: "Please call after 2pm" }).success).toBe(true);
      expect(leadFormSchema.safeParse({ ...valid, productInterest, comment: "   " }).success).toBe(true);
    }
  });

  it("rejects Other when the comment is empty or whitespace", () => {
    for (const comment of ["", "   ", "\n\t"]) {
      const parsed = leadFormSchema.safeParse({ ...valid, productInterest: "Other", comment });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.some((issue) => issue.path[0] === "comment")).toBe(true);
      }
    }
  });

  it("accepts Other when the comment has text", () => {
    const parsed = leadFormSchema.safeParse({
      ...valid,
      productInterest: "Other",
      comment: "  Warehouse labelling  ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.comment).toBe("Warehouse labelling");
  });

  it("rejects an unknown product and an invalid email", () => {
    expect(leadFormSchema.safeParse({ ...valid, productInterest: "STRATO WM" }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...valid, emailAddress: "not-an-email" }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...valid, cellNumber: "123" }).success).toBe(false);
  });

  it("requires a uuid submission id on the server schema", () => {
    expect(leadRequestSchema.safeParse({ ...valid, submissionId: "not-a-uuid" }).success).toBe(false);
    expect(
      leadRequestSchema.safeParse({
        ...valid,
        submissionId: "4f6d4f0e-4c1b-4e3a-8f1a-6d0e8c2b9a11",
      }).success,
    ).toBe(true);
  });
});
