import { describe, it, expect } from "vitest";
import { initialCreatorState } from "@/lib/creator/data";
import {
  availableBalance,
  totalEarnings,
  validateItem,
  validatePromotion,
  validateRule,
  saveRule,
  validateLanding,
  validateAvailability,
  uniqueSlug,
  orderAmount,
  payoutError,
  averageRating,
  stateSchema,
  type CreatorItem,
  type Promotion,
  type LandingPage, creatorBalances, currencyPayoutError } from "@/lib/creator/rules";
const item: CreatorItem = {
  id: "toolkit",
  kind: "ebook",
  title: "Toolkit",
  description: "Templates",
  category: "Business",
  price: 15000,
  status: "published",
  image: "",
  lessons: [],
  date: "",
  capacity: 0,
  duration: 0,
  createdAt: "2026-11-01T10:00:00Z",
};
const promotion: Promotion = {
  id: "launch",
  name: "Launch",
  code: "LAUNCH10",
  itemId: "toolkit",
  discount: 10,
  start: "2026-11-01",
  end: "2026-12-31",
  status: "draft",
};
const withData = { ...initialCreatorState, items: [item], promotions: [promotion] };
const order = { id: "o1", itemId: "toolkit", itemTitle: "Toolkit", customerId: "c1", amount: 25000, date: "2026-11-10T12:00:00Z", status: "paid" as const, currency: "NGN" as const };
describe("New Creator account", () => {
  it("starts with every list empty", () => {
    for (const key of ["items", "customers", "orders", "promotions", "reviews", "media", "affiliates", "rules", "programs", "landingPages", "leads", "payouts", "activity"] as const)
      expect(initialCreatorState[key]).toHaveLength(0);
  });
  it("starts with a zero balance, no bank and no storefront", () => {
    expect(totalEarnings(initialCreatorState)).toBe(0);
    expect(availableBalance(initialCreatorState)).toBe(0);
    expect(initialCreatorState.bank).toBeNull();
    expect(initialCreatorState.storefront.handle).toBe("");
    expect(initialCreatorState.universe.demoEligibleEarningsUsd).toBe(0);
  });
  it("is a valid stored record", () => expect(stateSchema.safeParse(initialCreatorState).success).toBe(true));
});
describe("Creator product rules", () => {
  it("requires titles and descriptions", () => expect(validateItem({ ...item, title: "" })).not.toBe(""));
  it("rejects negative prices", () => expect(validateItem({ ...item, price: -1 })).not.toBe(""));
  it("requires a curriculum for courses", () => expect(validateItem({ ...item, kind: "course", lessons: [] })).not.toBe(""));
  it("requires a date and whole capacity for live sessions", () => {
    expect(validateItem({ ...item, kind: "live", date: "invalid", capacity: 1 })).not.toBe("");
    expect(validateItem({ ...item, kind: "live", date: "2026-12-12T10:00", capacity: 1.5 })).not.toBe("");
    expect(validateItem({ ...item, kind: "live", date: "2026-12-12T10:00", capacity: 10 })).toBe("");
  });
  it("requires coaching sessions of at least 15 minutes", () => {
    expect(validateItem({ ...item, kind: "coaching", duration: 10 })).not.toBe("");
    expect(validateItem({ ...item, kind: "coaching", duration: 15 })).toBe("");
  });
  it("requires services to take at least one day", () => {
    expect(validateItem({ ...item, kind: "service", duration: 0 })).not.toBe("");
    expect(validateItem({ ...item, kind: "service", duration: 1 })).toBe("");
  });
  it("creates unique product addresses", () => {
    expect(uniqueSlug("Design Foundations!", [])).toBe("design-foundations");
    expect(uniqueSlug("Design Foundations", ["design-foundations"])).toBe("design-foundations-2");
  });
});
describe("Coupons", () => {
  it("validates discount bounds", () => expect(validatePromotion({ ...promotion, discount: 101 }, withData)).not.toBe(""));
  it("rejects reversed dates", () =>
    expect(validatePromotion({ ...promotion, start: "2026-12-31", end: "2026-11-01" }, withData)).not.toBe(""));
  it("rejects duplicate codes", () => expect(validatePromotion({ ...promotion, id: "new" }, withData)).not.toBe(""));
  it("needs an existing product", () => expect(validatePromotion(promotion, initialCreatorState)).not.toBe(""));
  it("applies active discounts only within their dates", () => {
    expect(orderAmount(item, { ...promotion, status: "active" }, "2026-11-11T12:00:00Z")).toBe(13500);
    expect(orderAmount(item, { ...promotion, status: "active" }, "2027-01-01T12:00:00Z")).toBe(15000);
    expect(orderAmount(item, promotion, "2026-11-11T12:00:00Z")).toBe(15000);
  });
});
describe("Wallet", () => {
  const s = { ...initialCreatorState, orders: [order], bank: { holder: "Demo", bank: "Demo", last4: "1234" } };
  it("requires a bank before payouts", () => expect(payoutError({ ...s, bank: null }, 100)).not.toBe(""));
  it("rejects payouts exceeding available funds", () => {
    expect(payoutError(s, 25001)).not.toBe("");
    expect(payoutError(s, 25000)).toBe("");
  });
  it("payouts reduce available funds", () =>
    expect(availableBalance({ ...s, payouts: [{ id: "p", amount: 5000, date: "2026-11-11", status: "simulated", last4: "1234", currency: "NGN" }] })).toBe(20000));
  it("refunds remove earnings", () => expect(totalEarnings({ orders: [{ ...order, status: "refunded" }] })).toBe(0));
  it("only keeps the last four bank digits", () =>
    expect(stateSchema.safeParse({ ...s, bank: { holder: "Demo", bank: "Demo", last4: "1234567890" } }).success).toBe(false));
  it("keeps a separate balance per currency and counts requested payouts as upcoming", () => {
    const gbp = { ...order, id: "o2", amount: 40, currency: "GBP" as const };
    const b = creatorBalances({ ...s, orders: [order, gbp], payouts: [{ id: "p", amount: 5000, date: "", status: "simulated", last4: "1234", currency: "NGN" }] });
    expect(b.find((x) => x.currency === "NGN")).toMatchObject({ available: 20000, upcoming: 5000 });
    expect(b.find((x) => x.currency === "GBP")?.available).toBe(40);
  });
  it("needs a saved payout account and an amount within that currency's balance", () => {
    expect(currencyPayoutError(s, 100, "NGN")).not.toBe("");
    const withAccount = { ...s, beneficiaries: [{ id: "b", country: "NG", currency: "NGN" as const, railId: "ng-ngn-bank", method: "bank" as const, provider: "paystack" as const, institution: { code: "058", name: "GTBank", logo: null }, holder: "Demo", nickname: "", last4: "1234", details: [], status: "format_checked" as const, preferred: true, fingerprint: "f", createdAt: "" }] };
    expect(currencyPayoutError(withAccount, 25000, "NGN")).toBe("");
    expect(currencyPayoutError(withAccount, 1, "GBP")).not.toBe("");
  });
});
describe("Affiliate commission rules", () => {
  it("accepts 1% to 90%", () => {
    expect(validateRule({ id: "a", name: "Std", rate: 0.5, isDefault: false }, [])).not.toBe("");
    expect(validateRule({ id: "a", name: "Std", rate: 91, isDefault: false }, [])).not.toBe("");
    expect(validateRule({ id: "a", name: "Std", rate: 20, isDefault: false }, [])).toBe("");
  });
  it("keeps only one default rule", () => {
    const rules = saveRule([{ id: "a", name: "A", rate: 10, isDefault: true }], { id: "b", name: "B", rate: 20, isDefault: true });
    expect(rules.filter((r) => r.isDefault).map((r) => r.id)).toEqual(["b"]);
  });
});
describe("Landing pages and availability", () => {
  const page: LandingPage = { id: "p", title: "Launch", slug: "launch", itemId: "", headline: "Join", body: "", cta: "Join", status: "draft", date: "", template: "spotlight", cover: "", sections: [] };
  it("requires every added section to have a title", () => {
    expect(validateLanding({ ...page, sections: [{ id: "s", title: " ", text: "", image: "" }] }, [])).not.toBe("");
    expect(validateLanding({ ...page, sections: [{ id: "s", title: "What you get", text: "", image: "" }] }, [])).toBe("");
  });
  it("requires a unique, valid address", () => {
    expect(validateLanding(page, [])).toBe("");
    expect(validateLanding({ ...page, slug: "Bad Slug" }, [])).not.toBe("");
    expect(validateLanding(page, [{ ...page, id: "other" }])).not.toBe("");
  });
  it("needs end times after start times", () => {
    expect(validateAvailability([{ enabled: true, start: "10:00", end: "09:00" }])).not.toBe("");
    expect(validateAvailability([{ enabled: false, start: "10:00", end: "09:00" }])).toBe("");
  });
  it("averages ratings to one decimal", () => expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.3));
});

import { creatorTransactions, type Order } from "@/lib/creator/rules";
describe("creator transaction history", () => {
  it("maps paid sales to successful money in, refunds to refunded and payout requests to pending money out", () => {
    const s = initialCreatorState;
    const rows = creatorTransactions({
      ...s,
      orders: [
        { id: "o1", itemId: "i", itemTitle: "Course", customerId: "c", amount: 5000, date: "2026-11-01T10:00:00Z", status: "paid", currency: "NGN" } as Order,
        { id: "o2", itemId: "i", itemTitle: "Ebook", customerId: "c", amount: 2000, date: "2026-11-02T10:00:00Z", status: "refunded", currency: "NGN" } as Order,
      ],
      payouts: [{ id: "p1", amount: 3000, date: "2026-11-03T10:00:00Z", status: "simulated", last4: "6789", currency: "NGN" }],
    });
    expect(rows.map((r) => [r.status, r.direction, r.amount])).toEqual([["successful", "in", 5000], ["refunded", "in", 2000], ["pending", "out", 3000]]);
    expect(rows[2]!.reference).toMatch(/^PAY-/);
  });
});
