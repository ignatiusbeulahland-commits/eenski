import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal/LegalPage";
import { CookiePreferences } from "@/components/legal/CookiePreferences";
export const Route = createFileRoute("/cookies-settings")({
  head: () => legalHead("cookies", "Learn how Enski uses cookies and manage your essential, analytics, preference and marketing choices."),
  component: () => <LegalPage page="cookies"><CookiePreferences /></LegalPage>,
});
