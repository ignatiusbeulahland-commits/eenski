import type { CreatorItem, CreatorState } from "./rules";

type BinState = Pick<CreatorState, "items" | "orders" | "promotions" | "programs" | "reviews" | "landingPages">;

/** A product sits in the Bin once it has a `binnedAt` date. */
export const inBin = (item: CreatorItem) => Boolean(item.binnedAt);

/**
 * Moves a product to the Bin. It goes off the storefront straight away
 * (status becomes archived) and remembers its old status for Restore.
 */
export function moveToBin<S extends Pick<CreatorState, "items">>(state: S, id: string, now = new Date().toISOString()) {
  return state.items.map((i) =>
    i.id === id && !inBin(i) ? { ...i, binnedAt: now, binnedFrom: i.status, status: "archived" as const } : i,
  );
}

/** Puts a product back exactly as it was before it went to the Bin. */
export function restoreFromBin<S extends Pick<CreatorState, "items">>(state: S, id: string) {
  return state.items.map((i) => {
    if (i.id !== id || !inBin(i)) return i;
    const { binnedAt: _a, binnedFrom, ...rest } = i;
    return { ...rest, status: binnedFrom ?? "draft" };
  });
}

/**
 * Products that anyone has bought can't be deleted for good: buyers keep
 * access and sales history must stay intact. Returns "" when deletion is allowed.
 */
export function deleteForeverBlock(state: Pick<CreatorState, "orders">, id: string) {
  const sales = state.orders.filter((o) => o.itemId === id).length;
  if (!sales) return "";
  return `${sales} ${sales === 1 ? "person has" : "people have"} bought this, so it stays in the Bin to keep their access and your sales history.`;
}

/** Removes a product for good, plus the coupons, affiliate offers and reviews tied to it. Linked landing pages go back to draft. */
export function deleteForever(state: BinState, id: string): Partial<BinState> | null {
  if (deleteForeverBlock(state, id)) return null;
  return {
    items: state.items.filter((i) => i.id !== id),
    promotions: state.promotions.filter((p) => p.itemId !== id),
    programs: state.programs.filter((p) => p.itemId !== id),
    reviews: state.reviews.filter((r) => r.itemId !== id),
    landingPages: state.landingPages.map((l) => (l.itemId === id ? { ...l, itemId: "", status: "draft" as const } : l)),
  };
}

/** Course presentation files stored only for this product (not Media Library files). */
export function ownFileIds(item: CreatorItem) {
  const p = item.course?.presentation;
  if (!p) return [];
  return [p.video?.id, p.slides?.id, ...p.images.map((i) => i.id)].filter((id): id is string => Boolean(id));
}
