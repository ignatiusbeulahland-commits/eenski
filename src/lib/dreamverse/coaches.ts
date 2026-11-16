import { CURRENCIES, PRICE_RANGES, type CurrencyCode, type PriceRangeId } from "./catalog";
import type { Coach, Money, Product } from "./types";

/**
 * Coach filters. A coach's price is their featured programme's price — the
 * only price Enski lists for a coach. Prices are compared only within one
 * currency and are never converted.
 */
export interface CoachFilters {
  area?: string | undefined;
  currency?: CurrencyCode | undefined;
  /** Only meaningful together with `currency`; bands are per currency. */
  price?: PriceRangeId | undefined;
  /** Order of the cards; never changes which coaches match. */
  sort?: CoachSortId | undefined;
}

export const COACH_SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Lowest programme price" },
  { id: "price-desc", label: "Highest programme price" },
  { id: "name", label: "Coach name (A to Z)" },
] as const;

export type CoachSortId = (typeof COACH_SORTS)[number]["id"];

/**
 * Order coaches without changing which ones match. Price sorting uses the
 * featured programme's price. With a currency picked every coach has a price
 * in it; otherwise prices can't be compared across currencies, so coaches are
 * grouped by currency (USD first) and sorted within each, unpriced last.
 */
export function sortCoaches(coaches: Coach[], sort: CoachSortId | undefined, currency?: CurrencyCode): Coach[] {
  if (!sort || sort === "featured") return coaches;
  if (sort === "name") return [...coaches].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  const dir = sort === "price-asc" ? 1 : -1;
  const priceOf = (c: Coach) => (currency ? coachPriceIn(c, currency) : (c.session?.price ?? null));
  const rank = (c: Coach) => {
    const m = priceOf(c);
    if (!m) return Number.MAX_SAFE_INTEGER;
    const i = CURRENCIES.findIndex((x) => x.code === m.currency);
    return i === -1 ? CURRENCIES.length : i;
  };
  return [...coaches].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (priceOf(a)?.currency ?? "").localeCompare(priceOf(b)?.currency ?? "") ||
      dir * ((priceOf(a)?.current ?? 0) - (priceOf(b)?.current ?? 0)) ||
      a.name.localeCompare(b.name),
  );
}

/** The featured programme's price in one currency, exactly as the coach set it. */
export function coachPriceIn(c: Coach, currency: CurrencyCode): Money | null {
  const prices = c.session?.prices ?? [];
  const exact = prices.find((m) => m.currency === currency);
  if (exact) return exact;
  const free = prices.length > 0 && prices.every((m) => m.current === 0);
  return free ? { currency, sign: "", amount: 0, current: 0, onSale: false } : null;
}

/** Coaching areas present in the data, alphabetical. */
export function coachAreas(coaches: Coach[]): string[] {
  return [...new Set(coaches.map((c) => c.expertise).filter((a): a is string => !!a))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function coachCurrencies(coaches: Coach[]): CurrencyCode[] {
  return CURRENCIES.map((c) => c.code).filter((code) => coaches.some((c) => coachPriceIn(c, code)));
}

export function filterCoaches(coaches: Coach[], f: CoachFilters): Coach[] {
  const cur = f.currency;
  const range = cur && f.price ? PRICE_RANGES[cur].find((r) => r.id === f.price) : undefined;
  return coaches.filter((c) => {
    if (f.area && c.expertise !== f.area) return false;
    if (cur) {
      const price = coachPriceIn(c, cur);
      if (!price) return false;
      if (range && (price.current < range.min || price.current > range.max)) return false;
    }
    return true;
  });
}

export interface CoachSuggestion {
  label: string;
  count: number;
  filters: CoachFilters;
}

export interface CoachSuggestions {
  /** Other price bands in the same currency and area, closest band first. */
  prices: CoachSuggestion[];
  /** Other coaching areas that have matches with the current price filters. */
  areas: CoachSuggestion[];
  /** Wider searches: another currency, any price, or all areas. */
  wider: CoachSuggestion[];
}

/**
 * Ways out of an empty result: only suggestions that would show at least one
 * coach, each with its real count. Prices stay within one currency; switching
 * currency drops the band because bands differ per currency.
 */
export function coachSuggestions(coaches: Coach[], f: CoachFilters, maxPrices = 3): CoachSuggestions {
  const count = (next: CoachFilters) => filterCoaches(coaches, next).length;
  const cur = f.currency;

  const prices: (CoachSuggestion & { distance: number })[] = [];
  if (cur && f.price) {
    const bands = PRICE_RANGES[cur];
    const at = bands.findIndex((b) => b.id === f.price);
    bands.forEach((b, i) => {
      if (b.id === f.price) return;
      const next = { ...f, price: b.id };
      const n = count(next);
      if (n > 0) prices.push({ label: b.label, count: n, filters: next, distance: Math.abs(i - at) });
    });
    prices.sort((a, b) => a.distance - b.distance);
  }

  const areas: CoachSuggestion[] = [];
  for (const a of coachAreas(coaches)) {
    if (a === f.area) continue;
    const next = { ...f, area: a };
    const n = count(next);
    if (n > 0) areas.push({ label: a, count: n, filters: next });
  }

  const wider: CoachSuggestion[] = [];
  if (cur) {
    for (const c of CURRENCIES) {
      if (c.code === cur) continue;
      const next: CoachFilters = { area: f.area, currency: c.code, sort: f.sort };
      const n = count(next);
      if (n > 0) wider.push({ label: `Prices in ${c.symbol} ${c.label}`, count: n, filters: next });
    }
  }
  if (f.price) {
    const next = { ...f, price: undefined };
    const n = count(next);
    if (n > 0) wider.push({ label: "Any price", count: n, filters: next });
  }
  if (f.area) {
    const next = { ...f, area: undefined };
    const n = count(next);
    if (n > 0) wider.push({ label: "All coaching areas", count: n, filters: next });
  }

  return {
    prices: prices.slice(0, maxPrices).map(({ distance: _d, ...s }) => s),
    areas,
    wider,
  };
}

/**
 * A coach's bookable programmes on Dreamverse: published coaching listings by the same creator
 * (matched on profile slug, else name), with their featured programme first.
 */
export function coachProgrammes(coach: Coach, products: Product[]): Product[] {
  const mine = products.filter(
    (p) =>
      p.type === "coaching" &&
      p.status === "published" &&
      (coach.slug ? p.creator?.slug === coach.slug : p.creator?.name.toLowerCase() === coach.name.toLowerCase()),
  );
  const lead = coach.session?.title;
  return lead ? [...mine.filter((p) => p.title === lead), ...mine.filter((p) => p.title !== lead)] : mine;
}

