import { describe, expect, it } from "vitest";

import { creatorRating, isMarketCourse } from "@/lib/dreamverse/catalog";
import type { Product } from "@/lib/dreamverse/types";
import { filterCourses } from "@/lib/marketplace/filter";
import { isPubliclyListed, normalizeCourse, toMarketCourse } from "@/lib/marketplace/normalize";
import { courseJsonLd } from "@/lib/marketplace/seo";

const listing = (over: Partial<Product> = {}): Product => ({
  id: "c1",
  slug: "ios-swiftui",
  title: "iOS App Development with SwiftUI",
  summary: "Build iOS apps.",
  type: "course",
  url: "https://staging.tryenski.com/course/alexrivera/ios-swiftui",
  thumbnail: null,
  creator: { name: "Alex Rivera", avatar: null, slug: "alex-rivera", region: null },
  skills: [],
  status: "published",
  demo: false,
  price: null,
  prices: [],
  rating: null,
  canAddToCart: true,
  ...over,
});

const page = (over: Record<string, unknown> = {}) => ({
  status: "published",
  dreamverse_status: "approved",
  is_publicly_visible: true,
  suspended_at: null,
  summary: "Build iOS apps from concept to App Store.",
  full_description: "Full intro.",
  course_highlights: ["5 complete app projects"],
  audience: ["Aspiring iOS developers"],
  requirement: ["Mac with Xcode"],
  default_currency: "USD",
  price: [
    { currency: "USD", sign: "$", amount: 479, discounted_price: 383, is_default: true },
    { currency: "NGN", sign: "₦", amount: 718500, discounted_price: 574500 },
  ],
  rating: { average: 4.5, count: 2, rates: [0, 0, 0, 1, 1] },
  breakdown: { skill_set: "Technology", student_count: 12, video_count: 1 },
  published_date: "2026-10-26",
  modules: [
    {
      title: "SwiftUI Fundamentals",
      videos: [
        { title: "Views", is_locked: true, video_url: "https://secret.example/paid.mp4", materials: [{ url: "https://secret.example/file.pdf" }] },
        { title: "Welcome", is_locked: false, video_url: "https://secret.example/free.mp4" },
      ],
    },
  ],
  ...over,
});

describe("only published, approved courses are public", () => {
  it("lists a published course Enski approved", () => {
    expect(isPubliclyListed(page())).toBe(true);
  });
  it("hides drafts", () => {
    expect(normalizeCourse(listing(), page({ status: "draft" }))).toBeNull();
  });
  it("hides courses awaiting Dreamverse approval", () => {
    expect(normalizeCourse(listing(), page({ dreamverse_status: "pending" }))).toBeNull();
  });
  it("hides suspended or hidden courses", () => {
    expect(normalizeCourse(listing(), page({ suspended_at: "2026-11-01" }))).toBeNull();
    expect(normalizeCourse(listing(), page({ is_publicly_visible: false }))).toBeNull();
  });
  it("never lists demo or non-course listings in the course marketplace", () => {
    expect(normalizeCourse(listing({ demo: true }), page())).toBeNull();
    expect(normalizeCourse(listing({ type: "ebook" }), page())).toBeNull();
  });
});

describe("course page content", () => {
  const course = normalizeCourse(listing(), page())!;

  it("never passes lesson videos or downloads to the public page", () => {
    const json = JSON.stringify(course);
    expect(json).not.toContain("secret.example");
    expect(json).not.toContain("video_url");
  });
  it("shows the curriculum outline and marks free previews", () => {
    expect(course.modules[0]?.lessons.map((l) => [l.title, l.preview])).toEqual([["Views", false], ["Welcome", true]]);
  });
  it("charges the discounted price, as Enski's checkout does", () => {
    expect(course.listing.price).toMatchObject({ currency: "USD", amount: 479, current: 383, onSale: true });
  });
  it("uses Enski's category, learner count and reviews", () => {
    expect(course.category).toBe("Technology");
    expect(course.students).toBe(12);
    expect(course.listing.rating).toEqual({ average: 4.5, count: 2 });
    expect(course.ratingBreakdown).toEqual([1, 1, 0, 0, 0]);
  });
  it("tells search engines the real prices and rating", () => {
    const ld = courseJsonLd(course);
    expect(ld["@type"]).toBe("Course");
    expect(ld["url"]).toBe("https://ensk.lovable.app/courses/ios-swiftui");
    expect(ld["offers"]).toEqual([
      expect.objectContaining({ price: 383, priceCurrency: "USD" }),
      expect.objectContaining({ price: 574500, priceCurrency: "NGN" }),
    ]);
    expect(ld["aggregateRating"]).toMatchObject({ ratingValue: 4.5, ratingCount: 2 });
  });
});

describe("marketplace search, filters and sorting", () => {
  const a = toMarketCourse(normalizeCourse(listing(), page())!);
  const b = toMarketCourse(
    normalizeCourse(
      listing({ id: "c2", slug: "sales", title: "Close more deals", url: "https://staging.tryenski.com/course/dann/sales", creator: { name: "Dr Dann", avatar: null, slug: "dr-dann", region: null } }),
      page({ breakdown: { skill_set: "Business", student_count: 3 }, published_date: "2026-11-05", price: [{ currency: "NGN", sign: "₦", amount: 0 }], rating: null }),
    )!,
  );

  it("finds courses by instructor name", () => {
    expect(filterCourses([a, b], { q: "dann", currency: "NGN" }).map((c) => c.slug)).toEqual(["sales"]);
  });
  it("filters by category", () => {
    expect(filterCourses([a, b], { category: "Technology", currency: "NGN" }).map((c) => c.slug)).toEqual(["ios-swiftui"]);
  });
  it("filters free courses", () => {
    expect(filterCourses([a, b], { price: "free", currency: "NGN" }).map((c) => c.slug)).toEqual(["sales"]);
  });
  it("sorts newest first", () => {
    expect(filterCourses([a, b], { sort: "newest", currency: "NGN" }).map((c) => c.slug)).toEqual(["sales", "ios-swiftui"]);
  });
  it("sorts by price in the chosen currency", () => {
    expect(filterCourses([a, b], { sort: "price-desc", currency: "NGN" }).map((c) => c.slug)).toEqual(["ios-swiftui", "sales"]);
  });
});

describe("one public page per course", () => {
  it("live Enski courses open in the course marketplace, demos stay in Dreamverse", () => {
    expect(isMarketCourse({ type: "course", demo: false })).toBe(true);
    expect(isMarketCourse({ type: "course", demo: true })).toBe(false);
    expect(isMarketCourse({ type: "ebook", demo: false })).toBe(false);
  });
});

describe("creator ratings", () => {
  it("weights each listing's average by its number of ratings", () => {
    expect(creatorRating([{ rating: { average: 5, count: 3 } }, { rating: { average: 4, count: 1 } }, { rating: null }])).toEqual({ average: 4.8, count: 4 });
  });
  it("shows nothing when nobody has rated", () => {
    expect(creatorRating([{ rating: null }])).toBeNull();
  });
});
