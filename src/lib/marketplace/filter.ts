import { PRICE_RANGES, priceIn, type CurrencyCode, type PriceRangeId } from "@/lib/dreamverse/catalog";
import type { Money } from "@/lib/dreamverse/types";
import type { MarketCourse } from "./types";

export const COURSE_SORTS = [
  { id: "featured", label: "Featured" },
  { id: "popular", label: "Most popular" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;
export type CourseSortId = (typeof COURSE_SORTS)[number]["id"];

export interface CourseFilters {
  q?: string | undefined;
  category?: string | undefined;
  level?: string | undefined;
  price?: PriceRangeId | undefined;
  currency: CurrencyCode;
  sort?: CourseSortId | undefined;
}

/** Price to show and compare: the chosen currency when the creator priced it there, else their default. */
export function coursePrice(c: MarketCourse, currency: CurrencyCode): Money | null {
  return priceIn(c.listing, currency) ?? c.listing.price;
}

const haystack = (c: MarketCourse) =>
  [c.listing.title, c.listing.summary, c.listing.creator?.name, c.category, c.level, ...c.tags, ...c.listing.skills]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** Higher is more popular: Enski's trending order first, then learners, then reviews. */
export function popularity(c: MarketCourse): number {
  const trend = c.trendingRank === null ? 0 : 1_000_000 - c.trendingRank * 1000;
  return trend + (c.students ?? 0) * 10 + (c.listing.rating?.count ?? 0);
}

export function filterCourses(courses: MarketCourse[], f: CourseFilters): MarketCourse[] {
  const terms = (f.q ?? "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  const range = f.price ? PRICE_RANGES[f.currency].find((r) => r.id === f.price) : undefined;
  const out = courses.filter((c) => {
    if (f.category && c.category !== f.category) return false;
    if (f.level && c.level !== f.level) return false;
    if (terms.length && !terms.every((t) => haystack(c).includes(t))) return false;
    if (range) {
      const isFree = c.listing.prices.length > 0 && c.listing.prices.every((m) => m.current === 0);
      if (range.id === "free") return isFree;
      const p = priceIn(c.listing, f.currency);
      if (!p || p.current < range.min || p.current > range.max) return false;
    }
    return true;
  });

  const price = (c: MarketCourse) => priceIn(c.listing, f.currency)?.current;
  const byPrice = (dir: 1 | -1) => (a: MarketCourse, b: MarketCourse) => {
    const pa = price(a);
    const pb = price(b);
    // Courses without a price in the chosen currency go last instead of being compared across currencies.
    if (pa === undefined || pb === undefined) return (pa === undefined ? 1 : 0) - (pb === undefined ? 1 : 0);
    return dir * (pa - pb);
  };
  switch (f.sort) {
    case "popular":
      return [...out].sort((a, b) => popularity(b) - popularity(a));
    case "newest":
      return [...out].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    case "price-asc":
      return [...out].sort(byPrice(1));
    case "price-desc":
      return [...out].sort(byPrice(-1));
    default:
      return out;
  }
}

const distinct = (values: (string | null)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));

export const categoriesOf = (courses: MarketCourse[]) => distinct(courses.map((c) => c.category));
export const levelsOf = (courses: MarketCourse[]) => distinct(courses.map((c) => c.level));

/** Same creator first, then the same category, then anything else — never the course itself. */
export function relatedCourses(course: MarketCourse, all: MarketCourse[], limit = 4): MarketCourse[] {
  const others = all.filter((c) => c.slug !== course.slug);
  const sameCategory = others.filter((c) => course.category && c.category === course.category);
  const rest = [...others].sort((a, b) => popularity(b) - popularity(a));
  return [...new Map([...sameCategory, ...rest].map((c) => [c.slug, c])).values()].slice(0, limit);
}

export function moreFromCreator(course: MarketCourse, all: MarketCourse[]): MarketCourse[] {
  const slug = course.listing.creator?.slug;
  return slug ? all.filter((c) => c.slug !== course.slug && c.listing.creator?.slug === slug) : [];
}
