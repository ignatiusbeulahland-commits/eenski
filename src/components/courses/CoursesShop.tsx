import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown, Clock3, Flame, Search, SlidersHorizontal, Store, TrendingUp, Trophy, Users, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { CreatorAvatar } from "@/components/dreamverse/CreatorAvatar";
import { fromCourse, fromShowcase } from "@/components/shop/adapters";
import { ShopGrid, ShopSection, ShopShelf } from "@/components/shop/ShopGrid";
import { RecentlyViewed, RecommendedFeed } from "@/components/shop/sections";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories as showcaseCategories, products as showcaseProducts } from "@/components/site/data";
import { CURRENCIES, PRICE_RANGES, type CurrencyCode, type PriceRangeId } from "@/lib/dreamverse/catalog";
import { marketplaceQueryOptions } from "@/lib/marketplace/data";
import { COURSE_SORTS, categoriesOf, filterCourses, levelsOf, popularity, type CourseSortId } from "@/lib/marketplace/filter";
import { searchItems, sortItems, uniqueItems } from "@/lib/shop/recommend";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

// "order" (not "sort") so it doesn't clash with Dreamverse's own sort options.
export type CoursesSearch = {
  q?: string | undefined;
  kind?: "course" | "ebook" | undefined;
  category?: string | undefined;
  level?: string | undefined;
  price?: PriceRangeId | undefined;
  currency?: CurrencyCode | undefined;
  order?: CourseSortId | undefined;
};

const KINDS = [
  { id: undefined, label: "All" },
  { id: "course", label: "Courses" },
  { id: "ebook", label: "eBooks" },
] as const;

const chip = (on: boolean) =>
  cn(
    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    on ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand hover:bg-sky-200",
  );

const selectClass =
  "h-11 w-full appearance-none rounded-full border-[1.5px] border-line bg-background pr-9 pl-4 text-sm font-extrabold text-ink focus:border-brand focus:ring-4 focus:ring-ice focus:outline-none";

function Select({ label, value, onChange, children, className }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode; className?: string }) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass} aria-label={label}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </label>
  );
}

/**
 * The course marketplace as a shopping feed: search, type and category chips,
 * filters and sort, then collections (popular, trending, bestsellers, recently
 * added, creators, recently viewed) and a two-column "Recommended for you".
 */
