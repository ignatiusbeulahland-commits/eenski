import { describe, expect, it } from "vitest";
import { removeWhere, restoreAll, restoreAt, sameId } from "./listUndo";

const list = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("remove then undo", () => {
  it("puts a removed item back in its old position", () => {
    const { list: next, removed } = removeWhere(list, (x) => x.id === "b");
    expect(next.map((x) => x.id)).toEqual(["a", "c"]);
    expect(restoreAt(next, removed!, sameId).map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps changes made after the removal when undoing", () => {
    const { list: next, removed } = removeWhere(list, (x) => x.id === "a");
    const later = [...next, { id: "d" }];
    expect(restoreAt(later, removed!, sameId).map((x) => x.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("never duplicates an item that is already back", () => {
    const { removed } = removeWhere(list, (x) => x.id === "c");
    expect(restoreAt(list, removed!, sameId)).toHaveLength(3);
  });

  it("restores several removed items in their original order", () => {
    const removed = [{ item: { id: "c" }, index: 2 }, { item: { id: "a" }, index: 0 }];
    expect(restoreAll([{ id: "b" }], removed, sameId).map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("reports nothing removed when no item matches", () => {
    expect(removeWhere(list, (x) => x.id === "z").removed).toBeNull();
  });
});
