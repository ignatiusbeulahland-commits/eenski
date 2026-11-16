import { createFileRoute, Link } from "@tanstack/react-router";
import { SupportShell } from "@/components/support/SupportShell";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support")({
  head: () => supportMeta("Support desk", "The Enski support workspace for chats and tickets."),
  component: SupportShell,
  errorComponent: () => (
    <div className="p-8">
      The support desk could not open. <Link to="/support/dashboard">Return to overview</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8">
      Page not found. <Link to="/support/dashboard">Return to overview</Link>
    </div>
  ),
});
