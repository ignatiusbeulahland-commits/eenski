import { createFileRoute } from "@tanstack/react-router";
import { AffiliateSales } from "@/components/creator/Affiliates";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/affiliations_/sales")({
  head: () => creatorMeta("Affiliate Sales", "Sales your affiliates have referred."),
  component: () => <AffiliateSales />,
});
