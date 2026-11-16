import { describe, expect, it } from "vitest";

import type { Money } from "@/lib/dreamverse/types";
import { findPriceCountry, localPrice } from "@/lib/pricing/local-price";

const m = (currency: string, current: number, amount = current): Money => ({ currency, sign: "", amount, current, onSale: amount > current });
const rates = { USD: 1, NGN: 1500, GHS: 15, KES: 130 };

describe("price for a chosen country or currency", () => {
  it("shows the creator's own price when they set one in that currency", () => {
    const r = localPrice([m("USD", 20), m("NGN", 25000)], "NGN", rates);
    expect(r).toMatchObject({ exact: true, shown: { current: 25000 } });
  });

  it("estimates other currencies from the creator's US dollar price", () => {
    const r = localPrice([m("NGN", 25000), m("USD", 20)], "GHS", rates);
    expect(r).toMatchObject({ exact: false, shown: { currency: "GHS", current: 300 } });
  });

  it("still charges the creator's own price at checkout", () => {
    const r = localPrice([m("USD", 20)], "KES", rates);
    expect(r?.charge).toMatchObject({ currency: "USD", current: 20 });
  });

  it("converts from naira when that's the only price", () => {
    expect(localPrice([m("NGN", 15000)], "USD", rates)?.shown.current).toBe(10);
  });

  it("keeps a sale price on sale in the estimate", () => {
    const r = localPrice([m("USD", 10, 20)], "GHS", rates);
    expect(r?.shown).toMatchObject({ current: 150, amount: 300, onSale: true });
  });

  it("shows nothing to estimate without today's rate", () => {
    expect(localPrice([m("USD", 20)], "GHS", null)).toBeNull();
  });

  it("keeps free listings free in every currency", () => {
    expect(localPrice([m("USD", 0)], "KES", null)?.shown.current).toBe(0);
  });
});

describe("country lookup", () => {
  it("maps eurozone countries to euros", () => {
    expect(findPriceCountry("fr")?.currency).toBe("EUR");
  });

  it("ignores countries not in the list", () => {
    expect(findPriceCountry("BR")).toBeNull();
  });
});
