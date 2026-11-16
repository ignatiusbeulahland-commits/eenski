import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, Award, BadgeCheck, Camera, Check, Clock, Copy, CreditCard, Landmark, LayoutDashboard, Link2,
  Package, Presentation, Store, Trash2, Wallet,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { CharmFigure, CharmHead } from "@/components/assistant/CharmFigure";
import { StepCurtain } from "@/components/assistant/VictoryCurtain";
import { lookFor } from "@/components/assistant/looks";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { FocusShell, outcomeButton } from "@/components/shared/outcome";
import { joinRoleOf } from "@/components/site/auth/Welcome";
import { phoneCodes, products, roleLabelOf, type JoinRole } from "@/components/site/data";
import { prefsStore } from "@/lib/assistant/store";
import { accountHandle, DASHBOARD_HOME } from "@/lib/dashboard/account";
import { demoSession, useDemoProfile, type DemoProfile } from "@/lib/demo/profile";
import { fromCourse, fromShowcase } from "@/components/shop/adapters";
import type { ShopItem } from "@/lib/shop/types";
import { marketplaceQueryOptions } from "@/lib/marketplace/data";
import {
  clampStep, LEARNER_STAGES, LEARNING_GOALS, LEARNING_TOPICS, progressOf, resumeIndex, SHARE_CHANNELS, stepsFor, withStepDone,
  type OnboardingAnswers, type OnboardingRecord, type StepId,
} from "@/lib/onboarding/flows";
import { saveOnboarding, useOnboardingRecord } from "@/lib/onboarding/store";
import { displayNameProblem, saveIdentity, useIdentity, type ResolvedIdentity } from "@/lib/shared/identity";
import { cn } from "@/lib/utils";
import { FIRST_STEPS } from "./firstSteps";

type Ctx = {
  role: JoinRole;
  profile: DemoProfile;
  identity: ResolvedIdentity;
  answers: OnboardingAnswers;
  index: number;
  total: number;
  onBack: () => void;
  /** Saves this step's answers (and display name) and moves on. */
  onDone: (answers: OnboardingAnswers, displayName?: string) => void;
};

