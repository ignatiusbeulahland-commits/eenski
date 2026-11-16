import { createFileRoute } from "@tanstack/react-router";
import { LiveChatPage } from "@/components/support/LiveChatPage";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/live-chat")({
  head: () => supportMeta("Live chat", "Manage incoming chats and human handovers."),
  validateSearch: (s: Record<string, unknown>) => ({ chat: typeof s['chat'] === "string" ? s['chat'] : undefined }),
  component: LiveChatPage,
});
