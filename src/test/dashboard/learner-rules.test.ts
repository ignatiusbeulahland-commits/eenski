import { describe, expect, it } from "vitest";
import { events, resources } from "@/lib/learner/catalog";
import {
  addToCart, badgeDefs, canAddToCart, cartTotals, checkout, confirmTransfer, initialLearnerState, markAttended,
  moveToCart, ownedResourceIds, registerFree, setQty, stateSchema, toggleUnit, toggleWishlist, withAchievements, type LearnerState,
} from "@/lib/learner/rules";

const apply = (s: LearnerState, patch: Partial<LearnerState>) => withAchievements({ ...s, ...patch });
const course = resources.find((r) => r.type === "Course")!;
const ebook = resources.find((r) => r.type === "Ebook")!;
const freeEvent = events.find((e) => e.price === 0 && new Date(e.start).getTime() > Date.now())!;
const paidEvent = events.find((e) => e.price > 0 && new Date(e.start).getTime() > Date.now())!;
const pastEvent = events.find((e) => new Date(e.start).getTime() < Date.now())!;
const buy = (s: LearnerState, id = course.id) => {
  const withCart = apply(s, addToCart(s, { kind: "resource", id }));
  return apply(withCart, checkout(withCart, "card", "success")!.patch);
};

describe("new learner", () => {
  it("starts with every list empty and no achievements", () => {
    const s = initialLearnerState;
    expect([s.wishlist, s.cart, s.purchases, s.registrations, s.certificates, s.notifications, s.support]).toEqual([[], [], [], [], [], [], []]);
    expect(s.badges).toEqual({});
    expect(withAchievements(s).badges).toEqual({});
    expect(stateSchema.safeParse(s).success).toBe(true);
  });
});

describe("cart and wishlist", () => {
  it("adds a resource once with quantity 1 and totals catalogue prices with no extra fees", () => {
    let s = apply(initialLearnerState, addToCart(initialLearnerState, { kind: "resource", id: course.id }));
    s = apply(s, addToCart(s, { kind: "resource", id: course.id }));
    expect(s.cart).toHaveLength(1);
    expect(setQty(s, { kind: "resource", id: course.id }, 3)).toEqual({});
    expect(cartTotals(s.cart).total).toBe(course.price);
  });
  it("allows 1 to 5 tickets for a paid event", () => {
    let s = apply(initialLearnerState, addToCart(initialLearnerState, { kind: "event", id: paidEvent.id }));
    s = apply(s, setQty(s, { kind: "event", id: paidEvent.id }, 9));
    expect(s.cart[0]!.qty).toBe(5);
    expect(cartTotals(s.cart).total).toBe(paidEvent.price * 5);
  });
  it("refuses free events, past events and owned resources", () => {
    expect(canAddToCart(initialLearnerState, { kind: "event", id: freeEvent.id }).ok).toBe(false);
    expect(canAddToCart(initialLearnerState, { kind: "event", id: pastEvent.id }).ok).toBe(false);
    expect(canAddToCart(buy(initialLearnerState), { kind: "resource", id: course.id }).ok).toBe(false);
  });
  it("moves a saved item from wishlist to cart", () => {
    let s = apply(initialLearnerState, toggleWishlist(initialLearnerState, { kind: "resource", id: ebook.id }));
    s = apply(s, moveToCart(s, { kind: "resource", id: ebook.id }));
    expect(s.wishlist).toHaveLength(0);
    expect(s.cart.map((c) => c.id)).toEqual([ebook.id]);
  });
});

describe("checkout", () => {
  it("card success grants access and clears the cart", () => {
    const s = buy(initialLearnerState);
    expect(s.purchases[0]!.status).toBe("paid");
    expect(s.cart).toHaveLength(0);
    expect(ownedResourceIds(s)).toEqual([course.id]);
  });
  it("declined payment grants nothing and keeps the cart", () => {
    const s0 = apply(initialLearnerState, addToCart(initialLearnerState, { kind: "resource", id: course.id }));
    const s = apply(s0, checkout(s0, "card", "failure")!.patch);
    expect(s.purchases[0]!.status).toBe("failed");
    expect(s.cart).toHaveLength(1);
    expect(ownedResourceIds(s)).toEqual([]);
  });
  it("bank transfer stays pending until confirmed, then issues event tickets", () => {
    const s0 = apply(initialLearnerState, addToCart(initialLearnerState, { kind: "event", id: paidEvent.id }));
    let s = apply(s0, checkout(s0, "transfer", "success")!.patch);
    expect(s.purchases[0]!.status).toBe("pending");
    expect(s.registrations).toHaveLength(0);
    s = apply(s, confirmTransfer(s, s.purchases[0]!.id));
    expect(s.purchases[0]!.status).toBe("paid");
    expect(s.registrations.map((r) => r.eventId)).toEqual([paidEvent.id]);
  });
  it("returns nothing for an empty cart", () => {
    expect(checkout(initialLearnerState, "card", "success")).toBeNull();
  });
});

