import { describe, it, expect } from "vitest";
import { initialCreatorState } from "@/lib/creator/data";
import { deleteForever, deleteForeverBlock, inBin, moveToBin, restoreFromBin } from "@/lib/creator/bin";
import type { CreatorItem, CreatorState } from "@/lib/creator/rules";

const item: CreatorItem = {
  id: "toolkit", kind: "ebook", title: "Toolkit", description: "Templates", category: "Business",
  price: 15000, status: "published", image: "", lessons: [], date: "", capacity: 0, duration: 0,
  createdAt: "2026-11-01T10:00:00Z",
};
const base: CreatorState = { ...initialCreatorState, items: [item] };

describe("product Bin", () => {
  it("moving a published product to the Bin takes it off the storefront", () => {
    const [binned] = moveToBin(base, "toolkit", "2026-11-12T10:00:00Z");
    expect(binned?.status).toBe("archived");
    expect(binned && inBin(binned)).toBe(true);
  });

  it("restore brings the product back with its old status", () => {
    const items = moveToBin(base, "toolkit");
    const [restored] = restoreFromBin({ items }, "toolkit");
    expect(restored?.status).toBe("published");
    expect(restored && inBin(restored)).toBe(false);
  });

  it("a product nobody bought can be deleted for good, with its coupons", () => {
    const state: CreatorState = {
      ...base,
      items: moveToBin(base, "toolkit"),
      promotions: [{ id: "p", name: "Launch", code: "L10", itemId: "toolkit", discount: 10, start: "2026-11-01", end: "2026-12-01", status: "draft" }],
    };
    const next = deleteForever(state, "toolkit");
    expect(next?.items).toHaveLength(0);
    expect(next?.promotions).toHaveLength(0);
  });

  it("a product someone bought can't be deleted for good", () => {
    const state: CreatorState = {
      ...base,
      orders: [{ id: "o1", itemId: "toolkit", itemTitle: "Toolkit", customerId: "c1", amount: 15000, date: "2026-11-02", status: "paid", currency: "NGN" } as CreatorState["orders"][number]],
    };
    expect(deleteForeverBlock(state, "toolkit")).not.toBe("");
    expect(deleteForever(state, "toolkit")).toBeNull();
  });
});
