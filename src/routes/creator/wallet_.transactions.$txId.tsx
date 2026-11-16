import { createFileRoute } from "@tanstack/react-router";
import { CreatorTxPage } from "@/components/creator/Withdrawals";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/wallet_/transactions/$txId")({
  validateSearch: (s: Record<string, unknown>): { refunded?: 1 } => (s["refunded"] === 1 || s["refunded"] === "1" ? { refunded: 1 } : {}),
  head: () => creatorMeta("Transaction details", "Amounts, reference, status timeline and receipt for an Enski transaction."),
  component: Page,
});

function Page() {
  const { txId } = Route.useParams();
  const { refunded } = Route.useSearch();
  return <CreatorTxPage txId={txId} justRefunded={refunded === 1} />;
}
