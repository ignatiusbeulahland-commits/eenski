/** Pure helpers for "remove, then Undo" on lists. Undo re-inserts into the *current* list. */
export type Removed<T> = { item: T; index: number };

/** Removes the first item matching `match`. Returns the new list and what was removed (or null). */
export function removeWhere<T>(list: readonly T[], match: (x: T) => boolean): { list: T[]; removed: Removed<T> | null } {
  const index = list.findIndex(match);
  if (index < 0) return { list: [...list], removed: null };
  return { list: [...list.slice(0, index), ...list.slice(index + 1)], removed: { item: list[index]!, index } };
}

/** Puts a removed item back at its old position (clamped), unless an equal item is already there. */
export function restoreAt<T>(list: readonly T[], removed: Removed<T>, same: (a: T, b: T) => boolean): T[] {
  if (list.some((x) => same(x, removed.item))) return [...list];
  const at = Math.min(Math.max(removed.index, 0), list.length);
  return [...list.slice(0, at), removed.item, ...list.slice(at)];
}

/** Restores several removed items, oldest position first, so indices stay correct. */
export function restoreAll<T>(list: readonly T[], removed: readonly Removed<T>[], same: (a: T, b: T) => boolean): T[] {
  return [...removed].sort((a, b) => a.index - b.index).reduce<T[]>((acc, r) => restoreAt(acc, r, same), [...list]);
}

export const sameId = <T extends { id: string }>(a: T, b: T) => a.id === b.id;
