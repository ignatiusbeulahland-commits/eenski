import { createFileRoute } from "@tanstack/react-router";
import { ConversationsPage } from "@/components/support/ConversationsPage";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/conversations")({
  head: () => supportMeta("Conversations", "Read back live chats and Charm conversations."),
  component: ConversationsPage,
});
