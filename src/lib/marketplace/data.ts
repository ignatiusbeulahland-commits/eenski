import { queryOptions } from "@tanstack/react-query";

import { moreFromCreator, relatedCourses } from "./filter";
import type { CourseDetail, CoursePageData, MarketplaceData } from "./types";

/**
 * Course cards and course pages for the prototype, from a saved copy of Enski's
 * public course pages (outlines only). Nothing is fetched from Enski.
 */
const loadMarketplace = async (): Promise<MarketplaceData> =>
  (await import("@/content/demo/marketplace.json")).default as unknown as MarketplaceData;

const loadCourses = async (): Promise<Record<string, CourseDetail | null>> =>
  (await import("@/content/demo/courses.json")).default as unknown as Record<string, CourseDetail | null>;

export async function loadCourse(slug: string): Promise<CoursePageData> {
  const [{ courses: all }, pages] = await Promise.all([loadMarketplace(), loadCourses()]);
  const course = pages[slug.toLowerCase()] ?? null;
  if (!course) return { course: null, more: [], related: [], error: null };
  const more = moreFromCreator(course, all);
  const moreSlugs = new Set(more.map((c) => c.slug));
  return { course, more, related: relatedCourses(course, all.filter((c) => !moreSlugs.has(c.slug))), error: null };
}

export const marketplaceQueryOptions = () =>
  queryOptions({ queryKey: ["marketplace"], queryFn: loadMarketplace, staleTime: Infinity });

export const courseQueryOptions = (slug: string) =>
  queryOptions({ queryKey: ["course", slug], queryFn: () => loadCourse(slug), staleTime: Infinity });
