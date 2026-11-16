import { createFileRoute } from "@tanstack/react-router";
import { UpcomingEventsPage } from "@/components/learner/bookings/UpcomingEvents";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/upcoming")({
  head: () => learnerMeta("Upcoming events", "Your live sessions, coaching, and upcoming gigs."),
  component: UpcomingEventsPage,
});
