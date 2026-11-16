import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => legalHead("privacy", "How Enski collects, uses, shares and protects your personal information, and the rights you have over it."),
  component: () => <LegalPage page="privacy"></LegalPage>,
});
