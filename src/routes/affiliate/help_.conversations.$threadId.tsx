import { createFileRoute } from "@tanstack/react-router";
import { ConversationPage } from "@/components/help-centre/Requests";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/conversations/$threadId")({
  head: () => meta("Conversation", "A past conversation with Charm and the Enski support team."),
  errorComponent: RoleError,
  component: function Page() { const { threadId } = Route.useParams(); return <ConversationPage role="affiliate" threadId={threadId} />; },
});
