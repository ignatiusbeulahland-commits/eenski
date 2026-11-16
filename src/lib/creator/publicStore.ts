import { COVER_PHOTOS } from "@/components/dreamverse/coverPhotos";
import type { PaymentRecord } from "@/lib/shop/payments";
import type { ShopItem } from "@/lib/shop/types";
import { STORAGE_KEY } from "./data";
import { stateSchema, type CreatorItem, type CreatorState } from "./rules";

/**
 * Public storefronts for creators who signed up on this device: their published
 * products, bought through the sitewide checkout. A successful payment is recorded
 * as a sale in that creator's own saved dashboard. Browser-only.
 */
export type PublicStore = {
  key: string;
  handle: string;
  name: string;
  tagline: string;
  about: string;
  banner: string;
  photo: string;
  owner: string;
  items: CreatorItem[];
  page: CreatorState["storePage"];
  verified: boolean;
  bio: string;
};

const PAGE_DEFAULT = stateSchema.shape.storePage.parse(undefined);

/** Visible items in the creator's chosen order (unlisted ones keep their saved order at the end). */
export function orderedItems(items: CreatorItem[], page: Pick<CreatorState["storePage"], "order" | "hiddenIds">): CreatorItem[] {
  const rank = (id: string) => { const i = page.order.indexOf(id); return i === -1 ? Number.MAX_SAFE_INTEGER : i; };
  return items.filter((i) => !page.hiddenIds.includes(i.id)).map((it, n) => ({ it, n })).sort((a, b) => rank(a.it.id) - rank(b.it.id) || a.n - b.n).map((x) => x.it);
}

const TYPE_LABEL: Record<CreatorItem["kind"], string> = { course: "Course", ebook: "eBook", live: "Live session", service: "Service", coaching: "Coaching" };
const PREFIX = `${STORAGE_KEY}:`;

function readAll(): PublicStore[] {
  if (typeof window === "undefined") return [];
  const out: PublicStore[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      const s = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<CreatorState> | null;
      const f = s?.storefront;
      if (!f?.handle || !f.published) continue;
      out.push({
        key,
        handle: f.handle.toLowerCase(),
        name: f.name,
        tagline: f.tagline,
        about: f.about,
        banner: f.banner ?? "",
        photo: s?.profile?.photo ?? "",
        owner: [s?.profile?.firstName, s?.profile?.lastName].filter(Boolean).join(" ") || f.name,
        items: (s?.items ?? []).filter((it) => it.status === "published" && !it.binnedAt),
        page: stateSchema.shape.storePage.safeParse(s?.storePage).data ?? PAGE_DEFAULT,
        verified: s?.verification === "submitted",
        bio: s?.profile?.bio ?? "",
      });
    } catch {
      /* unreadable record: skip */
    }
  }
  return out;
}

export const findStore = (handle: string) => readAll().find((s) => s.handle === handle.trim().toLowerCase()) ?? null;

export const storeItemKey = (handle: string, itemId: string) => `store:${handle}:${itemId}`;

export function storeShopItem(store: Pick<PublicStore, "handle" | "owner" | "photo">, item: CreatorItem): ShopItem {
  const fallback = COVER_PHOTOS.general[0]!;
  return {
    key: storeItemKey(store.handle, item.id),
    route: { kind: "store", slug: store.handle, item: item.id },
    title: item.title,
    summary: item.description,
    typeLabel: TYPE_LABEL[item.kind],
    creator: { name: store.owner, slug: null, avatar: store.photo || null },
    image: item.image ? { src: item.image, fit: "cover", fallback: fallback.small } : { src: fallback.small, fit: "cover" },
    price: item.price > 0 ? { currency: "NGN", sign: "₦", amount: item.price, current: item.price, onSale: false } : null,
    rating: null,
    reviewKey: `store:${store.handle}:${item.id}`,
    status: "published",
    canCart: item.price > 0,
    category: item.category || null,
    demo: false,
    popularity: 0,
    students: null,
    publishedAt: item.createdAt || null,
  };
}

