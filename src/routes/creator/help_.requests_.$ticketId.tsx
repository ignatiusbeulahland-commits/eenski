import { createFileRoute } from "@tanstack/react-router";
import { RequestDetailPage } from "@/components/help-centre/Requests";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/requests_/$ticketId")({
  head: () => meta("Support request", "The status and replies for your support request."),
  errorComponent: RoleError,
  component: function Page() { const { ticketId } = Route.useParams(); return <RequestDetailPage role="creator" ticketId={ticketId} />; },
});
