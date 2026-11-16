import { describe, expect, it } from "vitest";
import { amountError, maskEmail, newPinError, planWithdrawal, sentToday, withdrawalFee, withdrawalReference } from "./withdrawals";

describe("withdrawal rules", () => {
  it("charges ₦50 for a naira bank transfer and percentages for cards and wallets", () => {
    expect(withdrawalFee("bank", 20000, "NGN")).toBe(50);
    expect(withdrawalFee("card", 10000, "NGN")).toBe(150);
    expect(withdrawalFee("paypal", 100, "USD")).toBe(2);
    expect(withdrawalFee("stripe", 100, "USD")).toBe(1);
  });
  it("enforces the ₦1,000 minimum and the available balance", () => {
    expect(amountError(999, 50000, "NGN", 50)).toBe("The minimum withdrawal is 1,000 NGN.");
    expect(amountError(60000, 50000, "NGN", 50)).toBe("That's more than your available balance in this currency.");
    expect(amountError(20000, 50000, "NGN", 50)).toBe("");
  });
  it("refuses anything over the ₦2,000,000 daily limit", () => {
    expect(planWithdrawal(1_500_000, 600_000, "NGN")).toBe("daily_limit");
    expect(planWithdrawal(1_500_000, 500_000, "NGN")).toBe("successful");
  });
  it("counts only today's withdrawals that didn't fail", () => {
    const now = new Date("2026-11-13T15:00:00");
    const list = [
      { amount: 1000, currency: "NGN", date: "2026-11-13T09:00:00", status: "successful" },
      { amount: 5000, currency: "NGN", date: "2026-11-13T10:00:00", status: "failed" },
      { amount: 7000, currency: "NGN", date: "2026-11-12T10:00:00", status: "successful" },
    ];
    expect(sentToday(list, "NGN", now)).toBe(1000);
  });
  it("rejects weak or mismatched PINs", () => {
    expect(newPinError("1234", "1234")).toBe("Choose a PIN that's harder to guess.");
    expect(newPinError("5821", "5812")).toBe("The two PINs don't match.");
    expect(newPinError("58a1", "58a1")).toBe("Your PIN must be 4 digits.");
    expect(newPinError("5821", "5821")).toBe("");
  });
  it("formats references and masks emails", () => {
    expect(withdrawalReference(() => 0)).toBe("WD-AAAAAA");
    expect(maskEmail("Ada.Okafor@Mail.com")).toBe("ad•••@mail.com");
  });
});
