import { describe, expect, it } from "vitest";
import { couponPhase, promotionProblems } from "./coupons";
import { orderAmount, type Promotion } from "./rules";

const item = { id: "i1", status: "published", price: 10000 } as never;
const state = { items: [item], promotions: [] } as never;
const base: Promotion = { id: "p", name: "", code: "LAUNCH", itemId: "i1", discount: 10, discountType: "percent", start: "2026-01-01", end: "2026-01-31", startTime: "09:00", endTime: "18:00", status: "active" };

describe("coupons", () => {
  it("rejects an end before the start", () => {
    expect(promotionProblems({ ...base, end: "2026-01-01", endTime: "08:00" }, state).end).toBeTruthy();
  });
  it("rejects a percentage above 100", () => {
    expect(promotionProblems({ ...base, discount: 120 }, state).discount).toBeTruthy();
  });
  it("rejects a fixed discount not below the price", () => {
    expect(promotionProblems({ ...base, discountType: "fixed", discount: 10000 }, state).discount).toBeTruthy();
  });
  it("is active only inside its Lagos window and under its limit", () => {
    expect(couponPhase(base, 0, Date.parse("2026-01-01T08:30:00Z"))).toBe("active");
    expect(couponPhase(base, 0, Date.parse("2026-01-01T07:30:00Z"))).toBe("scheduled");
    expect(couponPhase({ ...base, usageLimit: 2 }, 2, Date.parse("2026-01-10T10:00:00Z"))).toBe("used up");
  });
  it("allows a site-wide coupon with no product chosen", () => {
    const wide = { ...base, itemId: "" };
    expect(promotionProblems(wide, state)).toEqual({});
    expect(orderAmount(item, wide, "2026-01-10T10:00:00Z")).toBe(9000);
  });
  it("takes a fixed amount off the price", () => {
    expect(orderAmount(item, { ...base, discountType: "fixed", discount: 2500 }, "2026-01-10T10:00:00Z")).toBe(7500);
  });
});
