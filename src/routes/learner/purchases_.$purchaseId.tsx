import { createFileRoute } from "@tanstack/react-router";
import { PurchaseDetails } from "@/components/learner/Purchases";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/purchases_/$purchaseId")({
  head: () => learnerMeta("Order details", "Order items, payment status and receipt on Enski."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="purchase" />,
});
function Page() {
  const { purchaseId } = Route.useParams();
  return <PurchaseDetails id={purchaseId} />;
}
