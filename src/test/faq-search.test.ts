import { describe, expect, it } from "vitest";

import { FAQS } from "@/components/faq/faqs";
import { filterFaqs, highlightParts } from "@/lib/faq-search";

describe("FAQ search", () => {
  it("contains every question from the live page", () => {
    expect(FAQS).toHaveLength(70);
  });

  it("explains settlements and payouts with Enski's own wording", () => {
    const answer = (q: string) => FAQS.find((f) => f.question === q)?.answer;
    expect(answer("How does Enski process settlements?")).toBe(
      "Whenever you receive a payment on Enski, the funds are processed in your Enski Wallet and made available on the Payout page.",
    );
    expect(answer("How do payouts work?")).toContain("withdraw anytime to your local bank account");
  });

  it("limits results to the chosen topic", () => {
    const results = filterFaqs(FAQS, "affiliates", "");
    expect(results).toHaveLength(10);
    expect(results.every((f) => f.category === "affiliates")).toBe(true);
  });

  it("matches words in answers, not just questions", () => {
    const ids = filterFaqs(FAQS, "all", "m-pesa").map((f) => f.id);
    expect(ids).toContain(9);
  });

  it("requires every typed word to match", () => {
    expect(filterFaqs(FAQS, "all", "payout zzzz")).toHaveLength(0);
  });

  it("flags matching words for highlighting regardless of case", () => {
    const parts = highlightParts("Reset your Password", "password");
    expect(parts).toEqual([
      { text: "Reset your ", match: false },
      { text: "Password", match: true },
    ]);
  });
});
