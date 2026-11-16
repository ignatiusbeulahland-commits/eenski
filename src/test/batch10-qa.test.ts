import { describe, expect, it } from "vitest";
import { dateRanges, filterName } from "@/components/affiliate/ui";

describe("filter dropdowns always have a spoken name", () => {
  it("uses the label it's given", () => {
    expect(filterName([["a", "A"]], "Time zone")).toBe("Time zone");
  });
  it("names the shared date ranges", () => {
    expect(filterName(dateRanges)).toBe("Date range");
  });
  it("works the name out from an 'All …' or 'Any …' first option", () => {
    expect(filterName([["all", "All statuses"]])).toBe("Filter by status");
    expect(filterName([["all", "Any status"]])).toBe("Filter by status");
    expect(filterName([["all", "All categories"]])).toBe("Filter by category");
    expect(filterName([["all", "All types"]])).toBe("Filter by type");
  });
});

import { completionScreenResource } from "@/lib/learner/rules";

describe("course complete screen holds pop-ups", () => {
  it("knows which course's completion screen is open", () => {
    expect(completionScreenResource("/learner/resources/course%3Aabc/complete")).toBe("course:abc");
  });
  it("ignores every other page, including the lesson player", () => {
    expect(completionScreenResource("/learner/resources/course%3Aabc")).toBeNull();
    expect(completionScreenResource("/learner/dashboard")).toBeNull();
  });
});
