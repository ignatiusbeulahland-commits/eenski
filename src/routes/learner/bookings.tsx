import { createFileRoute } from "@tanstack/react-router";
import { MyBookingsPage } from "@/components/learner/bookings/MyBookings";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/bookings")({
  head: () => learnerMeta("My bookings", "Your upcoming and past coaching sessions."),
  component: MyBookingsPage,
});
