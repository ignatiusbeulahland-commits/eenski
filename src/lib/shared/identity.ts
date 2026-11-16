import { useSyncExternalStore } from "react";
import { joinRoleFrom, type JoinRole } from "@/components/site/data";
import { currentDemoProfile, demoSession, useDemoProfile } from "@/lib/demo/profile";
import { firstWord } from "./greeting";
import { cleanFullName, fullNameProblem } from "./names";

/**
 * One person's three names, shared by every role they use on this device (keyed by email):
 * - fullName: the account record
 * - displayName: how Enski greets them (falls back to the first word of the full name)
 * - certificateName: printed on new certificates (empty = use the full name)
 * plus the role they joined as.
 */
export type Identity = { fullName: string; displayName: string; certificateName: string };
export type IdentityRecord = Partial<Identity> & { role?: JoinRole | undefined; updatedAt?: string | undefined };
export type ResolvedIdentity = Identity & { email: string; greet: string; printed: string; role: JoinRole | null };

export const IDENTITY_KEY = "enski:identity:v1";

/** Why a display name can't be used, or null. 2–40 characters with at least one letter. */
export function displayNameProblem(raw: string): string | null {
  const n = raw.replace(/\s+/g, " ").trim();
  if (!n) return "Enter the name you'd like us to use";
  if (n.length < 2) return "Use at least 2 characters";
  if (n.length > 40) return "Keep it under 40 characters";
  if (!/\p{L}/u.test(n)) return "Include at least one letter";
  return null;
}

/** Pure: the names to use for someone, filling gaps from the name they signed up with. */
export function resolveIdentity(rec: IdentityRecord | undefined, email: string, fallbackFullName: string): ResolvedIdentity {
  const fullName = cleanFullName(rec?.fullName ?? "") || cleanFullName(fallbackFullName);
  const displayName = (rec?.displayName ?? "").replace(/\s+/g, " ").trim();
  const certificateName = cleanFullName(rec?.certificateName ?? "");
  return {
    email,
    fullName,
    displayName,
    certificateName,
    greet: displayName || firstWord(fullName),
    printed: certificateName || fullName,
    role: joinRoleFrom(rec?.role) ?? null,
  };
}

/** Pure: splits a full name for older forms that keep first and last names apart. */
export function splitName(full: string): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = cleanFullName(full).split(" ").filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
}

/** Pure: checks one name change; returns the cleaned value or an error message. */
export function checkNameChange(field: keyof Identity, raw: string): { value: string } | { error: string } {
  if (field === "displayName") {
    const e = displayNameProblem(raw);
    return e ? { error: e } : { value: raw.replace(/\s+/g, " ").trim() };
  }
  const v = cleanFullName(raw);
  if (field === "certificateName" && !v) return { value: "" };
  const e = fullNameProblem(v);
  return e ? { error: e } : { value: v };
}

// ---- device store ----
const listeners = new Set<() => void>();
const EMPTY: Record<string, IdentityRecord> = {};
let cache: { raw: string | null; value: Record<string, IdentityRecord> } = { raw: null, value: {} };

function readAll(): Record<string, IdentityRecord> {
  if (typeof window === "undefined") return {};
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(IDENTITY_KEY); } catch { raw = null; }
  if (raw === cache.raw) return cache.value;
  let value: Record<string, IdentityRecord> = {};
  try {
    const v = raw ? (JSON.parse(raw) as unknown) : {};
    if (v && typeof v === "object" && !Array.isArray(v)) value = v as Record<string, IdentityRecord>;
  } catch { value = {}; }
  cache = { raw, value };
  return value;
}

export function identityRecord(email: string): IdentityRecord | undefined {
  return readAll()[email.trim().toLowerCase()];
}

/** Saves part of someone's names. Returns false when the device blocks saving (nothing changes then). */
export function saveIdentity(email: string, patch: IdentityRecord): boolean {
  const key = email.trim().toLowerCase();
  if (!key) return false;
  const all = readAll();
  const prev = all[key] ?? {};
  const next: IdentityRecord = { ...prev, ...patch };
  const same = (["fullName", "displayName", "certificateName", "role"] as const).every((k) => (prev[k] ?? "") === (next[k] ?? ""));
  if (same) return true;
  try {
    window.localStorage.setItem(IDENTITY_KEY, JSON.stringify({ ...all, [key]: { ...next, updatedAt: new Date().toISOString() } }));
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  if (patch.fullName && currentDemoProfile()?.email === key) demoSession.rename(patch.fullName);
  return true;
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === IDENTITY_KEY) l(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

/** The signed-in person's names (null when signed out or before hydration). */
export function useIdentity(): ResolvedIdentity | null {
  const profile = useDemoProfile();
  const all = useSyncExternalStore(subscribe, readAll, () => EMPTY);
  if (!profile) return null;
  return resolveIdentity(all[profile.email], profile.email, profile.name);
}

/** The signed-in person's names right now (browser only). */
export function currentIdentity(): ResolvedIdentity | null {
  const p = currentDemoProfile();
  return p ? resolveIdentity(identityRecord(p.email), p.email, p.name) : null;
}
