import { Award, RotateCcw, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { prefsStore } from "@/lib/assistant/store";
import type { Pose } from "@/lib/assistant/types";
import { isMotionReduced } from "@/components/site/motion";
import { cn } from "@/lib/utils";
import { CharmFigure, Confetti } from "./CharmFigure";
import { lookFor } from "./looks";

type Phase = "closed" | "opening" | "open";

/** Charm's beats during the big reveal, in ms from the start. */
export const VICTORY_BEATS: { at: number; pose: Pose }[] = [
  { at: 0, pose: "point" },
  { at: 900, pose: "celebrate" },
  { at: 2700, pose: "clap" },
  { at: 4600, pose: "proud" },
];

/** Which pose Charm holds `ms` into the reveal. */
export function victoryPoseAt(ms: number): Pose {
  let pose: Pose = VICTORY_BEATS[0]!.pose;
  for (const b of VICTORY_BEATS) if (ms >= b.at) pose = b.pose;
  return pose;
}

/**
 * The big theatrical reveal for finishing a course: a velvet stage curtain that Charm draws open
 * to show the achievement medal, with spotlights and a burst of confetti. It sits in the page
 * (never over it), plays once in about five seconds and can be replayed. Reduced motion shows
 * the open stage with Charm standing proud.
 */
export function VictoryCurtain({ eyebrow = "Course complete", title, medal }: { eyebrow?: string; title: ReactNode; medal?: ReactNode }) {
  const look = lookFor(prefsStore.use().look);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("closed");
  const [pose, setPose] = useState<Pose>("point");
  useEffect(() => {
    if (isMotionReduced()) {
      setPhase("open");
      setPose("proud");
      return;
    }
    setPhase("closed");
    const timers = [
      window.setTimeout(() => setPhase("opening"), 700),
      window.setTimeout(() => setPhase("open"), 2300),
      ...VICTORY_BEATS.map((b) => window.setTimeout(() => setPose(b.pose), b.at)),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [run]);
  return (
    <div className="victory-stage relative isolate mx-auto w-full overflow-hidden rounded-[24px]" data-phase={phase} data-surface="dark">
      <span className="victory-spot victory-spot-l" aria-hidden="true" />
      <span className="victory-spot victory-spot-r" aria-hidden="true" />
      <div className="victory-reveal relative z-[1] flex h-full flex-col items-center justify-center px-4 pb-6 pr-[34%] pt-8 text-center sm:pr-[30%]">
        {medal ?? <VictoryMedal />}
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
          <span className="neon-dot is-live" aria-hidden="true" />
          {eyebrow}
        </p>
        <p className="mt-1 line-clamp-2 max-w-[16rem] text-balance text-base font-extrabold leading-snug text-on-dark sm:text-lg">{title}</p>
      </div>
      {phase !== "closed" && <Confetti />}
      <span className="victory-curtain victory-curtain-l" aria-hidden="true" />
      <span className="victory-curtain victory-curtain-r" aria-hidden="true" />
      <span className="victory-valance" aria-hidden="true" />
      <span className="victory-rope" aria-hidden="true"><span className="victory-tassel" /></span>
      <span className="victory-floor" aria-hidden="true" />
      <CharmFigure look={look} pose={pose} className="absolute bottom-0 right-[2%] z-[4] h-[92%] w-auto drop-shadow-[0_10px_16px_rgb(0_0_0/0.35)]" alt="" />
      {phase === "open" && !isMotionReduced() && (
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="absolute left-3 top-3 z-[5] inline-flex min-h-9 items-center gap-1.5 rounded-full bg-on-dark/12 px-3 text-xs font-extrabold text-on-dark ring-1 ring-on-dark/25 transition-colors hover:bg-on-dark/20"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" /> Replay
        </button>
      )}
    </div>
  );
}

/** The achievement medal behind the curtain. */
export function VictoryMedal({ className }: { className?: string }) {
  return (
    <span className={cn("victory-medal relative grid size-24 place-items-center sm:size-28", className)} aria-hidden="true">
      <span className="victory-ribbon victory-ribbon-l" />
      <span className="victory-ribbon victory-ribbon-r" />
      <span className="absolute inset-0 rounded-full bg-lime shadow-[0_0_30px_color-mix(in_oklab,var(--lime)_60%,transparent)]" />
      <span className="absolute inset-[7%] rounded-full bg-cobalt border-2 border-dashed border-lime/70" />
      <Award className="relative size-[46%] text-lime" strokeWidth={2.2} />
    </span>
  );
}

/**
 * The small curtain for finishing a step (an onboarding screen, a setup task, a module): a quick
 * reveal in the page with Charm clapping, then it tucks itself away. Never covers the next step.
 */
export function StepCurtain({
  eyebrow,
  title,
  children,
  pose = "clap",
  then = "thumbsup",
  hideAfter = 5200,
  onClose,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  pose?: Pose;
  then?: Pose;
  hideAfter?: number | false;
  onClose?: () => void;
  className?: string;
}) {
  const look = lookFor(prefsStore.use().look);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (hideAfter === false || !onClose) return;
    const t = window.setTimeout(() => setLeaving(true), hideAfter);
    return () => window.clearTimeout(t);
  }, [hideAfter, onClose]);
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => onClose?.(), isMotionReduced() ? 0 : 320);
    return () => window.clearTimeout(t);
  }, [leaving, onClose]);
  return (
    <div role="status" className={cn("step-curtain relative isolate", leaving && "is-leaving", className)}>
      <div className="step-curtain-stage bg-brand-panel relative overflow-hidden rounded-[22px] py-4 pl-[6.5rem] pr-12 sm:pl-[7.5rem]">
        <span className="step-curtain-panel step-curtain-l" aria-hidden="true" />
        <span className="step-curtain-panel step-curtain-r" aria-hidden="true" />
        <p className="relative flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-lime">
          <span className="neon-dot is-live" aria-hidden="true" />
          {eyebrow}
        </p>
        <p className="relative mt-0.5 text-base font-extrabold leading-snug text-on-dark sm:text-lg">{title}</p>
        {children && <div className="relative mt-0.5 text-sm text-on-dark-muted">{children}</div>}
        {onClose && (
          <button type="button" onClick={() => setLeaving(true)} aria-label="Dismiss" className="absolute right-2 top-2 grid size-9 place-items-center rounded-full text-on-dark transition-colors hover:bg-on-dark/15">
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <CharmFigure look={look} pose={pose} then={then} thenAfter={1900} className="pointer-events-none absolute -top-5 bottom-0 left-2 h-[calc(100%+1.25rem)] w-auto drop-shadow-[0_8px_12px_rgb(0_0_0/0.3)] sm:left-4" alt="" />
    </div>
  );
}
