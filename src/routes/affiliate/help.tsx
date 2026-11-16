import { createFileRoute } from "@tanstack/react-router";
import { SupportHome } from "@/components/help-centre/SupportHome";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help")({
  head: () => meta("Support centre", "Search answers, chat with Charm or reach the Enski support team."),
  errorComponent: RoleError,
  component: () => <SupportHome role="affiliate" />,
});
