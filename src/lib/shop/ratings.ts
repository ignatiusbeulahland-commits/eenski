import { useQuery } from "@tanstack/react-query";

import { reviewSummaries } from "@/lib/reviews/reviews";

import type { ShopItem } from "./types";

type Summary = { average: number; count: number };

/** Ratings from demo reviews left on this device, for cards that don't carry Enski's own. */
export function useRatings(items: ShopItem[]): Record<string, Summary> {
  const keys = [...new Set(items.filter((i) => !i.rating).map((i) => i.reviewKey))].sort();
  const { data } = useQuery({
    queryKey: ["review-summaries", keys],
    queryFn: () => reviewSummaries(keys),
    enabled: keys.length > 0,
    staleTime: 0,
  });
  return data ?? {};
}
