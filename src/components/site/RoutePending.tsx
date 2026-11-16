import { useRouterState } from "@tanstack/react-router";
import { PageSkeleton } from "./PageSkeleton";
import { PageSkeleton as DashboardSkeleton } from "@/components/affiliate/ui";

const INTERNAL = /^\/(creator|learner|affiliate|admin|support)(\/|$)/;

/** Slow page change placeholder: dashboards get a content-only shimmer (their own menu stays), public pages get the site one. */
export function RoutePending() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (INTERNAL.test(path)) return <div className="p-4 sm:p-6"><DashboardSkeleton /></div>;
  return <PageSkeleton />;
}
