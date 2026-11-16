import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { stateSchema, type CreatorState } from "./rules";
import { initialCreatorState, STORAGE_KEY } from "./data";
import { accountPerson, accountStorageKey } from "@/lib/dashboard/account";
import { bankSummary, migrateLegacyBank } from "@/lib/shared/finance/sync";
import { currentDemoProfile } from "@/lib/demo/profile";
import { onboardingRecord } from "@/lib/onboarding/store";
import { identityRecord, splitName } from "@/lib/shared/identity";

/** Shared names win over this dashboard's copy; setup answers fill an empty bio or photo once. */
function withIdentity(s: CreatorState): CreatorState {
  const email = currentDemoProfile()?.email;
  if (!email) return s;
  const rec = identityRecord(email);
  const setup = onboardingRecord(email);
  const answers = setup && setup.role === "creator" ? setup.answers : {};
  const names = rec?.fullName ? splitName(rec.fullName) : {};
  const bio = s.profile.bio || answers.bio || answers.headline || "";
  const photo = s.profile.photo || answers.photo || "";
  return { ...s, profile: { ...s.profile, ...names, bio, photo } };
}
type Context = {
  state: CreatorState;
  ready: boolean;
  storageError: boolean;
  update: (patch: Partial<CreatorState> | ((state: CreatorState) => Partial<CreatorState>)) => void;
  /** Writes to storage first and only applies the change if the write succeeded. */
  commit: (patch: Partial<CreatorState> | ((state: CreatorState) => Partial<CreatorState>)) => boolean;
};
const CreatorContext = createContext<Context | null>(null);
/** A brand-new creator account for whoever signed in: their name and email, every list empty. */
function freshCreatorState(): CreatorState {
  const p = accountPerson();
  return { ...initialCreatorState, profile: { ...initialCreatorState.profile, firstName: p.firstName, lastName: p.lastName, email: p.email } };
}
export function CreatorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreatorState>(initialCreatorState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(accountStorageKey(STORAGE_KEY));
      if (raw) {
        const parsed = stateSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setState(withIdentity({ ...parsed.data, beneficiaries: migrateLegacyBank(parsed.data.bank, parsed.data.beneficiaries) }));
        else setStorageError(true);
      } else {
        setState(withIdentity(freshCreatorState()));
      }
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(accountStorageKey(STORAGE_KEY), JSON.stringify(state));
    } catch {
      setStorageError(true);
    }
  }, [state, ready]);
  const latest = useRef(state);
  latest.current = state;
  const compute = (s: CreatorState, patch: Parameters<Context["update"]>[0]): CreatorState => {
    const p = typeof patch === "function" ? patch(s) : patch;
    const next = { ...s, ...p };
    return p.beneficiaries ? { ...next, bank: bankSummary(next.beneficiaries) } : next;
  };
  const update: Context["update"] = (patch) => setState((s) => compute(s, patch));
  const commit: Context["commit"] = (patch) => {
    if (!ready) return false;
    const next = compute(latest.current, patch);
    try { localStorage.setItem(accountStorageKey(STORAGE_KEY), JSON.stringify(next)); } catch { setStorageError(true); return false; }
    latest.current = next;
    setState(next);
    return true;
  };
  return (
    <CreatorContext.Provider value={{ state, ready, storageError, update, commit }}>
      {children}
    </CreatorContext.Provider>
  );
}
export function useCreator() {
  const value = useContext(CreatorContext);
  if (!value) throw new Error("Creator pages require CreatorProvider");
  return value;
}
export const activityEntry = (text: string) => ({
  id: crypto.randomUUID(),
  text,
  date: new Date().toISOString(),
});
