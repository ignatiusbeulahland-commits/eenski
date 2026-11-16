import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { affiliateEvents } from "./rules";
import { products } from "./products";
import type { Promotions } from "./promotions";
import { accountPerson, accountStorageKey } from "@/lib/dashboard/account";
import { currentDemoProfile } from "@/lib/demo/profile";
import { identityRecord, splitName } from "@/lib/shared/identity";

/** Shared names (sign-up, onboarding, any role's settings) win over this dashboard's copy. */
function withIdentity(s: State): State {
  const email = currentDemoProfile()?.email;
  const rec = email ? identityRecord(email) : undefined;
  return rec?.fullName ? { ...s, profile: { ...s.profile, ...splitName(rec.fullName) } } : s;
}
import { defaultFinancePrefs, type Beneficiary, type FinancePrefs } from "@/lib/shared/finance/beneficiaries";
import { bankSummary, migrateLegacyBank } from "@/lib/shared/finance/sync";

export type AffiliateNotification = { id: string; title: string; body: string; date: string; read: boolean };

export type ProfileRole = "Affiliate" | "Learner" | "Creator";
export type State = {
  termsAccepted: boolean;
  termsBannerHidden: boolean;
  joined: string[];
  /** Link version, copies and shares per promoted product (ids match `joined`). */
  promotions: Promotions;
  linkCopied: boolean;
  visitedMarket: boolean;
  role: ProfileRole;
  profile: { firstName: string; lastName: string; email: string; phone: string; location: string; photo?: string | undefined };
  /** Preferred payout account summary; `account` holds only the last four digits. */
  bank: { holder: string; bank: string; account: string } | null;
  beneficiaries: Beneficiary[];
  finance: FinancePrefs;
  verification: "not_started" | "submitted";
  notifyPrefs: Record<string, boolean>;
  /** Connected integrations: id -> ISO date connected. */
  integrations: Record<string, string>;
  sidebarCollapsed: boolean;
  notifications: AffiliateNotification[];
};

export const initialState: State = {
  termsAccepted: false,
  termsBannerHidden: false,
  joined: [],
  promotions: {},
  linkCopied: false,
  visitedMarket: false,
  role: "Affiliate",
  profile: { firstName: "", lastName: "", email: "", phone: "", location: "" },
  bank: null,
  beneficiaries: [],
  finance: defaultFinancePrefs,
  verification: "not_started",
  notifyPrefs: { referrals: true, conversions: true, payouts: true, products: false, tips: false },
  integrations: {},
  sidebarCollapsed: false,
  notifications: [],
};

const KEY = "enski-affiliate-prototype-v1";
/** A brand-new affiliate account for whoever signed in: their name and email, nothing else. */
function freshState(): State {
  const p = accountPerson();
  return { ...initialState, profile: { ...initialState.profile, firstName: p.firstName, lastName: p.lastName, email: p.email } };
}
type Patch = Partial<State> | ((s: State) => Partial<State>);
/** `commit` writes to storage first and only applies the change if the write succeeded. */
type Ctx = { state: State; ready: boolean; update: (patch: Patch) => void; commit: (patch: Patch) => boolean; reset: () => void };
const StoreCtx = createContext<Ctx | null>(null);

export function AffiliateStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(accountStorageKey(KEY));
      if (raw) {
        const saved = { ...initialState, ...JSON.parse(raw) } as State;
        const last4 = saved.bank ? saved.bank.account.slice(-4) : "";
        const beneficiaries = migrateLegacyBank(saved.bank && { holder: saved.bank.holder, bank: saved.bank.bank, last4 }, saved.beneficiaries ?? []);
        setState(withIdentity({ ...saved, finance: { ...defaultFinancePrefs, ...saved.finance }, beneficiaries, bank: saved.bank && { ...saved.bank, account: last4 } }));
      } else {
        setState(withIdentity(freshState()));
      }
    } catch {
      setState(freshState());
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(accountStorageKey(KEY), JSON.stringify(state));
    } catch {
      /* storage blocked: changes last for this visit */
    }
  }, [state, ready]);
  const latest = useRef(state);
  latest.current = state;
  const compute = (s: State, patch: Patch): State => {
      const p = typeof patch === "function" ? patch(s) : patch;
      const merged = { ...s, ...p };
      const summary = bankSummary(merged.beneficiaries);
      const next = p.beneficiaries ? { ...merged, bank: summary && { holder: summary.holder, bank: summary.bank, account: summary.last4 } } : merged;
      const events = affiliateEvents(s, next, (id) => products.find((p) => p.id === id)?.title ?? "this product");
      if (!events.length) return next;
      const date = new Date().toISOString();
      const fresh = events.map((e, i) => ({ ...e, id: `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`, date, read: false }));
      return { ...next, notifications: [...fresh.reverse(), ...next.notifications].slice(0, 50) };
  };
  const update: Ctx["update"] = (patch) => setState((s) => compute(s, patch));
  const commit: Ctx["commit"] = (patch) => {
    if (!ready) return false;
    const next = compute(latest.current, patch);
    try { localStorage.setItem(accountStorageKey(KEY), JSON.stringify(next)); } catch { return false; }
    latest.current = next;
    setState(next);
    return true;
  };
  return (
    <StoreCtx.Provider value={{ state, ready, update, commit, reset: () => setState(freshState()) }}>{children}</StoreCtx.Provider>
  );
}

export function useAffiliate() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useAffiliate outside provider");
  return c;
}

export const maskAccount = (n: string) => (n.length >= 4 ? "•••• •••• " + n.slice(-4) : n);