/** Lesson titles a creator wrote for a course, so the buyer's learning space matches. */
export function storeLessons(key: string): string[] {
  const [, handle = "", id = ""] = key.split(":");
  return findStore(handle)?.items.find((i) => i.id === id)?.lessons ?? [];
}

/** The creator's own item behind a storefront key (its course set-up included). */
export function storeCourse(key: string): CreatorItem | null {
  const [, handle = "", id = ""] = key.split(":");
  return findStore(handle)?.items.find((i) => i.id === id) ?? null;
}

/**
 * Mirrors a buyer's learning on a storefront course into the creator's order for it,
 * so their Students view shows the same lessons done and best quiz score. Browser-only.
 */
export function syncStoreLearning(key: string, buyerEmail: string, patch: { completed?: string[]; quizScore?: number }): boolean {
  if (typeof window === "undefined" || !key.startsWith("store:")) return false;
  const [, handle = "", itemId = ""] = key.split(":");
  const store = readAll().find((s) => s.handle === handle);
  const email = buyerEmail.trim().toLowerCase();
  if (!store || !email) return false;
  try {
    const s = JSON.parse(localStorage.getItem(store.key) ?? "null") as CreatorState | null;
    if (!s) return false;
    const ids = new Set(s.customers.filter((c) => c.email.trim().toLowerCase() === email).map((c) => c.id));
    let changed = false;
    const orders = s.orders.map((o) => {
      if (o.itemId !== itemId || !ids.has(o.customerId) || o.status !== "paid") return o;
      const next = { ...o };
      if (patch.completed) next.completed = [...patch.completed];
      if (patch.quizScore !== undefined) next.quizScore = Math.max(o.quizScore ?? 0, patch.quizScore);
      changed = true;
      return next;
    });
    if (!changed) return false;
    localStorage.setItem(store.key, JSON.stringify({ ...s, orders }));
    return true;
  } catch {
    return false;
  }
}

/** Records each storefront item in a successful payment as a sale for its creator (once per payment). */
export function creditStoreSales(p: PaymentRecord): number {
  if (p.status !== "successful" || typeof window === "undefined") return 0;
  let credited = 0;
  const stores = readAll();
  for (const item of p.items) {
    if (!item.key.startsWith("store:")) continue;
    const [, handle = "", itemId = ""] = item.key.split(":");
    const store = stores.find((s) => s.handle === handle);
    if (!store) continue;
    try {
      const s = JSON.parse(localStorage.getItem(store.key) ?? "null") as CreatorState | null;
      if (!s) continue;
      const orderId = `${p.reference}-${itemId}`;
      if (s.orders.some((o) => o.id === orderId)) continue;
      const email = p.buyer?.email ?? "";
      const existing = s.customers.find((c) => c.email.toLowerCase() === email);
      const customer = existing ?? { id: `cust-${p.reference}`, name: p.buyer?.name || "Customer", email: email || "customer@enski.app", source: "purchase" as const, date: p.updatedAt };
      const product = s.items.find((i) => i.id === itemId);
      const next: CreatorState = {
        ...s,
        customers: existing ? s.customers : [...s.customers, customer],
        orders: [...s.orders, { id: orderId, itemId, itemTitle: product?.title ?? item.title, customerId: customer.id, amount: item.price?.current ?? 0, date: p.updatedAt, status: "paid", currency: "NGN", ...(product?.kind === "service" ? { stage: "requirements" as const } : {}) }],
        activity: [...s.activity, { id: `act-${orderId}`, text: `New sale: ${product?.title ?? item.title} to ${customer.name}`, date: p.updatedAt }],
      };
      localStorage.setItem(store.key, JSON.stringify(next));
      credited++;
    } catch {
      /* storage blocked: the buyer's receipt still stands */
    }
  }
  return credited;
}
