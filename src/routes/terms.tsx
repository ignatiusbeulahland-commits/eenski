import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => legalHead("terms", "The terms for using Enski as a learner, creator or affiliate, including payments, conduct and imported landing pages."),
  component: () => <LegalPage page="terms"></LegalPage>,
});
