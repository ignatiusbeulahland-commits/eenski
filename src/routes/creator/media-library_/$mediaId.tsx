import { createFileRoute } from "@tanstack/react-router";
import { MediaDetails } from "@/components/creator/Media";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/media-library_/$mediaId")({
  head: () => creatorMeta("File details", "Manage a file in your Enski Media Library."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="media" />,
});
function Page() {
  const { mediaId } = Route.useParams();
  return <MediaDetails id={mediaId} />;
}
