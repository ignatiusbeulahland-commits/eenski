import { describe, expect, it } from "vitest";

import { displayPrice, filterCatalog, matchesTopic } from "./catalog";
import { normalizeProducts, pickPrice, usableImage } from "./normalize";
import { coachFiltersFromSearch, coachSearchParams, validateDreamverseSearch } from "./search";
import type { Product } from "./types";

const raw = (over: Record<string, unknown> = {}) => ({
  id: "a",
  title: "iOS App Development with SwiftUI",
  summary: "Build iOS apps",
  public_path: "/course/alexrivera/ios",
  type: "course",
  thumbnail: "/images/courses/placeholder.jpg",
  facilitator: { name: "Alex Rivera", avatar: null },
  price: [
    { currency: "USD", sign: "$", amount: 479, discounted_price: 383 },
    { currency: "NGN", sign: "₦", amount: 718500, discounted_price: 574500 },
  ],
  ...over,
});

describe("pricing", () => {
  it("shows the discounted price learners pay on the product page, with the original price", () => {
    const p = pickPrice(raw().price);
    expect(p).toMatchObject({ currency: "USD", current: 383, amount: 479, onSale: true });
  });

  it("uses the listed amount when there is no lower discounted price", () => {
    expect(pickPrice([{ currency: "USD", sign: "$", amount: 39, discounted_price: 39 }])).toMatchObject({
      current: 39,
      onSale: false,
    });
  });

  it("prefers the default currency over USD", () => {
    const p = pickPrice([
      { currency: "USD", amount: 10, discounted_price: null },
      { currency: "NGN", amount: 15000, discounted_price: null, is_default: true },
    ]);
    expect(p?.currency).toBe("NGN");
  });

  it("never invents a price when none is provided", () => {
    expect(pickPrice([])).toBeNull();
    expect(pickPrice(null)).toBeNull();
  });
});

