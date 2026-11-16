import { createFileRoute } from "@tanstack/react-router";
import { CreatorPerformance } from "@/components/creator/Analytics";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/performance")({
  head: () => creatorMeta("Performance", "How your Enski products and sales are doing."),
  component: () => <CreatorPerformance />,
});
