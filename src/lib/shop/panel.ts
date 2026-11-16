import type { ShopItem } from "./types";

/** Lets any card open the header's cart, wishlist or orders panel (e.g. "View cart" on a toast). */
export type ShopPanel = "cart" | "wishlist" | "orders";
const listeners = new Set<(p: ShopPanel) => void>();

export function openShopPanel(p: ShopPanel) {
  listeners.forEach((l) => l(p));
}

export function onShopPanel(l: (p: ShopPanel) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Opens the checkout page for one listing ("Buy now") or the whole cart. */
const checkoutListeners = new Set<(items: ShopItem[]) => void>();
const PENDING_KEY = "enski:checkout:pending:v1";

export function openCheckout(items: ShopItem[]) {
  savePendingCheckout(items);
  checkoutListeners.forEach((l) => l(items));
}

/** Items waiting on the checkout page, kept for this tab so a refresh doesn't lose them. */
export function savePendingCheckout(items: ShopItem[]) {
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(items));
  } catch {
    /* blocked storage: the page shows its empty state */
  }
}

export function readPendingCheckout(): ShopItem[] {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ShopItem[]) : [];
  } catch {
    return [];
  }
}

export function onCheckout(l: (items: ShopItem[]) => void) {
  checkoutListeners.add(l);
  return () => {
    checkoutListeners.delete(l);
  };
}
