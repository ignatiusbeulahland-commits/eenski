import { Car, Check, IdCard, Plane, ScanLine, SunDim, Type, Vote, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { idDocuments } from "@/components/shared/SettingsKit";
import { cn } from "@/lib/utils";

/**
 * Presentation-only pieces for the identity Verification settings page (Affiliate, Creator).
 * Each role keeps its own state, validation and submit logic.
 */

export type StepState = "done" | "current" | "upcoming";
export type VerificationStep = { label: string; detail: string; state: StepState };

/** Signature-blue progress panel: overall status, lime progress bar and a connected stepper. */
export function VerificationProgress({ steps }: { steps: readonly VerificationStep[] }) {
  const done = steps.filter((s) => s.state === "done").length;
  const all = done === steps.length;
  const currentIdx = steps.findIndex((s) => s.state === "current");
  const inReview = !all && currentIdx === steps.length - 1;
  const pct = Math.round((done / steps.length) * 100);
  const art = all ? brandArtwork.success : inReview ? brandArtwork.pending : brandArtwork.shield;
  const heading = all ? "You're verified" : inReview ? "Your documents are in review" : `Step ${currentIdx + 1} of ${steps.length} · ${steps[currentIdx]?.label ?? ""}`;

  return (
    <section aria-labelledby="verify-progress-title" data-surface="dark" className="relative overflow-hidden rounded-[24px] bg-brand-panel p-5 text-on-dark sm:p-6">
      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-on-dark-muted"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Your progress</p>
          <h2 id="verify-progress-title" className="mt-1.5 text-lg font-extrabold leading-snug sm:text-xl">{heading}</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-on-dark/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Verification progress">
              <div className="h-full rounded-full bg-lime transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${Math.max(pct, 4)}%` }} />
            </div>
            <span className="shrink-0 text-[13px] font-extrabold tabular-nums"><span className="text-lime">{done}</span>/{steps.length} done</span>
          </div>
        </div>
        <span className="relative shrink-0">
          <BrandIcon src={art} className="h-14 w-14 drop-shadow-xl sm:h-20 sm:w-20" />
          <span className="lime-pedestal" aria-hidden="true" />
        </span>
      </div>

      <ol className="relative mt-5 grid gap-0 sm:grid-cols-3 sm:gap-3" aria-label="Verification steps">
        {steps.map((s, i) => (
          <li key={s.label} aria-current={s.state === "current" ? "step" : undefined} className="relative flex gap-3 pb-4 last:pb-0 sm:block sm:pb-0">
            {i < steps.length - 1 && (
              <span aria-hidden="true" className={cn("absolute left-[17px] top-9 bottom-0 w-0.5 rounded-full sm:left-12 sm:right-[-6px] sm:top-[17px] sm:bottom-auto sm:h-0.5 sm:w-auto", s.state === "done" ? "bg-lime/70" : "bg-on-dark/15")} />
            )}
            <span className={cn(
              "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold",
              s.state === "done" && "bg-lime text-midnight",
              s.state === "current" && "bg-on-dark text-cobalt ring-4 ring-lime/35",
              s.state === "upcoming" && "border-[1.5px] border-on-dark/25 text-on-dark-muted",
            )}>
              {s.state === "done" ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <span className="min-w-0 pt-1 sm:mt-3 sm:block sm:pt-0">
              <span className={cn("block text-sm font-extrabold", s.state === "upcoming" && "text-on-dark-muted")}>{s.label}</span>
              <span className="mt-0.5 block text-[13px] text-on-dark-muted">{s.state === "done" ? <span className="sr-only">Done: </span> : null}{s.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const docMeta: Record<string, { icon: LucideIcon; short: string; hint: string }> = {
  nin: { icon: IdCard, short: "National ID", hint: "NIN slip or card" },
  passport: { icon: Plane, short: "Passport", hint: "International passport" },
  license: { icon: Car, short: "Driver's licence", hint: "Front of the card" },
  voters: { icon: Vote, short: "Voter's card", hint: "Permanent voter's card" },
};

/** Card-style radio picker for the identity document type. */
export function DocumentTypePicker({ name, value, onChange, error }: { name: string; value: string; onChange: (v: string) => void; error?: string | undefined }) {
  const errId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? errId : undefined} aria-invalid={!!error || undefined}>
      <legend className="mb-2 text-[13px] font-bold">Document type</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {idDocuments.map(([v, label]) => {
          const m = docMeta[v] ?? { icon: IdCard, short: label, hint: "" };
          const on = value === v;
          return (
            <label key={v} className={cn(
              "group relative flex cursor-pointer flex-col items-start gap-2 rounded-[18px] border-[1.5px] p-3 transition-colors sm:flex-row sm:gap-2.5 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[var(--focus-color,var(--cobalt))] sm:p-3.5",
              on ? "border-cobalt bg-ice/70" : error ? "border-destructive/60 bg-card" : "border-line bg-card hover:border-cobalt-100 hover:bg-soft/60",
            )}>
              <input type="radio" name={name} value={v} checked={on} onChange={() => onChange(v)} className="sr-only" aria-label={label} />
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[12px] transition-colors", on ? "bg-cobalt text-primary-foreground" : "bg-soft text-cobalt")} aria-hidden="true"><m.icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1 sm:pr-5">
                <span className="block text-[13px] font-extrabold leading-tight sm:text-sm">{m.short}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{m.hint}</span>
              </span>
              <span aria-hidden="true" className={cn("absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full border-[1.5px] transition-colors", on ? "border-cobalt bg-cobalt text-lime" : "border-line bg-card text-transparent")}>
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={errId} className="mt-1.5 text-xs font-semibold text-destructive">{error}</p>}
    </fieldset>
  );
}

/** Three quick tips for a photo that passes review. */
export function CaptureTips() {
  const tips: [LucideIcon, string][] = [[ScanLine, "All four corners in view"], [SunDim, "No glare or blur"], [Type, "Name and number readable"]];
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="Photo tips">
      {tips.map(([Icon, t]) => (
        <li key={t} className="flex flex-col items-center gap-1.5 rounded-[14px] bg-soft/70 px-2 py-2.5 text-center sm:flex-row sm:px-3 sm:text-left">
          <Icon className="h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" />
          <span className="text-xs font-semibold leading-tight text-muted-foreground">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** Premium state card for "in review" and "verified". */
export function VerificationStatusCard({ tone, title, description, children }: { tone: "review" | "verified"; title: string; description: string; children?: ReactNode }) {
  return (
    <section aria-labelledby="verify-status-title" className="surface relative overflow-hidden p-5 sm:p-7">
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone === "verified" ? "bg-success" : "bg-cobalt")} />
      <div className="flex items-start gap-4 sm:items-center sm:gap-6">
        <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-ice/70 ring-1 ring-line sm:h-24 sm:w-24 sm:rounded-[22px]">
          <BrandIcon src={tone === "verified" ? brandArtwork.success : brandArtwork.pending} className="h-10 w-10 sm:h-16 sm:w-16" />
        </span>
        <div className="min-w-0 flex-1">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold", tone === "verified" ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground")}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{tone === "verified" ? "Verified" : "In review"}
          </span>
          <h2 id="verify-status-title" className="mt-2 flex items-center gap-2.5 text-xl font-extrabold"><span className="lime-tick" aria-hidden="true" />{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
          {children && <div className="mt-5">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/** Side card: what verifying unlocks for this role. */
export function VerificationPerks({ items }: { items: { art: string; title: string; text: string }[] }) {
  return (
    <section className="surface p-5" aria-labelledby="verify-perks-title">
      <h2 id="verify-perks-title" className="flex items-center gap-2.5 text-sm font-extrabold"><span className="lime-tick" aria-hidden="true" />What verifying unlocks</h2>
      <ul className="mt-4 space-y-3.5">
        {items.map((it) => (
          <li key={it.title} className="flex items-center gap-3">
            <BrandIcon src={it.art} className="h-11 w-11" />
            <span className="min-w-0">
              <span className="block text-sm font-bold">{it.title}</span>
              <span className="block text-[13px] text-muted-foreground">{it.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
