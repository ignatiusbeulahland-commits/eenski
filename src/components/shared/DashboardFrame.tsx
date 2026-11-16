import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import type { AccountType } from "@/components/site/data";
import { watchDashboardImages } from "@/lib/dashboard/imageLoading";
import { currentDemoProfile, demoSession, useDemoProfile } from "@/lib/demo/profile";

/**
 * Wraps the Learner, Creator and Affiliate dashboards.
 * - Restores the dashboard look (data-skin="dashboard") here and on <html>, so pop-ups match too.
 * - Needs a demo sign-in: signed-out visitors go to /auth for that role.
 * - Opening another role's dashboard switches the demo profile to that role (same person).
 * - Remounts per person, so each account loads its own saved dashboard.
 */
export function DashboardFrame({ role, children }: { role: AccountType; children: ReactNode }) {
  const navigate = useNavigate();
  const profile = useDemoProfile();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-skin", "dashboard");
    const stop = watchDashboardImages(document.body);
    return () => {
      root.removeAttribute("data-skin");
      stop();
    };
  }, []);

  useEffect(() => {
    setHydrated(true);
    const now = currentDemoProfile();
    if (!now) {
      void navigate({ to: "/auth", search: role === "learner" ? {} : { as: role }, replace: true });
    } else if (now.type !== role) {
      demoSession.switchTo(role);
    }
  }, [navigate, role]);

  const ready = hydrated && profile !== null;
  return (
    <div data-skin="dashboard" className="min-h-dvh bg-background text-foreground">
      {ready ? (
        <div key={profile.email} className="contents">
          {children}
        </div>
      ) : (
        <div className="flex min-h-dvh" role="status" aria-live="polite">
          <span className="sr-only">Opening your dashboard…</span>
          <div className="dash-shimmer hidden w-64 shrink-0 lg:block" aria-hidden />
          <div className="flex-1 space-y-6 p-4 sm:p-8" aria-hidden>
            <div className="dash-shimmer h-12 rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="dash-shimmer h-28 rounded-2xl" />
              <div className="dash-shimmer h-28 rounded-2xl" />
              <div className="dash-shimmer h-28 rounded-2xl" />
            </div>
            <div className="dash-shimmer h-72 rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
