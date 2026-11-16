import { createFileRoute } from "@tanstack/react-router";
import { LandingPageEditor } from "@/components/creator/LandingPages";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/landing-pages_/$pageId_/edit")({
  head: () => creatorMeta("Edit landing page", "Edit an Enski landing page."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="landingPage" />,
});
function Page() {
  const { pageId } = Route.useParams();
  return <LandingPageEditor id={pageId} />;
}
