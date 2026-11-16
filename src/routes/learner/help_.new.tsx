import { createFileRoute } from "@tanstack/react-router";
import { NewRequestPage } from "@/components/help-centre/Requests";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/new")({
  head: () => meta("New support request", "Tell the Enski support team what happened and get a reference straight away."),
  errorComponent: RoleError,
  validateSearch: (s: Record<string, unknown>) => ({ about: typeof s["about"] === "string" ? s["about"] : undefined }),
  component: function Page() { const { about } = Route.useSearch(); return <NewRequestPage role="learner" topic={about} />; },
});
