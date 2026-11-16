import { describe, expect, it } from "vitest";
import { ultraFeatures, ultraGroups } from "@/components/pricing/content";

describe("Enski Ultra feature list", () => {
  it("shows every Ultra feature exactly once across the three groups", () => {
    const grouped = ultraGroups.flatMap((g) => g.features);
    expect([...grouped].sort()).toEqual([...ultraFeatures].sort());
  });
});
