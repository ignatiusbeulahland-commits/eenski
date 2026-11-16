import { createFileRoute } from "@tanstack/react-router";
import { TopicPage } from "@/components/help-centre/Articles";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/topics/$topicId")({
  head: () => meta("Support topic", "Answers and ways to get help for this topic."),
  errorComponent: RoleError,
  component: function Page() { const { topicId } = Route.useParams(); return <TopicPage role="creator" topicId={topicId} />; },
});
