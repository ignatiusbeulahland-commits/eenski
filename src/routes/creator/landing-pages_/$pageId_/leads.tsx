import { createFileRoute } from "@tanstack/react-router";
import { LandingLeads } from "@/components/creator/LandingPages";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/landing-pages_/$pageId_/leads")({
  head: () => creatorMeta("Landing page leads", "People who signed up on your landing page."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="landingPage" />,
});
function Page() {
  const { pageId } = Route.useParams();
  return <LandingLeads id={pageId} />;
}
