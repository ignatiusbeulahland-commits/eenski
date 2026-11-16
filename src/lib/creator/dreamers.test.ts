import { describe, expect, it } from "vitest";
import { filterDreamers, emptyFilters, percentChange, total, resolveRange, type Dreamer } from "./dreamers";
const now = Date.parse("2026-11-16T12:00:00Z");
const d = (id: string, daysAgo: number, extra: Partial<Dreamer> = {}): Dreamer => ({ id, name: id, email: `${id}@x.com`, phone: "+234 801 234 5678", channel: "self", status: "active", joined: new Date(now - daysAgo * 864e5).toISOString(), purchases: [], sample: true, ...extra });
describe("dreamers", () => {
  it("does not count waitlisted people", () => {
    const r = resolveRange("30", [], now);
    expect(total([d("a", 1), d("b", 2, { status: "waitlisted" })], "people", r)).toBe(1);
  });
  it("offline enrolments add no money", () => {
    const r = resolveRange("30", [], now);
    const list = [d("a", 1, { purchases: [{ title: "x", kind: "course", amount: 5000, date: new Date(now - 864e5).toISOString() }] }), d("b", 1, { channel: "offline" })];
    expect(total(list, "money", r)).toBe(5000);
    expect(total(list, "money", r, "offline")).toBe(0);
  });
  it("searches by phone digits", () => {
    expect(filterDreamers([d("a", 1)], "0801 234", emptyFilters)).toHaveLength(1);
  });
  it("percent change vs previous period", () => {
    expect(percentChange(15, 10)).toBe(50);
    expect(percentChange(5, 0)).toBeNull();
  });
});
