import { describe, expect, it } from "vitest";
import { dashboardTypeOf, joinRoleFrom, joinRoles } from "@/components/site/data";
import { clampStep, progressOf, resumeIndex, stepsFor, withStepDone } from "./flows";

describe("role onboarding", () => {
  it("gives each role its own steps", () => {
    expect(stepsFor("learner").map((s) => s.id)).toEqual(["about", "interests", "explore"]);
    expect(stepsFor("creator").map((s) => s.id)).toEqual(["profile", "photo", "tools"]);
    expect(stepsFor("affiliate").map((s) => s.id)).toEqual(["profile", "referrals", "earnings"]);
  });
  it("resumes at the first unfinished step", () => {
    const rec = withStepDone(undefined, "creator", "profile");
    expect(resumeIndex(rec, "creator")).toBe(1);
    expect(progressOf(rec, "creator")).toMatchObject({ done: 1, total: 3, complete: false });
  });
  it("opens the ready screen only when every step is finished", () => {
    let rec = withStepDone(undefined, "affiliate", "profile");
    expect(clampStep(3, rec, "affiliate")).toBe(1);
    rec = withStepDone(withStepDone(rec, "affiliate", "referrals"), "affiliate", "earnings");
    expect(clampStep(3, rec, "affiliate")).toBe(3);
    expect(progressOf(rec, "affiliate").complete).toBe(true);
  });
  it("lets people go back to an earlier step", () => {
    const rec = withStepDone(withStepDone(undefined, "learner", "about"), "learner", "interests");
    expect(clampStep(0, rec, "learner")).toBe(0);
  });
  it("starts over when someone joins as a different role", () => {
    const rec = withStepDone(undefined, "learner", "about");
    expect(progressOf(rec, "creator").done).toBe(0);
    expect(withStepDone(rec, "creator", "profile").done).toEqual(["profile"]);
  });
  it("treats facilitators as creators, with no role of their own", () => {
    expect(joinRoleFrom("facilitator")).toBe("creator");
    expect(joinRoles.map((r) => r.id)).toEqual(["learner", "creator", "affiliate"]);
    expect(dashboardTypeOf("creator")).toBe("creator");
  });
});
