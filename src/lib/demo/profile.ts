import { useSyncExternalStore } from "react";

import type { AccountType } from "@/components/site/data";
import type { WelcomeKind } from "@/lib/shared/greeting";

/**
 * Demo sign-in for the prototype. Nothing is checked or sent anywhere: signing
 * in just picks a demo profile for this browser tab (sessionStorage), so the
 * Learner, Creator and Affiliate views can be tried and switched freely.
 */
export interface DemoProfile {
  type: AccountType;
  name: string;
  email: string;
}

/** Ready-made starter accounts (fictional, reserved example.com addresses). */
export const DEMO_PROFILES: Record<AccountType, DemoProfile> = {
  learner: { type: "learner", name: "Enski Learner", email: "learner@example.com" },
  creator: { type: "creator", name: "Enski Creator", email: "creator@example.com" },
  affiliate: { type: "affiliate", name: "Enski Affiliate", email: "affiliate@example.com" },
};

const KEY = "enski:demo:profile";
/** Names typed at registration, by email, so logging back in on this device greets the same person. */
const NAMES_KEY = "enski:demo:names";
/** Emails that have signed in on this device before, so the next sign-in says "welcome back". */
const VISITS_KEY = "enski:demo:visits";
/** This tab's sign-in: "new" or "returning", read by the dashboard greeting. */
const WELCOME_KEY = "enski:demo:welcome";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: DemoProfile | null } = { raw: null, value: null };

function read(): DemoProfile | null {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cache.raw) return cache.value;
  let value: DemoProfile | null = null;
  try {
    const p = raw ? (JSON.parse(raw) as Partial<DemoProfile>) : null;
    if (p && (p.type === "learner" || p.type === "creator" || p.type === "affiliate") && typeof p.name === "string" && typeof p.email === "string") {
      value = { type: p.type, name: p.name, email: p.email };
    }
  } catch {
    value = null;
  }
  cache = { raw, value };
  return value;
}

function readNames(): Record<string, string> {
  try {
    const v = JSON.parse(window.localStorage.getItem(NAMES_KEY) ?? "{}") as unknown;
    return v && typeof v === "object" ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function rememberName(email: string, name: string) {
  try {
    window.localStorage.setItem(NAMES_KEY, JSON.stringify({ ...readNames(), [email]: name }));
  } catch {
    /* storage blocked: the name just isn't remembered */
  }
}

/** "ada.obi92@mail.com" -> "Ada Obi": a friendly stand-in when someone logs in without a saved name. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local
    .replace(/[0-9]+/g, " ")
    .split(/[._+\-\s]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .slice(0, 60);
}

/** The signed-in demo profile right now (client only; null on the server or when signed out). */
export function currentDemoProfile(): DemoProfile | null {
  if (typeof window === "undefined") return null;
  return read();
}

function write(p: DemoProfile | null) {
  try {
    if (p) window.sessionStorage.setItem(KEY, JSON.stringify(p));
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the demo just stays signed out */
  }
  listeners.forEach((l) => l());
}

/** Builds the profile to sign in with: typed name/email win, else the ready-made demo account. */
export function demoProfileFor(
  type: AccountType,
  details: { name?: string | null; email?: string | null } = {},
  knownNames: Record<string, string> = {},
): DemoProfile {
  const base = DEMO_PROFILES[type];
  const name = details.name?.trim().replace(/\s+/g, " ").slice(0, 60);
  const email = details.email?.trim().toLowerCase().slice(0, 254);
  // Logging in with only an email: reuse the name registered with it, else build one from the email.
  const fallback = email ? knownNames[email] || nameFromEmail(email) : "";
  return { type, name: name || fallback || base.name, email: email || base.email };
}

function readVisits(): Record<string, number> {
  try {
    const v = JSON.parse(window.localStorage.getItem(VISITS_KEY) ?? "{}") as unknown;
    return v && typeof v === "object" ? (v as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/** Whether this sign-in is someone's first on this device. Logging in to an existing account always counts as returning. */
export function welcomeKindFor(intent: "register" | "login" | undefined, seenBefore: boolean): WelcomeKind {
  if (seenBefore) return "returning";
  return intent === "login" ? "returning" : "new";
}

/** "new" or "returning" for this tab's sign-in (client only). */
export function currentWelcomeKind(): WelcomeKind {
  try {
    return window.sessionStorage.getItem(WELCOME_KEY) === "new" ? "new" : "returning";
  } catch {
    return "returning";
  }
}

export const demoSession = {
  signIn(type: AccountType, details?: { name?: string | null; email?: string | null; intent?: "register" | "login" }) {
    const p = demoProfileFor(type, details, readNames());
    if (details?.name?.trim() && details.email?.trim()) rememberName(p.email, p.name);
    const visits = readVisits();
    const welcome = welcomeKindFor(details?.intent, (visits[p.email] ?? 0) > 0);
    try {
      window.localStorage.setItem(VISITS_KEY, JSON.stringify({ ...visits, [p.email]: (visits[p.email] ?? 0) + 1 }));
      window.sessionStorage.setItem(WELCOME_KEY, welcome);
    } catch {
      /* storage blocked: greeting falls back to "returning" */
    }
    write(p);
    return { ...p, welcome };
  },
  /** Updates the signed-in person's full name (after a name change in settings), on this tab and for future log-ins. */
  rename(name: string) {
    const current = read();
    const n = name.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!current || !n || current.name === n) return;
    rememberName(current.email, n);
    write({ ...current, name: n });
  },
  /** After the welcome screens, dashboards greet with the time of day instead of repeating "Welcome to Enski". */
  markWelcomed() {
    try {
      window.sessionStorage.setItem(WELCOME_KEY, "returning");
    } catch {
      /* storage blocked */
    }
  },
  /** Switches view (Learner / Creator / Affiliate) and keeps the same person. */
  switchTo(type: AccountType) {
    const current = read();
    write(current ? { ...current, type } : DEMO_PROFILES[type]);
  },
  signOut() {
    write(null);
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useDemoProfile(): DemoProfile | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
