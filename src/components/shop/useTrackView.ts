import { useEffect } from "react";

import { shop } from "@/lib/shop/store";
import type { ShopItem } from "@/lib/shop/types";

/** Adds a details page to "Recently viewed" once it has been opened. */
export function useTrackView(item: ShopItem | null) {
  const key = item?.key;
  useEffect(() => {
    if (item) shop.viewed(item);
    // Only when the item changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