export function CoursesShop() {
  const { data } = useSuspenseQuery(marketplaceQueryOptions());
  const search = useSearch({ from: "/courses" });
  const navigate = useNavigate({ from: "/courses" });
  const currency: CurrencyCode = search.currency ?? "NGN";
  const [query, setQuery] = useState(search.q ?? "");
  const [sheet, setSheet] = useState(false);

  useEffect(() => setQuery(search.q ?? ""), [search.q]);
  // Typing updates the address (so results can be shared) after a short pause.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const q = query.trim() || undefined;
      if (q !== search.q) void navigate({ search: (prev) => ({ ...prev, q }), replace: true, resetScroll: false });
    }, 250);
    return () => window.clearTimeout(id);
  }, [query, search.q, navigate]);

  const set = (patch: Partial<CoursesSearch>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });
  const clearAll = () => {
    setQuery("");
    void set({ q: undefined, kind: undefined, category: undefined, level: undefined, price: undefined });
  };

  const courses = data.courses;
  const levels = useMemo(() => levelsOf(courses), [courses]);
  const categories = useMemo(
    () => [...new Set([...categoriesOf(courses), ...showcaseCategories.filter((c) => c !== "All")])].sort((a, b) => a.localeCompare(b)),
    [courses],
  );
  const level = search.level && levels.includes(search.level) ? search.level : undefined;
  const filtering = !!(search.q || search.kind || search.category || level || search.price);
  const moreFilters = [level, search.price].filter(Boolean).length;

  // Every product on this page as shop cards: Enski's live courses, then the Enski creators' catalogue.
  const live = useMemo(() => courses.map((c) => fromCourse(c, currency)), [courses, currency]);
  const showcase = useMemo(() => showcaseProducts.map(fromShowcase), []);
  const all = useMemo(() => uniqueItems([...live, ...showcase]), [live, showcase]);

  const results = useMemo(() => {
    if (!filtering) return [];
    const liveMatches =
      search.kind === "ebook"
        ? []
        : filterCourses(courses, { q: search.q, category: search.category, level, price: search.price, currency }).map((c) => fromCourse(c, currency));
    const band = search.price ? PRICE_RANGES[currency].find((r) => r.id === search.price) : undefined;
    const showcaseMatches = level
      ? []
      : searchItems(showcase, search.q).filter((i) => {
          if (search.kind && i.typeLabel !== (search.kind === "ebook" ? "eBook" : "Course")) return false;
          if (search.category && i.category !== search.category) return false;
          if (band) {
            if (!i.price || i.price.currency !== currency) return false;
            if (band.id === "free" ? i.price.current !== 0 : i.price.current < band.min || i.price.current > band.max) return false;
          }
          return true;
        });
    return sortItems(uniqueItems([...liveMatches, ...showcaseMatches]), search.order, currency);
  }, [filtering, courses, showcase, search, level, currency]);

  // Collections, all from real Enski data (no invented sales figures).
  const popular = useMemo(() => [...live].sort((a, b) => b.popularity - a.popularity).slice(0, 10), [live]);
  const trending = useMemo(
    () =>
      courses
        .filter((c) => c.trendingRank !== null)
        .sort((a, b) => a.trendingRank! - b.trendingRank!)
        .map((c) => fromCourse(c, currency))
        .slice(0, 10),
    [courses, currency],
  );
  const bestsellers = useMemo(
    () =>
      courses
        .filter((c) => (c.students ?? 0) > 0)
        .sort((a, b) => (b.students ?? 0) - (a.students ?? 0) || popularity(b) - popularity(a))
        .map((c) => fromCourse(c, currency))
        .slice(0, 10),
    [courses, currency],
  );
  const recent = useMemo(
    () =>
      courses
        .filter((c) => c.publishedAt)
        .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))
        .map((c) => fromCourse(c, currency))
        .slice(0, 10),
    [courses, currency],
  );
  const creators = useMemo(() => featuredCreators(all), [all]);
  const feed = useMemo(() => uniqueItems([...popular, ...all]), [popular, all]);

  const filterControls = (
    <>
      <Select label="Price" value={search.price ?? ""} onChange={(v) => set({ price: (v || undefined) as PriceRangeId | undefined })}>
        <option value="">Any price</option>
        {PRICE_RANGES[currency].map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </Select>
      {levels.length > 0 && (
        <Select label="Level" value={level ?? ""} onChange={(v) => set({ level: v || undefined })}>
          <option value="">All levels</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      )}
      <Select label="Currency" value={currency} onChange={(v) => set({ currency: v as CurrencyCode, price: undefined })}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.name}
          </option>
        ))}
      </Select>
    </>
  );

  return (
    <>
      <section className="relative overflow-hidden bg-cobalt-light pt-24 pb-7 text-primary-foreground lg:pt-32 lg:pb-10">
        <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1200px] px-5">
          <p className="eyebrow text-lime">Enski marketplace</p>
          <h1 className="mt-3 max-w-3xl text-[32px] leading-[1.08] font-extrabold tracking-tight sm:text-5xl">
            Shop the skills <span className="text-lime">your dream needs.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-on-blue sm:text-[17px]">
            Courses and eBooks from creators on Enski. Open anything to preview it, no account needed.
          </p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-6 max-w-2xl">
            <label className="flex h-13 items-center gap-3 rounded-full bg-background px-5 text-ink shadow-card ring-sky focus-within:ring-[3px] sm:h-14">
              <Search className="size-5 shrink-0 text-brand" aria-hidden="true" />
              <span className="sr-only">Search by product name or creator</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a course, eBook or creator"
                className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-soft">
                  <X className="size-4" />
                </button>
              )}
            </label>
          </form>
        </div>
      </section>

      {/* Sticky shopping bar: type and category chips, filters, sort. */}
      <div className="sticky top-[72px] z-30 border-b border-line bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-5 py-2.5">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Product type and category">
            {KINDS.map((k) => {
              const on = k.id ? search.kind === k.id : !search.kind && !search.category;
              return (
                <button
                  key={k.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set(k.id ? { kind: search.kind === k.id ? undefined : k.id } : { kind: undefined, category: undefined })}
                  className={chip(on)}
                >
                  {k.label}
                </button>
              );
            })}
            <span className="mx-1 w-px shrink-0 self-stretch bg-line" aria-hidden />
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={search.category === c} onClick={() => set({ category: search.category === c ? undefined : c })} className={chip(search.category === c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <Sheet open={sheet} onOpenChange={setSheet}>
              <SheetTrigger asChild>
                <button type="button" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] border-line bg-background px-4 text-sm font-extrabold text-ink hover:bg-soft lg:hidden">
                  <SlidersHorizontal className="size-4 text-brand" aria-hidden /> Filters
                  {moreFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-cobalt text-[11px] text-primary-foreground">{moreFilters}</span>}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col gap-0 rounded-t-[28px] p-0">
                <div className="border-b border-line p-5 pr-14">
                  <SheetTitle className="text-xl font-extrabold text-ink">Filters</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">Narrow the marketplace by price, level and currency.</SheetDescription>
                </div>
                <div className="grid gap-3 overflow-y-auto p-5">{filterControls}</div>
                <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
                  <button type="button" onClick={clearAll} className="min-h-12 rounded-full border-[1.5px] border-line text-[15px] font-extrabold text-ink hover:bg-soft">
                    Clear all
                  </button>
                  <button type="button" onClick={() => setSheet(false)} className="min-h-12 rounded-full bg-cobalt text-[15px] font-extrabold text-primary-foreground hover:bg-cobalt-hover">
                    Show results
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="hidden min-w-0 flex-1 grid-cols-3 gap-2 lg:grid lg:max-w-[560px]">{filterControls}</div>
            <Select label="Sort by" value={search.order ?? "featured"} onChange={(v) => set({ order: v === "featured" ? undefined : (v as CourseSortId) })} className="ml-auto w-[11.5rem] sm:w-52">
              {COURSE_SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === "featured" ? "Sort: Featured" : s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] space-y-12 px-5 py-8 lg:space-y-16 lg:py-12">
        {data.error && courses.length === 0 && (
          <div role="alert" className="rounded-3xl bg-soft p-6 text-center">
            <p className="text-base font-extrabold text-ink">Some live courses couldn't load right now.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again in a moment.</p>
          </div>
        )}

        {filtering ? (
          <section aria-labelledby="results-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h2 id="results-title" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                {results.length} {results.length === 1 ? "result" : "results"}
                {search.q && <span className="text-brand"> for “{search.q}”</span>}
              </h2>
              <button type="button" onClick={clearAll} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-extrabold text-brand hover:bg-ice">
                <X className="size-4" aria-hidden /> Clear filters
              </button>
            </div>
            {results.length > 0 ? (
              <ShopGrid items={results} eagerCount={4} />
            ) : (
              <div className="rounded-3xl bg-soft p-10 text-center">
                <p className="text-lg font-extrabold text-ink">Nothing matches that yet.</p>
                <p className="mt-2 text-muted-foreground">Try another word, or clear a filter.</p>
              </div>
            )}
          </section>
        ) : (
          <>
            <RecentlyViewed />
            {popular.length > 0 && !sameStart(popular, bestsellers) && (
              <ShopSection id="popular-title" title="Popular right now" icon={<Flame />} note="Most enrolled and most reviewed on Enski.">
                <ShopShelf items={popular} label="Popular right now" />
              </ShopSection>
            )}
            {trending.length > 1 && (
              <ShopSection id="trending-title" title="Trending this week" icon={<TrendingUp />} note="From Enski's trending list.">
                <ShopShelf items={trending} label="Trending this week" badge={() => "Trending"} />
              </ShopSection>
            )}
            {bestsellers.length > 1 && (
              <ShopSection id="best-title" title="Bestsellers" icon={<Trophy />} note="Most enrolled on Enski.">
                <ShopShelf items={bestsellers} label="Bestsellers" badge={(_, i) => (i < 3 ? "Bestseller" : undefined)} />
              </ShopSection>
            )}
            {creators.length > 0 && (
              <ShopSection id="creators-title" title="Featured creators" icon={<Users />} note="Tap a creator to see everything they sell.">
                <ul className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto scroll-px-5 px-5 pb-2" aria-label="Featured creators">
                  {creators.map((c) => (
                    <li key={c.name} className="w-[8.5rem] shrink-0 snap-start sm:w-40">
                      <CreatorTile creator={c} onPick={() => set({ q: c.name, kind: undefined, category: undefined })} />
                    </li>
                  ))}
                </ul>
              </ShopSection>
            )}
            {recent.length > 1 && (
              <ShopSection id="new-title" title="New arrivals" icon={<Clock3 />} note="The newest courses to go live on Enski.">
                <ShopShelf items={recent} label="New arrivals" badge={(_, i) => (i < 2 ? "New" : undefined)} />
              </ShopSection>
            )}
            <ShopSection id="catalogue-title" title="From Enski creators" icon={<Store />} note="Courses and eBooks from creators building on Enski.">
              <ShopShelf items={showcase} label="From Enski creators" />
            </ShopSection>
            <RecommendedFeed items={feed} />
          </>
        )}
      </div>
    </>
  );
}

