import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/components/creator/Reviews";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/reviews")({
  head: () => creatorMeta("Reviews", "See and manage what customers say about your products."),
  component: () => <ReviewsPage />,
});
