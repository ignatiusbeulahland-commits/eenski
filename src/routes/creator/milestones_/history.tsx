import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/components/creator/universe/Pages";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/milestones_/history")({
  head: () =>
    creatorMeta(
      "Achievement History",
      "Explore your original Enski character and nine Creator milestone evolutions.",
    ),
  component: HistoryPage,
});
