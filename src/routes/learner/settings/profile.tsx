import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettings } from "@/components/learner/Settings";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/settings/profile")({
  head: () => learnerMeta("Manage profile", "Edit your Enski learner profile."),
  component: ProfileSettings,
});
