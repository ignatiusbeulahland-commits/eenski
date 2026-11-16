import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Circle,
  Eye,
  EyeOff,
  Fingerprint,
  GraduationCap,
  Headset,
  Inbox,
  KeyRound,
  Loader2,
  MailOpen,
  Megaphone,
  Presentation,
  } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OutcomeEmblem } from "@/components/shared/outcome";
import { adminStore, suspensionOf } from "@/lib/admin/store";
import { staffSession } from "@/lib/assistant/staff";
import { demoSession } from "@/lib/demo/profile";
import { validEmail } from "@/lib/shared/credentials";
import { saveIdentity } from "@/lib/shared/identity";
import { cleanFullName, fullNameProblem } from "@/lib/shared/names";
import { cn } from "@/lib/utils";
import { dashboardTypeOf, joinRoles, links, phoneCodes, roleLabelOf, type JoinRole } from "../data";
import { checkPassword, isStrongPassword } from "./password";

export type AuthMode = "login" | "register" | "forgot";

const typeIcons: Record<JoinRole, typeof GraduationCap> = {
  learner: GraduationCap,
  creator: Presentation,
  affiliate: Megaphone,
};

const inputCls =
  "h-12 w-full rounded-[14px] border border-line bg-card px-4 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-sky focus:ring-4 focus:ring-sky/15 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15";

const REMEMBER_KEY = "enski:auth:remember";
const JOIN_LINE: Record<JoinRole, string> = {
  learner: "Learn practical skills from creators across Africa and the world.",
  creator: "Sell courses and eBooks, run live training and coaching, and get paid.",
  affiliate: "Share products you believe in and earn commission on every sale.",
};

/** Forms validate, then sign in to a local profile on this tab (frontend-only: no account is created or checked). */
type SignIn = (details?: { name?: string | null; email?: string | null; intent?: "register" | "login" }) => boolean;

