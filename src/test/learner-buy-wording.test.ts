import { describe, expect, it } from "vitest";

import { eventActionLabel, resourceBuyLabel, startsIn } from "@/lib/learner/catalog";
import { eventIcs } from "@/lib/learner/ics";

describe("learner preview pages: buy wording matches the product", () => {
  it("courses say Buy course", () => expect(resourceBuyLabel({ type: "Course", price: 5000 })).toBe("Buy course"));
  it("eBooks say Buy eBook", () => expect(resourceBuyLabel({ type: "Ebook", price: 3000 })).toBe("Buy eBook"));
  it("templates say Buy template", () => expect(resourceBuyLabel({ type: "Template", price: 6500 })).toBe("Buy template"));
  it("coaching says Book session", () => expect(resourceBuyLabel({ type: "Coaching", price: 25000 })).toBe("Book session"));
  it("free resources say Get it free", () => expect(resourceBuyLabel({ type: "Ebook", price: 0 })).toBe("Get it free"));
  it("paid events sell a ticket, free ones register", () => {
    expect(eventActionLabel({ price: 5000 })).toBe("Buy ticket");
    expect(eventActionLabel({ price: 0 })).toBe("Register for free");
  });
});

describe("event countdown (Lagos days)", () => {
  const now = new Date("2026-11-13T10:00:00Z"); // 11:00 WAT
  it("counts days ahead", () => expect(startsIn({ start: "2026-11-18T16:00:00Z", durationMinutes: 90 }, now)).toBe("Starts in 5 days"));
  it("says tomorrow", () => expect(startsIn({ start: "2026-11-14T08:00:00Z", durationMinutes: 60 }, now)).toBe("Starts tomorrow"));
  it("says today", () => expect(startsIn({ start: "2026-11-13T17:00:00Z", durationMinutes: 60 }, now)).toBe("Starts today"));
  it("says happening now while it runs", () => expect(startsIn({ start: "2026-11-13T09:30:00Z", durationMinutes: 60 }, now)).toBe("Happening now"));
  it("says ended after it finishes", () => expect(startsIn({ start: "2026-11-13T08:00:00Z", durationMinutes: 60 }, now)).toBe("Ended"));
});

describe("add to calendar file", () => {
  it("has the event's start and end in UTC", () => {
    const ics = eventIcs({ id: "x", title: "Meetup, Lagos", host: "Salem King", description: "Hi", venue: "Yaba, Lagos", start: "2026-11-25T17:00:00.000Z", durationMinutes: 150 });
    expect(ics).toContain("DTSTART:20261125T170000Z");
    expect(ics).toContain("DTEND:20261125T193000Z");
    expect(ics).toContain("SUMMARY:Meetup\\, Lagos");
  });
});
