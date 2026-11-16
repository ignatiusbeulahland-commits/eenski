import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/help-centre/Requests";
import { LearnerError as RoleError } from "@/components/learner/shared";
import { learnerMeta as meta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/help_/contact")({
  head: () => meta("Contact support", "Chat with Charm, talk to a person or send the Enski support team a request."),
  errorComponent: RoleError,
  component: () => <ContactPage role="learner" />,
});
