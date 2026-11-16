import { createFileRoute } from "@tanstack/react-router";
import { CouponsPage } from "@/components/creator/Promotions";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/coupons")({
  head: () => creatorMeta("Coupons / Discounts", "Create discount codes for your Enski products."),
  component: () => <CouponsPage />,
});
