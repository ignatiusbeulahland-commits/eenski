import { createFileRoute } from "@tanstack/react-router";
import { RequestSentPage } from "@/components/help-centre/Requests";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/requests_/$ticketId_/sent")({
  head: () => meta("Request received", "Your support request was received."),
  errorComponent: RoleError,
  component: function Page() { const { ticketId } = Route.useParams(); return <RequestSentPage role="affiliate" ticketId={ticketId} />; },
});