export function AuthPanel({
  mode,
  type,
  onMode,
  onType,
}: {
  mode: AuthMode;
  type: JoinRole;
  onMode: (m: AuthMode) => void;
  onType: (t: JoinRole) => void;
}) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const typeLabel = roleLabelOf(type);
  const navigate = useNavigate();

  const signIn: SignIn = (details) => {
    const suspended = details?.email ? suspensionOf(adminStore.get(), details.email) : null;
    if (suspended) {
      setBlocked(details?.email?.trim().toLowerCase() ?? null);
      return false;
    }
    setBlocked(null);
    const intent = mode === "register" ? "register" : "login";
    const p = demoSession.signIn(dashboardTypeOf(type), { intent, ...details });
    saveIdentity(p.email, { role: type, ...(intent === "register" && details?.name ? { fullName: p.name } : {}) });
    // New accounts see "Account created" and onboarding; returning people a short welcome back.
    void navigate({ to: "/welcome" });
    return true;
  };

  const switchMode = (m: AuthMode) => {
    setSentTo(null);
    setBlocked(null);
    onMode(m);
  };

  return (
    <div className="relative z-10 -mt-6 flex min-h-[calc(100dvh-14rem)] flex-col rounded-t-[24px] bg-background px-5 pb-8 pt-7 sm:px-8 lg:mt-0 lg:min-h-dvh lg:rounded-none lg:px-14 lg:pt-7">
      <p className="hidden text-right text-sm font-medium text-muted-foreground lg:block">
        {mode === "register" ? "Already have an account? " : "New to Enski? "}
        <button
          type="button"
          onClick={() => switchMode(mode === "register" ? "login" : "register")}
          className="font-bold text-brand underline-offset-4 hover:underline"
        >
          {mode === "register" ? "Log in" : "Create an account"}
        </button>
      </p>

      <div className="mx-auto my-auto w-full max-w-[460px] py-4 lg:py-10">
        {mode === "forgot" ? (
          sentTo ? null : (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-4" /> Back to log in
            </button>
          )
        ) : (
          <ModeTabs mode={mode} onMode={switchMode} />
        )}

        {mode === "forgot" && sentTo ? (
          <ForgotSent email={sentTo} onBack={() => switchMode("login")} onChange={() => setSentTo(null)} />
        ) : (
          <div key={mode} className="animate-rise">
            <h2 className="mt-7 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink lg:text-[32px]">
              {mode === "login" && "Log in to Enski"}
              {mode === "register" && `Join Enski as ${type === "affiliate" ? "an" : "a"} ${typeLabel.toLowerCase()}`}
              {mode === "forgot" && "Forgot your password?"}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {mode === "login" && "Pick up right where you left off."}
              {mode === "register" && JOIN_LINE[type]}
              {mode === "forgot" && "No problem. Enter the email you signed up with and we'll send you a link to set a new one."}
            </p>

            {mode !== "forgot" && <TypePicker type={type} onType={onType} legend={mode === "login" ? "Log in as" : "I'm joining as"} />}

            {mode !== "forgot" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={googleBusy}
                  className="mt-6 w-full border-line bg-card text-base text-ink hover:bg-soft"
                  onClick={() => {
                    setGoogleBusy(true);
                    window.setTimeout(() => { if (!signIn()) setGoogleBusy(false); }, 700);
                  }}
                >
                  {googleBusy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <GoogleMark />}
                  {googleBusy ? "Connecting to Google…" : "Continue with Google"}
                </Button>
                <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
                </div>
              </>
            )}

            {blocked && mode !== "forgot" && (
              <p role="alert" className="mb-4 flex gap-2.5 rounded-[14px] border border-destructive/40 bg-destructive/10 p-3.5 text-sm font-semibold text-ink">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span>The account {blocked} is suspended, so it can't log in right now. Email support@enski.com and we'll help you sort it out.</span>
              </p>
            )}
            {mode === "login" && <LoginForm onSignIn={signIn} onForgot={() => switchMode("forgot")} />}
            {mode === "register" && <RegisterForm onSignIn={signIn} onLogin={() => switchMode("login")} />}
            {mode === "forgot" && <ForgotForm onDone={setSentTo} />}

            {mode === "login" && (
              <p className="mt-6 text-center text-sm font-medium text-muted-foreground lg:hidden">
                New to Enski?{" "}
                <button type="button" onClick={() => switchMode("register")} className="font-bold text-brand underline-offset-4 hover:underline">Create an account</button>
              </p>
            )}
            {mode === "login" && <StaffLogin />}
            {mode === "login" && (
              <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                Enski team?{" "}
                <Link to="/admin" className="font-bold text-brand underline-offset-4 hover:underline">Open the admin console</Link>
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
        © {new Date().getFullYear()} Enski ·{" "}
        <a href={links.privacy} className="hover:text-brand">Privacy</a> ·{" "}
        <a href={links.terms} className="hover:text-brand">Terms</a> ·{" "}
        <a href={links.faq} className="hover:text-brand">Help</a>
      </p>
    </div>
  );
}

function ModeTabs({ mode, onMode }: { mode: AuthMode; onMode: (m: AuthMode) => void }) {
  return (
    <div role="tablist" aria-label="Log in or register" className="relative grid grid-cols-2 rounded-full bg-soft p-1 ring-1 ring-line">
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-cobalt shadow-float transition-transform duration-300 ease-out motion-reduce:transition-none",
          mode === "register" && "translate-x-full",
        )}
      />
      {(["login", "register"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => onMode(m)}
          className={cn(
            "relative z-10 h-11 rounded-full text-[15px] font-bold transition-colors",
            mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-ink",
          )}
        >
          <span className="inline-flex items-center gap-2">
            {mode === m && <span className="neon-dot" aria-hidden="true" />}
            {m === "login" ? "Log in" : "Register"}
          </span>
        </button>
      ))}
    </div>
  );
}

