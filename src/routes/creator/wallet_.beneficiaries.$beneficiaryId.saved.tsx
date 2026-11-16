import { createFileRoute } from "@tanstack/react-router";
import { CreatorBeneficiarySavedPage } from "@/components/creator/Withdrawals";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/wallet_/beneficiaries/$beneficiaryId/saved")({
  validateSearch: (s: Record<string, unknown>): { from?: "withdraw" | "wallet" } => ({ from: s["from"] === "withdraw" ? "withdraw" : "wallet" }),
  head: () => creatorMeta("Beneficiary saved", "Your new payout account is saved and ready for withdrawals."),
  component: Page,
});

function Page() {
  const { beneficiaryId } = Route.useParams();
  const { from } = Route.useSearch();
  return <CreatorBeneficiarySavedPage id={beneficiaryId} from={from ?? "wallet"} />;
}
