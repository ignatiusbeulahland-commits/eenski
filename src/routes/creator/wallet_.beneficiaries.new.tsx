import { createFileRoute } from "@tanstack/react-router";
import { CreatorAddBeneficiaryPage } from "@/components/creator/Withdrawals";
import { creatorMeta } from "@/lib/creator/meta";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";

export const Route = createFileRoute("/creator/wallet_/beneficiaries/new")({
  validateSearch: (s: Record<string, unknown>): { from?: "withdraw" | "wallet"; cur?: CurrencyCode } => ({
    from: s["from"] === "withdraw" ? "withdraw" : "wallet",
    cur: (CURRENCY_CODES as readonly string[]).includes(String(s["cur"])) ? (s["cur"] as CurrencyCode) : "NGN",
  }),
  head: () => creatorMeta("Add payout account", "Add a bank account, debit card, PayPal or Stripe account for your Enski payouts."),
  component: Page,
});

function Page() {
  const { from, cur } = Route.useSearch();
  return <CreatorAddBeneficiaryPage from={from ?? "wallet"} currency={cur ?? "NGN"} />;
}
