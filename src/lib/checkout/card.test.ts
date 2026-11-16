import { describe, expect, it } from "vitest";
import { cardBrand, cardResponse, formatCardNumber, luhnValid, makeReference, otpValid, validateCard, virtualAccount } from "./card";

describe("card rules", () => {
  it("accepts a valid Visa number and rejects a mistyped one", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
    expect(luhnValid("4242 4242 4242 4241")).toBe(false);
  });
  it("detects brands", () => {
    expect(cardBrand("4242")).toBe("visa");
    expect(cardBrand("5399 8300")).toBe("mastercard");
    expect(cardBrand("5061 0000")).toBe("verve");
    expect(cardBrand("3782")).toBe("amex");
  });
  it("groups digits in fours", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });
  it("rejects an expiry in the past", () => {
    const e = validateCard({ number: "4242424242424242", expiry: "10 / 26", cvc: "123", name: "Ada Obi" }, new Date("2026-11-13"));
    expect(e.expiry).toBe("This card has expired");
    const ok = validateCard({ number: "4242424242424242", expiry: "11 / 26", cvc: "123", name: "Ada Obi" }, new Date("2026-11-13"));
    expect(ok).toEqual({});
  });
  it("maps the standard decline numbers to failure reasons", () => {
    expect(cardResponse("4000 0000 0000 0002")).toBe("declined");
    expect(cardResponse("4000 0000 0000 9995")).toBe("insufficient_funds");
    expect(cardResponse("4242 4242 4242 4242")).toBe("approved");
  });
  it("treats 000000 as a wrong code", () => {
    expect(otpValid("000000")).toBe(false);
    expect(otpValid("123456")).toBe(true);
    expect(otpValid("12345")).toBe(false);
  });
  it("makes ENS- references and stable virtual accounts", () => {
    expect(makeReference(() => 0)).toBe("ENS-AAAAAA");
    expect(makeReference()).toMatch(/^ENS-[A-Z2-9]{6}$/);
    expect(virtualAccount("ENS-ABCDEF")).toBe(virtualAccount("ENS-ABCDEF"));
    expect(virtualAccount("ENS-ABCDEF")).toMatch(/^99\d{8}$/);
  });
});
