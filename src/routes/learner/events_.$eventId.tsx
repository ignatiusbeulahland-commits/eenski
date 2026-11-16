import { createFileRoute } from "@tanstack/react-router";
import { EventDetails } from "@/components/learner/events/EventDetails";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/events_/$eventId")({
  head: () => learnerMeta("Event details", "Event date, venue, agenda and registration on Enski."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="event" />,
});
function Page() {
  const { eventId } = Route.useParams();
  return <EventDetails id={eventId} />;
}
