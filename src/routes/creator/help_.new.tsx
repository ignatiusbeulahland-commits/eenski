import { createFileRoute } from "@tanstack/react-router";
import { NewRequestPage } from "@/components/help-centre/Requests";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/new")({
  head: () => meta("New support request", "Tell the Enski support team what happened and get a reference straight away."),
  errorComponent: RoleError,
  validateSearch: (s: Record<string, unknown>) => ({ about: typeof s["about"] === "string" ? s["about"] : undefined }),
  component: function Page() { const { about } = Route.useSearch(); return <NewRequestPage role="creator" topic={about} />; },
});
