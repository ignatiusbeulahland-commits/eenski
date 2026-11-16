import { createFileRoute } from "@tanstack/react-router";
import { ItemDetails } from "@/components/creator/Items";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/ebooks_/$slug")({
  head: () => creatorMeta("Digital Download details", "Manage this digital download in your Enski Creator studio."),
  validateSearch: (s: Record<string, unknown>): { tab?: string } =>
    typeof s["tab"] === "string" ? { tab: s["tab"] } : {},
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="product" />,
});
function Page() {
  const { slug } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <ItemDetails
      kind="ebook"
      id={slug}
      tab={tab}
      onTab={(t) => navigate({ search: t === "overview" ? {} : { tab: t }, replace: true })}
    />
  );
}
