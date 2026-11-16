import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/components/creator/performance/PerformancePage";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/performance")({
  head: () => creatorMeta("Performance", "Track your enrolments, revenue, and commission over time."),
  component: () => <PerformancePage />,
});
