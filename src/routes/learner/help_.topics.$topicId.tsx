import { createFileRoute } from "@tanstack/react-router";
import { TopicPage } from "@/components/help-centre/Articles";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/topics/$topicId")({
  head: () => meta("Support topic", "Answers and ways to get help for this topic."),
  errorComponent: RoleError,
  component: function Page() { const { topicId } = Route.useParams(); return <TopicPage role="learner" topicId={topicId} />; },
});
