import { createFileRoute } from "@tanstack/react-router";
import { CreatorNotifications } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/notifications")({
  head: () => creatorMeta("Notifications", "Notifications in your Enski Creator studio."),
  component: () => <CreatorNotifications />,
});
