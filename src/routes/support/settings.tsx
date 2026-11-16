import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/support/SettingsPage";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/settings")({
  head: () => supportMeta("Settings", "Configure agents, hours, routing and notifications."),
  component: SettingsPage,
});
