import { createFileRoute } from "@tanstack/react-router";
import { CreatorVerification } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/verification")({
  head: () => creatorMeta("Verification", "Verification in your Enski Creator studio."),
  component: () => <CreatorVerification />,
});
