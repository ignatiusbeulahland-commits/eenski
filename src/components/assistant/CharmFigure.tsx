import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Pose } from "@/lib/assistant/types";
import { isMotionReduced } from "@/components/site/motion";
import type { CharmLook } from "./looks";

/** Poses drawn on the idle body: switching between them only changes his face, no pop. */
const FACE: Pose[] = ["idle", "wink", "laugh"];

/** The motion that plays with each pose (all of it switched off under reduced motion in styles.css). */
export const POSE_MOTION: Record<Pose, string> = {
  idle: "charm-idle",
  wink: "charm-nod",
  laugh: "charm-giggle",
  wave: "charm-sway",
  think: "charm-pose",
  concerned: "charm-pose",
  point: "charm-lean",
  thumbsup: "charm-thumb",
  clap: "charm-clap",
  proud: "charm-proud",
  celebrate: "charm-hop",
  dance: "charm-dance",
  surprised: "charm-jolt",
};

/** Random gap before the next blink, a little irregular like a real one. */
export function nextBlinkDelay(rand: () => number = Math.random) {
  return 2600 + Math.round(rand() * 3400);
}

/**
 * Full-body Charm in one of his poses. Swaps with a soft pop (face-only changes swap in place);
 * idle breathes and blinks now and then. `then` settles him into another pose after `thenAfter`
 * ms, e.g. a wave that ends in a relaxed idle.
 */
export function CharmFigure({
  look,
  pose,
  then,
  thenAfter = 2400,
  className,
  alt = "",
}: {
  look: CharmLook;
  pose: Pose;
  then?: Pose | undefined;
  thenAfter?: number;
  className?: string;
  alt?: string;
}) {
  const [shown, setShown] = useState<Pose>(pose);
  const [blink, setBlink] = useState(false);
  const entered = useRef(false);

  useEffect(() => {
    setShown(pose);
    if (!then || then === pose) return;
    const t = window.setTimeout(() => setShown(then), isMotionReduced() ? 0 : thenAfter);
    return () => window.clearTimeout(t);
  }, [pose, then, thenAfter]);

  useEffect(() => {
    const t = window.setTimeout(() => { entered.current = true; }, 450);
    // Warm the face frames so a blink or wink never shows an empty image.
    for (const src of [look.blink, look.poses.wink, look.poses.laugh]) {
      const img = new Image();
      img.src = src;
    }
    return () => window.clearTimeout(t);
  }, [look]);

  // A wink or a laugh is a moment, not a held face: he relaxes back to idle.
  useEffect(() => {
    if ((shown !== "wink" && shown !== "laugh") || isMotionReduced()) return;
    const t = window.setTimeout(() => setShown("idle"), shown === "wink" ? 1300 : 2100);
    return () => window.clearTimeout(t);
  }, [shown]);

  useEffect(() => {
    if (shown !== "idle" || isMotionReduced()) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (document.visibilityState !== "visible") return schedule();
        setBlink(true);
        timer = window.setTimeout(() => {
          setBlink(false);
          // Now and then a quick double blink.
          if (Math.random() < 0.2) {
            timer = window.setTimeout(() => {
              setBlink(true);
              timer = window.setTimeout(() => { setBlink(false); schedule(); }, 120);
            }, 160);
          } else schedule();
        }, 130);
      }, nextBlinkDelay());
    };
    schedule();
    return () => { window.clearTimeout(timer); setBlink(false); };
  }, [shown]);

  const face = FACE.includes(shown);
  const motion = shown === "idle" && entered.current ? "charm-breathe" : POSE_MOTION[shown];
  return (
    <img
      key={`${look.id}-${face ? "face" : shown}`}
      src={shown === "idle" && blink ? look.blink : look.poses[shown]}
      alt={alt}
      width={300}
      height={560}
      decoding="async"
      draggable={false}
      data-pose={shown}
      className={cn("charm-figure pointer-events-none select-none object-contain", motion, className)}
    />
  );
}

/** Charm's head, for message avatars and the launcher. */
export function CharmHead({ look, className, alt = "" }: { look: CharmLook; className?: string; alt?: string }) {
  return (
    <img
      src={look.head}
      alt={alt}
      width={96}
      height={96}
      decoding="async"
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  );
}

const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.06}s`,
  tone: ["bg-lime", "bg-sky", "bg-on-dark", "bg-lime", "bg-sky-light"][i % 5],
  rotate: `${(i * 47) % 360}deg`,
}));

/** A quick burst of brand-colour confetti for celebrations (hidden with reduced motion). */
export function Confetti() {
  return (
    <span aria-hidden="true" className="charm-confetti pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className={cn("absolute top-0 block h-2.5 w-1.5 rounded-[2px]", c.tone)}
          style={{ left: c.left, animationDelay: c.delay, transform: `rotate(${c.rotate})` }}
        />
      ))}
    </span>
  );
}

export function AgentAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-cobalt text-xs font-extrabold text-on-dark ring-2 ring-background", className)}
    >
      {initials}
    </span>
  );
}
