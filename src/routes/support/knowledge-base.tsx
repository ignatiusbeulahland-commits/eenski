import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBasePage } from "@/components/support/KnowledgeBasePage";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/knowledge-base")({
  head: () => supportMeta("Knowledge base", "Manage the published articles Charm uses to answer questions."),
  component: KnowledgeBasePage,
});
