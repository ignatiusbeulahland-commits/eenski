import { useEffect, useState } from "react";
import { readLocal, writeLocal } from "@/lib/demo/local";

/**
 * When to celebrate progress that's counted elsewhere (setup steps done, modules finished).
 * The first time a count is seen it's only remembered, so nobody gets a curtain for work
 * they did before; after that, every rise is one celebration.
 */
export function milestoneReached(previous: number | null | undefined, now: number): boolean {
  return typeof previous === "number" && now > previous;
}

const KEY = "enski:charm:milestones";

/** True once when `count` has gone up since this person last saw it (per key, per device). */
export function useMilestone(key: string | undefined, count: number) {
  const [hit, setHit] = useState(false);
  useEffect(() => {
    if (!key) return;
    const all = readLocal<Record<string, number>>(KEY, {});
    if (milestoneReached(all[key], count)) setHit(true);
    if (all[key] !== count) writeLocal(KEY, { ...all, [key]: count });
  }, [key, count]);
  return [hit, () => setHit(false)] as const;
}
