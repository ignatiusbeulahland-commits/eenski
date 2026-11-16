import { accountHandle } from "@/lib/dashboard/account";
import { referralLink, trackingId, type Product } from "./products";

/** Where an affiliate can share a link. Twitter is called Twitter on this site. */
export type ShareChannel = "whatsapp" | "facebook" | "linkedin" | "twitter" | "copy";
export const SHARE_CHANNELS: { id: ShareChannel; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter" },
  { id: "copy", label: "Copy link" },
];

/** One product an affiliate promotes. Counts are only their own actions (copies, shares). */
export type Promotion = {
  startedAt: string;
  /** Link version; goes up only when they choose to regenerate. */
  version: number;
  copies: number;
  lastCopiedAt?: string | undefined;
  shares: Partial<Record<ShareChannel, number>>;
  renewedAt?: string | undefined;
};
export type Promotions = Record<string, Promotion>;

const blank = (now: string): Promotion => ({ startedAt: now, version: 1, copies: 0, shares: {} });

/** Starts promoting a product. Promoting it again keeps the existing link and counts. */
export function startPromotion(all: Promotions, id: string, now = new Date().toISOString()): Promotions {
  return all[id] ? all : { ...all, [id]: blank(now) };
}

/** A promotion record, filling in one for products promoted before records existed. */
export const promotionOf = (all: Promotions | undefined, id: string): Promotion => all?.[id] ?? { startedAt: "", version: 1, copies: 0, shares: {} };

/** Replaces the link with a new one (the old one stops working); its copy and share counts start again. */
export function regeneratePromotion(all: Promotions, id: string, now = new Date().toISOString()): Promotions {
  const p = promotionOf(all, id);
  return { ...all, [id]: { ...p, version: p.version + 1, copies: 0, lastCopiedAt: undefined, shares: {}, renewedAt: now } };
}

export function recordCopy(all: Promotions, id: string, now = new Date().toISOString()): Promotions {
  const p = promotionOf(all, id);
  return { ...all, [id]: { ...p, startedAt: p.startedAt || now, copies: p.copies + 1, lastCopiedAt: now } };
}

export function recordShare(all: Promotions, id: string, channel: ShareChannel, now = new Date().toISOString()): Promotions {
  const p = promotionOf(all, id);
  return { ...all, [id]: { ...p, startedAt: p.startedAt || now, shares: { ...p.shares, [channel]: (p.shares[channel] ?? 0) + 1 } } };
}

export const shareCount = (p: Promotion) => Object.values(p.shares).reduce((n, v) => n + (v ?? 0), 0);

/** The affiliate's current link and tracking ID for a product. */
export function linkFor(all: Promotions | undefined, id: string, handle = accountHandle()) {
  const v = promotionOf(all, id).version;
  return { url: referralLink(id, handle, v), tracking: trackingId(id, handle, v), version: v };
}

/** A ready-to-paste message for a channel, with an honest note that it's an affiliate link. */
export function shareMessage(channel: ShareChannel, p: Pick<Product, "title" | "creator" | "promise" | "type">, url: string): string {
  const what = p.type === "Ebook" ? "eBook" : "course";
  if (channel === "copy") return url;
  if (channel === "twitter") return `"${p.title}" by ${p.creator} is worth a look. ${url} (affiliate link)`;
  if (channel === "linkedin")
    return `I'm recommending "${p.title}" by ${p.creator} on Enski. ${p.promise}\n\nTake a look: ${url}\n\n(This is my affiliate link, so I may earn a commission if you buy through it.)`;
  return `Hi! I think you'd like this ${what} on Enski: "${p.title}" by ${p.creator}. ${p.promise}\n${url}\n(My affiliate link: I may earn a commission if you buy.)`;
}