function TypePicker({ type, onType, legend }: { type: JoinRole; onType: (t: JoinRole) => void; legend: string }) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-2.5 text-sm font-bold text-ink">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className="grid grid-cols-3 gap-2.5">
        {joinRoles.map(({ id, label, blurb }) => {
          const Icon = typeIcons[id];
          const active = id === type;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onType(id)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-[14px] border p-3 text-left transition-all",
                active ? "border-cobalt bg-ice ring-4 ring-cobalt/10" : "border-line bg-card hover:-translate-y-0.5 hover:border-sky",
              )}
            >
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", active ? "bg-cobalt text-lime" : "bg-ice text-brand")}>
                <Icon className="size-[18px]" strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-extrabold text-ink">{label}</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{blurb}</span>
              </span>
              {active && (
                <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-cobalt text-lime">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({ label, required, children, id, error, hint }: { label: string; required?: boolean; children: ReactNode; id: string; error?: string | null | undefined; hint?: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="text-destructive" aria-hidden="true"> *</span>}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn("mt-1.5 flex items-start gap-1.5 text-xs", error ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {error && <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />}
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  describedBy,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
  describedBy?: string | undefined;
  invalid?: boolean | undefined;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={cn(inputCls, "pr-24")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-brand hover:bg-ice"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

const emailProblem = (email: string) => (!email.trim() ? "Enter your email address" : validEmail(email) ? null : "Enter a valid email, like name@example.com");

function focusFirst(ids: (string | false)[]) {
  const id = ids.find(Boolean);
  if (id) document.getElementById(id)?.focus();
}

function LoginForm({ onSignIn, onForgot }: { onSignIn: SignIn; onForgot: () => void }) {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY);
      if (saved) setEmail(saved);
    } catch {
      /* storage blocked */
    }
    return () => window.clearTimeout(timer.current);
  }, []);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = { email: emailProblem(email), password: password ? null : "Enter your password" };
    setErrors(next);
    if (next.email || next.password) {
      focusFirst([!!next.email && `${uid}-email`, !!next.password && `${uid}-pw`]);
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(() => {
      try {
        if (remember) window.localStorage.setItem(REMEMBER_KEY, email.trim().toLowerCase());
        else window.localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* storage blocked */
      }
      if (!onSignIn({ email, intent: "login" })) setBusy(false);
    }, 850);
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-busy={busy}>
      <Field label="Email address" required id={`${uid}-email`} error={errors.email}>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((v) => ({ ...v, email: null })); }}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={errors.email ? `${uid}-email-msg` : undefined}
          className={inputCls}
        />
      </Field>
      <Field label="Password" required id={`${uid}-pw`} error={errors.password}>
        <PasswordInput
          id={`${uid}-pw`}
          value={password}
          onChange={(v) => { setPassword(v); if (errors.password) setErrors((x) => ({ ...x, password: null })); }}
          autoComplete="current-password"
          placeholder="Enter your password"
          invalid={!!errors.password}
          describedBy={errors.password ? `${uid}-pw-msg` : undefined}
        />
      </Field>
      <div className="flex items-center justify-between gap-3 pt-1">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            className="size-5 rounded-[6px] border-line data-[state=checked]:border-cobalt data-[state=checked]:bg-cobalt"
          />
          Remember me
        </label>
        <button type="button" onClick={onForgot} className="text-sm font-bold text-brand underline-offset-4 hover:underline">
          Forgot password?
        </button>
      </div>
      <div className="flex gap-2.5 pt-2">
        <Button type="submit" size="lg" className="flex-1" disabled={busy}>
          {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Logging you in…</> : "Log in"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="w-14 shrink-0 px-0"
          aria-label="Log in with a passkey or fingerprint"
          title="Log in with a passkey"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            timer.current = window.setTimeout(() => { if (!onSignIn(email.trim() && validEmail(email) ? { email, intent: "login" } : undefined)) setBusy(false); }, 850);
          }}
        >
          <Fingerprint className="size-6" />
        </Button>
      </div>
    </form>
  );
}

type RegisterErrors = { name?: string | null; email?: string | null; password?: string | null; confirm?: string | null; terms?: string | null };

