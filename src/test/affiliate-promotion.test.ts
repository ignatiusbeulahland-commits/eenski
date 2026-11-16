import { describe, expect, it } from "vitest";
import { estCommission, products, rateFor, referralLink, trackingId, TYPE_RATE } from "@/lib/affiliate/products";
import { linkFor, recordCopy, recordShare, regeneratePromotion, shareCount, shareMessage, startPromotion } from "@/lib/affiliate/promotions";
import { milestoneReached } from "@/lib/assistant/milestones";
import { victoryPoseAt } from "@/components/assistant/VictoryCurtain";

const byId = (id: string) => products.find((p) => p.id === id)!;

describe("commission rates", () => {
  it("courses default to 20% and eBooks to 30%", () => {
    expect(TYPE_RATE).toEqual({ Course: 20, Ebook: 30 });
    expect(rateFor(byId("vibe-coding"))).toBe(20);
    expect(rateFor(byId("storytelling-hired"))).toBe(30);
  });
  it("a product's own rate overrides its type rate", () => {
    expect(rateFor(byId("get-gigs"))).toBe(25);
    expect(rateFor(byId("react-patterns"))).toBe(15);
    expect(rateFor(byId("freelancing"))).toBe(25);
  });
  it("rates stay between 15% and 30%", () => {
    expect(rateFor({ type: "Course", commissionRate: 40 })).toBe(30);
    expect(rateFor({ type: "Course", commissionRate: 5 })).toBe(15);
    for (const p of products) expect(rateFor(p)).toBeGreaterThanOrEqual(15), expect(rateFor(p)).toBeLessThanOrEqual(30);
  });
  it("estimated earnings are price × rate", () => {
    expect(estCommission(byId("vibe-coding"))).toBe(7000);
    expect(estCommission(byId("freelancing"))).toBe(1875);
    expect(estCommission(byId("react-patterns"))).toBe(6750);
  });
});

describe("referral links", () => {
  it("are the same every time for the same affiliate and product", () => {
    expect(referralLink("podcast", "ada")).toBe("https://tryenski.com/r/ada-podcast");
    expect(trackingId("podcast", "ada")).toBe(trackingId("podcast", "ada"));
    expect(trackingId("podcast", "ada")).toMatch(/^ENK-[0-9A-Z]{3}-[0-9A-Z]{4}$/);
  });
  it("revisiting a promoted product keeps its link", () => {
    const a = startPromotion({}, "podcast", "2026-11-01T00:00:00Z");
    const b = startPromotion(a, "podcast", "2026-11-09T00:00:00Z");
    expect(b).toBe(a);
    expect(linkFor(b, "podcast", "ada").url).toBe("https://tryenski.com/r/ada-podcast");
  });
  it("only changes when regenerated, and the new one resets its counts", () => {
    let s = startPromotion({}, "podcast");
    s = recordCopy(s, "podcast");
    s = recordShare(s, "podcast", "whatsapp");
    const r = regeneratePromotion(s, "podcast");
    expect(linkFor(r, "podcast", "ada").url).toBe("https://tryenski.com/r/ada-podcast-2");
    expect(linkFor(r, "podcast", "ada").tracking).not.toBe(linkFor(s, "podcast", "ada").tracking);
    expect(r["podcast"]!.copies).toBe(0);
    expect(shareCount(r["podcast"]!)).toBe(0);
  });
  it("counts copies and shares", () => {
    let s = startPromotion({}, "podcast");
    s = recordCopy(recordCopy(s, "podcast"), "podcast");
    s = recordShare(recordShare(s, "podcast", "linkedin"), "podcast", "twitter");
    expect(s["podcast"]!.copies).toBe(2);
    expect(shareCount(s["podcast"]!)).toBe(2);
  });
  it("share messages carry the link and say it's an affiliate link", () => {
    const msg = shareMessage("whatsapp", byId("podcast"), "https://tryenski.com/r/ada-podcast");
    expect(msg).toContain("https://tryenski.com/r/ada-podcast");
    expect(msg.toLowerCase()).toContain("affiliate link");
  });
});

describe("Charm celebrations", () => {
  it("a milestone fires only when the count rises after it was first seen", () => {
    expect(milestoneReached(undefined, 3)).toBe(false);
    expect(milestoneReached(2, 3)).toBe(true);
    expect(milestoneReached(3, 3)).toBe(false);
  });
  it("the victory curtain goes point → celebrate → clap → proud", () => {
    expect(victoryPoseAt(0)).toBe("point");
    expect(victoryPoseAt(1000)).toBe("celebrate");
    expect(victoryPoseAt(3000)).toBe("clap");
    expect(victoryPoseAt(6000)).toBe("proud");
  });
});
