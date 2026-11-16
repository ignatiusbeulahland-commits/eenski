import { describe, expect, it } from "vitest";
import { applyDraft, findStore, sampleStore, TYPE_PLURAL } from "./publicStore";
import { stateSchema } from "./rules";

const blank = stateSchema.shape.storePage.parse(undefined);

describe("storefront preview and sample page", () => {
  it("uses the Manage Products words for each type", () => {
    expect(Object.values(TYPE_PLURAL)).toEqual(["Courses", "Digital Downloads", "Live Sessions", "Services", "Coaching"]);
  });
  it("opens the sample creator page in any browser", () => {
    expect(findStore("Sample-Creator")?.sample).toBe(true);
    expect(findStore("nobody-here")).toBeNull();
  });
  it("sample page covers every product type", () => {
    expect(new Set(sampleStore().items.map((i) => i.kind))).toEqual(new Set(["course", "ebook", "live", "coaching", "service"]));
  });
  it("draft without sample data keeps only the creator's own products", () => {
    const own = { ...sampleStore(), items: [], sample: false };
    const out = applyDraft(own, { page: { ...blank, accent: "lime" }, sample: false });
    expect(out.items).toHaveLength(0);
    expect(out.page.accent).toBe("lime");
  });
  it("sample toggle fills empty sections but keeps the creator's own bio", () => {
    const own = { ...sampleStore(), items: [], sample: false };
    const out = applyDraft(own, { page: { ...blank, bio: "My own story" }, sample: true });
    expect(out.items.length).toBeGreaterThan(0);
    expect(out.page.bio).toBe("My own story");
    expect(out.page.achievements.length).toBeGreaterThan(0);
  });
});
