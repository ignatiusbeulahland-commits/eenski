import { describe, expect, it } from "vitest";
import { dayKeyIn, localDateTime, sameAsEventTime, watDateTime, zoneLabel, zonePlace } from "./timezone";

const start = "2026-11-15T19:00:00Z"; // 20:00 WAT

describe("event time zones", () => {
  it("keeps the scheduled WAT time", () => expect(watDateTime(start)).toBe("Sun, 15 Nov, 20:00 WAT"));
  it("converts to the learner's own zone", () => {
    expect(localDateTime(start, "America/New_York")).toBe("Sun, 15 Nov, 14:00 EST");
    expect(localDateTime(start, "Asia/Dubai")).toBe("Sun, 15 Nov, 23:00 GMT+4");
  });
  it("moves the event to the learner's calendar day when it crosses midnight", () => {
    expect(dayKeyIn("2026-11-15T21:30:00Z", "Africa/Lagos")).toBe("2026-11-15");
    expect(dayKeyIn("2026-11-15T21:30:00Z", "Asia/Tokyo")).toBe("2026-11-16");
  });
  it("treats zones with the same clock as WAT as the same time", () => {
    expect(sameAsEventTime(start, "Africa/Lagos")).toBe(true);
    expect(sameAsEventTime(start, "Africa/Kinshasa")).toBe(true);
    expect(sameAsEventTime(start, "Europe/London")).toBe(false);
  });
  it("labels zones", () => {
    expect(zoneLabel(start, "Africa/Lagos")).toBe("WAT");
    expect(zonePlace("America/New_York")).toBe("New York");
  });
});
