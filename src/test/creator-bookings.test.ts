import { describe, expect, it } from "vitest";
import { bookingRows, facilitationEarnings, needsAction, upcomingSessions } from "@/lib/creator/bookings";

const now = Date.parse("2026-11-13T12:00:00Z");
const item = (id: string, kind: string, extra: Record<string, unknown> = {}) => ({ id, kind, title: id, status: "published", date: "", capacity: 0, ...extra }) as never;
const order = (id: string, itemId: string, extra: Record<string, unknown> = {}) => ({ id, itemId, itemTitle: itemId, customerId: "c1", amount: 10000, date: "2026-11-01", status: "paid", currency: "NGN", ...extra }) as never;
const state = {
  customers: [{ id: "c1", name: "Ada Obi" }] as never,
  items: [item("coach", "coaching"), item("live", "live", { date: "2026-11-20T10:00:00Z", capacity: 20 }), item("svc", "service"), item("course", "course")],
  orders: [
    order("past", "coach", { sessionAt: "2026-11-10T10:00:00Z", booking: "scheduled" }),
    order("next", "coach", { sessionAt: "2026-11-15T10:00:00Z", booking: "scheduled" }),
    order("brief", "svc", { stage: "requirements" }),
    order("done", "svc", { stage: "completed" }),
    order("buy", "course"),
  ],
};

describe("creator bookings", () => {
  const rows = bookingRows(state, now);
  it("ignores courses and ebooks", () => {
    expect(rows.some((r) => r.item.id === "course")).toBe(false);
  });
  it("a past session still marked scheduled needs an outcome", () => {
    expect(rows.find((r) => r.id === "past")?.label).toBe("Needs outcome");
    expect(needsAction(rows).map((r) => r.id)).toEqual(["past", "brief"]);
  });
  it("upcoming sessions are future only, soonest first", () => {
    expect(upcomingSessions(rows, now).map((r) => r.id)).toEqual(["next", "live-live"]);
  });
  it("earnings count paid coaching, live and service orders only", () => {
    expect(facilitationEarnings(rows)).toBe(40000);
  });
});
