import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage } from "@/components/help-centre/Articles";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/$articleId")({
  head: () => meta("Help answer", "An answer from the Enski support centre."),
  errorComponent: RoleError,
  component: function Page() {
    const { articleId } = Route.useParams();
    return <ArticlePage role="affiliate" articleId={articleId} />;
  },
});
