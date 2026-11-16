import { createFileRoute } from "@tanstack/react-router";
import { WishlistPage } from "@/components/learner/Commerce";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/wishlist")({
  head: () => learnerMeta("Wishlist", "Resources and events you saved for later on Enski."),
  component: WishlistPage,
});
