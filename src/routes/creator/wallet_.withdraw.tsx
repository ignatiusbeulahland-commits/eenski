import { createFileRoute } from "@tanstack/react-router";
import { CreatorWithdrawPage } from "@/components/creator/Withdrawals";
import { creatorMeta } from "@/lib/creator/meta";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";

export const Route = createFileRoute("/creator/wallet_/withdraw")({
  validateSearch: (s: Record<string, unknown>): { cur?: CurrencyCode; ben?: string | undefined } => ({
    cur: (CURRENCY_CODES as readonly string[]).includes(String(s["cur"])) ? (s["cur"] as CurrencyCode) : "NGN",
    ...(typeof s["ben"] === "string" ? { ben: s["ben"] } : {}),
  }),
  head: () => creatorMeta("Withdraw", "Withdraw your Enski earnings to a bank account, card, PayPal or Stripe."),
  component: Page,
});

function Page() {
  const { cur, ben } = Route.useSearch();
  return <CreatorWithdrawPage currency={cur ?? "NGN"} beneficiary={ben} />;
}
