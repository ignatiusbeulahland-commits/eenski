import { createFileRoute } from "@tanstack/react-router";
import { PublishResult } from "@/components/creator/products/PublishResult";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/products_/result/$itemId")({
  validateSearch: (s: Record<string, unknown>): { fresh?: true; change?: "unpublished" } => ({
    ...(s["fresh"] === true || s["fresh"] === "1" || s["fresh"] === 1 ? { fresh: true as const } : {}),
    ...(s["change"] === "unpublished" ? { change: "unpublished" as const } : {}),
  }),
  head: () => creatorMeta("Product saved", "Your product is published or saved as a draft."),
  component: function PublishResultRoute() {
    const { itemId } = Route.useParams();
    const { fresh, change } = Route.useSearch();
    return <PublishResult id={itemId} fresh={!!fresh} unpublished={change === "unpublished"} />;
  },
});
