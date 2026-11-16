import { createFileRoute } from "@tanstack/react-router";
import { ItemCollection } from "@/components/creator/Items";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/ebooks")({
  head: () => creatorMeta("Digital Downloads", "Create and manage your digital downloads on Enski."),
  component: () => <ItemCollection kind="ebook" />,
});
