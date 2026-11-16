import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { notify, initialLearnerState, recordLearningDay, stateSchema, STORAGE_KEY, withAchievements, withPrintedNames, type LearnerState } from "./rules";
import { accountPerson, accountStorageKey } from "@/lib/dashboard/account";
import { currentDemoProfile } from "@/lib/demo/profile";
import { firstWord } from "@/lib/shared/greeting";
import { identityRecord, saveIdentity } from "@/lib/shared/identity";
import { useShop } from "@/lib/shop/store";
import { registerResources, type LearnerResource } from "./catalog";
import { purchaseFromPayment, resourceFromShopItem, unclaimedPayments, type Lesson, type OutlineExtras } from "./shopBridge";

type Outline = { lessons: Lesson[]; extras: OutlineExtras };

/** Lesson outlines for marketplace courses, from the saved course pages (modules, summaries, lengths). */
async function outlineFor(slug: string): Promise<Outline> {
  try {
    type Page = { modules?: { title?: string; lessons?: { title: string; description: string | null; durationSeconds: number | null; preview?: boolean }[] }[]; certificate?: boolean | null };
    const pages = (await import("@/content/demo/courses.json")).default as unknown as Record<string, Page | null>;
    const page = pages[slug.toLowerCase()];
    const lessons = (page?.modules ?? []).flatMap((m) => (m.lessons ?? []).map((l) => ({ ...l, module: m.title })));
    return { lessons, extras: page?.certificate === false ? { certificate: false } : {} };
  } catch {
    return { lessons: [], extras: {} };
  }
}

/** The course a creator built for their storefront: modules, lesson types, drip schedule, final quiz and certificate. */
async function storeOutline(key: string): Promise<Outline> {
  try {
    const [{ storeCourse, storeLessons }, { courseOf }] = await Promise.all([import("@/lib/creator/publicStore"), import("@/lib/creator/products")]);
    const item = storeCourse(key);
    if (!item) return { lessons: storeLessons(key).filter(Boolean).map((title) => ({ title, durationSeconds: 600 })), extras: {} };
    const c = courseOf(item);
    const scheduled = c.drip === "scheduled";
    const lessons: Lesson[] = c.modules.flatMap((m) =>
      m.lessons.filter((l) => l.title.trim()).map((l) => ({ id: l.id, title: l.title, durationSeconds: l.minutes > 0 ? l.minutes * 60 : null, module: m.title, preview: l.preview, kind: l.type, mediaId: l.mediaId || undefined, unlockDay: scheduled ? m.unlockDay : undefined })),
    );
    const quiz = c.quiz.enabled && c.quiz.questions.length ? { passMark: c.quiz.passMark, required: c.certificate.requireQuiz, questions: c.quiz.questions } : undefined;
    return { lessons, extras: { quiz, certificate: c.certificate.enabled } };
  } catch {
    return { lessons: [], extras: {} };
  }
}

/** The shared names (set at sign-up, in onboarding or in any role's settings) win over this dashboard's copy. */
function withIdentity(s: LearnerState): LearnerState {
  const email = currentDemoProfile()?.email;
  const rec = email ? identityRecord(email) : undefined;
  if (!rec) return s;
  const fullName = rec.fullName || s.profile.fullName;
  return {
    ...s,
    profile: {
      ...s.profile,
      fullName,
      displayName: rec.displayName || s.profile.displayName || firstWord(fullName),
      certificateName: rec.certificateName ?? s.profile.certificateName,
    },
  };
}

/** A brand-new learner account for whoever signed in: their name and email, every list empty. */
function freshLearnerState(): LearnerState {
  const p = accountPerson();
  return { ...initialLearnerState, profile: { ...initialLearnerState.profile, fullName: p.fullName, displayName: p.firstName, email: p.email } };
}

type Patch = Partial<LearnerState> | ((s: LearnerState) => Partial<LearnerState>);
type Context = { state: LearnerState; ready: boolean; storageError: boolean; update: (patch: Patch) => void; reset: () => void };
const LearnerContext = createContext<Context | null>(null);

export function LearnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState>(initialLearnerState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(accountStorageKey(STORAGE_KEY));
      if (raw) {
        const parsed = stateSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setState(withIdentity(withPrintedNames(parsed.data)));
        else setStorageError(true);
      } else {
        setState(withIdentity(freshLearnerState()));
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
  // Keep the shared names in step when they're changed here (e.g. the certificate "Edit name" dialog).
  const { fullName, displayName, certificateName, email } = state.profile;
  useEffect(() => {
    if (!ready) return;
    const who = currentDemoProfile()?.email;
    if (!who || !fullName) return;
    saveIdentity(who, { fullName, displayName, certificateName });
  }, [ready, fullName, displayName, certificateName, email]);
  // Purchases from the sitewide checkout land in this learner's library (matched by email).
  const payments = useShop((s) => s.payments);
  useEffect(() => {
    if (!ready) return;
    const todo = unclaimedPayments(state, payments, state.profile.email || accountPerson().email);
    if (!todo.length) return;
    let live = true;
    void (async () => {
      const added: LearnerResource[] = [];
      for (const p of todo)
        for (const item of p.items) {
          if (added.some((a) => a.id === item.key) || state.shopLibrary.some((a) => a.id === item.key)) continue;
          const o = item.route.kind === "course" ? await outlineFor(item.route.slug) : item.route.kind === "store" ? await storeOutline(item.key) : { lessons: [], extras: {} };
          added.push(resourceFromShopItem(item, o.lessons, o.extras));
        }
      if (!live) return;
      update((s) => {
        const fresh = unclaimedPayments(s, payments, s.profile.email || accountPerson().email);
        if (!fresh.length) return {};
        let next = { ...s, purchases: [...fresh.map(purchaseFromPayment), ...s.purchases], shopLibrary: [...s.shopLibrary, ...added.filter((a) => !s.shopLibrary.some((x) => x.id === a.id))] };
        for (const p of fresh) next = { ...next, notifications: notify(next, "purchase", "Purchase confirmed", `${p.items.map((i) => i.title).join(", ")} is ready in your library.`) };
        return next;
      });
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, payments, state.profile.email]);
  registerResources(state.shopLibrary as LearnerResource[]);
  const update = (patch: Patch) =>
    setState((s) => withAchievements(recordLearningDay(s, { ...s, ...(typeof patch === "function" ? patch(s) : patch) })));
  const reset = () => setState(freshLearnerState());
  return <LearnerContext.Provider value={{ state, ready, storageError, update, reset }}>{children}</LearnerContext.Provider>;
}
export function useLearner() {
  const v = useContext(LearnerContext);
  if (!v) throw new Error("Learner pages require LearnerProvider");
  return v;
}
