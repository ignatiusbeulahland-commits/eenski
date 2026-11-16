import { createFileRoute } from "@tanstack/react-router";
import { ItemCollection } from "@/components/creator/Items";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/live-trainings")({
  head: () => creatorMeta("Live Sessions", "Create and manage your live sessions on Enski."),
  component: () => <ItemCollection kind="live" />,
});