/** True when two rails would open with the same products, so only one is shown. */
const sameStart = (a: ShopItem[], b: ShopItem[], n = 4) =>
  b.length >= n && a.slice(0, n).every((item, i) => item.key === b[i]?.key);

interface FeaturedCreator {
  name: string;
  slug: string | null;
  avatar: string | null;
  count: number;
}

function featuredCreators(items: ShopItem[]): FeaturedCreator[] {
  const by = new Map<string, FeaturedCreator>();
  for (const i of items) {
    if (!i.creator) continue;
    const row = by.get(i.creator.name) ?? { name: i.creator.name, slug: i.creator.slug, avatar: i.creator.avatar, count: 0 };
    row.count += 1;
    row.slug ??= i.creator.slug;
    row.avatar ??= i.creator.avatar;
    by.set(i.creator.name, row);
  }
  return [...by.values()].sort((a, b) => b.count - a.count);
}

function CreatorTile({ creator, onPick }: { creator: FeaturedCreator; onPick: () => void }) {
  const body = (
    <>
      <CreatorAvatar name={creator.name} src={creator.avatar} size="lg" className="mx-auto size-16 ring-4 ring-ice" />
      <span className="mt-2.5 line-clamp-2 block text-[13px] leading-snug font-extrabold text-ink">{creator.name}</span>
      <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">
        {creator.count} {creator.count === 1 ? "product" : "products"}
      </span>
    </>
  );
  const cls =
    "block h-full rounded-[18px] border border-line bg-card px-3 py-4 text-center shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:hover:translate-y-0";
  return creator.slug ? (
    <Link to="/creators/$slug" params={{ slug: creator.slug }} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onPick} className={cn(cls, "w-full")}>
      {body}
    </button>
  );
}
