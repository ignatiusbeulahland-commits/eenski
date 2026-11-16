import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { COLLECTIONS, inCollection, isFree, type CollectionId } from "@/lib/dreamverse/catalog";
import type { Product } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

import { ProductShelf } from "./ProductRail";
import { SectionHeading } from "./SectionHeading";

/** Published listings before drafts and coming-soon ones, keeping each group's order. */
const availableFirst = (list: Product[]) =>
  [...list].sort((a, b) => Number(a.status !== "published") - Number(b.status !== "published"));

/** Skill collections, one tab each, so four topics share one section instead of crowding the page. */
export function CollectionsSection({ products }: { products: Product[] }) {
  const groups = useMemo(
    () =>
      COLLECTIONS.map((c) => ({ ...c, items: availableFirst(products.filter((p) => inCollection(p, c.id))) })).filter(
        (g) => g.items.length > 0,
      ),
    [products],
  );
  const [active, setActive] = useState<CollectionId | undefined>(undefined);
  const current = groups.find((g) => g.id === active) ?? groups[0];
  if (!current) return null;

  return (
    <section id="collections" aria-labelledby="collections-title" className="container-page scroll-mt-20 pt-16 lg:pt-24">
      <SectionHeading
        id="collections-title"
        eyebrow="Learn a practical skill"
        title={
          <>
            Skills that move <span className="text-brand">you forward.</span>
          </>
        }
      >
        Collections grouped by what you want to learn next.
      </SectionHeading>
      <div className="no-scrollbar -mx-[1.125rem] mt-6 flex gap-2 overflow-x-auto px-[1.125rem] pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Skill collections">
        {groups.map((g) => {
          const selected = g.id === current.id;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="collection-panel"
              onClick={() => setActive(g.id)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition-colors",
                selected ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand hover:bg-sky-200",
              )}
            >
              {g.name}
              <span className={cn("text-xs", selected ? "text-on-blue-muted" : "text-muted-foreground")}>{g.items.length}</span>
            </button>
          );
        })}
      </div>
      <div id="collection-panel" role="tabpanel" aria-label={current.name} className="mt-6">
        <ProductShelf key={current.id} label={current.name} products={current.items} />
      </div>
    </section>
  );
}

export function FreeSection({ products }: { products: Product[] }) {
  const free = availableFirst(products.filter(isFree));
  if (free.length === 0) return null;
  const available = free.filter((p) => p.status === "published").length;
  return (
    <section id="free" aria-labelledby="free-title" className="container-page scroll-mt-20 pt-16 lg:pt-24">
      <SectionHeading
        id="free-title"
        eyebrow="Free learning resources"
        title={
          <>
            Start learning <span className="text-brand">for free.</span>
          </>
        }
        action={
          <Link
            to="/dreamverse"
            search={(prev) => ({ ...prev, access: "free" as const, currency: undefined, price: undefined })}
            hash="marketplace"
            resetScroll={false}
            className="inline-flex min-h-11 items-center text-sm font-extrabold text-brand underline-offset-4 hover:underline"
          >
            See all free resources
          </Link>
        }
      >
        Free courses, eBooks, workshops and guides from Dreamverse creators, with no paid listings in the way.
      </SectionHeading>
      <p className="mt-3 text-[13px] font-semibold text-muted-foreground">
        {available} available now{free.length > available ? `, ${free.length - available} not published yet` : ""}.
      </p>
      <div className="mt-6">
        <ProductShelf label="Free learning resources" products={free} />
      </div>
    </section>
  );
}
