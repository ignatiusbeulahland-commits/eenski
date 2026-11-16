import { describe, expect, it } from "vitest";
import { learnerBookings, upcomingListings } from "./bookings";
import { events } from "./catalog";

describe("learner bookings", () => {
  it("starts empty with no purchases or registrations", () => {
    expect(learnerBookings({ purchases: [], registrations: [] })).toEqual([]);
  });
  it("puts a registration for a finished event in past", () => {
    const e = events[0]!;
    const [b] = learnerBookings({ purchases: [], registrations: [{ eventId: e.id, date: "", tickets: 1 }] }, Date.parse(e.start) + 864e5);
    expect(b?.when_past).toBe(true);
  });
  it("lists no gigs", () => {
    expect(upcomingListings("gigs")).toEqual([]);
  });
});
