import { ArrowRight, Check, Heart, ShoppingBag } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { discountPercent } from "@/lib/shop/money";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

import { ShopPrice, ShopRating, useCartAdd, useWishToggle } from "./ShopCard";
import { ShopImage } from "./ShopImage";
import { ShopLink } from "./ShopLink";

/** Product preview without leaving the list: bigger cover, summary, price and the main actions. */
export function QuickView({
  item,
  rating,
  open,
  onOpenChange,
}: {
  item: ShopItem;
  rating: ShopItem["rating"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const wish = useWishToggle(item);
  const cart = useCartAdd(item);
  const off = discountPercent(item.price);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-[520px] gap-0 overflow-y-auto rounded-[24px] border-line p-0 sm:rounded-[24px] [&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:grid [&>button:last-child]:size-9 [&>button:last-child]:place-items-center [&>button:last-child]:rounded-full [&>button:last-child]:bg-background [&>button:last-child]:opacity-100">
        <div className="relative aspect-[16/10]">
          <ShopImage image={item.image} sizes="520px" eager />
          {off > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-lime px-2.5 py-1 text-xs font-extrabold text-midnight">-{off}%</span>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-extrabold text-brand">
            {item.typeLabel}
            {item.category ? <span className="font-semibold text-muted-foreground"> · {item.category}</span> : null}
          </p>
          <DialogTitle className="mt-1.5 text-xl leading-snug font-extrabold tracking-tight text-ink">{item.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-muted-foreground">
              {item.creator && <span>By {item.creator.name}</span>}
              <ShopRating rating={rating} className="text-[13px]" />
              {item.demo && <span className="rounded-full bg-soft px-2 text-xs font-extrabold ring-1 ring-line ring-inset">Preview listing</span>}
            </div>
          </DialogDescription>
          {item.summary && <p className="mt-4 line-clamp-5 text-[15px] leading-relaxed text-muted-foreground">{item.summary}</p>}

          <div className="mt-5 flex items-center justify-between gap-3 rounded-[16px] bg-soft px-4 py-3">
            <ShopPrice item={item} size="lg" />
            {item.status !== "published" && <span className="text-sm font-extrabold text-brand">Coming soon</span>}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2.5">
            {item.canCart ? (
              <button
                type="button"
                onClick={cart.add}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-extrabold transition-colors",
                  cart.inCart ? "bg-lime text-midnight" : "bg-cobalt text-primary-foreground hover:bg-cobalt-hover",
                )}
              >
                <span key={cart.pulse} className={cn("grid place-items-center", cart.pulse > 0 && "shop-pop")}>
                  {cart.inCart ? <Check className="size-5" aria-hidden /> : <ShoppingBag className="size-5" aria-hidden />}
                </span>
                {cart.inCart ? "In your cart" : "Add to cart"}
              </button>
            ) : (
              <ShopLink
                route={item.route}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cobalt px-5 text-[15px] font-extrabold text-primary-foreground hover:bg-cobalt-hover"
              >
                View details <ArrowRight className="size-4" aria-hidden />
              </ShopLink>
            )}
            <button
              type="button"
              onClick={wish.toggle}
              aria-pressed={wish.wished}
              aria-label={wish.wished ? "Remove from wishlist" : "Add to wishlist"}
              className="grid size-12 place-items-center rounded-full border-[1.5px] border-line text-brand transition-colors hover:bg-ice"
            >
              <Heart key={wish.pulse} className={cn("size-5", wish.wished && "fill-cobalt", wish.pulse > 0 && "shop-pop")} aria-hidden />
            </button>
          </div>
          {item.canCart && (
            <ShopLink
              route={item.route}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 text-sm font-extrabold text-brand underline-offset-4 hover:underline"
            >
              See full details <ArrowRight className="size-4" aria-hidden />
            </ShopLink>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
