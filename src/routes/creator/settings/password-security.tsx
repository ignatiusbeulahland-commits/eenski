import { createFileRoute } from "@tanstack/react-router";
import { CreatorSecurity } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/password-security")({
  head: () => creatorMeta("Password & Security", "Keep your Enski account secure."),
  component: () => <CreatorSecurity />,
});