/** Guided, role-specific setup after sign-up. Each step is its own screen (?step=n), progress is saved per person. */
export function OnboardingJourney({ step }: { step: number | undefined }) {
  const profile = useDemoProfile();
  const identity = useIdentity();
  const navigate = useNavigate();
  const rec = useOnboardingRecord(profile?.email);
  const [checked, setChecked] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // The small curtain for the step just finished (the last one gets the bigger "all set" screen).
  const [cheer, setCheer] = useState<{ n: number; title: string; next: string | undefined } | null>(null);
  useEffect(() => { const t = window.setTimeout(() => setChecked(true), 300); return () => window.clearTimeout(t); }, []);
  useEffect(() => { if (checked && !profile) void navigate({ to: "/auth", replace: true }); }, [checked, profile, navigate]);
  if (!profile || !identity) return <FocusShell wide><div className="min-h-[60vh]" /></FocusShell>;

  const role = joinRoleOf(profile, identity);
  const steps = stepsFor(role);
  const index = clampStep(step, rec, role);
  const go = (i: number) => void navigate({ to: "/onboarding", search: { step: i } });
  const onDone = (answers: OnboardingAnswers, displayName?: string) => {
    const id = steps[index]?.id as StepId;
    const ok = saveOnboarding(profile.email, withStepDone(rec, role, id, answers));
    if (ok && displayName !== undefined) saveIdentity(profile.email, { displayName });
    setSaveError(!ok);
    if (ok) {
      const nextStep = steps[index + 1];
      setCheer(nextStep ? { n: index + 1, title: steps[index]!.short, next: nextStep.short } : null);
      go(index + 1);
    }
  };
  const ctx: Ctx = { role, profile, identity, answers: rec && rec.role === role ? rec.answers : {}, index, total: steps.length, onBack: () => go(Math.max(0, index - 1)), onDone };
  const later = (
    <Link to={DASHBOARD_HOME[profile.type]} onClick={() => demoSession.markWelcomed()} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-extrabold text-brand hover:bg-ice">
      Finish later
    </Link>
  );

  return (
    <FocusShell wide back={index < steps.length ? later : <span />}>
      {index >= steps.length ? (
        <Ready ctx={ctx} rec={rec} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <StepRail role={role} rec={rec} index={index} onPick={go} />
          <div>
            {cheer && cheer.n === index && (
              <StepCurtain key={cheer.n} className="mb-5" eyebrow={`Step ${cheer.n} of ${steps.length} done`} title={`${cheer.title}: all set`} onClose={() => setCheer(null)}>
                Next up: {cheer.next}
              </StepCurtain>
            )}
            {saveError && <p role="alert" className="mb-4 rounded-[14px] border border-destructive/40 bg-destructive/10 p-3.5 text-sm font-semibold">Your choices weren't saved because your browser is out of space. Free up some space, then try again.</p>}
            <StepBody ctx={ctx} />
          </div>
        </div>
      )}
    </FocusShell>
  );
}

function StepRail({ role, rec, index, onPick }: { role: JoinRole; rec: OnboardingRecord | undefined; index: number; onPick: (i: number) => void }) {
  const look = lookFor(prefsStore.use().look);
  const steps = stepsFor(role);
  const reach = resumeIndex(rec, role);
  const { done, total } = progressOf(rec, role);
  return (
    <aside aria-label="Setup progress" className="lg:sticky lg:top-8 lg:self-start">
      <div className="flex items-center gap-3">
        <CharmHead look={look} className="size-12 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Setting up as a</p>
          <p className="text-lg font-extrabold text-ink">{roleLabelOf(role)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 lg:hidden">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft ring-1 ring-line" aria-hidden="true">
          <div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-extrabold text-muted-foreground">Step {index + 1} of {total}</span>
      </div>
      <ol className="mt-6 hidden gap-1 lg:grid">
        {steps.map((s, i) => {
          const isDone = !!rec && rec.role === role && rec.done.includes(s.id);
          const skipped = isDone && s.id === "photo" && !rec?.answers.photo;
          const current = i === index;
          const open = i <= reach || isDone;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!open}
                aria-current={current ? "step" : undefined}
                onClick={() => onPick(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors",
                  current ? "bg-ice" : open ? "hover:bg-soft" : "opacity-60",
                )}
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold", isDone && !skipped && !current ? "bg-cobalt text-primary-foreground" : current ? "border-2 border-cobalt text-cobalt" : "border-2 border-line text-muted-foreground")}>
                  {isDone && !skipped && !current ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-sm font-extrabold", current ? "text-cobalt" : "text-ink")}>{s.short}</span>
                  <span className="block text-xs text-muted-foreground">{current ? "In progress" : skipped ? "Skipped · add any time" : isDone ? "Done" : open ? "Ready" : "Coming up"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 hidden text-xs text-muted-foreground lg:block">{done} of {total} done · your answers are saved as you go.</p>
    </aside>
  );
}

function StepBody({ ctx }: { ctx: Ctx }) {
  const id = stepsFor(ctx.role)[ctx.index]?.id;
  if (ctx.role === "learner") {
    if (id === "about") return <LearnerAbout ctx={ctx} />;
    if (id === "interests") return <LearnerInterests ctx={ctx} />;
    return <LearnerExplore ctx={ctx} />;
  }
  if (ctx.role === "creator") {
    if (id === "profile") return <CreatorProfileStep ctx={ctx} />;
    if (id === "photo") return <PhotoStep ctx={ctx} />;
    return <ToolsStep ctx={ctx} />;
  }
  if (id === "profile") return <AffiliateProfileStep ctx={ctx} />;
  if (id === "referrals") return <ReferralsStep ctx={ctx} />;
  return <EarningsStep ctx={ctx} />;
}

// ---------- building blocks ----------

function StepFrame({ ctx, onSubmit, children, skip, continueLabel = "Continue" }: { ctx: Ctx; onSubmit: () => void; children: ReactNode; skip?: (() => void) | undefined; continueLabel?: string }) {
  const s = stepsFor(ctx.role)[ctx.index]!;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [ctx.index]);
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(); };
  return (
    <form key={ctx.index} onSubmit={submit} noValidate className="screen-in rounded-[28px] border border-line bg-card p-5 shadow-card sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cobalt">Step {ctx.index + 1} of {ctx.total}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-ink outline-none sm:text-[30px]">{s.title}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{s.intro}</p>
      <div className="mt-6 grid gap-5">{children}</div>
      <div className="mt-8 flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row sm:items-center">
        {ctx.index > 0 ? (
          <button type="button" onClick={ctx.onBack} className={cn(outcomeButton.quiet, "sm:mr-auto")}><ArrowLeft aria-hidden="true" />Back</button>
        ) : <span className="hidden sm:mr-auto sm:block" />}
        {skip && <button type="button" onClick={skip} className={outcomeButton.secondary}>Skip for now</button>}
        <button type="submit" className={outcomeButton.primary}>{continueLabel}<ArrowRight aria-hidden="true" /></button>
      </div>
    </form>
  );
}

function TextField({ id, label, value, onChange, error, hint, optional, max = 80, placeholder, multiline }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string | null | undefined; hint?: string | undefined;
  optional?: boolean; max?: number; placeholder?: string | undefined; multiline?: boolean;
}) {
  const msg = error ?? hint;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}{optional && <span className="font-medium text-muted-foreground"> (optional)</span>}</Label>
      {multiline ? (
        <Textarea id={id} rows={3} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error || undefined} aria-describedby={msg ? `${id}-msg` : undefined} />
      ) : (
        <Input id={id} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error || undefined} aria-describedby={msg ? `${id}-msg` : undefined} />
      )}
      {msg && <p id={`${id}-msg`} className={cn("text-xs", error ? "font-semibold text-destructive" : "text-muted-foreground")}>{msg}</p>}
    </div>
  );
}

