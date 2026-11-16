import { describe, expect, it } from "vitest";
import { addCurrency, addSkill, emptyBuilder, imageProblem, levelLessons, removeCurrency, sanitizeHtml, step1Issues, step2Issues, step3Issues, type Builder } from "./courseBuilder";

const paid = (): Builder => { const b = emptyBuilder(); b.pricing.prices[0]!.amount = 25000; return b; };

describe("course builder rules", () => {
  it("requires title, summary and image on step 1", () => {
    expect(step1Issues({ title: "", description: "", image: "" }).map((i) => i.field)).toEqual(["cb-title", "cb-summary", "cb-image"]);
  });
  it("accepts PNG/JPG up to 10 MB only", () => {
    expect(imageProblem({ type: "image/png", size: 10 * 1024 * 1024 })).toBeNull();
    expect(imageProblem({ type: "image/jpeg", size: 10 * 1024 * 1024 + 1 })).not.toBeNull();
    expect(imageProblem({ type: "image/webp", size: 100 })).not.toBeNull();
  });
  it("caps skills at 5 and ignores duplicates", () => {
    let s: string[] = [];
    for (const k of ["a", "b", "A", "c", "d", "e", "f"]) s = addSkill(s, k);
    expect(s).toEqual(["a", "b", "c", "d", "e"]);
  });
  it("validates community links and external courses skip uploads", () => {
    const b = emptyBuilder();
    b.community = { platform: "whatsapp", url: "chat.whatsapp", description: "" };
    expect(step2Issues(b).map((i) => i.field)).toContain("cb-community-url");
    const e = emptyBuilder(); e.hosting = "external"; e.external.courseUrl = "https://example.com/course";
    expect(step2Issues(e)).toEqual([]);
  });
  it("discounted price must be lower than original", () => {
    const b = paid(); b.pricing.strike = true; b.pricing.prices[0]!.original = 20000;
    expect(step3Issues(b)[0]?.message).toMatch(/lower than the original/);
    b.pricing.prices[0]!.original = 40000;
    expect(step3Issues(b)).toEqual([]);
  });
  it("adding a currency syncs to levels without converting or overwriting", () => {
    let b = paid();
    b.payg.levels[1]!.prices = { NGN: 99999 };
    b = addCurrency(b, "USD");
    expect(b.pricing.prices.map((p) => [p.currency, p.amount])).toEqual([["NGN", 25000], ["USD", null]]);
    expect(b.payg.levels[1]!.prices).toEqual({ NGN: 99999, USD: null });
    expect(b.payg.levels[0]!.prices["USD"]).toBe(0);
    b = removeCurrency(b, "USD");
    expect(b.payg.levels[1]!.prices).toEqual({ NGN: 99999 });
  });
  it("level prices outside the suggested range are allowed; active paid levels need a price", () => {
    const b = paid(); b.payg.enabled = true;
    b.payg.levels[1] = { ...b.payg.levels[1]!, active: true, prices: { NGN: 50000 } };
    b.modules = [{ id: "m", title: "M", description: "", lessons: [{ id: "l", title: "L", description: "", videoUrl: "", resources: [] }] }];
    expect(step3Issues(b)).toEqual([]);
    b.payg.levels[2] = { ...b.payg.levels[2]!, active: true };
    expect(step3Issues(b)[0]?.field).toBe("cb-level-regular-NGN");
  });
  it("higher levels only include lower content when cumulative is chosen", () => {
    const b = paid(); b.payg.enabled = true;
    b.payg.levels[0] = { ...b.payg.levels[0]!, active: true, lessonIds: ["intro"] };
    b.payg.levels[4] = { ...b.payg.levels[4]!, active: true, lessonIds: ["adv"] };
    expect(levelLessons(b, "elite")).toEqual(["adv"]);
    b.payg.cumulative = true;
    expect(levelLessons(b, "elite")).toEqual(["intro", "adv"]);
  });
  it("sanitises the description", () => {
    expect(sanitizeHtml('<h2 onclick="x">Hi</h2><script>bad()</script><a href="javascript:x">l</a>')).toBe("<h2>Hi</h2>bad()<a>l</a>");
  });
});
