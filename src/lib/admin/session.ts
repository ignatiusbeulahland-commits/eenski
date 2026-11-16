import { useSyncExternalStore } from "react";

/** Who is signed in to the admin console in this tab (tab-only, like the support desk). */
export type AdminSession = { name: string; email: string };
const KEY = "enski:admin:session";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: AdminSession | null } = { raw: null, value: null };

function read(): AdminSession | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try { raw = window.sessionStorage.getItem(KEY); } catch { raw = null; }
  if (raw === cache.raw) return cache.value;
  let value: AdminSession | null = null;
  try {
    const p = raw ? (JSON.parse(raw) as Partial<AdminSession>) : null;
    if (p && typeof p.name === "string" && typeof p.email === "string") value = { name: p.name, email: p.email };
  } catch { value = null; }
  cache = { raw, value };
  return value;
}
function write(v: AdminSession | null) {
  try { if (v) window.sessionStorage.setItem(KEY, JSON.stringify(v)); else window.sessionStorage.removeItem(KEY); } catch { /* blocked */ }
  listeners.forEach((l) => l());
}
export const adminSession = {
  signIn(name: string, email: string) {
    const n = name.trim().replace(/\s+/g, " ").slice(0, 60) || email.split("@")[0] || "Admin";
    write({ name: n, email: email.trim().toLowerCase() });
  },
  signOut() { write(null); },
};
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export function useAdminSession(): AdminSession | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
