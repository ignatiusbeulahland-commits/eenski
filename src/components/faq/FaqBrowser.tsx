import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  BookOpen,
  Clapperboard,
  Handshake,
  LayoutGrid,
  Rocket,
  SearchX,
  ShieldCheck,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FAQ_CATEGORIES, FAQS, type FaqCategoryId } from "@/components/faq/faqs";
import { filterFaqs, type FaqFilter } from "@/lib/faq-search";
import { cn } from "@/lib/utils";
import { FaqItem } from "./FaqItem";

const ICONS: Record<FaqFilter, LucideIcon> = {
  all: LayoutGrid,
  "getting-started": Rocket,
  payments: Wallet,
  courses: BookOpen,
  facilitators: Clapperboard,
  affiliates: Handshake,
  technical: Wrench,
  account: ShieldCheck,
};

const TOPICS: { id: FaqFilter; label: string }[] = [
  { id: "all", label: "All topics" },
  ...FAQ_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

const labelFor = (id: FaqCategoryId) => FAQ_CATEGORIES.find((c) => c.id === id)?.label ?? "";

interface FaqBrowserProps {
  category: FaqFilter;
  onCategoryChange: (c: FaqFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

export function FaqBrowser({ category, onCategoryChange, query, onQueryChange }: FaqBrowserProps) {
  const results = useMemo(() => filterFaqs(FAQS, category, query), [category, query]);
  const counts = useMemo(() => {
    const map = { all: filterFaqs(FAQS, "all", query).length } as Record<FaqFilter, number>;
    for (const c of FAQ_CATEGORIES) map[c.id] = filterFaqs(FAQS, c.id, query).length;
    return map;
  }, [query]);

  const searching = query.trim().length > 0;
  const grouped = category === "all" && !searching;
  const activeCategory = FAQ_CATEGORIES.find((c) => c.id === category);

  return (
    <section
      id="answers"
      className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-6 pb-16 lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 lg:px-8 lg:pt-16 lg:pb-24"
    >
      {/* Mobile: sticky scrolling chips */}
      <div className="sticky top-[72px] z-20 -mx-5 border-b border-line bg-background/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="tablist" aria-label="Topics">
          {TOPICS.map((t) => {
            const Icon = ICONS[t.id];
            const active = category === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(t.id)}
                className={cn(
                  "flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors",
                  active
                    ? "bg-cobalt text-primary-foreground"
                    : "border border-line bg-card text-brand hover:bg-ice",
                )}
              >
                <Icon className="size-4" />
                {t.id === "all" ? "All" : t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Deep Cobalt topic sidebar */}
      <aside className="hidden lg:block">
        <nav
          aria-label="Topics"
          className="sticky top-24 rounded-[24px] bg-cobalt-light p-3 text-on-blue shadow-float"
        >
          <p className="type-eyebrow px-3 pt-3 pb-4 text-sky-light">Browse by topic</p>
          <ul className="space-y-1">
            {TOPICS.map((t) => {
              const Icon = ICONS[t.id];
              const active = category === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => onCategoryChange(t.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-3 text-left text-[15px] font-bold transition-colors",
                      active ? "bg-sky text-midnight" : "text-on-blue/90 hover:bg-on-blue/10",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    <span className="flex-1">{t.label}</span>
                    <span
                      className={cn(
                        "type-caption min-w-7 rounded-full px-2 py-0.5 text-center",
                        active ? "bg-midnight text-lime" : "bg-on-blue/10 text-on-blue/80",
                      )}
                    >
                      {counts[t.id]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="mt-8 lg:mt-0">
        {/* Results heading */}
        {searching ? (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="type-eyebrow text-sky-text">Search results</p>
              <h2 className="type-h2 mt-2">
                {results.length} {results.length === 1 ? "answer" : "answers"} for{" "}
                <span className="text-brand">&ldquo;{query.trim()}&rdquo;</span>
              </h2>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onQueryChange("")}>
              Clear search
            </Button>
          </div>
        ) : activeCategory ? (
          <div className="mb-6">
            <p className="type-eyebrow text-sky-text">{results.length} questions</p>
            <h2 className="type-h2 mt-2">{activeCategory.label}</h2>
            <p className="mt-2 text-base text-muted-foreground">{activeCategory.blurb}</p>
          </div>
        ) : null}

        {results.length === 0 ? (
          <EmptyState
            query={query}
            elsewhere={category !== "all" && counts.all > 0}
            onSearchAll={() => onCategoryChange("all")}
            onClear={() => onQueryChange("")}
          />
        ) : grouped ? (
          <div className="space-y-14">
            {FAQ_CATEGORIES.map((cat) => {
              const items = results.filter((f) => f.category === cat.id);
              const Icon = ICONS[cat.id];
              return (
                <div key={cat.id} id={`topic-${cat.id}`} className="scroll-mt-24">
                  <div className="mb-5 flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-ice text-brand">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <h2 className="type-h3 text-ink">{cat.label}</h2>
                      <p className="type-caption text-muted-foreground">{cat.blurb}</p>
                    </div>
                  </div>
                  <AccordionPrimitive.Root type="multiple" className="space-y-3">
                    {items.map((faq) => (
                      <FaqItem key={faq.id} faq={faq} query="" />
                    ))}
                  </AccordionPrimitive.Root>
                </div>
              );
            })}
          </div>
        ) : (
          <AccordionPrimitive.Root
            type="multiple"
            className="space-y-3"
            key={`${category}-${searching}`}
            defaultValue={searching && results.length <= 3 ? results.map((r) => String(r.id)) : []}
          >
            {results.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                query={query}
                categoryLabel={searching && category === "all" ? labelFor(faq.category) : undefined}
              />
            ))}
          </AccordionPrimitive.Root>
        )}
      </div>
    </section>
  );
}

function EmptyState({
  query,
  elsewhere,
  onSearchAll,
  onClear,
}: {
  query: string;
  elsewhere: boolean;
  onSearchAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-line bg-card px-6 py-12 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-ice text-brand">
        <SearchX className="size-7" />
      </span>
      <h3 className="type-h3 mt-5">No answers for &ldquo;{query.trim()}&rdquo; here</h3>
      <p className="mx-auto mt-2 max-w-sm text-base text-muted-foreground">
        Try a shorter word, check the spelling, or ask the Enski community below.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {elsewhere ? (
          <Button onClick={onSearchAll}>Search all topics</Button>
        ) : (
          <Button onClick={onClear}>Clear search</Button>
        )}
      </div>
    </div>
  );
}
