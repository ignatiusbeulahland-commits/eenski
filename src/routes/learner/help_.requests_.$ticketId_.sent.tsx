import { createFileRoute } from "@tanstack/react-router";
import { RequestSentPage } from "@/components/help-centre/Requests";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/requests_/$ticketId_/sent")({
  head: () => meta("Request received", "Your support request was received."),
  errorComponent: RoleError,
  component: function Page() { const { ticketId } = Route.useParams(); return <RequestSentPage role="learner" ticketId={ticketId} />; },
});
