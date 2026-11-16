import { Link } from "@tanstack/react-router";
import { SectionNavDropdown } from "@/components/shared/SectionDropdown";
import { PageTopRight } from "@/components/shared/BackBar";
import type { LucideIcon } from "lucide-react";
import { Check, CheckCircle2, ChevronsUpDown, Circle, Eye, EyeOff, FileText, Info, Loader2, Search, ShieldCheck, Upload, X } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Switch } from "@/components/dashboard-ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/dashboard-ui/command";
import { Input } from "@/components/dashboard-ui/input";
import { BrandIcon, iconArtwork } from "@/components/affiliate/BrandIcon";
import { bankGroupLabels, nigerianBanks, popularBankNames, type NigerianBankGroup } from "@/lib/shared/banks-ng";
import { passwordStrength } from "@/lib/shared/password";
import { cn } from "@/lib/utils";

/**
 * Shared, presentation-only settings building blocks for Affiliate, Creator and Learner.
 * Each role keeps its own state, validation and saving; these only render.
 */

export type SettingsTab = { label: string; to: string };

export function SettingsPage({ icon: Icon, title, description, status, tabs, children }: {
  icon: LucideIcon;
  title: string;
  description: string;
  status?: ReactNode;
  tabs: readonly SettingsTab[];
  children: ReactNode;
}) {
  const art = iconArtwork.get(Icon);
  return (
    <div className="settings-page">
      <header className="settings-hero surface relative mb-5 overflow-hidden p-5 sm:p-6">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          {art ? (
            <BrandIcon src={art} className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-ice text-cobalt ring-1 ring-line"><Icon className="h-6 w-6" /></span>
          )}
          <div className="min-w-0 flex-1">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Settings</p>
            <h1 className="text-2xl text-foreground sm:text-[28px]">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{description}</p>
          </div>
          {status && <div className="shrink-0">{status}</div>}
        </div>
      </header>
      <PageTopRight><SectionNavDropdown compact heading="Settings section" links={tabs.map((t) => ({ ...t, exact: true }))} className="min-w-0 max-w-full" /></PageTopRight>
      <nav aria-label="Settings sections" className="settings-tabs mb-6 hidden md:block">
        <ul className="inline-flex max-w-full flex-wrap gap-1 rounded-[22px] border bg-card p-1">
          {tabs.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to as "/"}
                activeOptions={{ exact: true }}
                className="lime-pip block whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-ice hover:text-cobalt data-[status=active]:bg-cobalt data-[status=active]:text-primary-foreground"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </div>
  );
}

export function SettingsGrid({ main, side }: { main: ReactNode; side?: ReactNode }) {
  if (!side) return <div className="space-y-6">{main}</div>;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">{main}</div>
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">{side}</aside>
    </div>
  );
}

export function SettingsCard({ icon: Icon, title, description, actions, children, footer, className, bodyClassName }: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("surface settings-card overflow-hidden", className)}>
      <header className="flex items-start gap-3 border-b px-5 py-4 sm:px-6">
        {Icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt ring-1 ring-line" aria-hidden="true"><Icon className="h-[18px] w-[18px]" /></span>}
        <div className="min-w-0 flex-1 self-center">
          <h2 className="flex items-center gap-2.5 text-[15px] font-extrabold"><span className="lime-tick" aria-hidden="true" />{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="shrink-0 self-center">{actions}</div>}
      </header>
      <div className={cn("p-5 sm:p-6", bodyClassName)}>{children}</div>
      {footer && <div className="flex flex-col-reverse gap-2 border-t bg-soft/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">{footer}</div>}
    </section>
  );
}

export function ToggleRow({ id, title, description, checked, onChange, icon: Icon, disabled }: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-soft/60 sm:px-6">
      {Icon && <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[12px] transition-colors", checked ? "bg-cobalt text-primary-foreground" : "bg-soft text-muted-foreground")} aria-hidden="true"><Icon className="h-4 w-4" /></span>}
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-[13px] text-muted-foreground">{description}</span>
      </label>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

/** A titled group of toggles inside one card. */
export function ToggleGroupCard({ icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: ReactNode }) {
  return (
    <SettingsCard icon={icon} title={title} description={description} bodyClassName="p-0 divide-y">
      {children}
    </SettingsCard>
  );
}

/** Small guidance card for the side column. */
export function SettingsTip({ icon: Icon = Info, title, items }: { icon?: LucideIcon; title: string; items: string[] }) {
  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold"><Icon className="h-4 w-4 text-cobalt" aria-hidden="true" />{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-[13px] text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />{t}</li>
        ))}
      </ul>
    </section>
  );
}

