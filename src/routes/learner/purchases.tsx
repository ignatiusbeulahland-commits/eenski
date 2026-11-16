import { createFileRoute } from "@tanstack/react-router";
import { PurchasesPage } from "@/components/learner/Purchases";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/purchases")({
  head: () => learnerMeta("Purchases", "Your Enski purchase history, receipts and order status."),
  component: PurchasesPage,
});