function DisplayNameField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string | null | undefined }) {
  return <TextField id="ob-display" label="What should we call you?" value={value} onChange={onChange} error={error} max={40} hint="Used in greetings around Enski. You can change it any time." />;
}

function Chips({ label, options, value, onChange, max, error }: { label: string; options: readonly string[]; value: string[]; onChange: (v: string[]) => void; max?: number; error?: string | null | undefined }) {
  const gid = useId();
  return (
    <fieldset aria-describedby={error ? `${gid}-err` : undefined}>
      <legend className="mb-2.5 text-sm font-extrabold text-ink">{label}{max && <span className="font-medium text-muted-foreground"> · up to {max}</span>}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          const full = !!max && value.length >= max && !on;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              disabled={full}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
              className={cn(
                "inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm font-bold transition-[background-color,border-color,transform] active:scale-[0.97] disabled:opacity-40",
                on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card text-ink hover:border-sky",
              )}
            >
              {on && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}{o}
            </button>
          );
        })}
      </div>
      {error && <p id={`${gid}-err`} className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
    </fieldset>
  );
}

function Choice({ label, options, value, onChange, error, cols = 2 }: { label: string; options: readonly string[]; value: string | undefined; onChange: (v: string) => void; error?: string | null | undefined; cols?: 2 | 4 }) {
  const gid = useId();
  return (
    <fieldset aria-describedby={error ? `${gid}-err` : undefined}>
      <legend className="mb-2.5 text-sm font-extrabold text-ink">{label}</legend>
      <div role="radiogroup" aria-label={label} className={cn("grid gap-2.5", cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2")}>
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o)}
              className={cn("flex min-h-12 items-center justify-between gap-2 rounded-[14px] border-[1.5px] px-4 py-3 text-left text-sm font-bold transition-colors", on ? "border-cobalt bg-ice text-ink ring-4 ring-cobalt/10" : "border-line bg-card text-ink hover:border-sky")}
            >
              {o}
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line")} aria-hidden="true">{on && <Check className="size-3" strokeWidth={3.5} />}</span>
            </button>
          );
        })}
      </div>
      {error && <p id={`${gid}-err`} className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
    </fieldset>
  );
}

