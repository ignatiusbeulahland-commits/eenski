import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettings } from "@/components/learner/Settings";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/settings/security")({
  head: () => learnerMeta("Password & security", "Password, sessions and security settings for your Enski learner account."),
  component: SecuritySettings,
});