function RegisterForm({ onSignIn, onLogin }: { onSignIn: SignIn; onLogin: () => void }) {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const checks = checkPassword(password);
  const clear = (k: keyof RegisterErrors) => errors[k] && setErrors((v) => ({ ...v, [k]: null }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    const clean = cleanFullName(name);
    const next: RegisterErrors = {
      name: fullNameProblem(clean),
      email: emailProblem(email),
      password: !password ? "Create a password" : isStrongPassword(password) ? null : "Your password needs all three things below",
      confirm: !confirm ? "Type your password again" : confirm === password ? null : "The passwords don't match. Type the same one in both boxes.",
      terms: terms ? null : "Tick the box to agree to the Terms and Privacy policy",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      focusFirst([!!next.name && `${uid}-name`, !!next.email && `${uid}-email`, !!next.password && `${uid}-pw`, !!next.confirm && `${uid}-pw2`, !!next.terms && `${uid}-terms`]);
      return;
    }
    setName(clean);
    setBusy(true);
    window.setTimeout(() => { if (!onSignIn({ name: clean, email, intent: "register" })) setBusy(false); }, 600);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate aria-busy={busy}>
      <Field label="Full name" required id={`${uid}-name`} error={errors.name} hint="Your first and last name in one box, e.g. Beulahland Ignatius.">
        <input
          id={`${uid}-name`}
          name="fullName"
          autoComplete="name"
          placeholder="Your full name"
          maxLength={80}
          value={name}
          onChange={(e) => { setName(e.target.value); clear("name"); }}
          onBlur={() => setName((v) => cleanFullName(v))}
          aria-invalid={!!errors.name || undefined}
          aria-describedby={`${uid}-name-msg`}
          className={inputCls}
        />
      </Field>
      <Field label="Email address" required id={`${uid}-email`} error={errors.email} hint="We'll send your receipts and certificates here.">
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clear("email"); }}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={`${uid}-email-msg`}
          className={inputCls}
        />
      </Field>
      <Field label="Phone number" id={`${uid}-phone`} hint="Optional. Handy for event reminders.">
        <div className="flex gap-2">
          <select aria-label="Country code" defaultValue="+234" className={cn(inputCls, "w-[112px] shrink-0 cursor-pointer px-3")}>
            {phoneCodes.map((p) => (
              <option key={p.code} value={p.code} label={`${p.iso} ${p.code}`}>
                {p.iso} {p.code} · {p.country}
              </option>
            ))}
          </select>
          <input id={`${uid}-phone`} type="tel" autoComplete="tel-national" placeholder="801 234 5678" aria-describedby={`${uid}-phone-msg`} className={inputCls} />
        </div>
      </Field>
      <Field label="Create a password" required id={`${uid}-pw`} error={errors.password}>
        <PasswordInput
          id={`${uid}-pw`}
          value={password}
          onChange={(v) => { setPassword(v); clear("password"); }}
          autoComplete="new-password"
          placeholder="Create a strong password"
          describedBy={`${uid}-rules${errors.password ? ` ${uid}-pw-msg` : ""}`}
          invalid={!!errors.password}
        />
      </Field>
      <ul id={`${uid}-rules`} aria-label="Password needs" className="grid gap-1.5 rounded-[14px] bg-soft p-3.5 text-sm font-semibold">
        {checks.map((c) => (
          <li key={c.id} className={cn("flex items-center gap-2 transition-colors", c.met ? "text-brand" : tried ? "text-destructive" : "text-muted-foreground")}>
            {c.met ? (
              <span className="grid size-4 place-items-center rounded-full bg-cobalt text-primary-foreground">
                <Check className="size-2.5" strokeWidth={3.5} />
              </span>
            ) : (
              <Circle className="size-4" strokeWidth={2} />
            )}
            {c.label}
            <span className="sr-only">{c.met ? "(done)" : "(not yet)"}</span>
          </li>
        ))}
      </ul>
      <Field label="Confirm password" required id={`${uid}-pw2`} error={errors.confirm} hint={confirm && confirm === password ? "Passwords match" : undefined}>
        <PasswordInput
          id={`${uid}-pw2`}
          value={confirm}
          onChange={(v) => { setConfirm(v); clear("confirm"); }}
          autoComplete="new-password"
          placeholder="Type it again"
          invalid={!!errors.confirm}
          describedBy={`${uid}-pw2-msg`}
        />
      </Field>
      <div>
        <label className={cn("flex cursor-pointer items-start gap-3 rounded-[14px] border p-3.5 text-[13px] leading-relaxed text-muted-foreground transition-colors", errors.terms ? "border-destructive bg-destructive/5" : "border-line")}>
          <Checkbox
            id={`${uid}-terms`}
            checked={terms}
            onCheckedChange={(v) => { setTerms(v === true); clear("terms"); }}
            aria-invalid={!!errors.terms || undefined}
            aria-describedby={errors.terms ? `${uid}-terms-msg` : undefined}
            className="mt-0.5 size-5 shrink-0 rounded-[6px] border-line data-[state=checked]:border-cobalt data-[state=checked]:bg-cobalt"
          />
          <span>
            I agree to Enski's{" "}
            <a href={links.terms} className="font-bold text-brand hover:underline">Terms of use</a> and{" "}
            <a href={links.privacy} className="font-bold text-brand hover:underline">Privacy policy</a>, including the{" "}
            <a href={links.cookies} className="font-bold text-brand hover:underline">use of cookies</a>.
          </span>
        </label>
        {errors.terms && (
          <p id={`${uid}-terms-msg`} className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-destructive">
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {errors.terms}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Creating your account…</> : "Create my account"}
      </Button>
      <p className="text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onLogin} className="font-bold text-brand underline-offset-4 hover:underline">Log in</button>
      </p>
    </form>
  );
}

