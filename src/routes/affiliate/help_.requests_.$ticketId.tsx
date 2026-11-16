import { createFileRoute } from "@tanstack/react-router";
import { RequestDetailPage } from "@/components/help-centre/Requests";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/requests_/$ticketId")({
  head: () => meta("Support request", "The status and replies for your support request."),
  errorComponent: RoleError,
  component: function Page() { const { ticketId } = Route.useParams(); return <RequestDetailPage role="affiliate" ticketId={ticketId} />; },
});
