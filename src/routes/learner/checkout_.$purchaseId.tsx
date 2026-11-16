import { createFileRoute } from "@tanstack/react-router";
import { LearnerCheckoutResult } from "@/components/learner/Checkout";
import { LearnerError } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";

export const Route = createFileRoute("/learner/checkout_/$purchaseId")({
  head: () => learnerMeta("Payment status", "The result of your Enski payment and what to do next."),
  component: Page,
  errorComponent: LearnerError,
});

function Page() {
  const { purchaseId } = Route.useParams();
  return <LearnerCheckoutResult id={purchaseId} />;
}
