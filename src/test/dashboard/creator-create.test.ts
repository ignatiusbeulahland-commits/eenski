import { describe, expect, it } from "vitest";
import { createIssue, createProgress, createStepOf, defaultExtras, earliestIssue, parseCreateStep, stepIssue, validateCreate, withCreateDetails } from "@/lib/creator/createGuide";
import type { CreatorItem, ItemKind } from "@/lib/creator/rules";

const now = new Date("2026-03-01T10:00:00Z");
const base = (kind: ItemKind, p: Partial<CreatorItem> = {}): CreatorItem => ({
  id: "x", kind, title: "Title", description: "Desc", category: "", price: 0, status: "draft", image: "",
  lessons: [], date: "", capacity: 30, duration: kind === "coaching" ? 60 : kind === "service" ? 7 : 0, createdAt: "", ...p,
});

describe("Guided product creation", () => {
  it("requires a future start time for live sessions", () => {
    expect(validateCreate(base("live"), defaultExtras, now)).toBe("Choose when the session starts.");
    expect(validateCreate(base("live", { date: "2026-02-01T10:00" }), defaultExtras, now)).toBe("Choose a start time in the future.");
    expect(validateCreate(base("live", { date: "2026-04-01T10:00" }), defaultExtras, now)).toBe("");
  });
  it("requires an address for in-person live sessions", () => {
    expect(validateCreate(base("live", { date: "2026-04-01T10:00" }), { ...defaultExtras, venue: "in_person" }, now)).toBe("Add the venue address.");
  });
  it("needs coaching sessions of at least 15 minutes and services of at least 1 day", () => {
    expect(validateCreate(base("coaching", { duration: 10 }), defaultExtras, now)).not.toBe("");
    expect(validateCreate(base("service", { duration: 0 }), defaultExtras, now)).not.toBe("");
  });
  it("rejects a meeting link that is not a full URL", () => {
    expect(validateCreate(base("coaching"), { ...defaultExtras, meetingLink: "meet.google" }, now)).not.toBe("");
  });
  it("turns course lessons into the first module and keeps outcomes", () => {
    const item = withCreateDetails(base("course"), { ...defaultExtras, objectives: ["Ship a design", " "], lessons: "Intro\n\nBasics" });
    expect(item.course?.objectives).toEqual(["Ship a design"]);
    expect(item.course?.modules[0]?.lessons.map((l) => l.title)).toEqual(["Intro", "Basics"]);
    expect(item.lessons).toEqual(["Intro", "Basics"]);
  });
  it("stores download licence and limits only on downloads", () => {
    const item = withCreateDetails(base("ebook"), { ...defaultExtras, license: "commercial", limit: 0 });
    expect(item.download?.license).toBe("commercial");
    expect(item.download?.limit).toBe(0);
    expect(item.course).toBeUndefined();
  });

  it("builds every module and lesson from the curriculum builder, skipping empty lessons", () => {
    const item = withCreateDetails(base("course"), {
      ...defaultExtras,
      drip: "scheduled",
      certificate: true,
      modules: [
        { id: "a", title: "Foundations", lessons: [{ id: "1", title: "Intro", type: "video", minutes: 8, preview: true }, { id: "2", title: " ", type: "text", minutes: 5, preview: false }] },
        { id: "b", title: "", lessons: [{ id: "3", title: "Worksheet", type: "download", minutes: 0, preview: false }] },
        { id: "c", title: "Module 3", lessons: [] },
      ],
    });
    const c = item.course!;
    expect(c.modules.map((m) => m.title)).toEqual(["Foundations", "Module 2"]);
    expect(c.modules.map((m) => m.unlockDay)).toEqual([0, 7]);
    expect(c.modules[0]?.lessons).toHaveLength(1);
    expect(c.modules[0]?.lessons[0]?.preview).toBe(true);
    expect(c.modules[1]?.lessons[0]?.type).toBe("download");
    expect(c.certificate.enabled).toBe(true);
    expect(item.lessons).toEqual(["Intro", "Worksheet"]);
  });
  it("caps the create form at 30 lessons", () => {
    const lessons = Array.from({ length: 31 }, (_, i) => ({ id: String(i), title: `L${i}`, type: "video" as const, minutes: 5, preview: false }));
    expect(createIssue(base("course"), { ...defaultExtras, modules: [{ id: "m", title: "Module 1", lessons }] }, now)?.field).toBe("create-curriculum");
  });
  it("prices a service from its cheapest package and delivery from its fastest", () => {
    const pk = (name: string, price: number, days: number) => ({ id: name, name, description: "", price, days, revisions: 1 });
    const item = withCreateDetails(base("service", { price: 99 }), { ...defaultExtras, packages: [pk("Standard", 40000, 7), pk("Basic", 20000, 3)] });
    expect(item.price).toBe(20000);
    expect(item.duration).toBe(3);
    expect(item.service?.packages).toHaveLength(2);
  });
  it("rejects a package without a name or valid price, and more than three packages", () => {
    const pk = (name: string, price: number) => ({ id: name + price, name, description: "", price, days: 3, revisions: 1 });
    expect(createIssue(base("service"), { ...defaultExtras, packages: [pk("", 1000)] }, now)?.field).toBe("create-packages");
    expect(createIssue(base("service"), { ...defaultExtras, packages: [pk("Basic", NaN)] }, now)?.field).toBe("create-packages");
    expect(createIssue(base("service"), { ...defaultExtras, packages: [pk("A", 1), pk("B", 1), pk("C", 1), pk("D", 1)] }, now)?.message).toBe("Offer up to 3 packages.");
  });
  it("rejects live ticket seats that exceed the session's seats", () => {
    const x = { ...defaultExtras, tickets: [{ id: "t", name: "VIP", price: 5000, quantity: 40 }] };
    const issue = createIssue(base("live", { date: "2026-04-01T10:00", capacity: 30 }), x, now);
    expect(issue?.field).toBe("create-tickets");
  });
  it("points each problem at the field that needs fixing", () => {
    expect(createIssue(base("ebook", { title: "" }), defaultExtras, now)?.field).toBe("item-title");
    expect(createIssue(base("live", { date: "2026-04-01T10:00", capacity: 0 }), defaultExtras, now)?.field).toBe("create-capacity");
  });
  it("keeps coaching booking rules and intake questions", () => {
    const item = withCreateDetails(base("coaching"), { ...defaultExtras, windowDays: 60, cancelHours: 48, refundOnCancel: false, intake: ["Your goal?", " "] });
    expect(item.coaching).toMatchObject({ windowDays: 60, cancelHours: 48, refundOnCancel: false, intake: ["Your goal?"] });
  });
  it("marks a download's files section complete only once a file is added", () => {
    const file = { id: "f", name: "guide.pdf", size: 10, mime: "application/pdf", version: 1, uploadedAt: "", history: [] };
    expect(createProgress(base("ebook"), defaultExtras, now)[1]).toBe(false);
    expect(createProgress(base("ebook"), { ...defaultExtras, files: [file] }, now)[1]).toBe(true);
    expect(withCreateDetails(base("ebook"), { ...defaultExtras, files: [file] }).download?.files).toHaveLength(1);
  });
});

