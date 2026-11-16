import { createFileRoute } from "@tanstack/react-router";
import { LearnerDashboard } from "@/components/learner/Dashboard";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/dashboard")({
  head: () => learnerMeta("Dashboard", "Your Enski learning overview: events, resources, saved items and achievements."),
  component: LearnerDashboard,
});
