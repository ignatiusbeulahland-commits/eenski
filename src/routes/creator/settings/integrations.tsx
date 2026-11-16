import { createFileRoute } from "@tanstack/react-router";
import { CreatorIntegrations } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/integrations")({
  head: () => creatorMeta("Integrations", "Integrations in your Enski Creator studio."),
  component: () => <CreatorIntegrations />,
});
