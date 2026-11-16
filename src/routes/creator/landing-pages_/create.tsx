import { createFileRoute } from "@tanstack/react-router";
import { LandingPageEditor } from "@/components/creator/LandingPages";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/landing-pages_/create")({
  head: () => creatorMeta("Create landing page", "Create a new Enski landing page."),
  component: () => <LandingPageEditor />,
});
