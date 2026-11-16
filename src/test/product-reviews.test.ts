import { describe, expect, it } from "vitest";

import { parseReview, reviewKey, summarizeReviews } from "@/lib/reviews/reviews";

const ok = { rating: 5, name: "Ada Obi", email: "ada@enski.com", body: "Clear and practical lessons." };

describe("review form rules", () => {
  it("needs a star rating from 1 to 5", () => {
    expect(parseReview({ ...ok, rating: 0 }).ok).toBe(false);
    expect(parseReview({ ...ok, rating: 6 }).ok).toBe(false);
    expect(parseReview({ ...ok, rating: 1 }).ok).toBe(true);
  });

  it("needs a name of at least 2 characters", () => {
    expect(parseReview({ ...ok, name: " A " }).ok).toBe(false);
  });

  it("needs a review of at least 10 characters", () => {
    expect(parseReview({ ...ok, body: "Great!" }).ok).toBe(false);
  });

  it("rejects reviews over 1,500 characters", () => {
    expect(parseReview({ ...ok, body: "a".repeat(1501) }).ok).toBe(false);
  });

  it("lower-cases the email so one person gets one review per listing", () => {
    const r = parseReview({ ...ok, email: "  Ada@Enski.COM " });
    expect(r.ok && r.data.email).toBe("ada@enski.com");
  });
});

describe("review summary", () => {
  it("averages to one decimal with a 5-to-1 star breakdown", () => {
    expect(summarizeReviews([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toEqual({
      average: 4.3,
      count: 3,
      breakdown: [1, 2, 0, 0, 0],
    });
  });

  it("is empty when nobody has reviewed yet", () => {
    expect(summarizeReviews([])).toBeNull();
  });
});

describe("review keys", () => {
  it("separate course, showcase and Dreamverse listings", () => {
    expect(reviewKey("course", "Figma-PM")).toBe("course:figma-pm");
    expect(reviewKey("dreamverse", "figma-pm")).not.toBe(reviewKey("course", "figma-pm"));
  });
});

describe("demo reviews (saved on this device only)", () => {
  it("posts one review per email per listing and shows it back", async () => {
    const { fetchReviews, reviewSummaries, submitReview } = await import("@/lib/reviews/reviews");
    const input = { rating: 4, name: "Ada", email: "ada@x.com", body: "Really useful course." };
    expect((await submitReview("course:demo-a", input)).status).toBe("posted");
    expect((await submitReview("course:demo-a", input)).status).toBe("already");
    expect((await fetchReviews("course:demo-a")).map((r) => r.name)).toEqual(["Ada"]);
    expect(reviewSummaries(["course:demo-a"])["course:demo-a"]).toEqual({ average: 4, count: 1 });
  });
});
