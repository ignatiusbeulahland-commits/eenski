import { describe, expect, it } from "vitest";
import { activeFilterChips, dateRange, defaultEventFilters, filterEvents, groupUpcoming, type EventFilters } from "./eventFilters";
import type { LearnerEvent } from "./catalog";

// Wednesday 11 Nov 2026, 10:00 WAT
const now = new Date("2026-11-11T09:00:00Z");
const ev = (id: string, start: string, price: number, mode: LearnerEvent["mode"] = "Online", category: LearnerEvent["category"] = "Tech") =>
  ({
    id, title: id, host: "Host", hostRole: "", tagline: "", description: "", agenda: [], outcomes: [], audience: "", level: "All levels",
    category, mode, venue: "", start, durationMinutes: 60, price, capacity: 50, image: "", banner: "", imageAlt: "", featured: false, eligible: true,
  }) satisfies LearnerEvent;
const list = [
  ev("past", "2026-11-01T17:00:00Z", 0),
  ev("today", "2026-11-11T17:00:00Z", 0, "In person", "Design"),
  ev("sat", "2026-11-14T10:00:00Z", 3000),
  ev("nextweek", "2026-11-17T10:00:00Z", 5000, "In person", "Business"),
  ev("dec", "2026-12-02T10:00:00Z", 15000),
];
const ids = (f: Partial<EventFilters>) => filterEvents(list, { ...defaultEventFilters, ...f }, now).map((e) => e.id);

describe("event filters", () => {
  it("topic keeps only that category", () => expect(ids({ topic: "Design" })).toEqual(["today"]));
  it("format splits online and in person", () => expect(ids({ format: "In person" })).toEqual(["today", "nextweek"]));
  it("price: free, paid, under ₦5,000 and ₦5,000 and above", () => {
    expect(ids({ price: "free" })).toEqual(["past", "today"]);
    expect(ids({ price: "paid" })).toEqual(["sat", "nextweek", "dec"]);
    expect(ids({ price: "under5k" })).toEqual(["sat"]);
    expect(ids({ price: "5kPlus" })).toEqual(["nextweek", "dec"]);
  });
  it("this weekend is the coming Saturday and Sunday", () => {
    expect(dateRange("weekend", now)).toEqual(["2026-11-14", "2026-11-15"]);
    expect(ids({ date: "weekend" })).toEqual(["sat"]);
  });
  it("this week runs to Sunday; next 7 days runs a rolling week", () => {
    expect(ids({ date: "week" })).toEqual(["today", "sat"]);
    expect(ids({ date: "next7" })).toEqual(["today", "sat", "nextweek"]);
  });
  it("this month and next month split on the calendar month", () => {
    expect(ids({ date: "month" })).toEqual(["today", "sat", "nextweek"]);
    expect(ids({ date: "nextMonth" })).toEqual(["dec"]);
  });
  it("already happened shows only past events; picking a date shows that day", () => {
    expect(ids({ date: "past" })).toEqual(["past"]);
    expect(ids({ date: "on", on: "2026-11-17" })).toEqual(["nextweek"]);
  });
  it("filters combine", () => expect(ids({ date: "next7", price: "paid", format: "Online" })).toEqual(["sat"]));
  it("lists each active filter as a chip", () => {
    expect(activeFilterChips({ ...defaultEventFilters, topic: "Tech", date: "weekend", format: "Online" }).map((c) => c.label)).toEqual(["Tech", "This weekend", "Online"]);
    expect(activeFilterChips(defaultEventFilters)).toEqual([]);
  });
  it("groups upcoming events into this week, next week and later", () => {
    const groups = groupUpcoming(list.slice(1), now);
    expect(groups.map((g) => [g.key, g.events.map((e) => e.id)])).toEqual([["week", ["today", "sat"]], ["next", ["nextweek"]], ["later", ["dec"]]]);
    expect(groups.map((g) => g.label)).toEqual(["This week", "Next week", "Later"]);
  });
});
