import { describe, expect, it } from "vitest";
import { buyLabel, findProduct, productKey } from "@/lib/dreamverse/catalog";
import { BEULAHLAND_CHATGPT, DEMO_PRODUCTS } from "@/lib/dreamverse/creators";
import { findProductBySlug, products, productSlug } from "@/components/site/data";

const ngn = (current: number) => [{ currency: "NGN", sign: "₦", amount: current, current, onSale: false }];

describe("details pages", () => {
  it("every homepage course and ebook has its own details page", () => {
    const slugs = products.map(productSlug);
    expect(new Set(slugs).size).toBe(products.length);
    for (const p of products) expect(findProductBySlug(productSlug(p))?.title).toBe(p.title);
  });

  it("every Dreamverse demo listing resolves to its own details page", () => {
    for (const p of DEMO_PRODUCTS) expect(findProduct(productKey(p), DEMO_PRODUCTS)?.id).toBe(p.id);
  });

  it("older links by id still open the listing", () => {
    expect(findProduct(BEULAHLAND_CHATGPT.id, DEMO_PRODUCTS)?.id).toBe(BEULAHLAND_CHATGPT.id);
  });

  it("buy button says Buy course / Buy eBook", () => {
    expect(buyLabel({ type: "course", prices: ngn(5000) })).toBe("Buy course");
    expect(buyLabel({ type: "ebook", prices: ngn(3000) })).toBe("Buy eBook");
    expect(buyLabel({ type: "ebook", prices: ngn(0) })).toBe("Get eBook free");
  });
});
