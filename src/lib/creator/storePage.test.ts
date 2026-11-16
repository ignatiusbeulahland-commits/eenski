import { describe, expect, it } from "vitest";
import { orderedItems } from "./publicStore";
import type { CreatorItem } from "./rules";

const it3 = ["a", "b", "c"].map((id) => ({ id }) as CreatorItem);
describe("creator page product order", () => {
  it("follows the creator's order and drops hidden products", () => {
    expect(orderedItems(it3, { order: ["c", "a"], hiddenIds: ["b"] }).map((i) => i.id)).toEqual(["c", "a"]);
  });
  it("puts products missing from the order at the end", () => {
    expect(orderedItems(it3, { order: ["b"], hiddenIds: [] }).map((i) => i.id)).toEqual(["b", "a", "c"]);
  });
});
