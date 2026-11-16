import { createFileRoute } from "@tanstack/react-router";
import { CreatorBookings } from "@/components/creator/Bookings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/bookings")({
  head: () => creatorMeta("Bookings & sessions", "Your coaching bookings, live sessions and service orders in one place."),
  component: CreatorBookings,
});
