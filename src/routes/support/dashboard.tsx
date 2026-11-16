import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/support/Overview";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/dashboard")({
  head: () => supportMeta("Overview", "Your support queue and activity at a glance."),
  component: Overview,
});
