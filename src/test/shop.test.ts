import { describe, expect, it } from "vitest";

import { discountPercent, subtotals } from "@/lib/shop/money";
import { recommend, searchItems, sortItems } from "@/lib/shop/recommend";
import { addOnce, makeOrder, moveAllToCart, pushRecent, shop, toggleIn } from "@/lib/shop/store";
import type { ShopItem } from "@/lib/shop/types";

const ngn = (current: number, amount = current) => ({ currency: "NGN", sign: "₦", amount, current, onSale: current < amount });

const item = (key: string, over: Partial<ShopItem> = {}): ShopItem => ({
  key,
  route: { kind: "course", slug: key },
  title: key,
  summary: "",
  typeLabel: "Course",
  creator: null,
  image: { src: "x.webp", fit: "cover" },
  price: ngn(5000),
  rating: null,
  reviewKey: `course:${key}`,
  status: "published",
  canCart: true,
  category: null,
  demo: false,
  popularity: 0,
  students: null,
  publishedAt: null,
  ...over,
});

describe("prices on shop cards", () => {
  it("shows the percentage off only when discounted", () => {
    expect(discountPercent(ngn(7500, 10000))).toBe(25);
    expect(discountPercent(ngn(5000))).toBe(0);
    expect(discountPercent(null)).toBe(0);
  });

  it("totals the cart per currency without converting", () => {
    const usd = { currency: "USD", sign: "$", amount: 20, current: 20, onSale: false };
    const t = subtotals([ngn(5000), ngn(2500), usd]);
    expect(t.map((r) => [r.currency, r.total])).toEqual([
      ["NGN", 7500],
      ["USD", 20],
    ]);
  });
});

describe("wishlist, cart and recently viewed", () => {
  it("toggles an item in and out of the wishlist", () => {
    const a = item("a");
    const first = toggleIn([], a);
    expect(first.added).toBe(true);
    expect(toggleIn(first.list, a)).toEqual({ list: [], added: false });
  });

  it("adds an item to the cart only once, and never one that can't be bought", () => {
    const a = item("a");
    const once = addOnce([], a);
    expect(addOnce(once.list, a).list).toHaveLength(1);
    expect(addOnce([], item("soon", { canCart: false })).added).toBe(false);
  });

  it("keeps recently viewed newest first without repeats", () => {
    let list: ShopItem[] = [];
    for (const k of ["a", "b", "a", "c"]) list = pushRecent(list, item(k), 3);
    expect(list.map((i) => i.key)).toEqual(["c", "a", "b"]);
  });
});

describe("finding products", () => {
  const items = [
    item("figma", { title: "Figma for PMs", creator: { name: "Beulahland Ignatius", slug: null, avatar: null }, category: "Design" }),
    item("gigs", { title: "Get gigs", creator: { name: "Salem King", slug: null, avatar: null }, category: "Career", popularity: 9 }),
  ];

  it("searches by product name or creator", () => {
    expect(searchItems(items, "figma").map((i) => i.key)).toEqual(["figma"]);
    expect(searchItems(items, "salem").map((i) => i.key)).toEqual(["gigs"]);
  });

  it("sorts by price within the chosen currency", () => {
    const list = [item("dear", { price: ngn(9000) }), item("cheap", { price: ngn(1000) })];
    expect(sortItems(list, "price-asc", "NGN").map((i) => i.key)).toEqual(["cheap", "dear"]);
  });

  it("ranks items like the ones you viewed first, and says when it isn't personal", () => {
    expect(recommend(items, { recent: [], wishlist: [], cart: [] }).personal).toBe(false);
    const r = recommend(items, { recent: [items[0]!], wishlist: [], cart: [] });
    expect(r.personal).toBe(true);
    expect(r.items[0]!.key).toBe("figma");
  });
});

describe("wishlist page: add all to cart", () => {
  it("moves only buyable items not already in the cart", () => {
    shop.toggleWishlist(item("a"));
    shop.toggleWishlist(item("b", { canCart: false }));
    shop.toggleWishlist(item("c"));
    shop.addToCart(item("c"));
    expect(moveAllToCart()).toBe(1);
    expect(moveAllToCart()).toBe(0);
  });
});

describe("demo checkout orders", () => {
  it("totals each currency separately and leaves out unpriced items", () => {
    const usd = { currency: "USD", sign: "$", amount: 20, current: 20, onSale: false };
    const order = makeOrder([item("a"), item("b", { price: ngn(3000) }), item("c", { price: usd }), item("d", { price: null })], new Date("2026-11-12T00:00:00Z"), "abc-123456");
    expect(order?.items.map((i) => i.key)).toEqual(["a", "b", "c"]);
    expect(order?.totals.map((t) => t.currency)).toEqual(["NGN", "USD"]);
    expect(order?.number).toBe("ENS-123456");
  });

  it("refuses an order with nothing priced", () => {
    expect(makeOrder([item("x", { price: null })], new Date(), "id")).toBeNull();
  });

  it("placing an order takes its items out of the cart", () => {
    shop.addToCart(item("p1"));
    shop.addToCart(item("p2"));
    const order = shop.placeOrder([item("p1")]);
    expect(order).not.toBeNull();
    expect(addOnce([], item("p2")).added).toBe(true);
  });
});
