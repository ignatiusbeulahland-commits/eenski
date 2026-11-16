import { createFileRoute } from "@tanstack/react-router";
import { IntegrationSettings } from "@/components/learner/Settings";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/settings/integrations")({
  head: () => learnerMeta("Integrations", "Connect calendars and meeting apps to your Enski learner account."),
  component: IntegrationSettings,
});
