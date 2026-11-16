import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact step indicator for multi-screen journeys (checkout, withdraw, award a badge…). */
export function FlowSteps({ steps, current, className }: { steps: string[]; current: number; className?: string | undefined }) {
  return (
    <ol className={cn("flex items-center gap-1.5 sm:gap-2", className)} aria-label={`Step ${Math.min(current + 1, steps.length)} of ${steps.length}`}>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "next";
        return (
          <li key={s} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold transition-[background-color,color,box-shadow] duration-300",
                state === "done" && "bg-cobalt text-primary-foreground",
                state === "current" && "bg-cobalt text-primary-foreground shadow-[0_0_0_4px_var(--ice)]",
                state === "next" && "bg-soft text-muted-foreground",
              )}
            >
              {state === "done" ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn("hidden truncate text-[13px] font-extrabold sm:block", state === "next" ? "text-muted-foreground" : "text-ink")}>{s}</span>
            {i < steps.length - 1 && (
              <span className="h-0.5 min-w-3 flex-1 overflow-hidden rounded-full bg-soft" aria-hidden="true">
                <span className={cn("block h-full bg-cobalt transition-[width] duration-500 ease-out", i < current ? "w-full" : "w-0")} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
