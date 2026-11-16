import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import emptyArt from "@/assets/dreamverse/empty-search-3d.webp";
import { Button } from "@/components/dreamverse/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  ACCESS,
  CATEGORY_TABS,
  CURRENCIES,
  FORMATS,
  REGIONS,
  PRICE_RANGES,
  SORTS,
  TOPICS,
  TYPE_LABELS,
  availableCreators,
  availableCurrencies,
  availableTypes,
  displayPrice,
  priceIn,
  filterCatalog,
  type CatalogFilters,
  type SortId,
} from "@/lib/dreamverse/catalog";
import type { Product } from "@/lib/dreamverse/types";
import { keepCoachSearch } from "@/lib/dreamverse/search";
import { ENSKI } from "@/lib/enski-links";
import { cn } from "@/lib/utils";

import { FilterPanel } from "./FilterPanel";
import { fromDreamverse } from "@/components/shop/adapters";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { SectionHeading } from "./SectionHeading";

const PAGE = 12;

export function Marketplace({ products, popularIds }: { products: Product[]; popularIds: string[] }) {
  const filters = useSearch({ from: "/dreamverse" });
  const navigate = useNavigate({ from: "/dreamverse" });
  const [visible, setVisible] = useState(PAGE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState(filters.q ?? "");

  // Keep the local input in step when search changes elsewhere (hero search, topic tiles).
  useEffect(() => setQuery(filters.q ?? ""), [filters.q]);

  const update = (patch: Partial<CatalogFilters>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false, hashScrollIntoView: false });

  // Debounce typing into the URL.
  useEffect(() => {
    const next = query.trim() || undefined;
    if (next === filters.q) return;
    const t = window.setTimeout(() => update({ q: next }), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => filterCatalog(products, filters, popularIds), [products, filters, popularIds]);
  useEffect(
    () => setVisible(PAGE),
    [filters.q, filters.type, filters.topic, filters.currency, filters.price, filters.creator, filters.access, filters.format, filters.region, filters.sort],
  );

  const types = useMemo(() => availableTypes(products), [products]);
  const creators = useMemo(() => availableCreators(products), [products]);
  const typeCounts = useMemo(() => {
    const base = filterCatalog(products, { ...filters, type: undefined });
    return base.reduce<Record<string, number>>((acc, p) => ((acc[p.type] = (acc[p.type] ?? 0) + 1), acc), {});
  }, [products, filters]);
  const currencies = useMemo(() => availableCurrencies(products), [products]);
  const currencyCounts = useMemo(() => {
    const base = filterCatalog(products, { ...filters, currency: undefined, price: undefined });
    return Object.fromEntries(currencies.map((c) => [c, base.filter((p) => priceIn(p, c)).length]));
  }, [products, filters, currencies]);

  const chips: { key: keyof CatalogFilters; label: string }[] = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` });
  if (filters.type) chips.push({ key: "type", label: TYPE_LABELS[filters.type].plural });
  if (filters.topic) chips.push({ key: "topic", label: TOPICS.find((t) => t.id === filters.topic)!.name });
  if (filters.currency) {
    const c = CURRENCIES.find((x) => x.code === filters.currency)!;
    chips.push({ key: "currency", label: `Priced in ${c.label}` });
    const band = filters.price && PRICE_RANGES[filters.currency].find((r) => r.id === filters.price);
    if (band) chips.push({ key: "price", label: band.label });
  }
  if (filters.creator) chips.push({ key: "creator", label: filters.creator });
  if (filters.access) chips.push({ key: "access", label: ACCESS.find((a) => a.id === filters.access)!.label });
  if (filters.format) chips.push({ key: "format", label: FORMATS.find((f) => f.id === filters.format)!.label });
  if (filters.region) chips.push({ key: "region", label: `Creators in ${REGIONS.find((r) => r.id === filters.region)!.label}` });
  const filterCount = chips.filter((c) => c.key !== "q").length;

  const clearAll = () => {
    setQuery("");
    // Clearing the marketplace leaves the coach-card filters alone.
    navigate({ search: (prev) => keepCoachSearch(prev), replace: true, resetScroll: false, hashScrollIntoView: false });
  };

  const shown = results.slice(0, visible);

  return (
    <section id="marketplace" aria-labelledby="market-title" className="scroll-mt-20 pt-16 lg:pt-24">
      <div className="container-page">
        <SectionHeading
          id="market-title"
          eyebrow="The marketplace"
          title={
            <>
              Find your next <span className="text-brand">learning experience.</span>
            </>
          }
        >
          Learn directly from people doing the work. Explore practical courses, eBooks, live classes, coaching and
          services from Nigerian and international creators.
        </SectionHeading>

        {/* Type tabs */}
        <div className="mt-8" role="group" aria-label="Resource type">
          <ul className="no-scrollbar -mx-[1.125rem] flex gap-2 overflow-x-auto px-[1.125rem] pb-1 sm:mx-0 sm:px-0">
            {[undefined, ...CATEGORY_TABS].map((t) => {
              const selected = filters.type === t;
              return (
                <li key={t ?? "all"} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update({ type: t })}
                    className={cn(
                      "h-11 rounded-full px-5 text-[15px] font-extrabold transition-colors",
                      selected ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand hover:bg-sky-200",
                    )}
                  >
                    {t ? TYPE_LABELS[t].plural : "All"}
                    {t && (
                      <span className={cn("ml-1.5 text-xs", selected ? "text-on-blue-muted" : "text-muted-foreground")}>
                        {typeCounts[t] ?? 0}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 rounded-[24px] border border-line bg-background p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-extrabold text-ink">Filters</p>
                {chips.length > 0 && (
                  <button type="button" onClick={clearAll} className="text-sm font-extrabold text-brand hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel
                filters={filters}
                update={update}
                types={types}
                creators={creators}
                typeCounts={typeCounts}
                currencies={currencies}
                currencyCounts={currencyCounts}
                idPrefix="desk"
              />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <label htmlFor="market-search" className="sr-only">
                  Search the marketplace
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  id="market-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, skill or creator."
                  className="h-12 w-full rounded-[14px] border-[1.5px] border-line bg-background pr-4 pl-12 text-[15px] font-medium text-ink placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-ice focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button variant="tertiary" className="flex-1 lg:hidden">
                      <SlidersHorizontal /> Filters
                      {filterCount > 0 && (
                        <span className="grid size-6 place-items-center rounded-full bg-cobalt text-xs text-primary-foreground">
                          {filterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="flex max-h-[88dvh] flex-col gap-0 rounded-t-[28px] p-0">
                    <div className="border-b border-line p-5 pr-14">
                      <SheetTitle className="text-xl font-extrabold text-ink">Filters</SheetTitle>
                      <SheetDescription className="text-sm text-muted-foreground">
                        {results.length} {results.length === 1 ? "result" : "results"} match
                      </SheetDescription>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                      <FilterPanel
                        filters={filters}
                        update={update}
                        types={types}
                        creators={creators}
                        typeCounts={typeCounts}
                        currencies={currencies}
                        currencyCounts={currencyCounts}
                        idPrefix="mob"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
                      <Button variant="outline" onClick={clearAll} disabled={chips.length === 0}>
                        Clear all
                      </Button>
                      <Button onClick={() => setDrawerOpen(false)}>Show {results.length}</Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="relative flex-1 sm:w-48 sm:flex-none">
                  <label htmlFor="market-sort" className="sr-only">
                    Sort by
                  </label>
                  <select
                    id="market-sort"
                    value={filters.sort ?? "featured"}
                    onChange={(e) => update({ sort: e.target.value === "featured" ? undefined : (e.target.value as SortId) })}
                    className="h-12 w-full appearance-none rounded-full border-[1.5px] border-line bg-background pr-10 pl-5 text-[15px] font-extrabold text-ink focus:border-brand focus:ring-4 focus:ring-ice focus:outline-none"
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                </div>
              </div>
            </div>

            {/* Results meta + active chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-live="polite">
              <p className="mr-2 text-sm font-semibold text-muted-foreground">
                Showing <span className="font-extrabold text-ink">{Math.min(visible, results.length)}</span> of{" "}
                <span className="font-extrabold text-ink">{results.length}</span>{" "}
                {results.length === 1 ? "resource" : "resources"}
              </p>
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    if (c.key === "q") setQuery("");
                    // A price band only exists within a currency.
                    update(c.key === "currency" ? { currency: undefined, price: undefined } : { [c.key]: undefined });
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ice pr-2 pl-3 text-[13px] font-extrabold text-brand hover:bg-sky-200"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              ))}
              {chips.length > 1 && (
                <button type="button" onClick={clearAll} className="text-[13px] font-extrabold text-brand hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="mt-6 flex flex-col items-center rounded-[24px] border border-dashed border-cobalt-100 bg-soft px-6 py-14 text-center">
                <img src={emptyArt} alt="" width={360} height={262} loading="lazy" className="h-auto w-40" />
                <p className="mt-2 text-lg font-extrabold text-ink">No matches yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try a broader search or fewer filters. Know this topic well? You could be the first creator here.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={clearAll}>Clear all filters</Button>
                  <Button asChild variant="outline">
                    <a href={ENSKI.register}>Become a creator</a>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <ShopGrid items={shown.map((p) => fromDreamverse(p, displayPrice(p, filters.currency)))} />
                </div>
                {visible < results.length && (
                  <div className="mt-10 flex justify-center">
                    <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
                      Load more ({results.length - visible} left)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
