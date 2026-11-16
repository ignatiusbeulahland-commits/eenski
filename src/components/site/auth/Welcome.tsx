import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { CharmFigure } from "@/components/assistant/CharmFigure";
import { lookFor } from "@/components/assistant/looks";
import { FocusShell, OutcomeScreen, ProcessingScreen, outcomeButton, useProcessing } from "@/components/shared/outcome";
import { dashboardTypeOf, roleLabelOf, type JoinRole } from "@/components/site/data";
import { prefsStore } from "@/lib/assistant/store";
import { DASHBOARD_HOME } from "@/lib/dashboard/account";
import { currentWelcomeKind, demoSession, useDemoProfile, type DemoProfile } from "@/lib/demo/profile";
import { progressOf, resumeIndex, stepsFor } from "@/lib/onboarding/flows";
import { useOnboardingRecord } from "@/lib/onboarding/store";
import { partOfDay } from "@/lib/shared/greeting";
import { useIdentity, type ResolvedIdentity } from "@/lib/shared/identity";

const CREATING = (role: string) => ["Creating your account", `Setting up your ${role} space`, "Personalising your welcome"];

/** The role someone joined as, kept in step with the dashboard they're signed in to. */
export function joinRoleOf(profile: DemoProfile, identity: ResolvedIdentity | null): JoinRole {
  const r = identity?.role;
  return r && dashboardTypeOf(r) === profile.type ? r : profile.type;
}

/** After sign-up: creating → account created (personal welcome) → onboarding. After log in: welcome back, then the dashboard. */
export function WelcomeJourney() {
  const profile = useDemoProfile();
  const identity = useIdentity();
  const navigate = useNavigate();
  const [kind, setKind] = useState<"new" | "returning" | null>(null);
  useEffect(() => setKind(currentWelcomeKind()), []);
  const [checked, setChecked] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setChecked(true), 300); return () => window.clearTimeout(t); }, []);
  useEffect(() => { if (checked && !profile) void navigate({ to: "/auth", replace: true }); }, [checked, profile, navigate]);
  if (!profile || !identity || !kind) return <FocusShell><div className="min-h-[60vh]" /></FocusShell>;
  const role = joinRoleOf(profile, identity);
  return (
    <FocusShell back={<span />}>
      {kind === "new" ? <NewAccount profile={profile} identity={identity} role={role} /> : <WelcomeBack profile={profile} identity={identity} role={role} />}
    </FocusShell>
  );
}

function NewAccount({ profile, identity, role }: { profile: DemoProfile; identity: ResolvedIdentity; role: JoinRole }) {
  const [created, setCreated] = useState(false);
  const label = roleLabelOf(role).toLowerCase();
  const steps = CREATING(label);
  const p = useProcessing(steps.length, () => setCreated(true), 850);
  if (!created) return <ProcessingScreen title="Creating your account" message={`This only takes a moment, ${identity.greet}.`} steps={steps} active={p.active} />;
  const setup = stepsFor(role);
  return (
    <OutcomeScreen
      tone="success"
      eyebrow="Account created"
      title={`Welcome to Enski, ${identity.greet}!`}
      message="Your next opportunity starts here. Let's get your space ready."
      details={[
        { label: "Full name", value: identity.fullName },
        { label: "Email", value: profile.email },
        { label: "Joined as", value: roleLabelOf(role) },
      ]}
      actions={<>
        <Link to="/onboarding" autoFocus className={outcomeButton.primary}>Continue<ArrowRight aria-hidden="true" /></Link>
      </>}
      moreActions={
        <Link to={DASHBOARD_HOME[profile.type]} onClick={() => demoSession.markWelcomed()} className={outcomeButton.quiet}>Skip for now</Link>
      }
      footer="You can finish setting up later, and change your names any time in Settings."
    >
      <section aria-labelledby="next-title" className="mt-6 rounded-[20px] border border-line p-4 text-left sm:p-5">
        <h2 id="next-title" className="flex items-center gap-2 text-sm font-extrabold text-ink"><ListChecks className="size-4 text-cobalt" aria-hidden="true" />What happens next</h2>
        <p className="mt-1 text-sm text-muted-foreground">Three quick steps to set up your {label} space. It takes about two minutes.</p>
        <ol className="mt-4 grid gap-2.5">
          {setup.map((s, i) => (
            <li key={s.id} className="reveal-in flex items-start gap-3" style={{ animationDelay: `${150 + i * 90}ms` }}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ice text-xs font-extrabold text-cobalt" aria-hidden="true">{i + 1}</span>
              <span className="pt-0.5"><span className="block text-sm font-extrabold text-ink">{s.short}</span><span className="block text-sm text-muted-foreground">{s.intro}</span></span>
            </li>
          ))}
        </ol>
      </section>
    </OutcomeScreen>
  );
}

