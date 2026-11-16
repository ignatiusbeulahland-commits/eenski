import { createFileRoute } from "@tanstack/react-router";
import { TicketsPage } from "@/components/support/TicketsPage";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/tickets")({
  head: () => supportMeta("Tickets", "Search and manage support requests."),
  component: TicketsPage,
});
