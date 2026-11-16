import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/help-centre/Requests";
import { AffiliateError as RoleError } from "@/components/affiliate/RouteBoundary";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/help_/contact")({
  head: () => meta("Contact support", "Chat with Charm, talk to a person or send the Enski support team a request."),
  errorComponent: RoleError,
  component: () => <ContactPage role="affiliate" />,
});