const useDisplay = (ctx: Ctx) => useState(ctx.identity.displayName || ctx.identity.greet);

// ---------- learner ----------

function LearnerAbout({ ctx }: { ctx: Ctx }) {
  const [display, setDisplay] = useDisplay(ctx);
  const [country, setCountry] = useState(ctx.answers.country ?? "Nigeria");
  const [stage, setStage] = useState(ctx.answers.stage);
  const [err, setErr] = useState<{ display?: string | null; stage?: string | null }>({});
  return (
    <StepFrame ctx={ctx} onSubmit={() => {
      const e = { display: displayNameProblem(display), stage: stage ? null : "Pick the one that fits you best" };
      setErr(e);
      if (!e.display && !e.stage) ctx.onDone({ country, stage }, display.replace(/\s+/g, " ").trim());
    }}>
      <DisplayNameField value={display} onChange={(v) => { setDisplay(v); setErr((x) => ({ ...x, display: null })); }} error={err.display} />
      <div className="grid gap-1.5">
        <Label htmlFor="ob-country">Where are you learning from?</Label>
        <select id="ob-country" value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 w-full rounded-[12px] border border-input bg-card px-3 text-sm font-semibold outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/30">
          {[...phoneCodes.map((p) => p.country), "Somewhere else"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <p className="text-xs text-muted-foreground">So we can show prices and event times that make sense for you.</p>
      </div>
      <Choice label="Which best describes you?" options={LEARNER_STAGES} value={stage} onChange={(v) => { setStage(v); setErr((x) => ({ ...x, stage: null })); }} error={err.stage} />
    </StepFrame>
  );
}

function LearnerInterests({ ctx }: { ctx: Ctx }) {
  const [topics, setTopics] = useState<string[]>(ctx.answers.interests ?? []);
  const [goal, setGoal] = useState(ctx.answers.goal);
  const [err, setErr] = useState<{ topics?: string | null; goal?: string | null }>({});
  return (
    <StepFrame ctx={ctx} onSubmit={() => {
      const e = { topics: topics.length ? null : "Pick at least one topic", goal: goal ? null : "Choose your main goal" };
      setErr(e);
      if (!e.topics && !e.goal) ctx.onDone({ interests: topics, goal });
    }}>
      <Chips label="Topics you're curious about" options={LEARNING_TOPICS} value={topics} max={5} onChange={(v) => { setTopics(v); setErr((x) => ({ ...x, topics: null })); }} error={err.topics} />
      <Choice label="What's your main goal right now?" options={LEARNING_GOALS} value={goal} onChange={(v) => { setGoal(v); setErr((x) => ({ ...x, goal: null })); }} error={err.goal} />
    </StepFrame>
  );
}

const TOPIC_WORDS: Record<string, RegExp> = {
  Design: /design|figma|\bui\b|\bux\b|brand/i,
  "Tech & coding": /cod(e|ing)|develop|program|web|software|tech|data/i,
  "AI tools": /\bai\b|chatgpt|prompt|artificial|automation|vibe/i,
  Business: /business|entrepreneur|startup|small business/i,
  Marketing: /market|social media|sales|growth hack|advert/i,
  "Product management": /product/i,
  "Personal growth": /growth|confidence|mindset|productiv|habit|leader/i,
  "Money & finance": /money|financ|invest|budget|wealth/i,
  "Content creation": /content|video|youtube|creator|writ|podcast/i,
  Career: /career|job|\bcv\b|interview|resume|linkedin/i,
};

/** Courses that match the person's topics, in catalogue order (Enski's own catalogue first); tops up with the rest. */
export function pickCourses(all: ShopItem[], topics: string[], n = 4): { picks: ShopItem[]; matched: boolean } {
  const text = (c: ShopItem) => `${c.title} ${c.summary ?? ""} ${c.category ?? ""}`;
  const matched = all.filter((c) => topics.some((t) => TOPIC_WORDS[t]?.test(text(c))));
  const rest = all.filter((c) => !matched.includes(c));
  return { picks: [...matched, ...rest].slice(0, n), matched: matched.length > 0 };
}

function LearnerExplore({ ctx }: { ctx: Ctx }) {
  const market = useQuery(marketplaceQueryOptions());
  const topics = ctx.answers.interests ?? [];
  const catalogue = [...products.filter((p) => p.type === "Course").map(fromShowcase), ...(market.data?.courses ?? []).map((c) => fromCourse(c, "NGN"))];
  const seen = new Set<string>();
  const unique = catalogue.filter((c) => (c.route.kind === "course" && !seen.has(c.route.slug) ? (seen.add(c.route.slug), true) : false));
  const { picks, matched } = pickCourses(unique, topics);
  return (
    <StepFrame ctx={ctx} onSubmit={() => ctx.onDone({})} continueLabel="Finish setup">
      <p className="text-sm text-muted-foreground">
        {matched ? <>Based on <b className="text-ink">{topics.slice(0, 3).join(", ")}</b>{topics.length > 3 ? " and more" : ""}.</> : "Popular with Enski learners right now."}
      </p>
      {picks.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {picks.map((c, i) => (
            <li key={c.key} className="reveal-in" style={{ animationDelay: `${i * 80}ms` }}>
              <Link to="/courses/$slug" params={{ slug: c.route.slug }} className="group flex h-full gap-3 rounded-[18px] border-[1.5px] border-line p-3 transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-sky hover:bg-ice">
                <img src={c.image.src} alt="" width={96} height={72} loading="lazy" className={cn("h-[72px] w-24 shrink-0 rounded-[12px] bg-soft", c.image.fit === "contain" ? "object-contain" : "object-cover")} />
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-extrabold text-ink">{c.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{c.creator?.name ?? "Enski creator"}</span>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-extrabold text-cobalt">View course<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="dash-shimmer h-28 rounded-[18px]" />)}</div>
      )}
      <p className="flex items-start gap-2 rounded-[16px] bg-soft p-4 text-sm text-muted-foreground"><Award className="mt-0.5 size-4 shrink-0 text-cobalt" aria-hidden="true" />Finish a course to earn a certificate with your name on it, plus badges along the way.</p>
    </StepFrame>
  );
}

// ---------- creator ----------

function CreatorProfileStep({ ctx }: { ctx: Ctx }) {
  const [display, setDisplay] = useDisplay(ctx);
  const [headline, setHeadline] = useState(ctx.answers.headline ?? "");
  const [bio, setBio] = useState(ctx.answers.bio ?? "");
  const [err, setErr] = useState<{ display?: string | null; headline?: string | null }>({});
  return (
    <StepFrame ctx={ctx} onSubmit={() => {
      const e = { display: displayNameProblem(display), headline: headline.trim().length >= 3 ? null : "Tell learners what you teach, in a few words" };
      setErr(e);
      if (!e.display && !e.headline) ctx.onDone({ headline: headline.trim(), bio: bio.trim() }, display.replace(/\s+/g, " ").trim());
    }}>
      <DisplayNameField value={display} onChange={(v) => { setDisplay(v); setErr((x) => ({ ...x, display: null })); }} error={err.display} />
      <TextField id="ob-headline" label="What do you teach?" value={headline} onChange={(v) => { setHeadline(v); setErr((x) => ({ ...x, headline: null })); }} error={err.headline} placeholder="e.g. UI design for beginners" hint="One short line. It sits under your name on your storefront." />
      <TextField id="ob-bio" label="A little about you" optional multiline max={280} value={bio} onChange={setBio} placeholder="Your experience, who you help and how." hint={`${bio.length}/280`} />
    </StepFrame>
  );
}

const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
async function squarePhoto(file: File, size = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(size, side);
    const g = canvas.getContext("2d");
    if (!g) throw new Error("no canvas");
    g.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function PhotoStep({ ctx }: { ctx: Ctx }) {
  const [photo, setPhoto] = useState(ctx.answers.photo ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const initials = ctx.identity.fullName.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  const pick = async (f?: File) => {
    if (!f) return;
    if (!PHOTO_TYPES.includes(f.type)) { setErr("Use a JPG, PNG or WebP photo"); return; }
    if (f.size > 5 * 1024 * 1024) { setErr("Choose a photo under 5 MB"); return; }
    setBusy(true); setErr(null);
    try { setPhoto(await squarePhoto(f)); } catch { setErr("We couldn't read that photo. Try another one."); }
    setBusy(false);
  };
  return (
    <StepFrame ctx={ctx} onSubmit={() => (photo ? ctx.onDone({ photo }) : setErr("Add a photo, or skip this step for now"))} skip={photo ? undefined : () => ctx.onDone({})}>
      <div className="flex flex-col items-center gap-5 rounded-[22px] border-[1.5px] border-dashed border-line bg-soft/50 p-6 sm:flex-row sm:p-8">
        <span className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-full bg-cobalt text-3xl font-extrabold text-primary-foreground ring-4 ring-card">
          {photo ? <img src={photo} alt="Your profile photo" className="size-full object-cover" /> : initials}
          {busy && <span className="absolute inset-0 dash-shimmer" aria-hidden="true" />}
        </span>
        <div className="text-center sm:text-left">
          <p className="font-extrabold text-ink">{photo ? "Looking good!" : "Upload a photo of you"}</p>
          <p className="mt-1 text-sm text-muted-foreground">A clear face shot works best. JPG, PNG or WebP, up to 5 MB. We crop it to a square.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button type="button" onClick={() => input.current?.click()} className={outcomeButton.secondary}><Camera aria-hidden="true" />{photo ? "Change photo" : "Choose photo"}</button>
            {photo && <button type="button" onClick={() => setPhoto("")} className={outcomeButton.quiet}><Trash2 aria-hidden="true" />Remove</button>}
          </div>
          <input ref={input} type="file" accept={PHOTO_TYPES.join(",")} className="sr-only" tabIndex={-1} aria-label="Choose a profile photo" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>
      {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
    </StepFrame>
  );
}

type Tool = { icon: ComponentType<{ className?: string }>; title: string; text: string };
/** Creators include facilitators, so live training and coaching sit beside products. */
const TOOLS: Tool[] = [
  { icon: Package, title: "Products & storefront", text: "Courses and eBooks built step by step, on one page you can share anywhere." },
  { icon: Presentation, title: "Live training & coaching", text: "Schedule workshops and 1:1 or group coaching that learners can book." },
  { icon: BadgeCheck, title: "Certificates & badges", text: "Your logo and signature on every certificate learners earn." },
  { icon: Wallet, title: "Wallet & payouts", text: "Track sales and withdraw to your bank, card or PayPal." },
];
const FIRST_MAKE = ["A course", "An eBook", "Coaching", "Live training"] as const;

function ToolsStep({ ctx }: { ctx: Ctx }) {
  const [first, setFirst] = useState(ctx.answers.firstProduct);
  return (
    <StepFrame ctx={ctx} onSubmit={() => ctx.onDone({ firstProduct: first })} continueLabel="Finish setup">
      <ul className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((t, i) => (
          <li key={t.title} className="reveal-in flex gap-3 rounded-[18px] border-[1.5px] border-line p-4" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ice text-cobalt"><t.icon className="size-5" /></span>
            <span><span className="block font-extrabold text-ink">{t.title}</span><span className="block text-sm text-muted-foreground">{t.text}</span></span>
          </li>
        ))}
      </ul>
      <Choice label="What would you like to make first? (optional)" options={FIRST_MAKE} value={first} onChange={setFirst} cols={4} />
    </StepFrame>
  );
}

// ---------- affiliate ----------

const AUDIENCE = ["Just starting", "Under 1,000", "1,000–10,000", "10,000+"] as const;

function AffiliateProfileStep({ ctx }: { ctx: Ctx }) {
  const [display, setDisplay] = useDisplay(ctx);
  const [channels, setChannels] = useState<string[]>(ctx.answers.channels ?? []);
  const [audience, setAudience] = useState(ctx.answers.audience);
  const [err, setErr] = useState<{ display?: string | null; channels?: string | null; audience?: string | null }>({});
  return (
    <StepFrame ctx={ctx} onSubmit={() => {
      const e = { display: displayNameProblem(display), channels: channels.length ? null : "Pick at least one place you'll share", audience: audience ? null : "Choose the closest size" };
      setErr(e);
      if (!e.display && !e.channels && !e.audience) ctx.onDone({ channels, audience }, display.replace(/\s+/g, " ").trim());
    }}>
      <DisplayNameField value={display} onChange={(v) => { setDisplay(v); setErr((x) => ({ ...x, display: null })); }} error={err.display} />
      <Chips label="Where will you share Enski?" options={SHARE_CHANNELS} value={channels} onChange={(v) => { setChannels(v); setErr((x) => ({ ...x, channels: null })); }} error={err.channels} />
      <Choice label="Roughly how many people follow you?" options={AUDIENCE} value={audience} onChange={(v) => { setAudience(v); setErr((x) => ({ ...x, audience: null })); }} error={err.audience} cols={4} />
    </StepFrame>
  );
}

function ReferralsStep({ ctx }: { ctx: Ctx }) {
  const link = `ensk.lovable.app/r/${accountHandle(ctx.profile)}`;
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!copied) return; const t = window.setTimeout(() => setCopied(false), 1800); return () => window.clearTimeout(t); }, [copied]);
  return (
    <StepFrame ctx={ctx} onSubmit={() => ctx.onDone({})}>
      <div className="rounded-[22px] bg-brand-panel p-5 text-on-dark sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-lime">Your link</p>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-on-dark/10 p-1.5 pl-4 ring-1 ring-on-dark/20">
          <Link2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate font-mono text-sm font-bold">{link}</span>
          <button type="button" onClick={() => void navigator.clipboard?.writeText(`https://${link}`).then(() => setCopied(true), () => setCopied(false))} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-lime px-3.5 text-sm font-extrabold text-midnight">
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}{copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p role="status" className="sr-only">{copied ? "Link copied" : ""}</p>
        <p className="mt-3 text-sm text-on-dark-muted">Each programme you join gives you its own link like this one.</p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          { t: "Share", d: "Post your link on WhatsApp, social media or in your community." },
          { t: "They buy", d: "When someone buys through your link, the sale is tracked to you." },
          { t: "You earn", d: "You get the commission shown on that programme, for every sale." },
        ].map((s, i) => (
          <li key={s.t} className="reveal-in rounded-[18px] border-[1.5px] border-line p-4" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="grid size-8 place-items-center rounded-full bg-ice text-sm font-extrabold text-cobalt" aria-hidden="true">{i + 1}</span>
            <p className="mt-2 font-extrabold text-ink">{s.t}</p>
            <p className="text-sm text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>
    </StepFrame>
  );
}

const PAYOUTS = ["Bank transfer", "Card", "PayPal"] as const;
function EarningsStep({ ctx }: { ctx: Ctx }) {
  const [payout, setPayout] = useState(ctx.answers.payout);
  return (
    <StepFrame ctx={ctx} onSubmit={() => ctx.onDone({ payout })} continueLabel="Finish setup">
      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Clock, t: "Pending", d: "A new sale waits a short time in case the buyer asks for a refund." },
          { icon: Wallet, t: "Available", d: "Then it moves to your balance, ready to withdraw." },
          { icon: Landmark, t: "Paid", d: "Withdraw any time to the payout account you choose." },
        ].map((s, i) => (
          <li key={s.t} className="reveal-in relative rounded-[18px] border-[1.5px] border-line p-4" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="grid size-10 place-items-center rounded-2xl bg-ice text-cobalt"><s.icon className="size-5" aria-hidden="true" /></span>
            <p className="mt-2 font-extrabold text-ink">{s.t}</p>
            <p className="text-sm text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>
      <Choice label="How would you like to be paid? (optional)" options={PAYOUTS} value={payout} onChange={setPayout} />
      <p className="flex items-start gap-2 rounded-[16px] bg-soft p-4 text-sm text-muted-foreground"><CreditCard className="mt-0.5 size-4 shrink-0 text-cobalt" aria-hidden="true" />You'll add the account details from your dashboard when you're ready to withdraw.</p>
    </StepFrame>
  );
}

// ---------- ready ----------

function Ready({ ctx, rec }: { ctx: Ctx; rec: OnboardingRecord | undefined }) {
  const look = lookFor(prefsStore.use().look);
  useEffect(() => {
    demoSession.markWelcomed();
    if (rec && !rec.finishedAt) saveOnboarding(ctx.profile.email, { ...rec, finishedAt: new Date().toISOString() });
  }, [rec, ctx.profile.email]);
  const a = ctx.answers;
  const chips = [...(a.interests ?? []), ...(a.channels ?? []), ...(a.headline ? [a.headline] : [])].slice(0, 6);
  const label = roleLabelOf(ctx.role).toLowerCase();
  return (
    <section aria-labelledby="ready-title" className="screen-in mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-line bg-card shadow-card">
      <div className="bg-brand-panel relative isolate flex items-end gap-4 overflow-hidden px-6 pt-8 sm:px-10">
        <div className="min-w-0 flex-1 pb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-lime">Setup complete</p>
          <h1 id="ready-title" tabIndex={-1} className="mt-2 text-balance text-[28px] font-extrabold leading-tight text-on-dark outline-none sm:text-4xl">You're all set, {ctx.identity.greet}!</h1>
          <p className="mt-3 max-w-sm text-[15px] text-on-dark-muted">Your {label} space is ready. Here are three good places to start.</p>
          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Your choices">
              {chips.map((c) => <li key={c} className="rounded-full bg-on-dark/10 px-2.5 py-1 text-xs font-bold text-on-dark ring-1 ring-on-dark/20">{c}</li>)}
            </ul>
          )}
        </div>
        <CharmFigure look={look} pose="celebrate" then="dance" thenAfter={1600} alt="Charm, the Enski assistant, celebrating" className="h-44 w-auto shrink-0 sm:h-56" />
      </div>
      <div className="grid gap-3 p-5 sm:p-8">
        {FIRST_STEPS[ctx.role].map((s, i) => (
          <Link key={s.title} to={s.to} className="reveal-in group flex items-center gap-4 rounded-[20px] border-[1.5px] border-line p-4 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-sky hover:bg-ice" style={{ animationDelay: `${120 + i * 90}ms` }}>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ice text-cobalt"><s.icon className="size-5" /></span>
            <span className="min-w-0 flex-1"><span className="block font-extrabold text-ink">{s.title}</span><span className="block text-sm text-muted-foreground">{s.text}</span></span>
            <ArrowRight className="size-4 shrink-0 text-cobalt transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
        <Link to={DASHBOARD_HOME[ctx.profile.type]} autoFocus className={`${outcomeButton.primary} mt-3 sm:w-full`}><LayoutDashboard aria-hidden="true" />Go to my {label} dashboard</Link>
        <button type="button" onClick={ctx.onBack} className={cn(outcomeButton.quiet, "mx-auto")}><ArrowLeft aria-hidden="true" />Review my answers</button>
      </div>
    </section>
  );
}
