import { Check, Clock, Copy, Info, Loader2, OctagonX, ShieldAlert, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CharmFigure } from "@/components/assistant/CharmFigure";
import { lookFor } from "@/components/assistant/looks";
import { prefsStore } from "@/lib/assistant/store";

export type OutcomeTone = "success" | "failed" | "pending" | "cancelled" | "processing" | "info" | "warning";

export interface OutcomeDetail {
  label: string;
  value: ReactNode;
  /** When set, a copy button sits beside the value (references, IDs). */
  copy?: string | undefined;
  /** Monospace + tabular, for references and IDs. */
  mono?: boolean | undefined;
  /** Make the row stand out (the amount on a receipt). */
  strong?: boolean | undefined;
}

const toneCopy: Record<OutcomeTone, { eyebrow: string; ring: string; icon: typeof Check }> = {
  success: { eyebrow: "Done", ring: "outcome-ring-success", icon: Check },
  failed: { eyebrow: "Didn't go through", ring: "outcome-ring-failed", icon: X },
  pending: { eyebrow: "In progress", ring: "outcome-ring-pending", icon: Clock },
  cancelled: { eyebrow: "Cancelled", ring: "outcome-ring-cancelled", icon: OctagonX },
  processing: { eyebrow: "Working on it", ring: "outcome-ring-pending", icon: Loader2 },
  info: { eyebrow: "Heads up", ring: "outcome-ring-info", icon: Info },
  warning: { eyebrow: "Check this", ring: "outcome-ring-warning", icon: ShieldAlert },
};

/** The animated emblem at the top of every result screen. */
export function OutcomeEmblem({ tone, size = "lg", art }: { tone: OutcomeTone; size?: "md" | "lg"; art?: string | undefined }) {
  const t = toneCopy[tone];
  const Icon = t.icon;
  const box = size === "lg" ? "size-24 sm:size-28" : "size-16";
  return (
    <span className={cn("outcome-emblem relative mx-auto grid place-items-center", box)} aria-hidden="true">
      {tone === "success" && <span className="outcome-burst" />}
      <span className={cn("outcome-ring absolute inset-0 rounded-full", t.ring)} />
      {art ? (
        <img src={art} alt="" width={96} height={96} className="outcome-pop relative size-[62%] object-contain" />
      ) : tone === "success" ? (
        <svg viewBox="0 0 52 52" className="outcome-pop relative size-[46%]" fill="none">
          <path className="outcome-check" d="M14 27.5 22.5 36 39 17" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <Icon className={cn("outcome-pop relative size-[42%]", tone === "processing" && "animate-spin")} strokeWidth={2.6} />
      )}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setDone(false), 1600);
    return () => window.clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => setDone(true), () => setDone(false));
      }}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-ice hover:text-cobalt"
      aria-label={done ? `${label} copied` : `Copy ${label.toLowerCase()}`}
    >
      {done ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
    </button>
  );
}

/** When something didn't go through, Charm looks gently concerned beside a small cross. */
function ConcernedCharm() {
  const look = lookFor(prefsStore.use().look);
  return (
    <span className="relative mx-auto block h-32 w-24 sm:h-36" aria-hidden="true">
      <CharmFigure look={look} pose="concerned" className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2" />
      <span className="outcome-ring-failed absolute -right-3 top-6 grid size-8 place-items-center rounded-full text-destructive ring-4 ring-card">
        <X className="size-4" strokeWidth={3} />
      </span>
    </span>
  );
}

