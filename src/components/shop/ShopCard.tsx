import { Bell, Check, Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatMoney } from "@/lib/dreamverse/normalize";
import { discountPercent } from "@/lib/shop/money";
import { openShopPanel } from "@/lib/shop/panel";
import { shop, useInCart, useWished } from "@/lib/shop/store";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

import { QuickView } from "./QuickView";
import { ShopImage } from "./ShopImage";
import { ShopLink } from "./ShopLink";

export type ShopBadge = "Trending" | "New" | "Bestseller" | "Popular";

/** Heart toggle shared by cards, quick view and details pages. */
export function useWishToggle(item: ShopItem) {
  const wished = useWished(item.key);
  const [pulse, setPulse] = useState(0);
  const toggle = () => {
    const now = shop.toggleWishlist(item);
    setPulse((n) => n + 1);
    toast(now ? "Saved to your wishlist" : "Removed from your wishlist", {
      description: item.title,
      action: now ? { label: "View", onClick: () => openShopPanel("wishlist") } : undefined,
    });
  };
  return { wished, toggle, pulse };
}

export function useCartAdd(item: ShopItem) {
  const inCart = useInCart(item.key);
  const [pulse, setPulse] = useState(0);
  const add = () => {
    if (inCart) {
      openShopPanel("cart");
      return;
    }
    if (shop.addToCart(item)) {
      setPulse((n) => n + 1);
      toast("Added to your cart", { description: item.title, action: { label: "View cart", onClick: () => openShopPanel("cart") } });
    }
  };
  return { inCart, add, pulse };
}

export function ShopPrice({ item, size = "md" }: { item: ShopItem; size?: "md" | "lg" }) {
  const p = item.price;
  if (!p) {
    return (
      <span className="text-[13px] font-bold text-muted-foreground">{item.status === "published" ? "Price on request" : "Price at launch"}</span>
    );
  }
  const off = discountPercent(p);
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
      <span className={cn("font-extrabold leading-none tracking-tight text-ink", size === "lg" ? "text-2xl" : "text-[15px] sm:text-base")}>
        {formatMoney(p.current, p)}
      </span>
      {off > 0 && (
        <span className={cn("font-semibold text-muted-foreground line-through", size === "lg" ? "text-sm" : "text-[11px] sm:text-xs")}>
          <span className="sr-only">Was </span>
          {formatMoney(p.amount, p)}
        </span>
      )}
    </span>
  );
}

export function ShopRating({ rating, className }: { rating: ShopItem["rating"]; className?: string }) {
  if (!rating) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-bold text-ink", className)}>
      <Star className="size-3.5 fill-lime-press text-lime-press" aria-hidden />
      {rating.average.toFixed(1)}
      <span className="font-semibold text-muted-foreground">
        ({rating.count}
        <span className="sr-only"> {rating.count === 1 ? "review" : "reviews"}</span>)
      </span>
    </span>
  );
}

/**
 * Compact shopping card: big cover, name, seller, price (with the original and
 * percentage off when discounted), real rating, type, wishlist and cart. The
 * whole card opens the details page; the heart, quick look and cart buttons sit
 * above that link so they work on their own.
 */
export function ShopCard({
  item,
  rating,
  badge,
  className,
  eager,
}: {
  item: ShopItem;
  /** Rating from reviews on this site, when Enski has none. */
  rating?: ShopItem["rating"] | undefined;
  badge?: ShopBadge | undefined;
  className?: string | undefined;
  eager?: boolean | undefined;
}) {
  const [quick, setQuick] = useState(false);
  const wish = useWishToggle(item);
  const cart = useCartAdd(item);
  const off = discountPercent(item.price);
  const shownRating = item.rating ?? rating ?? null;
  const published = item.status === "published";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-card shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-card focus-within:border-cobalt-100 focus-within:shadow-card has-[h3_a:focus-visible]:shadow-[0_0_0_2px_var(--background),0_0_0_4.5px_var(--sky)] active:scale-[0.985] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:rounded-[20px]",
        className,
      )}
    >
      <div className="relative aspect-square">
        <ShopImage image={item.image} eager={eager} />

        <div className="pointer-events-none absolute inset-x-2 top-2 flex flex-wrap gap-1 pr-11">
          <span className="rounded-full bg-background/95 px-2 py-0.5 text-[11px] font-extrabold text-brand shadow-sm">{item.typeLabel}</span>
        </div>
        <button
          type="button"
          onClick={wish.toggle}
          aria-pressed={wish.wished}
          aria-label={wish.wished ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
          className="absolute top-1.5 right-1.5 z-10 grid size-10 place-items-center rounded-full bg-background/95 text-brand shadow-sm transition-colors hover:bg-ice focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Heart key={wish.pulse} className={cn("size-[18px]", wish.wished && "fill-cobalt", wish.pulse > 0 && "shop-pop")} aria-hidden />
        </button>

        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-1">
          <span className="flex flex-wrap gap-1">
            {off > 0 && <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight">-{off}%</span>}
            {badge && published && <span className="rounded-full bg-cobalt px-2 py-0.5 text-[11px] font-extrabold text-primary-foreground">{badge}</span>}
            {!published && (
              <span className="rounded-full bg-midnight px-2 py-0.5 text-[11px] font-extrabold text-on-blue">
                {item.status === "draft" ? "In the works" : "Coming soon"}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setQuick(true)}
            aria-label={`Quick look at ${item.title}`}
            className="pointer-events-auto z-10 grid size-9 shrink-0 place-items-center rounded-full bg-background/95 text-brand opacity-100 shadow-sm transition-[opacity,background-color] hover:bg-ice focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Eye className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-[13.5px] leading-snug font-bold text-ink sm:text-[15px]">
          <ShopLink route={item.route} className="after:absolute after:inset-0 after:z-0 focus-visible:outline-none group-hover:text-brand">
            {item.title}
          </ShopLink>
        </h3>
        {item.creator && (
          <p className="flex min-w-0 items-center gap-1 text-[12px] font-semibold text-muted-foreground">
            <span className="truncate">{item.creator.name}</span>
            {item.demo && <span className="shrink-0 rounded-full bg-soft px-1.5 text-[10px] font-extrabold ring-1 ring-line ring-inset">Preview</span>}
          </p>
        )}
        <ShopRating rating={shownRating} />

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-1.5">
          <ShopPrice item={item} />
          {item.canCart ? (
            <button
              type="button"
              onClick={cart.add}
              aria-label={cart.inCart ? `${item.title} is in your cart, view cart` : `Add ${item.title} to cart`}
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                cart.inCart ? "bg-lime text-midnight" : "bg-cobalt text-primary-foreground hover:bg-cobalt-hover",
              )}
            >
              <span key={cart.pulse} className={cn("grid place-items-center", cart.pulse > 0 && "shop-pop")}>
                {cart.inCart ? <Check className="size-[18px]" aria-hidden /> : <ShoppingBag className="size-[18px]" aria-hidden />}
              </span>
            </button>
          ) : !published ? (
            <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-dashed border-cobalt/35 bg-ice text-brand" aria-hidden>
              <Bell className="size-4" />
            </span>
          ) : null}
        </div>
      </div>

      {quick && <QuickView item={item} rating={shownRating} open={quick} onOpenChange={setQuick} />}
    </article>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-card" aria-hidden>
      <div className="aspect-square animate-pulse bg-soft" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-soft" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-soft" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-soft" />
      </div>
    </div>
  );
}
