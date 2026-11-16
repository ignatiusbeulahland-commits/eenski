import { createFileRoute } from "@tanstack/react-router";
import { CreatorWithdrawalPage } from "@/components/creator/Withdrawals";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/wallet_/withdrawals/$withdrawalId")({
  head: () => creatorMeta("Withdrawal", "The status of your Enski withdrawal, with amount, beneficiary and reference."),
  component: Page,
});

function Page() {
  const { withdrawalId } = Route.useParams();
  return <CreatorWithdrawalPage id={withdrawalId} />;
}
