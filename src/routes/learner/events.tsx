import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/components/learner/Events";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/events")({
  head: () => learnerMeta("Events", "Discover workshops, live sessions and meetups from Enski creators."),
  component: EventsPage,
});
