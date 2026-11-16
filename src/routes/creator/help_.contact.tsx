import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/help-centre/Requests";
import { CreatorError as RoleError } from "@/components/creator/shared";
import { creatorMeta as meta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/help_/contact")({
  head: () => meta("Contact support", "Chat with Charm, talk to a person or send the Enski support team a request."),
  errorComponent: RoleError,
  component: () => <ContactPage role="creator" />,
});
