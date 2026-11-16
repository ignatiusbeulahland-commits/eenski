import { queryOptions } from "@tanstack/react-query";

import type { DreamverseData } from "./types";

/**
 * The Dreamverse catalogue for the prototype: a saved copy of Enski's public
 * listings (photos stored in /public/demo/enski). Nothing is fetched from Enski.
 */
export const loadDreamverse = async (): Promise<DreamverseData> =>
  (await import("@/content/demo/dreamverse.json")).default as unknown as DreamverseData;

export const dreamverseQueryOptions = () =>
  queryOptions({ queryKey: ["dreamverse"], queryFn: loadDreamverse, staleTime: Infinity });
