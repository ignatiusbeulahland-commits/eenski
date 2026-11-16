import { describe, expect, it } from "vitest";

import { coachAreas, coachCurrencies, coachSuggestions, filterCoaches, sortCoaches } from "./coaches";
import type { Coach, Money } from "./types";

const money = (currency: string, current: number): Money => ({
  currency,
  sign: currency === "USD" ? "$" : "₦",
  amount: current,
  current,
  onSale: false,
});

const coach = (id: string, expertise: string | null, prices: Money[] | null): Coach => ({
  id,
  name: id,
  avatar: null,
  bio: null,
  url: `https://example.com/${id}`,
  sessionCount: 1,
  expertise,
  session: prices ? { title: "Programme", url: "https://example.com/p", price: prices[0] ?? null, prices } : null,
});

// Mirrors Enski staging: one USD coach (pays $280), one NGN-only coach (₦15,000).
const alex = coach("alex", "Finance & Investment", [money("USD", 280)]);
const fac = coach("fac", "Marketing & Sales", [money("NGN", 15_000)]);
const free = coach("free", "Marketing & Sales", [money("USD", 0)]);
const none = coach("none", null, null);
const all = [alex, fac, free, none];

describe("coach filters", () => {
  it("lists each coaching area once, from the data", () => {
    expect(coachAreas(all)).toEqual(["Finance & Investment", "Marketing & Sales"]);
  });

  it("narrows to one coaching area", () => {
    expect(filterCoaches(all, { area: "Marketing & Sales" }).map((c) => c.id)).toEqual(["fac", "free"]);
  });

  it("shows only coaches whose programme is priced in the chosen currency, never converting", () => {
    expect(filterCoaches(all, { currency: "NGN" }).map((c) => c.id)).toEqual(["fac", "free"]);
    expect(filterCoaches(all, { currency: "USD" }).map((c) => c.id)).toEqual(["alex", "free"]);
  });

  it("applies price bands in the chosen currency's own amounts", () => {
    expect(filterCoaches(all, { currency: "USD", price: "tier-3" }).map((c) => c.id)).toEqual(["alex"]);
    expect(filterCoaches(all, { currency: "NGN", price: "tier-1" }).map((c) => c.id)).toEqual(["fac"]);
    expect(filterCoaches(all, { currency: "NGN", price: "free" }).map((c) => c.id)).toEqual(["free"]);
  });

  it("ignores a price band when no currency is chosen", () => {
    expect(filterCoaches(all, { price: "tier-3" })).toHaveLength(4);
  });

  it("offers only currencies some coach is priced in", () => {
    expect(coachCurrencies([alex])).toEqual(["USD"]);
    expect(coachCurrencies([alex, fac])).toEqual(["USD", "NGN"]);
  });
});

describe("coach no-results suggestions", () => {
  const usd = (id: string, area: string, amount: number) => coach(id, area, [money("USD", amount)]);
  const cheap = usd("cheap", "Finance & Investment", 20); // Under $50
  const mid = usd("mid", "Finance & Investment", 120); // $50 – $250
  const pricey = usd("pricey", "Marketing & Sales", 280); // $250 – $500
  const list = [cheap, mid, pricey, fac];

  it("suggests the nearest price bands first, in the same currency and area, with real counts", () => {
    const s = coachSuggestions(list, { area: "Finance & Investment", currency: "USD", price: "tier-4" });
    expect(s.prices.map((p) => [p.label, p.count])).toEqual([
      ["$50 – $250", 1],
      ["Under $50", 1],
    ]);
    expect(s.prices[0]?.filters).toEqual({ area: "Finance & Investment", currency: "USD", price: "tier-2" });
  });

  it("suggests other coaching areas that have coaches at the chosen price", () => {
    const s = coachSuggestions(list, { area: "Finance & Investment", currency: "USD", price: "tier-3" });
    expect(s.areas.map((a) => [a.label, a.count])).toEqual([["Marketing & Sales", 1]]);
  });

  it("offers another currency without carrying over a price band", () => {
    const s = coachSuggestions(list, { area: "Marketing & Sales", currency: "USD", price: "tier-4" });
    const ngn = s.wider.find((w) => w.filters.currency === "NGN");
    expect(ngn).toMatchObject({ count: 1, filters: { area: "Marketing & Sales", currency: "NGN" } });
    expect(ngn?.filters.price).toBeUndefined();
  });

  it("never suggests something that would still show no coaches", () => {
    const s = coachSuggestions(list, { area: "Marketing & Sales", currency: "NGN", price: "tier-4" });
    for (const x of [...s.prices, ...s.areas, ...s.wider]) expect(x.count).toBeGreaterThan(0);
    expect(s.areas).toEqual([]);
  });
});

describe("coach sorting", () => {
  const usd = (id: string, name: string, area: string, amount: number) => ({
    ...coach(id, area, [money("USD", amount)]),
    name,
  });
  const zara = usd("z", "Zara Obi", "Finance & Investment", 300);
  const ade = usd("a", "ade Bello", "Finance & Investment", 40);
  const kemi = usd("k", "Kemi Ola", "Marketing & Sales", 120);
  const naira = { ...fac, name: "Bisi Eze" }; // ₦15,000 only
  const unpriced = { ...none, name: "Chidi Nwosu" };
  const list = [zara, naira, ade, unpriced, kemi];
  const ids = (cs: Coach[]) => cs.map((c) => c.id);

  it("keeps Enski's order for Featured", () => {
    expect(ids(sortCoaches(list, "featured"))).toEqual(["z", "fac", "a", "none", "k"]);
  });

  it("sorts by coach name A to Z, ignoring letter case", () => {
    expect(sortCoaches(list, "name").map((c) => c.name)).toEqual([
      "ade Bello",
      "Bisi Eze",
      "Chidi Nwosu",
      "Kemi Ola",
      "Zara Obi",
    ]);
  });

  it("sorts by programme price within the chosen currency, keeping area and price filters applied", () => {
    const filtered = filterCoaches(list, { area: "Finance & Investment", currency: "USD" });
    expect(ids(sortCoaches(filtered, "price-asc", "USD"))).toEqual(["a", "z"]);
    expect(ids(sortCoaches(filtered, "price-desc", "USD"))).toEqual(["z", "a"]);
    const banded = filterCoaches(list, { currency: "USD", price: "tier-2" });
    expect(ids(sortCoaches(banded, "price-desc", "USD"))).toEqual(["k"]);
  });

  it("never compares dollars with naira: groups by currency (USD first), unpriced last", () => {
    expect(ids(sortCoaches(list, "price-asc"))).toEqual(["a", "k", "z", "fac", "none"]);
    expect(ids(sortCoaches(list, "price-desc"))).toEqual(["z", "k", "a", "fac", "none"]);
  });
});
