import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/learner/Commerce";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/cart")({
  head: () => learnerMeta("Cart", "Review your cart and check out on Enski."),
  component: CartPage,
});
