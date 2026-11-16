import { useMemo } from "react";

import { fromDreamverse } from "@/components/shop/adapters";
import { RecommendedFeed } from "@/components/shop/sections";
import type { Product } from "@/lib/dreamverse/types";
import { uniqueItems } from "@/lib/shop/recommend";

/**
 * Personal feed: Enski's featured picks lead, then the rest of the catalogue
 * (available first), re-ranked by what this visitor has viewed and saved.
 */
export function RecommendedSection({ picks, catalogue }: { picks: Product[]; catalogue: Product[] }) {
  const items = useMemo(() => {
    const rest = [...catalogue].sort((a, b) => Number(a.status !== "published") - Number(b.status !== "published"));
    return uniqueItems([...picks, ...rest].map((p) => fromDreamverse(p)));
  }, [picks, catalogue]);
  if (items.length === 0) return null;
  return (
    <div className="container-page pt-16 lg:pt-24">
      <RecommendedFeed items={items} />
    </div>
  );
}
