import { createFileRoute } from "@tanstack/react-router";
import { LandingPagesList } from "@/components/creator/LandingPages";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/landing-pages")({
  head: () => creatorMeta("Landing Pages", "Pages that collect leads or sell a single product."),
  component: () => <LandingPagesList />,
});
