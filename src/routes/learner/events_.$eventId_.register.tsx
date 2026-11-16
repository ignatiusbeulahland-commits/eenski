import { createFileRoute } from "@tanstack/react-router";
import { RegisterEvent } from "@/components/learner/events/RegisterEvent";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/events_/$eventId_/register")({
  head: () => learnerMeta("Register for an event", "Choose tickets, add your details and confirm your seat."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="event" />,
});
function Page() {
  const { eventId } = Route.useParams();
  return <RegisterEvent id={eventId} />;
}
