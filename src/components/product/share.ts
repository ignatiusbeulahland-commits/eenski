import { productKey } from "@/lib/dreamverse/catalog";
import type { ResourceType } from "@/lib/dreamverse/types";
import { SITE_ORIGIN } from "@/lib/marketplace/seo";

export type ShareId = "facebook" | "twitter" | "linkedin" | "whatsapp" | "email";

/** Share links for a product page. Twitter is called Twitter on this site, never X. */
export function shareLinks(url: string, title: string): { id: ShareId; label: string; href: string }[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { id: "whatsapp", label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { id: "linkedin", label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: "facebook", label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "twitter", label: "Share on Twitter", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    {
      id: "email",
      label: "Share by email",
      href: `mailto:?subject=${t}&body=${encodeURIComponent(`Take a look at this on Enski: ${url}`)}`,
    },
  ];
}

/** Public URL of a Dreamverse listing's details page. */
export const dreamverseUrl = (p: { id: string; type: ResourceType; slug?: string | undefined }) =>
  `${SITE_ORIGIN}/dreamverse/${productKey(p)}`;

/** Enski's own product links (`/course|ebooks|coaching/<creator>/<slug>`) and the page on this site that shows the same product. */
export type EnskiKind = "course" | "ebooks" | "coaching";

export function enskiTarget(kind: EnskiKind, slug: string): { to: "/courses/$slug" | "/dreamverse/$slug"; slug: string } {
  if (kind === "course") return { to: "/courses/$slug", slug };
  return { to: "/dreamverse/$slug", slug: productKey({ id: slug, slug, type: kind === "ebooks" ? "ebook" : "coaching" }) };
}

/** Whole-number discount between a listed and a paid price. */
export const percentOff = (was: number, now: number) => (was > 0 && now < was ? Math.round((1 - now / was) * 100) : 0);
