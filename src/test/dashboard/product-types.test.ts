import { describe, expect, it } from "vitest";
import {
  certificateEarned,
  changeAllowed,
  coachingConfigSchema,
  coachingSlots,
  courseConfigSchema,
  courseOf,
  downloadAccess,
  downloadConfigSchema,
  nextStage,
  replaceFile,
  studentProgress,
  ticketAvailable,
  typeIssue,
  unlockedModules,
  validateTickets,
} from "@/lib/creator/products";

const item = { kind: "course" as const, price: 1000, date: "", capacity: 10, duration: 60, lessons: [] as string[] };
const order = { id: "o1", date: "2026-11-01T09:00:00.000Z", status: "paid" as const };
const course = courseConfigSchema.parse({
  modules: [
    { id: "m1", title: "Start", unlockDay: 0, lessons: [{ id: "l1", title: "Welcome" }, { id: "l2", title: "Tools" }] },
    { id: "m2", title: "Next", unlockDay: 7, lessons: [{ id: "l3", title: "Practice" }, { id: "l4", title: "Wrap up" }] },
  ],
});

describe("Courses", () => {
  it("moves an older flat lesson list into a first module", () => {
    const c = courseOf({ ...item, lessons: ["Intro", "Basics"] });
    expect(c.modules).toHaveLength(1);
    expect(c.modules[0]!.lessons.map((l) => l.title)).toEqual(["Intro", "Basics"]);
  });
  it("tracks completion as a share of all lessons", () => {
    expect(studentProgress({ ...order, completed: ["l1"] }, course)).toBe(25);
    expect(studentProgress({ ...order, completed: ["l1", "l2", "l3", "l4"] }, course)).toBe(100);
  });
  it("unlocks a scheduled module only after its day", () => {
    const drip = { ...course, drip: "scheduled" as const };
    expect(unlockedModules(drip, order.date, new Date("2026-11-03T09:00:00Z"))).toEqual(["m1"]);
    expect(unlockedModules(drip, order.date, new Date("2026-11-08T09:00:00Z"))).toEqual(["m1", "m2"]);
    expect(unlockedModules(course, order.date, new Date("2026-11-01T10:00:00Z"))).toEqual(["m1", "m2"]);
  });
  it("awards a certificate only after every lesson, and the quiz pass when required", () => {
    const all = { ...order, completed: ["l1", "l2", "l3", "l4"] };
    const c = { ...course, certificate: { ...course.certificate, enabled: true, title: "", signer: "", requireQuiz: true }, quiz: { enabled: true, passMark: 70, questions: [] } };
    expect(certificateEarned({ ...all, quizScore: 60 }, c)).toBe(false);
    expect(certificateEarned({ ...all, quizScore: 70 }, c)).toBe(true);
    expect(certificateEarned({ ...order, completed: ["l1"], quizScore: 90 }, c)).toBe(false);
  });
});

describe("Digital downloads", () => {
  const d = downloadConfigSchema.parse({ limit: 3, expiryDays: 30 });
  it("blocks downloads after the limit", () => {
    expect(downloadAccess({ ...order, downloads: 2 }, d, new Date("2026-11-02")).ok).toBe(true);
    expect(downloadAccess({ ...order, downloads: 3 }, d, new Date("2026-11-02")).reason).toBe("Limit reached");
  });
  it("expires the link after the set days", () =>
    expect(downloadAccess(order, d, new Date("2026-12-02")).reason).toBe("Link expired"));
  it("blocks revoked buyers", () => expect(downloadAccess({ ...order, revoked: true }, d, new Date("2026-11-02")).ok).toBe(false));
  it("keeps the old version when a file is replaced", () => {
    const f = { id: "f", name: "guide.pdf", size: 10, mime: "application/pdf", version: 1, uploadedAt: "a", history: [] };
    const next = replaceFile(f, { name: "guide-v2.pdf", size: 12, mime: "application/pdf" }, "b");
    expect(next.version).toBe(2);
    expect(next.history[0]).toMatchObject({ version: 1, name: "guide.pdf" });
  });
});

describe("Live sessions", () => {
  it("rejects ticket seats above the event capacity", () => {
    expect(validateTickets([{ id: "a", name: "VIP", price: 0, quantity: 6 }, { id: "b", name: "Std", price: 0, quantity: 5 }], 10)).not.toBe("");
    expect(validateTickets([{ id: "a", name: "VIP", price: 0, quantity: 5 }], 10)).toBe("");
  });
  it("stops selling a ticket once its seats are gone", () => {
    const t = { id: "vip", name: "VIP", price: 0, quantity: 1 };
    expect(ticketAvailable({ ...item, kind: "live" }, [], t)).toBe(true);
    expect(ticketAvailable({ ...item, kind: "live" }, [{ ...order, ticketId: "vip" }], t)).toBe(false);
  });
});

describe("Services", () => {
  it("moves orders through requirements, work, delivery and completion", () => {
    expect(nextStage("requirements")).toBe("in_progress");
    expect(nextStage("in_progress")).toBe("delivered");
    expect(nextStage("delivered")).toBe("completed");
    expect(nextStage("completed")).toBeNull();
  });
  it("needs a package before publishing", () => expect(typeIssue({ ...item, kind: "service" })).not.toBe(""));
});

describe("Coaching", () => {
  const days = Array.from({ length: 7 }, (_, i) => ({ enabled: i === 0, start: "09:00", end: "11:00" }));
  const c = coachingConfigSchema.parse({ noticeHours: 0, windowDays: 3 });
  const monday = new Date(2026, 10, 16, 6, 0);
  it("offers slots only on available days, spaced by length plus break", () => {
    const slots = coachingSlots(days, 15, 45, c, [], monday);
    expect(slots.map((s) => new Date(s).getHours() + ":" + new Date(s).getMinutes())).toEqual(["9:0", "10:0"]);
    expect(slots.every((s) => new Date(s).getDay() === 1)).toBe(true);
  });
  it("skips booked times", () => {
    const first = coachingSlots(days, 15, 45, c, [], monday)[0]!;
    expect(coachingSlots(days, 15, 45, c, [first], monday)).not.toContain(first);
  });
  it("allows changes only outside the notice period", () => {
    expect(changeAllowed("2026-11-16T12:00:00Z", 24, new Date("2026-11-15T11:00:00Z"))).toBe(true);
    expect(changeAllowed("2026-11-16T12:00:00Z", 24, new Date("2026-11-15T13:00:00Z"))).toBe(false);
  });
  it("needs a meeting link for video sessions before publishing", () =>
    expect(typeIssue({ ...item, kind: "coaching" })).toMatch(/meeting link/));
});
