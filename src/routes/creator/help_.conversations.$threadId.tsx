import { createFileRoute } from "@tanstack/react-router";
import { ConversationPage } from "@/components/help-centre/Requests";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/conversations/$threadId")({
  head: () => meta("Conversation", "A past conversation with Charm and the Enski support team."),
  errorComponent: RoleError,
  component: function Page() { const { threadId } = Route.useParams(); return <ConversationPage role="creator" threadId={threadId} />; },
});
