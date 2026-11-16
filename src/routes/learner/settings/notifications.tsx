import { createFileRoute } from "@tanstack/react-router";
import { NotificationSettings } from "@/components/learner/Settings";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/settings/notifications")({
  head: () => learnerMeta("Notifications", "Your Enski notifications and email preferences."),
  component: NotificationSettings,
});