/** Receipt-style list of facts about the action (amount, reference, date…). */
export function OutcomeDetails({ details, title }: { details: OutcomeDetail[]; title?: string | undefined }) {
  if (details.length === 0) return null;
  return (
    <section aria-label={title ?? "Details"} className="outcome-receipt mt-6 rounded-[20px] border border-line bg-soft/60 p-1 text-left">
      {title && <h2 className="px-4 pb-1 pt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2>}
      <dl className="divide-y divide-dashed divide-line">
        {details.map((d) => (
          <div key={d.label} className="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">{d.label}</dt>
            <dd className={cn("flex min-w-0 items-center justify-end gap-1 text-right text-sm font-extrabold text-ink", d.mono && "font-mono tabular-nums tracking-tight", d.strong && "text-lg")}>
              <span className="min-w-0 break-words">{d.value}</span>
              {d.copy && <CopyButton text={d.copy} label={d.label} />}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Dedicated result screen for an important action: emblem, heading, short message,
 * receipt-style details and one primary plus secondary next steps. Use it for every
 * success, failure, pending or cancelled outcome instead of a toast.
 */
export function OutcomeScreen({
  tone,
  eyebrow,
  title,
  message,
  details = [],
  detailsTitle,
  actions,
  moreActions,
  footer,
  children,
  art,
  emblem,
  className,
}: {
  tone: OutcomeTone;
  eyebrow?: string | undefined;
  title: ReactNode;
  message: ReactNode;
  details?: OutcomeDetail[] | undefined;
  detailsTitle?: string | undefined;
  /** Primary action first; render with `OutcomeActions`-friendly buttons/links. */
  actions: ReactNode;
  /** Quieter extra links under the main actions. */
  moreActions?: ReactNode;
  /** Small text under the actions (e.g. "A copy is in your orders"). */
  footer?: ReactNode;
  children?: ReactNode;
  /** Optional brand artwork instead of the plain icon. */
  art?: string | undefined;
  /** Replaces the round emblem entirely (e.g. a badge emblem). */
  emblem?: ReactNode;
  className?: string | undefined;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [tone]);
  const label = eyebrow ?? toneCopy[tone].eyebrow;
  return (
    <section
      aria-labelledby="outcome-title"
      role={tone === "failed" ? "alert" : "status"}
      data-tone={tone}
      className={cn("outcome-card screen-in mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-line bg-card shadow-card", className)}
    >
      <div className="outcome-head relative isolate overflow-hidden px-6 pb-6 pt-9 text-center sm:px-10 sm:pt-11">
        <span className="outcome-glow" aria-hidden="true" />
        {emblem ?? (tone === "failed" && !art ? <ConcernedCharm /> : <OutcomeEmblem tone={tone} art={art} />)}
        <p className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="outcome-dot size-1.5 rounded-full" aria-hidden="true" />
          {label}
        </p>
        <h1 id="outcome-title" ref={heading} tabIndex={-1} className="mt-2 text-balance text-[26px] font-extrabold leading-tight text-ink outline-none sm:text-[32px]">
          {title}
        </h1>
        <div className="mx-auto mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">{message}</div>
      </div>
      <div className="px-5 pb-7 sm:px-10">
        <OutcomeDetails details={details} title={detailsTitle} />
        {children}
        <div className="outcome-actions mt-7 grid gap-2.5 sm:flex sm:flex-row-reverse sm:justify-center">{actions}</div>
        {moreActions && <div className="mt-2 grid gap-1 sm:flex sm:flex-wrap sm:justify-center">{moreActions}</div>}
        {footer && <p className="mt-4 text-center text-xs text-muted-foreground">{footer}</p>}
      </div>
    </section>
  );
}

/** Pill classes for links/buttons inside result screens and flows. */
export const outcomeButton = {
  primary:
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cobalt px-6 text-[15px] font-extrabold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-cobalt-hover active:scale-[0.98] disabled:opacity-60 sm:w-auto [&_svg]:size-4",
  secondary:
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-line bg-card px-6 text-[15px] font-extrabold text-brand transition-[background-color,border-color,transform] duration-150 hover:border-sky hover:bg-ice active:scale-[0.98] disabled:opacity-60 sm:w-auto [&_svg]:size-4",
  quiet:
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold text-brand transition-colors hover:bg-ice sm:w-auto [&_svg]:size-4",
  danger:
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-destructive px-6 text-[15px] font-extrabold text-destructive-foreground transition-[background-color,transform] duration-150 hover:bg-destructive-hover active:scale-[0.98] disabled:opacity-60 sm:w-auto [&_svg]:size-4",
};
