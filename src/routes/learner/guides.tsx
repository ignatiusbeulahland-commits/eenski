import { createFileRoute } from "@tanstack/react-router";
import { GuidesPage } from "@/components/learner/Support";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/guides")({
  head: () => learnerMeta("Guides", "Tutorials for getting the most from Enski as a learner."),
  component: GuidesPage,
});
