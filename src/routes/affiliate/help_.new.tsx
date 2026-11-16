import { createFileRoute } from "@tanstack/react-router";
import { NewRequestPage } from "@/components/help-centre/Requests";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/new")({
  head: () => meta("New support request", "Tell the Enski support team what happened and get a reference straight away."),
  errorComponent: RoleError,
  validateSearch: (s: Record<string, unknown>) => ({ about: typeof s["about"] === "string" ? s["about"] : undefined }),
  component: function Page() { const { about } = Route.useSearch(); return <NewRequestPage role="affiliate" topic={about} />; },
});
