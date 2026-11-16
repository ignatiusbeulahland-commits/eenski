import { describe, expect, it } from "vitest";

import { parseFirstName, parseNewsletterEmail } from "@/components/site/newsletter";

describe("newsletter email", () => {
  it("rejects an address without a domain", () => {
    expect(parseNewsletterEmail("dreamer@").ok).toBe(false);
  });

  it("rejects an empty address", () => {
    expect(parseNewsletterEmail("   ").ok).toBe(false);
  });

  it("stores addresses trimmed and lower-cased so duplicates are caught", () => {
    expect(parseNewsletterEmail("  Ada@Enski.COM ")).toEqual({ ok: true, email: "ada@enski.com" });
  });
});

describe("newsletter first name", () => {
  it("is optional: a blank name is saved as nothing", () => {
    expect(parseFirstName("   ")).toBeNull();
  });

  it("is trimmed with inner spaces collapsed", () => {
    expect(parseFirstName("  Ada   Obi ")).toBe("Ada Obi");
  });

  it("is capped at 80 characters", () => {
    expect(parseFirstName("a".repeat(120))).toHaveLength(80);
  });
});

describe("demo newsletter sign-up (saved on this device only)", () => {
  it("signs up once, then says the address is already on the list", async () => {
    const { subscribeToNewsletter } = await import("@/components/site/newsletter");
    expect((await subscribeToNewsletter("New@Dreamer.com")).status).toBe("subscribed");
    expect((await subscribeToNewsletter(" new@dreamer.com ")).status).toBe("already");
  });
});