describe("achievements", () => {
  it("only an owned resource records progress", () => {
    expect(toggleUnit(initialLearnerState, course.id, course.units[0]!.id)).toEqual({});
  });
  it("completing every lesson unlocks First Lesson and Finisher and issues one certificate", () => {
    let s = buy(initialLearnerState);
    for (const u of course.units) s = apply(s, toggleUnit(s, course.id, u.id));
    expect(s.badges["first-lesson"]).toBeTruthy();
    expect(s.badges["finisher"]).toBeTruthy();
    expect(s.certificates).toHaveLength(1);
    expect(s.certificates[0]!.issuer).toBe(course.creator);
    const again = withAchievements(s);
    expect(again.certificates).toHaveLength(1);
  });
  it("ebooks never issue certificates", () => {
    let s = buy(initialLearnerState, ebook.id);
    for (const u of ebook.units) s = apply(s, toggleUnit(s, ebook.id, u.id));
    expect(s.certificates).toHaveLength(0);
  });
  it("registering and attending an event unlocks participation badges; badges are never revoked", () => {
    let s = apply(initialLearnerState, registerFree(initialLearnerState, freeEvent.id));
    expect(s.badges["rsvp"]).toBeTruthy();
    expect(s.badges["show-up"]).toBeUndefined();
    s = apply(s, markAttended(s, freeEvent.id));
    expect(s.badges["show-up"]).toBeTruthy();
    const firstDate = s.badges["show-up"];
    s = apply(s, { registrations: [] });
    expect(s.badges["show-up"]).toBe(firstDate);
  });
  it("defines eleven automatic learning and participation badges with no earnings-based levels", () => {
    expect(badgeDefs).toHaveLength(11);
    expect(badgeDefs.every((b) => b.category === "Learning" || b.category === "Participation")).toBe(true);
  });
});

import { learnerTransactions } from "@/lib/learner/rules";
describe("learner purchase history", () => {
  it("keeps the order number as reference and maps paid/pending/failed statuses", () => {
    const base = { items: [{ kind: "resource" as const, id: "r", title: "Book", price: 100, qty: 1 }], total: 100, date: "2026-11-01T00:00:00Z", method: "card" as const };
    const rows = learnerTransactions([
      { ...base, id: "a", orderNumber: "EN-1", status: "paid" },
      { ...base, id: "b", orderNumber: "EN-2", status: "pending", method: "transfer" },
      { ...base, id: "c", orderNumber: "EN-3", status: "failed" },
    ] as never);
    expect(rows.map((r) => [r.reference, r.status, r.method])).toEqual([["EN-1", "successful", "Card"], ["EN-2", "pending", "Bank transfer"], ["EN-3", "failed", "Card"]]);
  });
});

import { badgeProgress as progressOf, initialLearnerState as blankLearner } from "@/lib/learner/rules";
describe("new automatic badges", () => {
  it("Learning Milestone needs 25 completed lessons", () => {
    expect(badgeDefs.find((b) => b.id === "learning-milestone")?.target).toBe(25);
  });
  it("Early Achiever needs a certificate within 7 days of buying", () => {
    const bought = "2026-11-01T10:00:00.000Z";
    const s = { ...blankLearner, purchases: [{ id: "p", orderNumber: "1", date: bought, items: [{ kind: "resource" as const, id: "r1", title: "R", price: 0, qty: 1 }], total: 0, status: "paid" as const, method: "card" as const }] };
    const fast = { ...s, certificates: [{ id: "cert-r1", resourceId: "r1", title: "R", issuer: "X", issuedAt: "2026-11-06T10:00:00.000Z" }] };
    const slow = { ...s, certificates: [{ id: "cert-r1", resourceId: "r1", title: "R", issuer: "X", issuedAt: "2026-11-12T10:00:00.000Z" }] };
    expect(progressOf(fast)["early-achiever"]).toBe(1);
    expect(progressOf(slow)["early-achiever"]).toBe(0);
  });
});
