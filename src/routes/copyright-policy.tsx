import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/copyright-policy")({
  head: () => legalHead("copyright", "Who owns content on Enski, what buyers may do with it, and how to report work you believe was copied."),
  component: () => <LegalPage page="copyright"></LegalPage>,
});
