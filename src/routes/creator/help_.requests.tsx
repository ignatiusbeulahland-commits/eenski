import { createFileRoute } from "@tanstack/react-router";
import { RequestsPage } from "@/components/help-centre/Requests";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/requests")({
  head: () => meta("My requests and chats", "Follow your support requests and pick up past conversations."),
  errorComponent: RoleError,
  component: () => <RequestsPage role="creator" />,
});
