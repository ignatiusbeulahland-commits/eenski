import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { openShopPanel } from "@/lib/shop/panel";
import { moveAllToCart, useShop, useShopReady } from "@/lib/shop/store";

import { ShopCardSkeleton } from "./ShopCard";
import { ShopGrid } from "./ShopGrid";
import { RecentlyViewed } from "./sections";

/** Everything this visitor hearted, in the same two-column shop grid as the rest of Enski. */
export function WishlistPage() {
  const ready = useShopReady();
  const items = useShop((s) => s.wishlist);
  const cart = useShop((s) => s.cart);
  const buyable = items.filter((i) => i.canCart && !cart.some((c) => c.key === i.key)).length;

  const moveAll = () => {
    const n = moveAllToCart();
    if (n) toast(`${n} ${n === 1 ? "item" : "items"} added to your cart`, { action: { label: "View cart", onClick: () => openShopPanel("cart") } });
  };

  return (
    <div className="container-page space-y-12 py-8 lg:py-12">
      <section aria-labelledby="wishlist-title">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h1 id="wishlist-title" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ice text-brand">
                <Heart className="size-5" aria-hidden />
              </span>
              Your wishlist
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {ready && items.length > 0
                ? `${items.length} saved ${items.length === 1 ? "item" : "items"}, kept on this device. Tap a heart to remove it.`
                : "Things you've saved for later."}
            </p>
          </div>
          {ready && buyable > 0 && (
            <button
              type="button"
              onClick={moveAll}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-cobalt px-4 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-cobalt-hover sm:px-5"
            >
              <ShoppingBag className="size-4" aria-hidden />
              <span className="hidden sm:inline">Add all to cart</span>
              <span className="sm:hidden">Add all</span>
            </button>
          )}
        </div>

        {!ready ? (
          <ul className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 sm:gap-x-4 sm:gap-y-5 lg:grid-cols-4" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <ShopCardSkeleton />
              </li>
            ))}
          </ul>
        ) : items.length > 0 ? (
          <ShopGrid items={items} eagerCount={4} />
        ) : (
          <div className="flex flex-col items-center rounded-3xl bg-soft px-6 py-14 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-ice text-brand">
              <Heart className="size-7" aria-hidden />
            </span>
            <p className="mt-4 text-lg font-extrabold text-ink">Nothing saved yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Tap the heart on any course, eBook, live session or resource to keep it here.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/courses"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cobalt px-6 text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-cobalt-hover"
              >
                Shop courses <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/dreamverse"
                className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-line bg-background px-6 text-[15px] font-extrabold text-brand transition-colors hover:bg-ice"
              >
                Explore Dreamverse
              </Link>
            </div>
          </div>
        )}
      </section>

      {ready && <RecentlyViewed />}
    </div>
  );
}
