import { createFileRoute } from "@tanstack/react-router";
import { CreatorGuides } from "@/components/creator/Resources";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/guides")({
  head: () => creatorMeta("Guides", "Guides in your Enski Creator studio."),
  component: () => <CreatorGuides />,
});
