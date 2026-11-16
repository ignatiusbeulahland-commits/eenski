import { createFileRoute } from "@tanstack/react-router";
import { ItemCollection } from "@/components/creator/Items";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/services")({
  head: () => creatorMeta("Services", "Create and manage your services on Enski."),
  component: () => <ItemCollection kind="service" />,
});
