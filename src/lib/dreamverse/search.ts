import {
  ACCESS,
  CURRENCIES,
  FORMATS,
  REGIONS,
  PRICE_TIER_IDS,
  SORTS,
  TOPICS,
  TYPE_ORDER,
  type CatalogFilters,
  type CurrencyCode,
  type PriceRangeId,
} from "./catalog";
import { COACH_SORTS, type CoachFilters, type CoachSortId } from "./coaches";
import type { ResourceType } from "./types";

const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;

/** Coach-card filters, kept in the URL under their own keys so they never clash with the marketplace's. */
export interface CoachSearch {
  coachArea?: string | undefined;
  coachCurrency?: CurrencyCode | undefined;
  coachPrice?: PriceRangeId | undefined;
  coachSort?: CoachSortId | undefined;
}

export type DreamverseSearch = CatalogFilters & CoachSearch;

/** Marketplace and coach-card state live in the URL so results can be shared and restored. */
export function validateDreamverseSearch(search: Record<string, unknown>): DreamverseSearch {
  const q = typeof search["q"] === "string" ? search["q"].slice(0, 120) : undefined;
  const creator = typeof search["creator"] === "string" ? search["creator"].slice(0, 80) : undefined;
  const currency = pick(search["currency"], CURRENCIES.map((c) => c.code));
  return {
    q: q || undefined,
    type: pick<ResourceType>(search["type"], TYPE_ORDER),
    topic: pick(search["topic"], TOPICS.map((t) => t.id)),
    currency,
    // Price bands are per currency, so a band without a currency is ignored.
    price: currency ? pick(search["price"], PRICE_TIER_IDS) : undefined,
    creator: creator || undefined,
    access: pick(search["access"], ACCESS.map((a) => a.id)),
    format: pick(search["format"], FORMATS.map((f) => f.id)),
    region: pick(search["region"], REGIONS.map((r) => r.id)),
    sort: pick(search["sort"], SORTS.map((s) => s.id)),
    ...validateCoachSearch(search),
  };
}

function validateCoachSearch(search: Record<string, unknown>): CoachSearch {
  const area = typeof search["coachArea"] === "string" ? search["coachArea"].trim().slice(0, 80) : undefined;
  const currency = pick(search["coachCurrency"], CURRENCIES.map((c) => c.code));
  return {
    coachArea: area || undefined,
    coachCurrency: currency,
    // Same rule as the marketplace: a price band only means something within a currency.
    coachPrice: currency ? pick(search["coachPrice"], PRICE_TIER_IDS) : undefined,
    coachSort: pick(search["coachSort"], COACH_SORTS.map((s) => s.id).filter((id) => id !== "featured")),
  };
}

/** Coach filters as read from the URL. */
export function coachFiltersFromSearch(s: CoachSearch): CoachFilters {
  return {
    area: s.coachArea,
    currency: s.coachCurrency,
    price: s.coachCurrency ? s.coachPrice : undefined,
    sort: s.coachSort,
  };
}

/** URL params for a set of coach filters (empty filters clear the keys). */
export function coachSearchParams(f: CoachFilters): CoachSearch {
  return {
    coachArea: f.area,
    coachCurrency: f.currency,
    coachPrice: f.currency ? f.price : undefined,
    coachSort: f.sort && f.sort !== "featured" ? f.sort : undefined,
  };
}

/** Only the coach keys of a search, so marketplace resets keep the coach-card filters. */
export function keepCoachSearch(s: CoachSearch): CoachSearch {
  return { coachArea: s.coachArea, coachCurrency: s.coachCurrency, coachPrice: s.coachPrice, coachSort: s.coachSort };
}
