import { beforeEach, describe, expect, it } from "vitest";
import { choiceFor, clearSummaryChoice, parseSummaryChoice, readSummaryChoice, saveSummaryChoice } from "@/lib/checkout/summary";

describe("payment summary step", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("shows the method the learner picked after a refresh", () => {
    saveSummaryChoice("site", { method: "card", methodLabel: "Visa •••• 4242", plan: "successful", needsOtp: true });
    expect(readSummaryChoice("site")).toEqual({ method: "card", methodLabel: "Visa •••• 4242", plan: "successful", needsOtp: true });
  });

  it("sends the buyer back to pick a method when none was chosen", () => {
    expect(readSummaryChoice("learner")).toBeNull();
    expect(parseSummaryChoice({ method: "crypto", methodLabel: "x", plan: "successful" })).toBeNull();
    expect(parseSummaryChoice({ method: "bank", methodLabel: "", plan: "pending" })).toBeNull();
  });

  it("only opens the summary for the method in the address", () => {
    const saved = { method: "bank" as const, methodLabel: "Bank transfer", plan: "pending" as const };
    expect(choiceFor(saved, "card")).toBeNull();
    expect(choiceFor(saved, "bank")).toEqual(saved);
  });

  it("forgets the choice once payment is placed", () => {
    saveSummaryChoice("learner", { method: "ussd", methodLabel: "GTBank USSD (*737#)", plan: "pending" });
    clearSummaryChoice("learner");
    expect(readSummaryChoice("learner")).toBeNull();
  });
});
