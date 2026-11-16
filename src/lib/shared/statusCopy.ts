/** Intentional wording for "missing", "didn't load" and connection states, shared by every role. */
export type MissingKind =
  | "page" | "event" | "resource" | "purchase" | "certificate" | "article" | "guide"
  | "product" | "marketProduct" | "programme" | "affiliate" | "media" | "landingPage";

export type StatusCopy = { eyebrow: string; title: string; body: string };

export const missingCopy: Record<MissingKind, StatusCopy> = {
  page: { eyebrow: "Page not found", title: "We couldn't find that page", body: "The link may be old or mistyped. Check it, or go back to where you were." },
  event: { eyebrow: "Event not found", title: "This event isn't available", body: "It may have ended, or the host may have taken it down. There are more events waiting for you." },
  resource: { eyebrow: "Resource not found", title: "This resource isn't available", body: "The creator may have taken it down, or the link is incomplete. Everything you've bought is still in My Resources." },
  purchase: { eyebrow: "Order not found", title: "We couldn't find this order", body: "Check the order number on your receipt, or find it in your purchase history." },
  certificate: { eyebrow: "Certificate not found", title: "We couldn't find this certificate", body: "Certificates appear once you complete a course. All the ones you've earned are kept together in one place." },
  article: { eyebrow: "Article not found", title: "We couldn't find that article", body: "It may have been updated or merged with another one. Search Help to find what you need." },
  guide: { eyebrow: "Guide not found", title: "We couldn't find that guide", body: "We may have updated or merged it with another one. Browse all guides to find what you need." },
  product: { eyebrow: "Product not found", title: "This product isn't available", body: "It may have been archived, or the link is incomplete. Your other products are right where you left them." },
  marketProduct: { eyebrow: "Product not found", title: "This product is no longer listed", body: "The creator may have paused it or closed their programme. There are plenty more products to promote in the market." },
  programme: { eyebrow: "Programme not found", title: "This programme isn't available", body: "The creator may have closed it, or the link is incomplete. Your other affiliations are safe." },
  affiliate: { eyebrow: "Affiliate not found", title: "We couldn't find this affiliate", body: "They may have left your programme, or the link is incomplete. Your affiliate list has everyone who's active." },
  media: { eyebrow: "File not found", title: "This file isn't in your library", body: "It may have been deleted, or the link is incomplete. Everything else in your Media Library is untouched." },
  landingPage: { eyebrow: "Page not found", title: "This landing page isn't available", body: "It may have been deleted, or the link is incomplete. Your other landing pages are right where you left them." },
};

export const loadErrorCopy: StatusCopy = {
  eyebrow: "Something went wrong",
  title: "This page didn't load",
  body: "This page didn't open properly. Your work is safe. Try again, and if it keeps happening, get in touch through Help.",
};

export const connectionCopy = {
  offline: { title: "You're offline.", body: "Keep going. Your changes save on this device, and pages you've opened still work." },
  online: { title: "You're back online.", body: "Everything's connected again." },
} as const;
