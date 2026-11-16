import { createFileRoute } from "@tanstack/react-router";
import { AffiliatesPage } from "@/components/creator/Affiliates";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/affiliates")({
  head: () => creatorMeta("Affiliates", "People who promote your Enski products."),
  component: () => <AffiliatesPage />,
});
