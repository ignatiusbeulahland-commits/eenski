import { createFileRoute } from "@tanstack/react-router";
import { CourseComplete } from "@/components/learner/CourseComplete";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/resources_/$resourceId_/complete")({
  head: () => learnerMeta("Completed", "You finished it: your completion, certificate and what to learn next."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="resource" />,
});
function Page() {
  const { resourceId } = Route.useParams();
  return <CourseComplete id={resourceId} />;
}
