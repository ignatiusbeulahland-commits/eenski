import { describe, expect, it } from "vitest";
import { deckPose, stepDeck } from "@/components/dreamverse/CreatorDeck";

describe("creator circle deck", () => {
  it("next arrow moves one creator forward and stops at the last", () => {
    expect(stepDeck(0, 1, 5)).toBe(1);
    expect(stepDeck(4, 1, 5)).toBe(4);
  });

  it("previous arrow stops at the first creator", () => {
    expect(stepDeck(0, -1, 5)).toBe(0);
    expect(stepDeck(3, -1, 5)).toBe(2);
  });

  it("the next card peeks from the right and the previous one is hidden", () => {
    expect(deckPose(1).x).toBeGreaterThan(0);
    expect(deckPose(1).opacity).toBeGreaterThan(0);
    expect(deckPose(-1).opacity).toBe(0);
    expect(deckPose(0).z).toBeGreaterThan(deckPose(1).z);
  });
});
