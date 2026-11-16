// Plain DTOs for the public course marketplace, read from Enski's own course pages.
import type { Product } from "@/lib/dreamverse/types";

export interface CourseLesson {
  title: string;
  description: string | null;
  durationSeconds: number | null;
  /** Enski marks this lesson as free to preview (not locked). */
  preview: boolean;
}

export interface CourseModule {
  title: string;
  description: string | null;
  lessons: CourseLesson[];
}

export interface MarketCourse {
  /** URL key: `/courses/<slug>`. */
  slug: string;
  /** The Dreamverse listing (title, summary, cover, creator, live prices, Enski product page). */
  listing: Product;
  category: string | null;
  /** Difficulty, only when Enski provides one. */
  level: string | null;
  language: string | null;
  durationSeconds: number | null;
  lessonCount: number;
  students: number | null;
  /** ISO date the course went live, when Enski shares it. */
  publishedAt: string | null;
  tags: string[];
  /** Position in Enski's trending list (0 = most popular), or null. */
  trendingRank: number | null;
}

export interface CourseDetail extends MarketCourse {
  description: string;
  outcomes: string[];
  bonuses: string[];
  audience: string[];
  requirements: string[];
  modules: CourseModule[];
  /** True/false only when Enski says so. */
  certificate: boolean | null;
  /** Star counts, 5 stars first; null when nobody has rated it. */
  ratingBreakdown: number[] | null;
}

export interface MarketplaceData {
  courses: MarketCourse[];
  fetchedAt: string;
  error: string | null;
}

export interface CoursePageData {
  course: CourseDetail | null;
  more: MarketCourse[];
  related: MarketCourse[];
  error: string | null;
}
