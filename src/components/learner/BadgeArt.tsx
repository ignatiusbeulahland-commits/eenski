import { Lock } from "lucide-react";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { findPlatformBadge } from "@/lib/shared/badges";
import type { BadgeDef } from "@/lib/learner/rules";
import { cn } from "@/lib/utils";

/** A learner badge drawn with the shared Enski emblem for its category; locked ones are greyed with a lock. */
export function BadgeArt({ badge, unlocked, size = 88, className }: { badge: BadgeDef; unlocked: boolean; size?: number; className?: string }) {
  const def = findPlatformBadge(badge.id) ?? { name: badge.title, category: "learning" as const, icon: "award" as const };
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }} aria-hidden="true">
      <BadgeEmblem badge={def} size={size} locked={!unlocked} />
      {!unlocked && (
        <span className="absolute bottom-[12%] right-[6%] grid place-items-center rounded-full bg-card text-muted-foreground ring-1 ring-line" style={{ width: size * 0.28, height: size * 0.28 }}>
          <Lock style={{ width: size * 0.14, height: size * 0.14 }} />
        </span>
      )}
    </div>
  );
}
