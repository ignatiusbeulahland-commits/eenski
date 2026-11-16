import { useSyncExternalStore } from "react";
import { joinRoleFrom } from "@/components/site/data";
import type { OnboardingRecord } from "./flows";

/** Setup progress per person (by email) on this device. */
const KEY = "enski:onboarding:v1";
const EMPTY: Record<string, OnboardingRecord> = {};
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Record<string, OnboardingRecord> } = { raw: null, value: EMPTY };

function readAll(): Record<string, OnboardingRecord> {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(KEY); } catch { raw = null; }
  if (raw === cache.raw) return cache.value;
  let value: Record<string, OnboardingRecord> = EMPTY;
  try {
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      // Older setups saved as "facilitator" continue as creator setups.
      value = Object.fromEntries(Object.entries(v as Record<string, OnboardingRecord>).map(([k, r]) => [k, { ...r, role: joinRoleFrom(r.role) ?? "learner" }]));
    }
  } catch { value = EMPTY; }
  cache = { raw, value };
  return value;
}

export function onboardingRecord(email: string): OnboardingRecord | undefined {
  return readAll()[email.trim().toLowerCase()];
}

/** Returns false when the device blocks saving. */
export function saveOnboarding(email: string, rec: OnboardingRecord): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [email.trim().toLowerCase()]: rec }));
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useOnboardingRecord(email: string | null | undefined): OnboardingRecord | undefined {
  const all = useSyncExternalStore(subscribe, readAll, () => EMPTY);
  return email ? all[email.trim().toLowerCase()] : undefined;
}
