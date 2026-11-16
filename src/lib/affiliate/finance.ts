import { balancesByCurrency } from "@/lib/shared/finance/wallet";
import type { CurrencyCode } from "@/lib/shared/finance/currencies";
import { verificationComplete } from "./rules";
import type { State } from "./store";

/** Affiliates have no commission records yet, so every balance is zero until real earnings exist. */
export const affiliateBalances = (s: Pick<State, "finance">) => balancesByCurrency([], ["NGN", ...s.finance.walletCurrencies.filter((c) => c !== "NGN")]);

export function affiliatePayoutBlockers(s: State, currency: CurrencyCode) {
  const available = affiliateBalances(s).find((b) => b.currency === currency)?.available ?? 0;
  return [
    !s.termsAccepted && { label: "Accept the affiliate terms", to: "/affiliate/dashboard" },
    !s.beneficiaries.length && { label: "Add a payout account", to: "/affiliate/settings/bank-account" },
    !verificationComplete(s.verification) && { label: "Complete verification", to: "/affiliate/settings/verification" },
    available <= 0 && { label: `Earn a ${currency} balance to withdraw`, to: "/affiliate/market" },
  ].filter(Boolean) as { label: string; to: string }[];
}