describe("product normalisation", () => {
  it("treats placeholder covers as missing artwork", () => {
    expect(usableImage("/images/courses/placeholder.jpg")).toBeNull();
    expect(usableImage("/uploads/cover.png")).toBe("https://staging.tryenski.com/uploads/cover.png");
  });

  it("drops duplicate products", () => {
    const list = normalizeProducts([raw(), raw(), raw({ id: "b", public_path: "/course/x/y" })]);
    expect(list.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("links products to their page on Enski", () => {
    expect(normalizeProducts([raw()])[0]?.url).toBe("https://staging.tryenski.com/course/alexrivera/ios");
  });
});

describe("marketplace filters", () => {
  const products = normalizeProducts([
    raw(),
    raw({ id: "e", type: "ebook", title: "The Remote Team Handbook", public_path: "/ebooks/x/remote", price: [{ currency: "USD", amount: 29, discounted_price: 23 }] }),
    raw({ id: "g", type: "gig", title: "Custom Web Application Development", public_path: "/service/x/web", price: [{ currency: "USD", amount: 2500, discounted_price: 2000 }] }),
  ]) as Product[];

  it("combines search and type", () => {
    expect(filterCatalog(products, { q: "handbook", type: "ebook" }).map((p) => p.id)).toEqual(["e"]);
    expect(filterCatalog(products, { q: "handbook", type: "course" })).toHaveLength(0);
  });

  it("filters USD price ranges on the price actually charged", () => {
    expect(filterCatalog(products, { currency: "USD", price: "tier-1" }).map((p) => p.id)).toEqual(["e"]);
    expect(filterCatalog(products, { currency: "USD", price: "tier-3" }).map((p) => p.id)).toEqual(["a"]);
  });

  it("sorts by lowest and highest price", () => {
    expect(filterCatalog(products, { sort: "price-asc" }).map((p) => p.id)).toEqual(["e", "a", "g"]);
    expect(filterCatalog(products, { sort: "price-desc" }).map((p) => p.id)).toEqual(["g", "a", "e"]);
  });

  const mixed = [
    ...products,
    ...normalizeProducts([raw({ id: "n", public_path: "/course/n", price: [{ currency: "NGN", amount: 15000, discounted_price: null }] })]),
  ];

  it("without a currency, sorts within each currency and never mixes them", () => {
    expect(filterCatalog(mixed, { sort: "price-asc" }).map((p) => p.id)).toEqual(["e", "a", "g", "n"]);
  });

  it("ignores a price band when no currency is chosen", () => {
    expect(filterCatalog(mixed, { price: "tier-4" })).toHaveLength(4);
    expect(validateDreamverseSearch({ price: "tier-4" }).price).toBeUndefined();
    expect(validateDreamverseSearch({ currency: "NGN", price: "tier-4" })).toMatchObject({ currency: "NGN", price: "tier-4" });
  });

  it("NGN shows only resources priced in naira, at their naira price", () => {
    const ngn = filterCatalog(mixed, { currency: "NGN" });
    expect(ngn.map((p) => p.id)).toEqual(["a", "n"]);
    expect(displayPrice(ngn[0]!, "NGN")).toMatchObject({ currency: "NGN", current: 574500, amount: 718500 });
  });

  it("USD hides resources priced only in naira", () => {
    expect(filterCatalog(mixed, { currency: "USD" }).map((p) => p.id)).toEqual(["a", "e", "g"]);
  });

  it("NGN price bands use naira amounts", () => {
    expect(filterCatalog(mixed, { currency: "NGN", price: "tier-1" }).map((p) => p.id)).toEqual(["n"]);
    expect(filterCatalog(mixed, { currency: "NGN", price: "tier-4" }).map((p) => p.id)).toEqual(["a"]);
  });

  it("sorts by naira price when NGN is chosen", () => {
    expect(filterCatalog(mixed, { currency: "NGN", sort: "price-desc" }).map((p) => p.id)).toEqual(["a", "n"]);
  });

  it("treats free resources as free in every currency", () => {
    const free = normalizeProducts([raw({ id: "f", public_path: "/course/f", price: [{ currency: "USD", amount: 0, discounted_price: null }] })]);
    expect(filterCatalog(free, { currency: "NGN", price: "free" }).map((p) => p.id)).toEqual(["f"]);
  });

  it("matches topics on whole words in the resource's own text", () => {
    expect(matchesTopic(products[0]!, "technology")).toBe(true);
    expect(matchesTopic(products[0]!, "finance")).toBe(false);
  });
});

describe("shareable coach filters", () => {
  it("restores coaching area, currency and price band from a link", () => {
    const s = validateDreamverseSearch({ coachArea: "Marketing & Sales", coachCurrency: "NGN", coachPrice: "tier-1" });
    expect(coachFiltersFromSearch(s)).toEqual({ area: "Marketing & Sales", currency: "NGN", price: "tier-1" });
  });

  it("ignores a coach price band without a currency, like the marketplace", () => {
    expect(validateDreamverseSearch({ coachPrice: "tier-3" }).coachPrice).toBeUndefined();
    expect(validateDreamverseSearch({ coachCurrency: "EUR", coachPrice: "tier-3" }).coachCurrency).toBeUndefined();
  });

  it("keeps coach filters separate from marketplace filters", () => {
    const s = validateDreamverseSearch({ currency: "USD", price: "tier-2", coachCurrency: "NGN" });
    expect(s).toMatchObject({ currency: "USD", price: "tier-2", coachCurrency: "NGN" });
    expect(s.coachPrice).toBeUndefined();
  });

  it("clearing coach filters removes their keys from the link", () => {
    expect(coachSearchParams({})).toEqual({ coachArea: undefined, coachCurrency: undefined, coachPrice: undefined, coachSort: undefined });
  });
});

describe("shareable coach sort", () => {
  it("keeps the coach sort in the link, and drops unknown or default values", () => {
    expect(coachFiltersFromSearch(validateDreamverseSearch({ coachSort: "name", coachArea: "Marketing & Sales" }))).toMatchObject({
      sort: "name",
      area: "Marketing & Sales",
    });
    expect(validateDreamverseSearch({ coachSort: "rating" }).coachSort).toBeUndefined();
    expect(coachSearchParams({ sort: "featured" }).coachSort).toBeUndefined();
  });
});
