import { describe, expect, it } from "vitest";
import { affiliateEvents, affiliateMilestones } from "@/lib/affiliate/rules";
import { initialState } from "@/lib/affiliate/store";
import { dayKey, initialLearnerState, learningStreak, recordLearningDay } from "@/lib/learner/rules";
import { timeAgo } from "@/components/shared/NotificationCentre";

describe("Affiliate milestones", () => {
  it("a new affiliate has earned no milestones", () =>
    expect(affiliateMilestones(initialState).filter((m) => m.earned)).toEqual([]));
  it("promoting a product earns First product", () =>
    expect(affiliateMilestones({ ...initialState, joined: ["x"] }).find((m) => m.id === "first-product")?.earned).toBe(true));
  it("first referral stays locked while referrals are zero", () =>
    expect(affiliateMilestones({ ...initialState, joined: ["x"], linkCopied: true }).find((m) => m.id === "first-referral")?.earned).toBe(false));
});

describe("Affiliate notifications", () => {
  it("accepting terms creates one notification", () =>
    expect(affiliateEvents(initialState, { ...initialState, termsAccepted: true }).map((e) => e.title)).toEqual(["Affiliate terms accepted"]));
  it("promoting a product names it in the notification", () =>
    expect(affiliateEvents(initialState, { ...initialState, joined: ["p1"] }, () => "Vibe coding")[0]?.body).toContain("Vibe coding"));
  it("an unchanged update creates no notification", () =>
    expect(affiliateEvents(initialState, { ...initialState })).toEqual([]));
});

describe("Learner streak", () => {
  const today = new Date(2026, 10, 11, 12);
  const daysAgo = (n: number) => dayKey(new Date(2026, 10, 11 - n, 12));
  it("is zero with no learning days", () => expect(learningStreak([], today)).toBe(0));
  it("counts three consecutive days ending today", () => expect(learningStreak([daysAgo(2), daysAgo(1), daysAgo(0)], today)).toBe(3));
  it("survives until midnight when yesterday was the last day", () => expect(learningStreak([daysAgo(2), daysAgo(1)], today)).toBe(2));
  it("breaks after a missed day", () => expect(learningStreak([daysAgo(3), daysAgo(0)], today)).toBe(1));
  it("records today only when learning actually changed", () => {
    const s = initialLearnerState;
    expect(recordLearningDay(s, { ...s, collapsed: true }, today).learningDays).toEqual([]);
    const learned = { ...s, progress: { r1: { completed: ["l1"], lastAccessed: today.toISOString() } } };
    expect(recordLearningDay(s, learned, today).learningDays).toEqual([dayKey(today)]);
  });
});

describe("Notification time labels", () => {
  const now = new Date("2026-11-11T12:00:00Z").getTime();
  it("shows Just now under a minute", () => expect(timeAgo("2026-11-11T11:59:30Z", now)).toBe("Just now"));
  it("shows minutes under an hour", () => expect(timeAgo("2026-11-11T11:15:00Z", now)).toBe("45 min ago"));
});
