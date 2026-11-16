import { createFileRoute } from "@tanstack/react-router";
import { ConversationPage } from "@/components/help-centre/Requests";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/conversations/$threadId")({
  head: () => meta("Conversation", "A past conversation with Charm and the Enski support team."),
  errorComponent: RoleError,
  component: function Page() { const { threadId } = Route.useParams(); return <ConversationPage role="learner" threadId={threadId} />; },
});
