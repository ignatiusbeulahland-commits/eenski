import { createFileRoute } from "@tanstack/react-router";
import { LearnerBadgePage } from "@/components/learner/Achievements";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/badges/$badgeKey")({
  head: () => learnerMeta("Badge", "Your Enski badge: criteria, evidence, download, share and verification."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="certificate" />,
});
function Page() {
  const { badgeKey } = Route.useParams();
  return <LearnerBadgePage badgeKey={badgeKey} />;
}
