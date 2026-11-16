import { createFileRoute } from "@tanstack/react-router";
import { CreatorDashboard } from "@/components/creator/Dashboard";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/dashboard")({
  head: () => creatorMeta("Overview", "Overview in your Enski Creator studio."),
  component: () => <CreatorDashboard />,
});
