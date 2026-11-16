import { beforeEach, describe, expect, it } from "vitest";

import { creditStoreSales, findStore, storeShopItem } from "@/lib/creator/publicStore";
import { STORAGE_KEY } from "@/lib/creator/data";
import { initialCreatorState } from "@/lib/creator/data";
import { purchaseFromPayment, resourceFromShopItem, unclaimedPayments } from "@/lib/learner/shopBridge";
import { creatorNotificationLink, learnerNotificationLink } from "@/lib/shared/notificationLinks";
import type { PaymentRecord } from "@/lib/shop/payments";

const creatorKey = `${STORAGE_KEY}:ada@example.com`;

function seedCreator(published = true) {
  const s = {
    ...initialCreatorState,
    storefront: { ...initialCreatorState.storefront, name: "Ada's studio", handle: "ada", published },
    items: [{ id: "c1", kind: "course", title: "Pitch decks", description: "Make one", category: "Business", price: 12000, status: "published", image: "", lessons: ["Intro", "Story"], date: "", capacity: 0, duration: 0, createdAt: "2026-11-01T00:00:00.000Z" }],
  };
  localStorage.setItem(creatorKey, JSON.stringify(s));
}

function payment(status: PaymentRecord["status"], email = "buyer@example.com"): PaymentRecord {
  const store = findStore("ada")!;
  const item = storeShopItem(store, store.items[0]!);
  return { reference: "ENS-ABC123", items: [item], totals: [{ currency: "NGN", label: "₦12,000", total: 12000 }], method: "card", methodLabel: "Visa •••• 4242", buyer: { name: "Bola", email }, status, createdAt: "2026-11-13T09:00:00.000Z", updatedAt: "2026-11-13T09:00:05.000Z", events: [], plan: "successful", resolveAt: 0 };
}

describe("creator storefront sales", () => {
  beforeEach(() => localStorage.clear());

  it("only lists live storefronts", () => {
    seedCreator(false);
    expect(findStore("ada")).toBeNull();
  });

  it("records a successful payment as one paid sale for the creator, only once", () => {
    seedCreator();
    const p = payment("successful");
    expect(creditStoreSales(p)).toBe(1);
    expect(creditStoreSales(p)).toBe(0);
    const saved = JSON.parse(localStorage.getItem(creatorKey)!);
    expect(saved.orders).toHaveLength(1);
    expect(saved.orders[0]).toMatchObject({ itemId: "c1", amount: 12000, status: "paid", currency: "NGN" });
    expect(saved.customers[0]).toMatchObject({ email: "buyer@example.com", name: "Bola" });
  });

  it("never records a failed payment as a sale", () => {
    seedCreator();
    expect(creditStoreSales(payment("failed"))).toBe(0);
    expect(JSON.parse(localStorage.getItem(creatorKey)!).orders).toHaveLength(0);
  });
});

describe("purchases reach the learner library", () => {
  beforeEach(() => {
    localStorage.clear();
    seedCreator();
  });

  it("only claims successful payments made with the learner's email", () => {
    const ok = payment("successful", "Buyer@Example.com");
    const other = { ...payment("successful", "someone@else.com"), reference: "ENS-OTHER" };
    const failed = { ...payment("failed"), reference: "ENS-FAIL" };
    expect(unclaimedPayments({ purchases: [] }, [ok, other, failed], "buyer@example.com").map((p) => p.reference)).toEqual(["ENS-ABC123"]);
    expect(unclaimedPayments({ purchases: [purchaseFromPayment(ok)] }, [ok], "buyer@example.com")).toEqual([]);
  });

  it("a bought course uses the creator's own lessons and offers a certificate", () => {
    const item = payment("successful").items[0]!;
    const r = resourceFromShopItem(item, [{ title: "Intro", durationSeconds: 600 }, { title: "Story", durationSeconds: 600 }]);
    expect(r.units.map((u) => u.title)).toEqual(["Intro", "Story"]);
    expect(r.certificate).toBe(true);
    expect(r.price).toBe(12000);
  });
});

describe("notifications open where they're about", () => {
  it("learner purchase, certificate and badge notifications", () => {
    expect(learnerNotificationLink({ type: "purchase", title: "Purchase confirmed" })).toBe("/learner/purchases");
    expect(learnerNotificationLink({ type: "achievement", title: "Certificate ready" })).toBe("/learner/certificates");
    expect(learnerNotificationLink({ type: "achievement", title: "Badge earned" })).toBe("/learner/certificates?tab=badges");
    expect(learnerNotificationLink({ type: "support", title: "Reply from support" })).toBe("/learner/help/requests");
  });

  it("creator sale and payout notifications open the wallet", () => {
    expect(creatorNotificationLink("New sale: Pitch decks to Bola")).toBe("/creator/wallet");
    expect(creatorNotificationLink("Withdrawal sent")).toBe("/creator/wallet");
  });
});
