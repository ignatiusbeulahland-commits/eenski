import { createFileRoute } from "@tanstack/react-router";
import { AffiliateDetails } from "@/components/creator/Affiliates";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/affiliates_/$affiliateId")({
  head: () => creatorMeta("Affiliate", "Manage an affiliate who promotes your products."),
  component: Page,
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound what="affiliate" />,
});
function Page() {
  const { affiliateId } = Route.useParams();
  return <AffiliateDetails id={affiliateId} />;
}
