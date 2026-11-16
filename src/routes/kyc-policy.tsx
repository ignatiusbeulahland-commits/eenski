import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/kyc-policy")({
  head: () => legalHead("kyc", "How Enski verifies creators and affiliates with email, BVN and bank checks before paying out earnings."),
  component: () => <LegalPage page="kyc"></LegalPage>,
});
