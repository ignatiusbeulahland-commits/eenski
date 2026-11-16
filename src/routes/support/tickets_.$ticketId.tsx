import { createFileRoute } from "@tanstack/react-router";
import { TicketDetails } from "@/components/support/TicketDetails";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/tickets_/$ticketId")({
  head: () => supportMeta("Ticket details", "Read and reply to a support ticket."),
  component: Page,
});
function Page() {
  const { ticketId } = Route.useParams();
  return <TicketDetails id={ticketId} />;
}
