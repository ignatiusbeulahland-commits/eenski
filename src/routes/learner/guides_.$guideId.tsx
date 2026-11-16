import { createFileRoute } from "@tanstack/react-router";
import { GuideDetails } from "@/components/learner/Support";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/guides_/$guideId")({
  head: () => learnerMeta("Guide", "A step-by-step Enski learner guide."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="guide" />,
});
function Page() {
  const { guideId } = Route.useParams();
  return <GuideDetails id={guideId} />;
}
