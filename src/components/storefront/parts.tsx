import { Heart, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";

import { useCartAdd, useWishToggle } from "@/components/shop/ShopCard";
import { ShopLink } from "@/components/shop/ShopLink";
import { ProductCover } from "@/components/creator/products/ProductChrome";
import type { CreatorItem, StoreAccent } from "@/lib/creator/rules";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

/** Accent colour → brand-token classes (creators pick from brand colours only). */
export const ACCENT: Record<StoreAccent, { solid: string; text: string; ring: string; label: string }> = {
  cobalt: { solid: "bg-cobalt text-primary-foreground hover:bg-cobalt-hover", text: "text-cobalt", ring: "ring-cobalt", label: "Cobalt" },
  sky: { solid: "bg-sky text-primary-foreground hover:bg-sky-mid", text: "text-sky-text", ring: "ring-sky", label: "Sky" },
  midnight: { solid: "bg-midnight text-primary-foreground hover:bg-cobalt-press", text: "text-brand", ring: "ring-midnight", label: "Midnight" },
  lime: { solid: "bg-lime text-midnight hover:bg-lime-hover", text: "text-brand", ring: "ring-lime", label: "Lime" },
};

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1v6.1c0 3.9-3.2 6.3-6.6 5.8-2.6-.4-4.6-2.6-4.6-5.4 0-3.4 3-5.9 6.5-5.3v3.2c-1.6-.4-3.2.6-3.2 2.1 0 1.3 1 2.2 2.2 2.2 1.3 0 2.2-.9 2.2-2.5V3h3.5Z" />
    </svg>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-lg font-extrabold text-ink sm:text-xl">{children}</h2>
      {action}
    </div>
  );
}

/** Square product card: type, wishlist heart, two-line title, price, accent cart button. */
export function OfferCard({ item, shopItem, accent }: { item: CreatorItem; shopItem: ShopItem; accent: StoreAccent }) {
  const wish = useWishToggle(shopItem);
  const cart = useCartAdd(shopItem);
  return (
    <article className="surface group relative flex min-w-0 flex-col overflow-hidden">
      <ShopLink item={shopItem} className="block focus-visible:outline-none">
        <ProductCover src={item.image} alt={item.title} kind={item.kind} className="aspect-square w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0" aria-hidden="true" />
      </ShopLink>
      <button
        type="button"
        onClick={wish.toggle}
        aria-pressed={wish.wished}
        aria-label={wish.wished ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`}
        className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-card/95 text-ink shadow-sm backdrop-blur transition-colors hover:text-destructive"
      >
        <Heart className={cn("h-[18px] w-[18px]", wish.wished && "fill-destructive text-destructive")} aria-hidden="true" />
      </button>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{shopItem.typeLabel}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-5 text-ink">{item.title}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="truncate text-[15px] font-extrabold tabular-nums text-ink">{item.price ? naira(item.price) : "Free"}</p>
          {shopItem.canCart && (
            <button
              type="button"
              onClick={cart.add}
              aria-label={cart.inCart ? `View cart (${item.title} is in it)` : `Add ${item.title} to cart`}
              className={cn("relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors", ACCENT[accent].solid)}
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Embed URL for YouTube/Vimeo links; null for anything else. */
export function videoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export const safeUrl = (u: string) => {
  const v = u.trim();
  if (!v) return "";
  const full = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try { return new URL(full).protocol.startsWith("http") ? full : ""; } catch { return ""; }
};
