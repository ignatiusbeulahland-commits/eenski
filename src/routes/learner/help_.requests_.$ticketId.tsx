import { createFileRoute } from "@tanstack/react-router";
import { RequestDetailPage } from "@/components/help-centre/Requests";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/requests_/$ticketId")({
  head: () => meta("Support request", "The status and replies for your support request."),
  errorComponent: RoleError,
  component: function Page() { const { ticketId } = Route.useParams(); return <RequestDetailPage role="learner" ticketId={ticketId} />; },
});
