import { createFileRoute, notFound } from "@tanstack/react-router";
import { GuideArticle } from "@/components/creator/Resources";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorGuides } from "@/lib/creator/data";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/guides_/$guideId")({
  loader: ({ params }) => {
    const item = creatorGuides.find((i) => i.id === params.guideId);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) =>
    creatorMeta(loaderData?.title ?? "Resource unavailable", "Enski Creator resources."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="guide" />,
});
function Page() {
  const item = Route.useLoaderData();
  return <GuideArticle guide={item} />;
}