describe("Create flow steps", () => {
  it("reads steps 2 to 5 from the page address and ignores anything else", () => {
    expect(parseCreateStep({ step: "3" })).toEqual({ step: 3 });
    expect(parseCreateStep({ step: 5 })).toEqual({});
    expect(parseCreateStep({ step: "1" })).toEqual({});
    expect(parseCreateStep({ step: "6" })).toEqual({});
    expect(parseCreateStep({ step: "abc" })).toEqual({});
  });
  it("Next on step 1 only checks the basics, not pricing or later steps", () => {
    const form = base("live", { title: "", price: NaN });
    expect(stepIssue(form, defaultExtras, 1, now)?.field).toBe("item-title");
    expect(stepIssue(base("live", { price: NaN }), defaultExtras, 1, now)).toBeNull();
  });
  it("puts each problem on the step that owns its field", () => {
    expect(stepIssue(base("live"), defaultExtras, 2, now)?.field).toBe("create-date");
    expect(stepIssue(base("live", { date: "2026-04-01T10:00" }), { ...defaultExtras, venue: "in_person" }, 2, now)?.field).toBe("create-address");
    expect(stepIssue(base("course", { price: NaN }), defaultExtras, 3, now)?.field).toBe("item-price");
    expect(createStepOf("create-session-length")).toBe(2);
  });
  it("saving goes back to the earliest unfinished step", () => {
    const form = base("live", { description: "", price: NaN });
    expect(earliestIssue(form, defaultExtras, now)?.field).toBe("item-description");
    expect(createStepOf(earliestIssue(base("live", { price: NaN }), defaultExtras, now)!.field)).toBe(2);
  });
});
