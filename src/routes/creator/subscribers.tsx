import { createFileRoute } from "@tanstack/react-router";
import { SubscribersPage } from "@/components/creator/Commerce";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/subscribers")({
  head: () => creatorMeta("Dreamers / Subscribers", "Everyone who has bought from you or joined your list."),
  component: () => <SubscribersPage />,
});
