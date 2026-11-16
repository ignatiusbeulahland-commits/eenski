import { describe, expect, it } from "vitest";
import { HEADLINE_MAX, tidyBannerWords, wrapLines } from "@/lib/creator/banner";
import { stateSchema } from "@/lib/creator/rules";

describe("Storefront banner words", () => {
  it("trims, collapses spaces and capitalises the first letter", () => {
    expect(tidyBannerWords("  learn   design  the practical way. ", " courses ,templates and live classes ")).toEqual({
      headline: "Learn design the practical way",
      subline: "Courses, templates and live classes",
    });
  });
  it("turns all-caps shouting into sentence case", () => expect(tidyBannerWords("BEST DESIGN CLASSES", "").headline).toBe("Best design classes"));
  it("collapses repeated punctuation", () => expect(tidyBannerWords("Start today!!!", "").headline).toBe("Start today!"));
  it("keeps the headline within the limit without cutting a word", () => {
    const h = tidyBannerWords("word ".repeat(30), "").headline;
    expect(h.length).toBeLessThanOrEqual(HEADLINE_MAX);
    expect(h.endsWith("word")).toBe(true);
  });
  it("wraps into at most the given lines and flags overflow", () => {
    const r = wrapLines("one two three four", 7, (s) => s.length, 2);
    expect(r.lines).toEqual(["one two", "three"]);
    expect(r.overflow).toBe(true);
  });
});

describe("Saved storefronts from before banners", () => {
  it("load with no banner and the Cobalt style", () => {
    const shape = stateSchema.shape.storefront;
    const sf = shape.parse({ name: "Ada", handle: "ada", tagline: "", about: "", published: false });
    expect(sf.banner).toBe("");
    expect(sf.bannerSource).toBe("none");
    expect(sf.bannerWords.style).toBe("cobalt");
  });
});