/** Support staff open the Support dashboard (local sign-in on this tab). */
function StaffLogin() {
  const uid = useId();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-[18px] border border-line bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-staff`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-ice text-brand">
          <Headset className="size-[18px]" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-ink">Support staff</span>
          <span className="block text-xs font-medium text-muted-foreground">Log in to the Support dashboard to answer chats and tickets</span>
        </span>
        <span className="text-sm font-bold text-brand">{open ? "Hide" : "Open"}</span>
      </button>
      {open && (
        <form
          id={`${uid}-staff`}
          className="space-y-3 border-t border-line p-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const name = String(f.get("staffName") ?? "");
            staffSession.signIn(name, String(f.get("staffEmail") ?? ""));
            toast(`Signed in to the support desk as ${name.trim() || "Support agent"}`);
            void navigate({ to: "/support/dashboard" });
          }}
        >
          <Field label="Your name" required id={`${uid}-sn`}>
            <input id={`${uid}-sn`} name="staffName" required autoComplete="name" placeholder="Amaka Obi" className={inputCls} />
          </Field>
          <Field label="Work email" required id={`${uid}-se`}>
            <input id={`${uid}-se`} name="staffEmail" type="email" required autoComplete="email" placeholder="you@enski.com" className={inputCls} />
          </Field>
          <Button type="submit" variant="secondary" className="w-full">
            Open Support dashboard
          </Button>
        </form>
      )}
    </div>
  );
}

function ForgotForm({ onDone }: { onDone: (email: string) => void }) {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  return (
    <form
      noValidate
      aria-busy={sending}
      onSubmit={(e) => {
        e.preventDefault();
        const problem = emailProblem(email);
        setError(problem);
        setFailed(false);
        if (problem) { document.getElementById(`${uid}-email`)?.focus(); return; }
        setSending(true);
        window.setTimeout(() => {
          // Offline: the request can't go out, so say so and keep what they typed.
          if (typeof navigator !== "undefined" && navigator.onLine === false) { setSending(false); setFailed(true); return; }
          onDone(email.trim().toLowerCase());
        }, 1100);
      }}
      className="mt-6 space-y-4"
    >
      {failed && (
        <p role="alert" className="flex gap-2.5 rounded-[14px] border border-destructive/40 bg-destructive/10 p-3.5 text-sm font-semibold text-ink">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>We couldn't send the link because you're offline. Check your connection, then try again.</span>
        </p>
      )}
      <Field label="Email address" required id={`${uid}-email`} error={error} hint="Use the email you signed up with.">
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
          aria-invalid={!!error || undefined}
          aria-describedby={`${uid}-email-msg`}
          className={inputCls}
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={sending}>
        {sending ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending your link…</> : failed ? "Try again" : "Send reset link"}
      </Button>
    </form>
  );
}

const RESEND_AFTER = 30;
const NEXT_STEPS = [
  { icon: Inbox, text: "Open the email from Enski. Check spam or promotions if it isn't in your inbox." },
  { icon: MailOpen, text: "Tap \"Set a new password\". The link works for 30 minutes." },
  { icon: KeyRound, text: "Choose your new password, then log in with it." },
];
/** Confirmation after asking for a reset link: what happens next, resend (after a short wait) and a way back. */
function ForgotSent({ email, onBack, onChange }: { email: string; onBack: () => void; onChange: () => void }) {
  const [wait, setWait] = useState(RESEND_AFTER);
  const [resent, setResent] = useState(0);
  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);
  return (
    <section aria-labelledby="sent-title" className="screen-in mt-2 text-center">
      <OutcomeEmblem tone="success" />
      <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Reset link sent</p>
      <h2 id="sent-title" tabIndex={-1} className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink outline-none">Check your email</h2>
      <p role="status" className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
        If <b className="break-all text-ink">{email}</b> has an Enski account, a link to reset your password is on its way.
      </p>
      <ol className="mx-auto mt-6 max-w-sm space-y-3 rounded-[18px] bg-soft p-4 text-left text-sm text-ink">
        {NEXT_STEPS.map((s, i) => (
          <li key={s.text} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cobalt text-xs font-extrabold text-primary-foreground" aria-hidden="true">{i + 1}</span>
            <span className="pt-0.5 font-medium">{s.text}</span>
          </li>
        ))}
      </ol>
      <div className="mt-7 grid gap-2.5">
        <Button type="button" size="lg" onClick={onBack} autoFocus>
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to log in
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={wait > 0}
          onClick={() => { setResent((n) => n + 1); setWait(RESEND_AFTER); toast.success("We sent another link", { description: email }); }}
        >
          {wait > 0 ? `Resend link in ${wait}s` : resent ? "Resend again" : "Resend link"}
        </Button>
        <button type="button" onClick={onChange} className="mt-1 text-sm font-bold text-brand underline-offset-4 hover:underline">Use a different email</button>
      </div>
    </section>
  );
}

/** Google's own four-colour "G" — a third-party brand mark, so it keeps Google's colours. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
