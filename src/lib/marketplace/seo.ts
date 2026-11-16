import type { CourseDetail } from "./types";

export const SITE_ORIGIN = "https://ensk.lovable.app";

export const courseUrl = (slug: string) => `${SITE_ORIGIN}/courses/${slug}`;

/** Absolute share image for a course, only when the creator uploaded real artwork. */
export function courseImage(c: Pick<CourseDetail, "listing">): string | null {
  const src = c.listing.thumbnail;
  if (!src) return null;
  if (/^https:\/\//.test(src)) return src;
  return src.startsWith("/") ? `${SITE_ORIGIN}${src}` : null;
}

/** schema.org Course data for search engines, using only what Enski publishes. */
export function courseJsonLd(c: CourseDetail): Record<string, unknown> {
  const l = c.listing;
  const image = courseImage(c);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: l.title,
    description: l.summary || c.description,
    url: courseUrl(c.slug),
    provider: { "@type": "Organization", name: "Enski", sameAs: SITE_ORIGIN },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      ...(l.creator ? { instructor: { "@type": "Person", name: l.creator.name } } : {}),
    },
  };
  if (l.creator) data["creator"] = { "@type": "Person", name: l.creator.name };
  if (image) data["image"] = image;
  if (c.language) data["inLanguage"] = c.language;
  if (c.level) data["educationalLevel"] = c.level;
  if (c.outcomes.length) data["teaches"] = c.outcomes;
  if (c.requirements.length) data["coursePrerequisites"] = c.requirements;
  if (l.prices.length) {
    data["offers"] = l.prices.map((m) => ({
      "@type": "Offer",
      price: m.current,
      priceCurrency: m.currency,
      category: m.current === 0 ? "Free" : "Paid",
      url: courseUrl(c.slug),
      availability: "https://schema.org/InStock",
    }));
  }
  if (l.rating && l.rating.count > 0) {
    data["aggregateRating"] = {
      "@type": "AggregateRating",
      ratingValue: l.rating.average,
      ratingCount: l.rating.count,
      bestRating: 5,
    };
  }
  return data;
}
