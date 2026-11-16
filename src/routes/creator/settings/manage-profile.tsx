import { createFileRoute } from "@tanstack/react-router";
import { CreatorProfile } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/manage-profile")({
  head: () => creatorMeta("Manage Profile", "Your Enski Creator profile details."),
  component: () => <CreatorProfile />,
});
