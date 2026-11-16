import { readLocal, writeLocal } from "@/lib/demo/local";

export type CookieChoice = "analytics" | "preference" | "marketing";
export type CookiePrefs = Record<CookieChoice, boolean> & { savedAt: string | null };

export const COOKIE_KEY = "enski:cookie-prefs";
export const defaultPrefs: CookiePrefs = { analytics: false, preference: false, marketing: false, savedAt: null };

export const readCookiePrefs = (): CookiePrefs => ({ ...defaultPrefs, ...readLocal<Partial<CookiePrefs>>(COOKIE_KEY, {}) });

export function saveCookiePrefs(p: Record<CookieChoice, boolean>): CookiePrefs {
  const next = { ...p, savedAt: new Date().toISOString() };
  writeLocal(COOKIE_KEY, next);
  return next;
}
