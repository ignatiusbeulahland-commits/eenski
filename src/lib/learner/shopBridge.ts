import type { PaymentRecord } from "@/lib/shop/payments";
import type { ShopItem } from "@/lib/shop/types";
import type { LearnerResource, ResourceQuiz, ResourceType, ResourceUnit } from "./catalog";
import type { LearnerState, Purchase } from "./rules";

/**
 * Purchases made through the sitewide checkout become learner library items for
 * the buyer's email, so "Continue learning" opens the course straight away. Pure.
 */
export type Lesson = {
  title: string;
  durationSeconds: number | null;
  /** Creator's lesson id (storefront courses), so progress lines up with their dashboard. */
  id?: string | undefined;
  description?: string | null | undefined;
  module?: string | undefined;
  preview?: boolean | undefined;
  kind?: ResourceUnit["kind"];
  mediaId?: string | undefined;
  unlockDay?: number | undefined;
};
/** Course-level extras from the creator's set-up. */
export type OutlineExtras = { quiz?: ResourceQuiz | undefined; certificate?: boolean | undefined };

const TYPE: Record<string, ResourceType> = { Course: "Course", eBook: "Ebook", Ebook: "Ebook", "Digital product": "Template", Template: "Template", Coaching: "Coaching", "Live session": "Coaching", Service: "Coaching" };
const DEFAULT_UNITS: Record<ResourceType, string[]> = {
  Course: ["Welcome and how this course works", "The core ideas", "Hands-on practice", "Put it to work", "Wrap-up and next steps"],
  Ebook: ["Introduction", "Part one", "Part two", "Part three", "Your action checklist"],
  Template: ["Open and copy your files", "Make it your own", "Put it to use"],
  Coaching: ["Prepare for your session", "Your session", "Follow-up and action plan"],
};

export const resourceTypeOf = (item: Pick<ShopItem, "typeLabel">): ResourceType => TYPE[item.typeLabel] ?? "Course";

export function resourceFromShopItem(item: ShopItem, lessons: Lesson[] = [], extras: OutlineExtras = {}): LearnerResource {
  const type = resourceTypeOf(item);
  const units: ResourceUnit[] = lessons.length
    ? lessons.map((l, i) => {
        const secs = l.durationSeconds && l.durationSeconds > 0 ? l.durationSeconds : undefined;
        const u: ResourceUnit = { id: l.id || `u${i + 1}`, title: l.title, minutes: secs ? Math.max(1, Math.round(secs / 60)) : 10 };
        if (secs) u.seconds = secs;
        if (l.description?.trim()) u.description = l.description.trim();
        if (l.module?.trim()) u.module = l.module.trim();
        if (l.preview) u.preview = true;
        if (l.kind) u.kind = l.kind;
        if (l.mediaId) u.mediaId = l.mediaId;
        if (l.unlockDay) u.unlockDay = l.unlockDay;
        return u;
      })
    : DEFAULT_UNITS[type].map((title, i) => ({ id: `u${i + 1}`, title, minutes: type === "Coaching" && i === 1 ? 45 : 10 }));
  return {
    id: item.key,
    title: item.title,
    creator: item.creator?.name ?? "Enski creator",
    description: item.summary,
    type,
    category: (item.category ?? "Career") as LearnerResource["category"],
    price: item.price?.current ?? 0,
    image: item.image.src,
    imageAlt: "",
    units,
    eligible: true,
    certificate: extras.certificate ?? type === "Course",
    downloadable: type === "Ebook" || type === "Template",
    publicRoute: item.route,
    ...(extras.quiz?.questions.length ? { quiz: extras.quiz } : {}),
  };
}

/** Successful payments by this buyer that the learner library hasn't picked up yet. */
export function unclaimedPayments(s: Pick<LearnerState, "purchases">, payments: readonly PaymentRecord[], email: string): PaymentRecord[] {
  const who = email.trim().toLowerCase();
  if (!who) return [];
  const have = new Set(s.purchases.map((p) => p.orderNumber));
  return payments.filter((p) => p.status === "successful" && p.buyer?.email.trim().toLowerCase() === who && !have.has(p.reference));
}

export function purchaseFromPayment(p: PaymentRecord): Purchase {
  const items = p.items.map((i) => ({ kind: "resource" as const, id: i.key, title: i.title, price: i.price?.current ?? 0, qty: 1, image: i.image.src }));
  return {
    id: `shop-${p.reference}`,
    orderNumber: p.reference,
    date: p.updatedAt,
    items,
    total: items.reduce((n, i) => n + i.price, 0),
    status: "paid",
    method: p.method === "bank" || p.method === "ussd" ? "transfer" : "card",
  };
}
