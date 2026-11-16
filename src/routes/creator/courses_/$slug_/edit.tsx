import { createFileRoute } from "@tanstack/react-router";
import { ItemEditor } from "@/components/creator/Items";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/courses_/$slug_/edit")({
  head: () => creatorMeta("Edit Course", "Edit this course in your Enski Creator studio."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="product" />,
});
function Page() {
  const { slug } = Route.useParams();
  return <ItemEditor kind="course" id={slug} />;
}
