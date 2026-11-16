import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/help-centre/Articles";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/$articleId")({
  head: () => meta("Help answer", "An answer from the Enski support centre."),
  errorComponent: RoleError,
  component: function Page() {
    const { articleId } = Route.useParams();
    return <ArticlePage role="creator" articleId={articleId} />;
  },
});
