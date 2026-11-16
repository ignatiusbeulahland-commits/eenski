import { createFileRoute } from "@tanstack/react-router";
import { TopicPage } from "@/components/help-centre/Articles";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/topics/$topicId")({
  head: () => meta("Support topic", "Answers and ways to get help for this topic."),
  errorComponent: RoleError,
  component: function Page() { const { topicId } = Route.useParams(); return <TopicPage role="affiliate" topicId={topicId} />; },
});
