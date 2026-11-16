import { useCallback, useSyncExternalStore } from "react";

import { subtotals } from "./money";
import { advancePayment, cancelPayment, type PaymentRecord } from "./payments";
import type { ShopItem } from "./types";

/**
 * Wishlist, cart and recently viewed, kept in this browser only (front-end
 * prototype: no account or payment is involved). One store so every page and
 * the header counts stay in step.
 */
const KEY = "enski:shop:v1";
export const RECENT_LIMIT = 12;

/** A simulated order: nothing is charged, it only lives on this device. */
export interface DemoOrder {
  id: string;
  /** Short reference shown to the visitor, e.g. ENS-4F7K2Q. */
  number: string;
  at: string;
  items: ShopItem[];
  totals: { currency: string; label: string }[];
}

export interface ShopState {
  wishlist: ShopItem[];
  cart: ShopItem[];
  recent: ShopItem[];
  orders: DemoOrder[];
  /** Every checkout attempt, newest first (successful ones also appear in `orders`). */
  payments: PaymentRecord[];
}

const EMPTY: ShopState = { wishlist: [], cart: [], recent: [], orders: [], payments: [] };

// ---- pure list helpers (tested) ----

/** Adds to the front, or removes when already there. Returns the new list and whether it is now in. */
export function toggleIn(list: ShopItem[], item: ShopItem): { list: ShopItem[]; added: boolean } {
  return list.some((i) => i.key === item.key)
    ? { list: list.filter((i) => i.key !== item.key), added: false }
    : { list: [item, ...list], added: true };
}

/** Puts an item into the cart once; items that can't be bought are refused. */
export function addOnce(list: ShopItem[], item: ShopItem): { list: ShopItem[]; added: boolean } {
  if (!item.canCart || list.some((i) => i.key === item.key)) return { list, added: false };
  return { list: [...list, item], added: true };
}

/** Builds a demo order for items that have a price; anything without one is left out. */
export function makeOrder(items: ShopItem[], now: Date, id: string): DemoOrder | null {
  const priced = items.filter((i) => i.price);
  if (priced.length === 0) return null;
  return {
    id,
    number: `ENS-${id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`,
    at: now.toISOString(),
    items: priced,
    totals: subtotals(priced.map((i) => i.price)).map(({ currency, label }) => ({ currency, label })),
  };
}

/** Most recent first, no repeats, capped. */
export function pushRecent(list: ShopItem[], item: ShopItem, limit = RECENT_LIMIT): ShopItem[] {
  return [item, ...list.filter((i) => i.key !== item.key)].slice(0, limit);
}

// ---- store ----

let state: ShopState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ShopState>;
      state = {
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        cart: Array.isArray(parsed.cart) ? parsed.cart : [],
        recent: Array.isArray(parsed.recent) ? parsed.recent : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      };
    }
  } catch {
    /* corrupt or blocked storage: start empty */
  }
}

function set(next: ShopState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export function useShop<T>(select: (s: ShopState) => T): T {
  return select(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
}

export const shop = {
  toggleWishlist(item: ShopItem): boolean {
    load();
    const r = toggleIn(state.wishlist, item);
    set({ ...state, wishlist: r.list });
    return r.added;
  },
  removeWishlist(key: string) {
    load();
    set({ ...state, wishlist: state.wishlist.filter((i) => i.key !== key) });
  },
  addToCart(item: ShopItem): boolean {
    load();
    const r = addOnce(state.cart, item);
    if (r.added) set({ ...state, cart: r.list });
    return r.added;
  },
  removeFromCart(key: string) {
    load();
    set({ ...state, cart: state.cart.filter((i) => i.key !== key) });
  },
  /** Simulated checkout: records the order on this device and takes its items out of the cart. */
  placeOrder(items: ShopItem[]): DemoOrder | null {
    load();
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}${Math.random()}`;
    const order = makeOrder(items, new Date(), id);
    if (!order) return null;
    const bought = new Set(order.items.map((i) => i.key));
    set({ ...state, cart: state.cart.filter((i) => !bought.has(i.key)), orders: [order, ...state.orders].slice(0, 50) });
    return order;
  },
  /** Records a new payment attempt (status "processing"). */
  startPayment(record: PaymentRecord) {
    load();
    set({ ...state, payments: [record, ...state.payments.filter((p) => p.reference !== record.reference)].slice(0, 100) });
  },
  /**
   * Moves a payment along by the clock. The first time it turns successful, an order
   * with the same reference is created and its items leave the cart (idempotent).
   */
  refreshPayment(reference: string, now = Date.now()): PaymentRecord | null {
    load();
    const cur = state.payments.find((p) => p.reference === reference);
    if (!cur) return null;
    const next = advancePayment(cur, now);
    if (next === cur) return cur;
    commitPayment(next);
    return next;
  },
  cancelPayment(reference: string, now = Date.now()) {
    load();
    const cur = state.payments.find((p) => p.reference === reference);
    if (!cur) return;
    const next = cancelPayment(advancePayment(cur, now), now);
    commitPayment(next);
  },
  /** Bank transfer / USSD: the payer says they've sent the money; confirm shortly after. */
  markSent(reference: string, confirmInMs: number, now = Date.now()) {
    load();
    const cur = state.payments.find((p) => p.reference === reference);
    if (!cur || cur.status !== "pending") return;
    commitPayment({ ...cur, confirmAt: now + confirmInMs });
  },
  viewed(item: ShopItem) {
    load();
    if (state.recent[0]?.key === item.key) return;
    set({ ...state, recent: pushRecent(state.recent, item) });
  },
};

function commitPayment(next: PaymentRecord) {
  const payments = state.payments.map((p) => (p.reference === next.reference ? next : p));
  let { orders, cart } = state;
  if (next.status === "successful" && !orders.some((o) => o.number === next.reference)) {
    const order: DemoOrder = {
      id: next.reference,
      number: next.reference,
      at: next.updatedAt,
      items: next.items,
      totals: next.totals.map(({ currency, label }) => ({ currency, label })),
    };
    orders = [order, ...orders].slice(0, 50);
    const bought = new Set(next.items.map((i) => i.key));
    cart = cart.filter((i) => !bought.has(i.key));
  }
  set({ ...state, payments, orders, cart });
  // Storefront items: the sale lands in that creator's own dashboard (idempotent per payment).
  if (next.status === "successful" && next.items.some((i) => i.key.startsWith("store:"))) {
    void import("@/lib/creator/publicStore").then((m) => m.creditStoreSales(next)).catch(() => undefined);
  }
}

export function usePayment(reference: string): PaymentRecord | null {
  return useShop(useCallback((s: ShopState) => s.payments.find((p) => p.reference === reference) ?? null, [reference]));
}

/** Wishlist state for one item. */
export function useWished(key: string): boolean {
  return useShop(useCallback((s: ShopState) => s.wishlist.some((i) => i.key === key), [key]));
}

export function useInCart(key: string): boolean {
  return useShop(useCallback((s: ShopState) => s.cart.some((i) => i.key === key), [key]));
}

const noop = () => () => {};
/** False during the server render and first paint, true once this device's saved lists can be read. */
export function useShopReady(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Puts every buyable wishlist item into the cart; returns how many were added. */
export function moveAllToCart(): number {
  load();
  let cart = state.cart;
  let added = 0;
  for (const item of state.wishlist) {
    const r = addOnce(cart, item);
    if (r.added) {
      cart = r.list;
      added += 1;
    }
  }
  if (added) set({ ...state, cart });
  return added;
}
