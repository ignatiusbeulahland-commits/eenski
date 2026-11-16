import { createFileRoute } from "@tanstack/react-router";
import { RequestsPage } from "@/components/help-centre/Requests";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/requests")({
  head: () => meta("My requests and chats", "Follow your support requests and pick up past conversations."),
  errorComponent: RoleError,
  component: () => <RequestsPage role="affiliate" />,
});
