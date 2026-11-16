import { createFileRoute } from "@tanstack/react-router";
import { ItemCollection } from "@/components/creator/Items";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/coaching")({
  head: () => creatorMeta("Coaching", "Create and manage your coaching offers on Enski."),
  component: () => <ItemCollection kind="coaching" />,
});
