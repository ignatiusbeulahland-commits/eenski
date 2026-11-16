import { createFileRoute } from "@tanstack/react-router";
import { SupportHome } from "@/components/help-centre/SupportHome";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help")({
  head: () => meta("Support centre", "Search answers, chat with Charm or reach the Enski support team."),
  errorComponent: RoleError,
  component: () => <SupportHome role="creator" />,
});
