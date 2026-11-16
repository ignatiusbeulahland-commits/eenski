import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/help-centre/Articles";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/$articleId")({
  head: () => meta("Help answer", "An answer from the Enski support centre."),
  errorComponent: RoleError,
  component: function Page() {
    const { articleId } = Route.useParams();
    return <ArticlePage role="learner" articleId={articleId} />;
  },
});
