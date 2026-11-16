import { describe, expect, it } from "vitest";
import { joinProduct, prototypeBalances, validPhone, verificationComplete } from "@/lib/affiliate/rules";
import { initialState } from "@/lib/affiliate/store";

describe("Affiliate prototype rules", () => {
  it("starts with ₦0 earnings, available and pending balances", () => { expect(prototypeBalances.earnings).toBe(0); expect(prototypeBalances.available).toBe(0); expect(prototypeBalances.pending).toBe(0); });
  it("starts with zero clicks", () => expect(prototypeBalances.clicks).toBe(0));
  it("starts with zero referrals", () => expect(prototypeBalances.referrals).toBe(0));
  it("starts with zero conversions", () => expect(prototypeBalances.conversions).toBe(0));
  it("starts with no promoted products", () => expect(initialState.joined).toEqual([]));
  it("prevents duplicate promotion", () => expect(joinProduct(["vibe-coding"], "vibe-coding")).toEqual(["vibe-coding"]));
  it("does not mark submitted identity documents as verified", () => expect(verificationComplete("submitted")).toBe(false));
  it("accepts the shown Nigerian phone format", () => expect(validPhone("+234 801 234 5678")).toBe(true));
  it("rejects a phone containing letters", () => expect(validPhone("+234 801 ABC 5678")).toBe(false));
});