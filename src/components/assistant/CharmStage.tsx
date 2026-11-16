import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { prefsStore } from "@/lib/assistant/store";
import type { Pose } from "@/lib/assistant/types";
import { CharmFigure } from "./CharmFigure";
import { lookFor } from "./looks";

/**
 * Charm presented on a soft stage: the person's chosen look, standing on a lime-lit
 * pedestal with an optional speech bubble. Presentation only; the artwork is used as is.
 */
export function CharmStage({
  pose = "wave",
  then,
  bubble,
  size = "md",
  className,
  bubbleSide = "left",
}: {
  pose?: Pose;
  /** Settles into this pose after the first one has played. */
  then?: Pose | undefined;
  bubble?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  bubbleSide?: "left" | "right";
}) {
  const prefs = prefsStore.use();
  const look = lookFor(prefs.look);
  const h = size === "lg" ? "h-56 sm:h-64" : size === "md" ? "h-40 sm:h-48" : "h-28";
  return (
    <div className={cn("charm-stage relative flex items-end justify-center", className)}>
      {bubble && (
        <div
          className={cn(
            "charm-bubble absolute top-1 z-10 w-44 rounded-[18px] bg-card px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug text-ink shadow-float ring-1 ring-line",
            bubbleSide === "left" ? "right-[58%] rounded-br-[6px]" : "left-[58%] rounded-bl-[6px]",
          )}
        >
          {bubble}
        </div>
      )}
      <span className="charm-pedestal" aria-hidden="true" />
      <CharmFigure look={look} pose={pose} then={then} className={cn("relative w-auto", h)} alt="" />
    </div>
  );
}

/** A small "from Charm" card: Charm in a lit window beside a message and actions. */
export function CharmTip({
  eyebrow = "From Charm",
  title,
  children,
  actions,
  pose = "point",
  then,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  pose?: Pose;
  /** Settles into this pose after the first one has played (e.g. wave, then thumbs-up). */
  then?: Pose | undefined;
  className?: string;
}) {
  const prefs = prefsStore.use();
  const look = lookFor(prefs.look);
  return (
    <section className={cn("charm-tip surface relative flex items-stretch gap-4 overflow-hidden p-0", className)}>
      <div className="charm-tip-window relative min-h-36 w-24 shrink-0 sm:w-28" aria-hidden="true">
        <span className="charm-pedestal" />
        <CharmFigure look={look} pose={pose} then={then} className="absolute bottom-0 left-1/2 h-[90%] max-h-52 w-auto max-w-none -translate-x-1/2" />
      </div>
      <div className="min-w-0 flex-1 py-4 pr-4 sm:py-5 sm:pr-5">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand">
          <span className="size-1.5 rounded-full bg-lime shadow-[0_0_8px_var(--lime)]" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-extrabold leading-snug text-ink sm:text-lg">{title}</h2>
        {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}
