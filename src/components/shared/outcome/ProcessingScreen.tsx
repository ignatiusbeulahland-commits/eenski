import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OutcomeEmblem, outcomeButton } from "./OutcomeScreen";

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Walks through `steps` one after another (about `stepMs` each), then calls `onDone`.
 * Cancelling stops the timeline. Reduced motion shortens every step.
 */
export function useProcessing(steps: number, onDone: () => void, stepMs = 900) {
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (stopped) return;
    const ms = reducedMotion() ? Math.min(stepMs, 250) : stepMs;
    const t = window.setTimeout(() => {
      if (active + 1 >= steps) done.current();
      else setActive(active + 1);
    }, ms);
    return () => window.clearTimeout(t);
  }, [active, steps, stepMs, stopped]);
  return { active, stop: () => setStopped(true), stopped };
}

/** Full-card "working on it" state with a step list and progress bar. */
export function ProcessingScreen({
  title,
  message,
  steps,
  active,
  onCancel,
  cancelLabel = "Cancel",
  footer,
}: {
  title: ReactNode;
  message: ReactNode;
  steps: string[];
  active: number;
  onCancel?: (() => void) | undefined;
  cancelLabel?: string | undefined;
  footer?: ReactNode;
}) {
  const pct = Math.round(((active + 0.5) / steps.length) * 100);
  return (
    <section aria-labelledby="processing-title" aria-busy="true" className="screen-in mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-line bg-card shadow-card">
      <div className="px-6 pb-7 pt-9 text-center sm:px-10 sm:pt-11">
        <OutcomeEmblem tone="processing" />
        <h1 id="processing-title" className="mt-6 text-[26px] font-extrabold leading-tight text-ink sm:text-[30px]">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">{message}</p>
        <div className="mx-auto mt-7 h-2 max-w-sm overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress">
          <span className="block h-full rounded-full bg-cobalt transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <ol className="mx-auto mt-6 max-w-sm space-y-2.5 text-left" aria-live="polite">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-3 text-sm font-bold transition-colors", i <= active ? "text-ink" : "text-muted-foreground/70")}>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors",
                  i < active ? "border-success bg-success text-primary-foreground" : i === active ? "border-cobalt text-cobalt" : "border-line",
                )}
                aria-hidden="true"
              >
                {i < active ? <Check className="size-3.5" strokeWidth={3} /> : i === active ? <Loader2 className="size-3.5 animate-spin" /> : null}
              </span>
              <span>{s}</span>
              {i < active && <span className="sr-only">done</span>}
            </li>
          ))}
        </ol>
        {onCancel && (
          <button type="button" onClick={onCancel} className={cn(outcomeButton.quiet, "mt-7")}>
            {cancelLabel}
          </button>
        )}
        {footer && <p className="mt-4 text-xs text-muted-foreground">{footer}</p>}
      </div>
    </section>
  );
}
