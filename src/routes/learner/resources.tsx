import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPage } from "@/components/learner/Resources";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/resources")({
  validateSearch: (s: Record<string, unknown>): { view?: "discover" } => (s["view"] === "discover" ? { view: "discover" } : {}),
  head: () => learnerMeta("My resources", "Your purchased Enski resources and products, plus courses and ebooks to discover."),
  component: Page,
});
function Page() {
  const { view } = Route.useSearch();
  return <ResourcesPage view={view === "discover" ? "discover" : "library"} />;
}
