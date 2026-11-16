import { createFileRoute } from "@tanstack/react-router";
import { SupportHome } from "@/components/help-centre/SupportHome";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help")({
  head: () => meta("Support centre", "Search answers, chat with Charm or reach the Enski support team."),
  errorComponent: RoleError,
  component: () => <SupportHome role="learner" />,
});
