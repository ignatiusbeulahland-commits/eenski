import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";


/** Quick page changes show nothing; anything slower gets the bar, and very slow ones a short hint. */
const SHOW_AFTER_MS = 150;

/**
 * Thin lime bar along the top while a new page is loading, plus a gentle
 * "still loading" note on slow connections. Never covers the page.
 */
export function NavigationProgress() {
  const loading = useRouterState({ select: (s) => s.status === "pending" });
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");

  useEffect(() => {
    if (loading) {
      const show = window.setTimeout(() => setPhase("running"), SHOW_AFTER_MS);
      return () => window.clearTimeout(show);
    }
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
    </>
  );
}
