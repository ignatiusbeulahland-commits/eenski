import { createFileRoute } from "@tanstack/react-router";
import { DreamersPage } from "@/components/creator/dreamers/DreamersPage";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/subscribers")({
  head: () => creatorMeta("Dreamers & Subscribers", "See where your dreamers come from, track enrolments and manage your subscribers."),
  component: () => <DreamersPage />,
});
