import { fromDreamverse } from "@/components/shop/adapters";
import type { ShopBadge } from "@/components/shop/ShopCard";
import { ShopShelf } from "@/components/shop/ShopGrid";
import type { Product } from "@/lib/dreamverse/types";

/** A Dreamverse collection in the shared two-column shop grid, with "Show more". */
export function ProductShelf({ label, products, badge }: { label: string; products: Product[]; badge?: ShopBadge | undefined }) {
  return (
    <ShopShelf
      label={label}
      items={products.map((p) => fromDreamverse(p))}
      badge={badge ? (item) => (item.status === "published" ? badge : undefined) : undefined}
    />
  );
}
