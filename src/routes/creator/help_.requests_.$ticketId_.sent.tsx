import { createFileRoute } from "@tanstack/react-router";
import { RequestSentPage } from "@/components/help-centre/Requests";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/requests_/$ticketId_/sent")({
  head: () => meta("Request received", "Your support request was received."),
  errorComponent: RoleError,
  component: function Page() { const { ticketId } = Route.useParams(); return <RequestSentPage role="creator" ticketId={ticketId} />; },
});
