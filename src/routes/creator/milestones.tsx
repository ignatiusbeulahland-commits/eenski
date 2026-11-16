import { createFileRoute } from "@tanstack/react-router";
import { UniversePage } from "@/components/creator/universe/Pages";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/milestones")({
  head: () =>
    creatorMeta(
      "Creator Universe",
      "Explore your original Enski character and nine Creator milestone evolutions.",
    ),
  component: UniversePage,
});
