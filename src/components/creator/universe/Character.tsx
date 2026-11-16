import type React from "react";
import { Flame, Anvil, Eye, Sun, Crown, Shield, Feather, Orbit, Gem } from "lucide-react";
import { characterSource } from "@/lib/creator/universe/art";
import { STYLES, type CharacterStyle } from "@/lib/creator/universe/rules";
import { cn } from "@/lib/utils";
const emblems = [Flame, Anvil, Eye, Sun, Crown, Shield, Feather, Orbit, Gem];
/** Section eyebrow matching the app's page headers (Lime mark, Cobalt label). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt", className)}>
      <span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />{children}
    </p>
  );
}
/** Milestone badge: Ice with a Cobalt icon while locked, Cobalt with a Lime icon once earned. */
export function Emblem({ level, className, on = false }: { level: number; className?: string; on?: boolean }) {
  const Icon = emblems[Math.max(0, level - 1)] ?? Flame;
  return (
    <span className={cn("universe-emblem", on && "is-on", className)} aria-hidden="true">
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </span>
  );
}
export function Character({
  style,
  level,
  className,
  priority = false,
}: {
  style: CharacterStyle;
  level: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      data-character={style + "-" + level}
      src={characterSource(style, Math.max(1, level))}
      alt={`${STYLES.find((s) => s.id === style)?.label} ${level === 0 ? "starter" : `level ${level}`} character`}
      width={640}
      height={640}
      loading={priority ? "eager" : "lazy"}
      className={cn("universe-character", className)}
    />
  );
}
