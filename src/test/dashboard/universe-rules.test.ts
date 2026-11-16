import { describe, it, expect } from "vitest";
import {
  MILESTONES,
  progression,
  initialUniverse,
  reconcileUniverse,
  isAchieved,
  canConfirmDemoVerification,
} from "@/lib/creator/universe/rules";
describe("Enski Creator Universe", () => {
  const exact = [
    [1, 1000, "Spark"],
    [2, 5000, "Forge"],
    [3, 10000, "Visionary"],
    [4, 25000, "Illumina"],
    [5, 50000, "Mogul"],
    [6, 100000, "Titan"],
    [7, 250000, "Ascendant"],
    [8, 500000, "Transcendent"],
    [9, 1000000, "Legend"],
  ] as const;
  it.each(exact)("level %i requires exactly %i USD and is named %s", (level, amount, title) => {
    expect(MILESTONES[level - 1]).toMatchObject({ level, threshold: amount, title });
    expect(progression(amount - 0.01).level).toBe(level - 1);
    expect(progression(amount).level).toBe(level);
  });
  it("does not grant Spark before its threshold", () => {
    expect(progression(0).level).toBe(0);
    expect(progression(999).remaining).toBe(1);
  });
  it("calculates progress within the next milestone interval", () => {
    const p = progression(3000);
    expect(p.percent).toBe(50);
    expect(p.remaining).toBe(2000);
    expect(p.next?.title).toBe("Forge");
  });
  it("caps Legend progression", () => {
    expect(progression(1000001).next).toBeUndefined();
    expect(progression(1000001).percent).toBe(100);
    expect(progression(1000001).remaining).toBe(0);
  });
  it("records each milestone once with achievement date", () => {
    const first = reconcileUniverse(
      initialUniverse,
      { demoEligibleEarningsUsd: 5000 },
      "2026-11-11",
    );
    const again = reconcileUniverse(first, { demoEligibleEarningsUsd: 5000 }, "2026-11-12");
    expect(again.achievements).toHaveLength(2);
    expect(again.achievements[0]?.date).toBe("2026-11-11");
  });
  it("changing style retains earnings achievements and acknowledged celebrations", () => {
    const first = reconcileUniverse(
      initialUniverse,
      { demoEligibleEarningsUsd: 1000 },
      "2026-11-11",
    );
    const acknowledged = {
      ...first,
      achievements: first.achievements.map((a) => ({ ...a, celebrated: true })),
    };
    const changed = reconcileUniverse(acknowledged, { style: "queen" }, "2026-11-12");
    expect(changed.demoEligibleEarningsUsd).toBe(1000);
    expect(changed.achievements).toEqual(acknowledged.achievements);
  });
  it("blocks sharing an unearned milestone even with a forged record", () =>
    expect(
      isAchieved(
        { ...initialUniverse, achievements: [{ level: 9, date: "2026-11-11", celebrated: false }] },
        9,
      ),
    ).toBe(false));
  it("requires profile completion and sample submission before demo confirmation", () => {
    expect(canConfirmDemoVerification({ firstName: "", lastName: "Demo" }, "submitted")).toBe(
      false,
    );
    expect(
      canConfirmDemoVerification({ firstName: "Demo", lastName: "Creator" }, "not_started"),
    ).toBe(false);
    expect(
      canConfirmDemoVerification({ firstName: "Demo", lastName: "Creator" }, "submitted"),
    ).toBe(true);
  });
});
