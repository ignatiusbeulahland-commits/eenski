import { useNavigate } from "@tanstack/react-router";

import { Icon3D } from "./icons3d";
import { Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/dreamverse/button";
import { TOPICS, isMarketCourse, productKey, suggest, type TopicId } from "@/lib/dreamverse/catalog";
import type { Product } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

import { TOPIC_ICONS } from "./topicIcons";

export function SearchDiscovery({ products }: { products: Product[] }) {
  const navigate = useNavigate({ from: "/dreamverse" });
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => suggest(products, value), [products, value]);

  const goSearch = (q: string) => {
    setOpen(false);
    navigate({
      search: (prev) => ({ ...prev, q: q.trim() || undefined, topic: undefined }),
      hash: "marketplace",
      resetScroll: false,
    });
  };
  const goTopic = (topic: TopicId) =>
    navigate({ search: (prev) => ({ ...prev, topic, q: undefined }), hash: "marketplace", resetScroll: false });

  return (
    <section aria-labelledby="search-title" className="relative z-10 -mt-6 lg:-mt-14">
      <div className="container-page">
        <div className="relative rounded-[28px] border border-line bg-background p-5 shadow-card sm:p-8 lg:p-10">
          <Icon3D
            name="ebook"
            className="absolute -top-7 right-4 size-16 rotate-6 animate-bob sm:-top-9 sm:right-8 sm:size-20 lg:right-12 lg:size-24"
          />
          <h2 id="search-title" className="dv-h2 pr-16 text-ink sm:pr-24">
            Find something <span className="text-brand">worth learning.</span>
          </h2>

          <form
            role="search"
            className="relative mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              const pick = active >= 0 ? results[active] : undefined;
              if (pick?.kind === "product" && isMarketCourse(pick.product)) navigate({ to: "/courses/$slug", params: { slug: pick.product.slug } });
              else if (pick?.kind === "product") navigate({ to: "/dreamverse/$slug", params: { slug: productKey(pick.product) } });
              else if (pick?.kind === "topic") goTopic(pick.topic);
              else goSearch(value);
            }}
          >
            <label htmlFor="dreamverse-search" className="sr-only">
              Search Dreamverse
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  ref={inputRef}
                  id="dreamverse-search"
                  type="search"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={open && results.length > 0}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                  value={value}
                  placeholder="Search courses, eBooks, coaches, skills and more..."
                  onChange={(e) => {
                    setValue(e.target.value);
                    setOpen(true);
                    setActive(-1);
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActive((i) => Math.min(i + 1, results.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActive((i) => Math.max(i - 1, -1));
                    } else if (e.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                  className="h-14 w-full rounded-[14px] border-[1.5px] border-line bg-background pr-12 pl-12 text-base font-medium text-ink placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-ice focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {value && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setValue("");
                      inputRef.current?.focus();
                    }}
                    className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-soft"
                  >
                    <X className="size-4" />
                  </button>
                )}

                {open && results.length > 0 && (
                  <ul
                    id={listId}
                    role="listbox"
                    className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-popover p-1.5 shadow-float"
                  >
                    {results.map((r, i) => (
                      <li
                        key={`${r.kind}-${r.label}`}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (r.kind === "product") navigate({ to: "/dreamverse/$slug", params: { slug: productKey(r.product) } });
                          else goTopic(r.topic);
                        }}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink",
                          i === active ? "bg-ice" : "hover:bg-soft",
                        )}
                      >
                        <span className="truncate">{r.label}</span>
                        <span className="shrink-0 text-xs font-extrabold text-sky-text">{r.sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" size="lg" className="sm:w-auto">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-semibold text-muted-foreground">Popular topics</p>
            <ul className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {TOPICS.map((t) => {
                const Icon = TOPIC_ICONS[t.id];
                return (
                  <li key={t.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => goTopic(t.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-ice px-4 text-sm font-extrabold text-brand transition-colors hover:bg-sky-200"
                    >
                      <Icon className="size-4" aria-hidden />
                      {t.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
