import type { ShopItem } from "./types";

/**
 * "Recommended for you": items sharing a category, creator or type with what
 * this visitor viewed, saved or put in the cart rank first; ties keep the
 * catalogue's own order (popularity). Without any signals it is the catalogue
 * order, so the page never claims personalisation it doesn't have.
 */
export function recommend(
  items: ShopItem[],
  signals: { recent: ShopItem[]; wishlist: ShopItem[]; cart: ShopItem[] },
): { items: ShopItem[]; personal: boolean } {
  const seen = [...signals.cart, ...signals.wishlist, ...signals.recent];
  if (seen.length === 0) return { items, personal: false };

  const weight = new Map<string, number>();
  const bump = (k: string | null | undefined, w: number) => {
    if (k) weight.set(k, (weight.get(k) ?? 0) + w);
  };
  for (const s of seen) {
    bump(s.category && `cat:${s.category}`, 3);
    bump(s.creator?.name && `by:${s.creator.name}`, 2);
    bump(`type:${s.typeLabel}`, 1);
  }
  const score = (i: ShopItem) =>
    (weight.get(`cat:${i.category}`) ?? 0) + (weight.get(`by:${i.creator?.name}`) ?? 0) + (weight.get(`type:${i.typeLabel}`) ?? 0);

  const owned = new Set(signals.cart.map((i) => i.key));
  const ranked = items
    .map((item, index) => ({ item, index, s: score(item) }))
    .filter((r) => !owned.has(r.item.key))
    .sort((a, b) => b.s - a.s || a.index - b.index)
    .map((r) => r.item);
  return { items: ranked, personal: true };
}

/** Same item can come from two sources (e.g. a live course also listed in Dreamverse): keep the first. */
export function uniqueItems(items: ShopItem[]): ShopItem[] {
  return [...new Map(items.map((i) => [i.key, i])).values()];
}

/** Lowercased words must all appear in the title, creator, type or category. */
export function searchItems(items: ShopItem[], q: string | undefined): ShopItem[] {
  const terms = (q ?? "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return items;
  return items.filter((i) => {
    const hay = [i.title, i.summary, i.creator?.name, i.typeLabel, i.category].filter(Boolean).join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export type ShopSort = "featured" | "popular" | "newest" | "price-asc" | "price-desc";

/** Sorts a mixed list. Prices only compare within one currency; anything else goes last. */
export function sortItems(items: ShopItem[], sort: ShopSort | undefined, currency: string): ShopItem[] {
  const price = (i: ShopItem) => (i.price && i.price.currency === currency ? i.price.current : i.price?.current === 0 ? 0 : undefined);
  const byPrice = (dir: 1 | -1) => (a: ShopItem, b: ShopItem) => {
    const pa = price(a);
    const pb = price(b);
    if (pa === undefined || pb === undefined) return (pa === undefined ? 1 : 0) - (pb === undefined ? 1 : 0);
    return dir * (pa - pb);
  };
  switch (sort) {
    case "popular":
      return [...items].sort((a, b) => b.popularity - a.popularity);
    case "newest":
      return [...items].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    case "price-asc":
      return [...items].sort(byPrice(1));
    case "price-desc":
      return [...items].sort(byPrice(-1));
    default:
      return items;
  }
}
