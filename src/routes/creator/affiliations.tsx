import { createFileRoute } from "@tanstack/react-router";
import { OngoingPromotions } from "@/components/creator/Affiliates";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/affiliations")({
  head: () => creatorMeta("Ongoing Promotions", "Products affiliates can promote and their commission."),
  component: () => <OngoingPromotions />,
});
