import { useState, type ReactNode } from "react";

import { useRatings } from "@/lib/shop/ratings";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

import { ShopCard, type ShopBadge } from "./ShopCard";

type BadgeFor = (item: ShopItem, index: number) => ShopBadge | undefined;

/**
 * The shopping grid: always two cards side by side on phones and tablets, more
 * columns only when the space allows (sized by the grid's own width, so it also
 * works next to a filter sidebar).
 */
export function ShopGrid({ items, badge, className, eagerCount = 0 }: { items: ShopItem[]; badge?: BadgeFor | undefined; className?: string | undefined; eagerCount?: number }) {
  const ratings = useRatings(items);
  return (
    <div className="@container">
      <ul className={cn("grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:gap-x-4 sm:gap-y-5 @3xl:grid-cols-3 @5xl:grid-cols-4", className)}>
        {items.map((item, i) => (
          <li key={item.key} className="min-w-0">
            <ShopCard item={item} rating={ratings[item.reviewKey]} badge={badge?.(item, i)} eager={i < eagerCount} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A collection shown as the same two-column grid (Trending, Bestsellers, New
 * arrivals…): a short block of cards first, "Show more" for the rest. Six fill
 * three rows on phones and two on tablets; wide grids show one full row of four.
 */
export function ShopShelf({
  items,
  label,
  badge,
  initial = 6,
  step = 12,
}: {
  items: ShopItem[];
  label: string;
  badge?: BadgeFor | undefined;
  initial?: number | undefined;
  step?: number | undefined;
}) {
  const [shown, setShown] = useState(initial);
  const ratings = useRatings(items);
  const collapsed = shown === initial;
  const visible = items.slice(0, shown);
  // In the four-column view, hide the cards that would leave a half-empty row while collapsed.
  const fullRow = Math.floor(visible.length / 4) * 4 || visible.length;
  const more = items.length - shown;
  return (
    <div>
      <div className="@container">
        <ul aria-label={label} className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:gap-x-4 sm:gap-y-5 @3xl:grid-cols-3 @5xl:grid-cols-4">
          {visible.map((item, i) => (
            <li key={item.key} className={cn("min-w-0", collapsed && i >= fullRow && "@5xl:hidden")}>
              <ShopCard item={item} rating={ratings[item.reviewKey]} badge={badge?.(item, i)} />
            </li>
          ))}
        </ul>
      </div>
      {more > 0 && <ShowMore onClick={() => setShown((n) => n + step)} left={more} />}
    </div>
  );
}

export function ShowMore({ onClick, left }: { onClick: () => void; left: number }) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-line bg-background px-6 text-[15px] font-extrabold text-brand transition-colors hover:bg-ice"
      >
        Show more ({left} left)
      </button>
    </div>
  );
}

/** Compact shop section heading with an optional "See all". */
export function ShopSection({
  id,
  title,
  note,
  icon,
  action,
  children,
  className,
}: {
  id: string;
  title: ReactNode;
  note?: ReactNode | undefined;
  icon?: ReactNode | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section aria-labelledby={id} className={cn("scroll-mt-24", className)}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {icon && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ice text-brand [&_svg]:size-4">{icon}</span>}
            <span className="min-w-0">{title}</span>
          </h2>
          {note && <p className="mt-1 text-[13px] font-semibold text-muted-foreground sm:text-sm">{note}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}
