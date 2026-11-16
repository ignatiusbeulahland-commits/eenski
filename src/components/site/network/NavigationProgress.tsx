import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { SLOW_NAVIGATION_MS } from "@/lib/network/timing";

/** Quick page changes show nothing; anything slower gets the bar, and very slow ones a short hint. */
const SHOW_AFTER_MS = 150;

/**
 * Thin lime bar along the top while a new page is loading, plus a gentle
 * "still loading" note on slow connections. Never covers the page.
 */
export function NavigationProgress() {
  const loading = useRouterState({ select: (s) => s.status === "pending" });
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (loading) {
      const show = window.setTimeout(() => setPhase("running"), SHOW_AFTER_MS);
      const hint = window.setTimeout(() => setSlow(true), SLOW_NAVIGATION_MS);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hint);
      };
    }
    setSlow(false);
    setPhase((p) => (p === "running" ? "done" : "idle"));
    return undefined;
  }, [loading]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => setPhase("idle"), 450);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-(--z-progress) h-[3px] overflow-hidden"
      >
        {phase !== "idle" ? (
          <div className="nav-progress h-full bg-lime shadow-[0_0_10px_var(--lime)]" data-phase={phase} />
        ) : null}
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {phase === "running" ? "Loading page…" : ""}
      </div>
      {slow && loading ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-(--z-status) flex justify-center px-4">
          <p className="net-notice rounded-full bg-midnight px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg ring-1 ring-primary-foreground/15">
            Still loading… your connection seems slow
          </p>
        </div>
      ) : null}
    </>
  );
}
