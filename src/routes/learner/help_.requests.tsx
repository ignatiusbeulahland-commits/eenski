import { createFileRoute } from "@tanstack/react-router";
import { RequestsPage } from "@/components/help-centre/Requests";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/requests")({
  head: () => meta("My requests and chats", "Follow your support requests and pick up past conversations."),
  errorComponent: RoleError,
  component: () => <RequestsPage role="learner" />,
});
