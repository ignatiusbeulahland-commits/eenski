import { createFileRoute } from "@tanstack/react-router";
import { CreatorAvailability } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/availability")({
  head: () => creatorMeta("Availability", "Set when people can book your coaching sessions."),
  component: () => <CreatorAvailability />,
});
