import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/creator/universe/Collection";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/milestones_/collection")({
  head: () =>
    creatorMeta(
      "Character Collection",
      "Browse six Enski characters, their signature moves, worlds and nine milestone evolutions.",
    ),
  component: CollectionPage,
});