/** Summary of how many preferences are on. */
export function PreferenceSummary({ on, total, label }: { on: number; total: number; label: string }) {
  const pct = total ? Math.round((on / total) * 100) : 0;
  return (
    <section className="surface p-5">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{on}<span className="text-base text-muted-foreground"> / {total} on</span></p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Passwords

export function PasswordInput({ id, value, onChange, autoComplete, invalid, placeholder }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={invalid || undefined} placeholder={placeholder} className="pr-12" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[12px] text-muted-foreground transition-colors hover:bg-ice hover:text-cobalt" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const s = passwordStrength(value);
  const tone = ["bg-line", "bg-destructive", "bg-warning", "bg-sky", "bg-success"][s.score] ?? "bg-line";
  return (
    <div className="space-y-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => <span key={n} className={cn("h-1.5 rounded-full transition-colors duration-300", value && s.score >= n ? tone : "bg-soft")} />)}
        </div>
        <span className="w-20 text-right text-xs font-bold text-muted-foreground">{value ? s.label : "Strength"}</span>
      </div>
      <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {s.checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-1.5 text-xs font-semibold", c.ok ? "text-success" : "text-muted-foreground")}>
            {c.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}{c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SessionRow({ icon: Icon, title, detail, current }: { icon: LucideIcon; title: string; detail: string; current?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt" aria-hidden="true"><Icon className="h-[18px] w-[18px]" /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{title}</p><p className="text-[13px] text-muted-foreground">{detail}</p></div>
      {current && <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success"><span className="h-1.5 w-1.5 rounded-full bg-current" />Active now</span>}
    </div>
  );
}

export function currentBrowser() {
  if (typeof navigator === "undefined") return "This browser";
  const ua = navigator.userAgent;
  const b = /Edg/.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${b} on ${os}` : b;
}

// ---------------------------------------------------------------- Banks

const tints = ["bg-ice text-cobalt", "bg-sky-200 text-cobalt-press", "bg-cobalt text-primary-foreground", "bg-midnight text-lime"];
export function BankMonogram({ name, className }: { name: string; className?: string }) {
  const words = name.replace(/\(.*?\)/g, "").split(/\s+/).filter((w) => /^[A-Za-z0-9]/.test(w) && !/^(of|and|the|bank|plc|ltd|limited)$/i.test(w));
  const initials = (words.slice(0, 2).map((w) => w[0]).join("") || name.slice(0, 2)).toUpperCase();
  const tint = tints[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % tints.length];
  return <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-[11px] font-extrabold", tint, className)} aria-hidden="true">{initials}</span>;
}

const groupOrder: NigerianBankGroup[] = ["commercial", "digital", "microfinance", "mortgage", "other"];

export function BankPicker({ id, value, onChange, invalid }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const popular = useMemo(() => popularBankNames.filter((n) => nigerianBanks.some((b) => b.name === n)), []);
  const pick = (name: string) => { onChange(name); setOpen(false); };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className="flex h-12 w-full items-center gap-3 rounded-[14px] border-[1.5px] border-input bg-card px-3 text-left text-sm font-medium transition-[border-color,box-shadow] hover:border-cobalt-100 focus-visible:border-cobalt focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ice aria-[invalid=true]:border-destructive"
        >
          {value ? <BankMonogram name={value} /> : <Search className="ml-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          <span className={cn("min-w-0 flex-1 truncate", !value && "text-muted-foreground")}>{value || "Search or choose your bank"}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${nigerianBanks.length} banks…`} />
          <CommandList className="max-h-80">
            <CommandEmpty>No bank matches that search.</CommandEmpty>
            <CommandGroup heading="Popular">
              {popular.map((n) => (
                <CommandItem key={`p-${n}`} value={`popular ${n}`} keywords={[n]} onSelect={() => pick(n)} className="gap-3">
                  <BankMonogram name={n} className="h-7 w-7" /><span className="min-w-0 flex-1 truncate">{n}</span>{value === n && <Check className="h-4 w-4 text-cobalt" />}
                </CommandItem>
              ))}
            </CommandGroup>
            {groupOrder.map((g) => (
              <CommandGroup key={g} heading={bankGroupLabels[g]}>
                {nigerianBanks.filter((b) => b.group === g).map((b) => (
                  <CommandItem key={b.code + b.name} value={b.name} onSelect={() => pick(b.name)} className="gap-3">
                    <BankMonogram name={b.name} className="h-7 w-7" /><span className="min-w-0 flex-1 truncate">{b.name}</span>{value === b.name && <Check className="h-4 w-4 text-cobalt" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const formatNuban = (n: string) => n.replace(/\D/g, "").replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));

/** The saved payout account, shown as a card. */
export function BankCard({ bank, holder, masked, onEdit }: { bank: string; holder: string; masked: string; onEdit: () => void }) {
  return (
    <section className="bg-brand-panel relative overflow-hidden rounded-[24px] p-5 text-on-dark sm:p-6" data-surface="dark" aria-label="Payout account">
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <BankMonogram name={bank} className="h-11 w-11 rounded-[14px] text-sm" />
          <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.12em] text-on-dark-muted">Payout account</p><p className="truncate text-lg font-extrabold">{bank}</p></div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 text-xs font-extrabold text-midnight"><ShieldCheck className="h-3.5 w-3.5" />Saved</span>
      </div>
      <p className="relative mt-8 font-mono text-xl font-bold tracking-[0.18em] sm:text-2xl">{masked}</p>
      <div className="relative mt-4 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs text-on-dark-muted">Account name</p><p className="font-bold">{holder}</p></div>
        <button type="button" onClick={onEdit} className="rounded-full border-[1.5px] border-on-dark/30 px-4 py-2 text-sm font-extrabold text-on-dark transition-colors hover:border-lime hover:text-lime">Change account</button>
      </div>
    </section>
  );
}

export type BankDraft = { bank: string; account: string; holder: string };
export function validateBankDraft(d: BankDraft) {
  const e: Partial<Record<keyof BankDraft, string>> = {};
  if (!d.bank) e.bank = "Choose your bank";
  if (!/^\d{10}$/.test(d.account)) e.account = "Enter your 10-digit NUBAN account number";
  if (d.holder.trim().length < 3) e.holder = "Enter the name on the account";
  return e;
}

/** Bank, NUBAN and account name with a check-and-confirm step before saving. */
export function BankAccountForm({ initial, onSave, onCancel, saveLabel = "Save bank account" }: { initial: BankDraft; onSave: (d: BankDraft) => void; onCancel?: (() => void) | undefined; saveLabel?: string }) {
  const [d, setD] = useState(initial);
  const [err, setErr] = useState<Partial<Record<keyof BankDraft, string>>>({});
  const [stage, setStage] = useState<"edit" | "checking" | "review">("edit");
  const [own, setOwn] = useState(false);
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const er = validateBankDraft(d);
    setErr(er);
    if (Object.keys(er).length) return;
    setStage("checking");
    setTimeout(() => setStage("review"), 700);
  };
  const set = (p: Partial<BankDraft>) => { setD({ ...d, ...p }); setStage("edit"); setOwn(false); };
  return (
    <form onSubmit={check} noValidate className="surface overflow-hidden">
      <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
        <ol className="flex items-center gap-2 text-xs font-bold" aria-label="Steps">
          {["Account details", "Review & save"].map((s, i) => {
            const done = i === 0 ? stage === "review" : false;
            const cur = i === 0 ? stage !== "review" : stage === "review";
            return (
              <li key={s} className="flex items-center gap-2">
                {i > 0 && <span className="h-px w-6 bg-line" aria-hidden="true" />}
                <span className={cn("grid h-6 w-6 place-items-center rounded-full", done ? "bg-success text-primary-foreground" : cur ? "bg-cobalt text-primary-foreground" : "bg-soft text-muted-foreground")}>{done ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <span className={cn(cur ? "text-foreground" : "text-muted-foreground")} aria-current={cur ? "step" : undefined}>{s}</span>
              </li>
            );
          })}
        </ol>
      </header>
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="bank-picker" className="text-[13px] font-bold">Bank</label>
          <BankPicker id="bank-picker" value={d.bank} onChange={(v) => set({ bank: v })} invalid={!!err.bank} />
          {err.bank ? <p className="text-xs font-semibold text-destructive">{err.bank}</p> : <p className="text-xs text-muted-foreground">Commercial, digital and microfinance banks that accept transfers.</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="bank-account" className="text-[13px] font-bold">Account number</label>
          <div className="relative">
            <Input id="bank-account" inputMode="numeric" autoComplete="off" maxLength={13} value={formatNuban(d.account)} aria-invalid={!!err.account || undefined} onChange={(e) => set({ account: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="012 345 6789" className="pr-16 font-mono tracking-wider" />
            <span className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold tabular-nums", d.account.length === 10 ? "text-success" : "text-muted-foreground")}>{d.account.length}/10</span>
          </div>
          {err.account ? <p className="text-xs font-semibold text-destructive">{err.account}</p> : <p className="text-xs text-muted-foreground">Your 10-digit NUBAN.</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="bank-holder" className="text-[13px] font-bold">Account name</label>
          <Input id="bank-holder" autoComplete="name" value={d.holder} aria-invalid={!!err.holder || undefined} onChange={(e) => set({ holder: e.target.value })} placeholder="As it appears on your bank account" />
          {err.holder ? <p className="text-xs font-semibold text-destructive">{err.holder}</p> : <p className="text-xs text-muted-foreground">Must match the name on your ID.</p>}
        </div>
        {stage === "review" && (
          <div className="rounded-[18px] border-[1.5px] border-cobalt-100 bg-ice/60 p-4 sm:col-span-2" role="status">
            <p className="flex items-center gap-2 text-sm font-extrabold text-cobalt"><CheckCircle2 className="h-4 w-4" />Check these details</p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-muted-foreground">Bank</dt><dd className="font-bold">{d.bank}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Account number</dt><dd className="font-mono font-bold">{formatNuban(d.account)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Account name</dt><dd className="font-bold">{d.holder.trim()}</dd></div>
            </dl>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13px] font-semibold">
              <input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--cobalt)]" />
              This account is in my name and the details are correct.
            </label>
          </div>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-soft/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
        {onCancel && <button type="button" onClick={onCancel} className="inline-flex h-11 items-center justify-center rounded-full border-[1.5px] border-line bg-card px-5 text-sm font-extrabold hover:border-cobalt-100 hover:bg-ice hover:text-cobalt">Cancel</button>}
        {stage === "review" ? (
          <button type="button" disabled={!own} onClick={() => onSave({ ...d, holder: d.holder.trim() })} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-cobalt-hover disabled:bg-cobalt-100 disabled:text-cobalt-300"><ShieldCheck className="h-4 w-4" />{saveLabel}</button>
        ) : (
          <button type="submit" disabled={stage === "checking"} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-cobalt-hover disabled:bg-cobalt-100 disabled:text-cobalt-300">{stage === "checking" ? <><Loader2 className="h-4 w-4 animate-spin" />Checking…</> : "Continue"}</button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- Verification

export function DocumentDrop({ id, file, onFile, error, hint = "PDF, JPG or PNG · up to 5 MB" }: { id: string; file: File | null; onFile: (f: File | null) => void; error?: string | undefined; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-[18px] border-[1.5px] border-success/40 bg-success-soft/50 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-card text-cobalt ring-1 ring-line"><FileText className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to submit</p></div>
        <button type="button" onClick={() => onFile(null)} className="grid h-9 w-9 place-items-center rounded-[12px] text-muted-foreground hover:bg-card hover:text-destructive" aria-label={`Remove ${file.name}`}><X className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <div>
      <button
        type="button"
        id={id}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0] ?? null); }}
        aria-invalid={!!error || undefined}
        className={cn("group relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-[20px] border-[1.5px] border-dashed px-4 py-7 text-center transition-colors sm:py-8", drag ? "border-cobalt bg-ice" : error ? "border-destructive bg-destructive/5" : "border-cobalt-100 bg-[radial-gradient(80%_120%_at_50%_0%,var(--ice),transparent_70%)] hover:border-cobalt hover:bg-ice/60")}
      >
        <span className="relative grid h-14 w-14 place-items-center rounded-[18px] bg-card text-cobalt shadow-md ring-1 ring-line transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none"><Upload className="h-6 w-6" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-lime ring-2 ring-card" aria-hidden="true" /></span>
        <span className="mt-1 text-sm font-extrabold">{drag ? "Drop to add your document" : "Drag your document here"}</span>
        <span className="inline-flex h-9 items-center rounded-full bg-cobalt px-4 text-[13px] font-extrabold text-primary-foreground transition-colors group-hover:bg-cobalt-hover">Choose file</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </button>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = ""; }} />
      {error && <p className="mt-1.5 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export function validateDocument(f: File | null) {
  if (!f) return "Upload your document";
  if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return "Upload a PDF, JPG or PNG";
  if (f.size > 5 * 1024 * 1024) return "File must be under 5 MB";
  return "";
}

export const idDocuments: [string, string][] = [
  ["nin", "National ID (NIN slip or card)"],
  ["passport", "International passport"],
  ["license", "Driver's licence"],
  ["voters", "Voter's card"],
];

export function StatusPill({ tone, children }: { tone: "neutral" | "pending" | "success"; children: ReactNode }) {
  const t = { neutral: "bg-soft text-muted-foreground", pending: "bg-warning-soft text-warning-foreground", success: "bg-success-soft text-success" }[tone];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold", t)}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}
