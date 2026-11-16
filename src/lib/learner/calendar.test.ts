import { describe, expect, it } from "vitest";
import { addMonths, groupByDay, lagosDayKey, monthGrid } from "./calendar";

describe("events calendar", () => {
  it("files an event under its Lagos day, not the UTC day", () => {
    // 23:30 UTC on 30 Nov is 00:30 WAT on 1 Dec
    expect(lagosDayKey("2026-11-30T23:30:00Z")).toBe("2026-12-01");
  });
  it("builds Monday-first weeks covering the whole month", () => {
    const weeks = monthGrid({ year: 2026, month: 10 }); // November 2026 starts on a Sunday
    expect(weeks[0]![0]!.key).toBe("2026-10-26");
    expect(weeks[0]![6]!).toEqual({ key: "2026-11-01", day: 1, inMonth: true });
    expect(weeks.flat().filter((c) => c.inMonth)).toHaveLength(30);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
  it("rolls months across the year boundary", () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
  it("groups same-day events in start order", () => {
    const g = groupByDay([{ id: "b", start: "2026-11-17T15:00:00Z" }, { id: "a", start: "2026-11-17T09:00:00Z" }, { id: "c", start: "2026-11-18T09:00:00Z" }]);
    expect(g.get("2026-11-17")!.map((e) => e.id)).toEqual(["a", "b"]);
    expect(g.get("2026-11-18")!.map((e) => e.id)).toEqual(["c"]);
  });
});
