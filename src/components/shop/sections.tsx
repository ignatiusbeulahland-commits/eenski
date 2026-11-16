import { Compass, History } from "lucide-react";
import { useMemo, useState } from "react";

import { recommend } from "@/lib/shop/recommend";
import { useShop } from "@/lib/shop/store";
import type { ShopItem } from "@/lib/shop/types";

import { ShopGrid, ShopSection, ShopShelf, ShowMore } from "./ShopGrid";

/** Things this visitor opened recently, newest first (kept on this device). */
export function RecentlyViewed({ className, exclude }: { className?: string | undefined; exclude?: string }) {
  const recent = useShop((s) => s.recent);
  const items = exclude ? recent.filter((i) => i.key !== exclude) : recent;
  if (items.length === 0) return null;
  return (
    <ShopSection id="recent-title" title="Recently viewed" icon={<History />} note="Pick up where you left off." className={className}>
      <ShopShelf items={items} label="Recently viewed" initial={4} />
    </ShopSection>
  );
}

/**
 * "Recommended for you": a two-column feed that grows as you scroll down and
 * tap "Show more". It leans on what this visitor viewed, saved and added to
 * the cart; with no history it says so instead of pretending.
 */
export function RecommendedFeed({
  items,
  page = 8,
  className,
  title = "Recommended for you",
}: {
  items: ShopItem[];
  page?: number | undefined;
  className?: string | undefined;
  title?: string | undefined;
}) {
  const signals = useShop((s) => s);
  const { items: ranked, personal } = useMemo(() => recommend(items, signals), [items, signals]);
  const [shown, setShown] = useState(page);
  if (ranked.length === 0) return null;
  return (
    <ShopSection
      id="for-you-title"
      title={title}
      icon={<Compass />}
      note={personal ? "Based on what you've viewed, saved and added to your cart." : "Popular picks to start with. This feed adapts as you browse."}
      className={className}
    >
      <ShopGrid items={ranked.slice(0, shown)} />
      {shown < ranked.length && <ShowMore onClick={() => setShown((n) => n + page)} left={ranked.length - shown} />}
    </ShopSection>
  );
}