const BACK_MS = 3200;
function WelcomeBack({ profile, identity, role }: { profile: DemoProfile; identity: ResolvedIdentity; role: JoinRole }) {
  const navigate = useNavigate();
  const look = lookFor(prefsStore.use().look);
  const rec = useOnboardingRecord(profile.email);
  const progress = progressOf(rec, role);
  // Only people who started setup and stopped part-way are offered to finish it.
  const unfinished = !!rec && rec.role === role && !progress.complete;
  const [paused, setPaused] = useState(false);
  const waiting = paused || unfinished;
  useEffect(() => { demoSession.markWelcomed(); }, []);
  useEffect(() => {
    if (waiting) return;
    const t = window.setTimeout(() => void navigate({ to: DASHBOARD_HOME[profile.type], replace: true }), BACK_MS);
    return () => window.clearTimeout(t);
  }, [waiting, navigate, profile.type]);
  const next = stepsFor(role)[resumeIndex(rec, role)];
  return (
    <section aria-labelledby="back-title" className="screen-in mx-auto max-w-xl overflow-hidden rounded-[28px] border border-line bg-card text-center shadow-card">
      <div className="bg-brand-panel relative grid place-items-center px-6 pt-8">
        <CharmFigure look={look} pose="wave" then="idle" thenAfter={3400} alt="Charm, the Enski assistant, waving" className="h-40 w-auto sm:h-48" />
      </div>
      <div className="px-6 pb-8 pt-6 sm:px-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Good {partOfDay()}</p>
        <h1 id="back-title" className="mt-2 text-[28px] font-extrabold leading-tight text-ink sm:text-[32px]">Welcome back, {identity.greet}!</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {unfinished ? "You're nearly set up. Pick up where you left off, or go straight to your dashboard." : paused ? "Take your time." : `Opening your ${roleLabelOf(role).toLowerCase()} dashboard…`}
        </p>
        {!waiting && <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-soft" aria-hidden="true"><div className="welcome-countdown h-full rounded-full bg-cobalt" style={{ animationDuration: `${BACK_MS}ms` }} /></div>}
        {unfinished && (
          <div className="mx-auto mt-5 max-w-sm rounded-[18px] border border-line bg-soft/60 p-4 text-left">
            <div className="flex items-center justify-between text-sm"><span className="font-extrabold text-ink">Setup</span><span className="font-bold text-muted-foreground">{progress.done} of {progress.total} done</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true"><div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>
            {next && <p className="mt-2 text-xs text-muted-foreground">Next: {next.short}</p>}
          </div>
        )}
        <div className="outcome-actions mt-6 grid gap-2.5 sm:flex sm:flex-row-reverse sm:justify-center">
          {unfinished ? (
            <>
              <Link to="/onboarding" className={outcomeButton.primary}>Finish setting up<ArrowRight aria-hidden="true" /></Link>
              <Link to={DASHBOARD_HOME[profile.type]} className={outcomeButton.secondary}><LayoutDashboard aria-hidden="true" />Go to my dashboard</Link>
            </>
          ) : (
            <>
              <Link to={DASHBOARD_HOME[profile.type]} className={outcomeButton.primary}><LayoutDashboard aria-hidden="true" />Go to my dashboard</Link>
              {!paused && <button type="button" className={outcomeButton.secondary} onClick={() => setPaused(true)}>Stay here</button>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
