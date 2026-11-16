import { describe, expect, it } from "vitest";
import { resources } from "@/lib/learner/catalog";
import { isLearnerLinkActive, learnerLinks, learnerSections } from "@/lib/learner/nav";
import { addToCart, checkout, discountPct, initialLearnerState, recommendResources, toggleWishlist, withAchievements, type LearnerState } from "@/lib/learner/rules";
import { checkSwitchPassword, isTrusted, trustExpiry, TRUST_MS } from "@/lib/profileSwitch";

const apply = (s: LearnerState, patch: Partial<LearnerState>) => withAchievements({ ...s, ...patch });

describe("profile switch confirmation", () => {
  it("rejects an empty or short password and accepts 8+ characters", () => {
    expect(checkSwitchPassword("")).toMatch(/Enter your password/);
    expect(checkSwitchPassword("       ")).toMatch(/Enter your password/);
    expect(checkSwitchPassword("1234567")).toMatch(/at least 8/);
    expect(checkSwitchPassword("12345678")).toBeNull();
  });
  it("'Don't ask again' lasts exactly 30 minutes", () => {
    const now = 1_000_000;
    const stored = String(trustExpiry(now));
    expect(TRUST_MS).toBe(30 * 60 * 1000);
    expect(isTrusted(stored, now + 29 * 60 * 1000)).toBe(true);
    expect(isTrusted(stored, now + 30 * 60 * 1000)).toBe(false);
    expect(isTrusted(null, now)).toBe(false);
    expect(isTrusted(String(now + 2 * TRUST_MS), now)).toBe(false);
  });
});

describe("recommended for you", () => {
  it("mixes courses, templates, coaching and ebooks for a new learner", () => {
    const recs = recommendResources(initialLearnerState);
    expect(recs).toHaveLength(resources.length);
    expect(new Set(recs.slice(0, 4).map((r) => r.resource.type))).toEqual(new Set(["Course", "Template", "Coaching", "Ebook"]));
    expect(recs.every((r) => r.reason === "starter")).toBe(true);
  });
  it("ranks the saved category first and never recommends owned resources", () => {
    const coaching = resources.find((r) => r.type === "Coaching")!;
    const saved = apply(initialLearnerState, toggleWishlist(initialLearnerState, { kind: "resource", id: coaching.id }));
    const recs = recommendResources(saved);
    expect(recs[0]!.resource.category).toBe(coaching.category);
    expect(recs[0]!.reason).toBe("saved");

    const withCart = apply(initialLearnerState, addToCart(initialLearnerState, { kind: "resource", id: coaching.id }));
    const bought = apply(withCart, checkout(withCart, "card", "success")!.patch);
    expect(recommendResources(bought).some((r) => r.resource.id === coaching.id)).toBe(false);
  });
  it("computes the promotion discount from the list price", () => {
    expect(discountPct({ price: 30000, originalPrice: 40000 })).toBe(25);
    expect(discountPct({ price: 30000 })).toBe(0);
  });
});

describe("learner sidebar", () => {
  it("only links to existing learner pages, plus the external website", () => {
    const groups = learnerSections.map((s) => s.label);
    expect(groups).toEqual(["Main menu", "My library", "Account", "Support"]);
    expect(learnerLinks.every((l) => l.to.startsWith("/learner/"))).toBe(true);
    const external = learnerSections.flatMap((s) => s.items).filter((i) => "href" in i);
    expect(external.map((e) => e.label)).toEqual(["Back to website"]);
  });
  it("highlights Discover and My Resources on the right view of the resources page", () => {
    const discover = learnerLinks.find((l) => l.label === "Discover")!;
    const library = learnerLinks.find((l) => l.label === "My Resources / Products")!;
    expect(isLearnerLinkActive(discover, "/learner/resources", "discover")).toBe(true);
    expect(isLearnerLinkActive(library, "/learner/resources", "discover")).toBe(false);
    expect(isLearnerLinkActive(library, "/learner/resources", undefined)).toBe(true);
    expect(isLearnerLinkActive(library, "/learner/resources/vibe-coding", undefined)).toBe(true);
    const wishlist = learnerLinks.find((l) => l.to === "/learner/wishlist")!;
    expect(isLearnerLinkActive(wishlist, "/learner/cart")).toBe(true);
  });
});
