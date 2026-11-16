import { createFileRoute } from "@tanstack/react-router";
import { StorefrontPage } from "@/components/creator/Storefront";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/storefront")({
  head: () => creatorMeta("Storefront", "Set up your public Enski storefront."),
  component: () => <StorefrontPage />,
});
