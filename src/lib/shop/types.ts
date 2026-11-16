import type { Money } from "@/lib/dreamverse/types";

/** Where a shop card opens: /courses, /dreamverse, or a creator storefront (`store` slug = handle). */
export type ShopRoute = { kind: "course"; slug: string } | { kind: "dreamverse"; slug: string } | { kind: "store"; slug: string; item?: string | undefined };

/**
 * One product as every shopping surface shows it (homepage, /courses, Dreamverse).
 * Plain data only, so it can be kept in this browser for the wishlist, cart and
 * recently viewed lists.
 */
export interface ShopItem {
  /** Stable id across pages, e.g. `course:figma-pm`, `dv:ebook-1`, `showcase:ai-builder`. */
  key: string;
  route: ShopRoute;
  title: string;
  summary: string;
  /** "Course", "eBook", "Coaching", "Live session", "Digital product", "Service". */
  typeLabel: string;
  creator: { name: string; slug: string | null; avatar: string | null } | null;
  image: {
    src: string;
    srcSet?: string | undefined;
    /** Creator artwork is shown whole ("contain"); our own subject photos fill the frame. */
    fit: "contain" | "cover";
    /** Used when the creator's artwork refuses to load. */
    fallback?: string | undefined;
  };
  price: Money | null;
  /** Only real ratings: Enski's own, or reviews left on this site. Never made up. */
  rating: { average: number; count: number } | null;
  /** Key for reviews left on this site (`product_reviews`). */
  reviewKey: string;
  status: "published" | "draft" | "coming_soon";
  /** Published and paid, so it can sit in the cart. */
  canCart: boolean;
  category: string | null;
  /** Sample listing, clearly labelled. */
  demo: boolean;
  /** Higher sells/trends more (real Enski data only); 0 when unknown. */
  popularity: number;
  /** Learners enrolled, when Enski shares it. */
  students: number | null;
  /** ISO date the listing went live, when known. */
  publishedAt: string | null;
}
