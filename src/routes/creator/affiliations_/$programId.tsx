import { createFileRoute } from "@tanstack/react-router";
import { ProgramDetails } from "@/components/creator/Affiliates";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/affiliations_/$programId")({
  head: () => creatorMeta("Ongoing promotion", "Manage a product in your affiliate programme."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="programme" />,
});
function Page() {
  const { programId } = Route.useParams();
  return <ProgramDetails id={programId} />;
}
