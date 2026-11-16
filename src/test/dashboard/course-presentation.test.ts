import { describe, expect, it } from "vitest";
import { defaultExtras, withCreateDetails } from "@/lib/creator/createGuide";
import { COURSE_CATEGORIES, PRESENTATION_MAX_IMAGES, skillOptions, validateSlidesFile, validateVideoFile } from "@/lib/creator/courseMeta";
import { courseConfigSchema } from "@/lib/creator/products";
import type { CreatorItem } from "@/lib/creator/rules";

const course: CreatorItem = {
  id: "x", kind: "course", title: "Title", description: "Desc", category: "Design", price: 0, status: "draft", image: "",
  lessons: [], date: "", capacity: 30, duration: 0, createdAt: "",
};
const MB = 1024 * 1024;

describe("Course category, skill and level", () => {
  it("suggests skills for a listed category and none for a custom one", () => {
    expect(COURSE_CATEGORIES).toContain("Design");
    expect(skillOptions("Design")).toContain("UI design");
    expect(skillOptions("Beekeeping")).toEqual([]);
  });
  it("saves the chosen skill and level on the course", () => {
    const item = withCreateDetails(course, { ...defaultExtras, skill: " Pottery ", level: "beginner" });
    expect(item.course?.skill).toBe("Pottery");
    expect(item.course?.level).toBe("beginner");
  });
  it("older saved courses load with no skill, all levels and no presentation", () => {
    const c = courseConfigSchema.parse({ modules: [] });
    expect(c.skill).toBe("");
    expect(c.level).toBe("all");
    expect(c.presentation).toEqual({ video: null, slides: null, images: [] });
  });
});

describe("Course presentation uploads", () => {
  it("keeps the intro video, slides and images on the course", () => {
    const ref = { id: "v1", name: "intro.mp4", size: 10, mime: "video/mp4", uploadedAt: "" };
    const item = withCreateDetails(course, { ...defaultExtras, presentation: { video: ref, slides: null, images: [] } });
    expect(item.course?.presentation.video?.name).toBe("intro.mp4");
  });
  it("accepts MP4, MOV and WebM videos up to 500 MB", () => {
    expect(validateVideoFile({ name: "a.mp4", type: "video/mp4", size: 10 * MB })).toBeNull();
    expect(validateVideoFile({ name: "a.mov", type: "", size: 10 * MB })).toBeNull();
    expect(validateVideoFile({ name: "a.pdf", type: "application/pdf", size: MB })).not.toBeNull();
    expect(validateVideoFile({ name: "a.mp4", type: "video/mp4", size: 501 * MB })).not.toBeNull();
  });
  it("accepts PDF, PowerPoint and Keynote slides up to 100 MB", () => {
    expect(validateSlidesFile({ name: "deck.pptx", type: "", size: MB })).toBeNull();
    expect(validateSlidesFile({ name: "deck.key", type: "", size: MB })).toBeNull();
    expect(validateSlidesFile({ name: "deck.docx", type: "", size: MB })).not.toBeNull();
    expect(validateSlidesFile({ name: "deck.pdf", type: "application/pdf", size: 101 * MB })).not.toBeNull();
  });
  it("allows up to 8 presentation images", () => {
    expect(PRESENTATION_MAX_IMAGES).toBe(8);
  });
});

describe("Categories for every product type", () => {
  it("each product type has a category list and a second dropdown", async () => {
    const { PRODUCT_TOPICS, categoriesFor } = await import("@/lib/creator/courseMeta");
    expect(categoriesFor("live")).toContain("Business");
    expect(PRODUCT_TOPICS.live.sub.options("Business")).toContain("Workshop");
    expect(PRODUCT_TOPICS.service.sub.options("Design")).toContain("Logo design");
    expect(PRODUCT_TOPICS.service.sub.options("Beekeeping")).toEqual([]);
    expect(PRODUCT_TOPICS.coaching.categories).toContain("Career");
  });
  it("saves the typed session type and level on a live session", () => {
    const item = withCreateDetails({ ...course, kind: "live", date: "2027-01-01T10:00" }, { ...defaultExtras, subtype: " Book club ", level: "advanced" });
    expect(item.live?.sessionType).toBe("Book club");
    expect(item.live?.level).toBe("advanced");
  });
  it("saves the format, service and focus for the other types", () => {
    expect(withCreateDetails({ ...course, kind: "ebook" }, { ...defaultExtras, subtype: "Planner" }).download?.format).toBe("Planner");
    expect(withCreateDetails({ ...course, kind: "service", duration: 7 }, { ...defaultExtras, subtype: "Logo design" }).service?.serviceType).toBe("Logo design");
    expect(withCreateDetails({ ...course, kind: "coaching", duration: 60 }, { ...defaultExtras, subtype: "Mentorship" }).coaching?.focus).toBe("Mentorship");
  });
});

describe("Drafts never get stuck", () => {
  it("a blank draft saves with an Untitled title and safe numbers", async () => {
    const { draftAnswers } = await import("@/lib/creator/createGuide");
    const blank = { ...course, kind: "live" as const, title: "  ", price: NaN, capacity: NaN };
    const d = draftAnswers(blank, { ...defaultExtras, durationMins: NaN, tickets: [{ id: "t", name: "", price: NaN, quantity: 0 }] }, "live session");
    expect(d.form.title).toBe("Untitled live session");
    expect(d.form.price).toBe(0);
    expect(d.form.capacity).toBe(30);
    expect(() => withCreateDetails(d.form, d.x)).not.toThrow();
  });
});

describe("Media Library rules", () => {
  it("sorts files into image, video, audio and PDF, by type or extension", async () => {
    const { mediaKindOf } = await import("@/lib/creator/mediaRules");
    expect(mediaKindOf({ type: "video/mp4", name: "a.mp4" })).toBe("video");
    expect(mediaKindOf({ type: "", name: "talk.MOV" })).toBe("video");
    expect(mediaKindOf({ type: "", name: "song.mp3" })).toBe("audio");
    expect(mediaKindOf({ type: "application/pdf", name: "x.pdf" })).toBe("document");
    expect(mediaKindOf({ type: "application/zip", name: "x.zip" })).toBeNull();
  });
  it("allows videos up to 500 MB and other files up to their own limits", async () => {
    const { mediaProblem } = await import("@/lib/creator/mediaRules");
    expect(mediaProblem({ type: "video/mp4", name: "a.mp4", size: 400 * MB })).toBeNull();
    expect(mediaProblem({ type: "video/mp4", name: "a.mp4", size: 501 * MB })).not.toBeNull();
    expect(mediaProblem({ type: "image/png", name: "a.png", size: 26 * MB })).not.toBeNull();
    expect(mediaProblem({ type: "application/pdf", name: "a.pdf", size: 0 })).not.toBeNull();
  });
  it("formats lengths and finds the lessons that use a file", async () => {
    const { formatDuration, mediaUsage } = await import("@/lib/creator/mediaRules");
    expect(formatDuration(75)).toBe("1:15");
    expect(formatDuration(3725)).toBe("1:02:05");
    const items = [{ id: "c1", title: "Design", kind: "course", course: { modules: [{ lessons: [{ id: "l1", title: "Intro", mediaId: "m1" }, { id: "l2", title: "Next", mediaId: "" }] }] } }];
    expect(mediaUsage(items, "m1")).toEqual([{ itemId: "c1", itemTitle: "Design", lessonId: "l1", lessonTitle: "Intro" }]);
  });
});
