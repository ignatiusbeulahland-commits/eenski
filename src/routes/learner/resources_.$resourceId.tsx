import { createFileRoute } from "@tanstack/react-router";
import { ResourceDetails } from "@/components/learner/Resources";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/resources_/$resourceId")({
  validateSearch: (s: Record<string, unknown>): { view?: "quiz" } => (s["view"] === "quiz" ? { view: "quiz" } : {}),
  head: () => learnerMeta("Resource", "Open, continue or buy this Enski resource."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="resource" />,
});
function Page() {
  const { resourceId } = Route.useParams();
  const { view } = Route.useSearch();
  return <ResourceDetails key={`${resourceId}-${view ?? ""}`} id={resourceId} view={view} />;
}
