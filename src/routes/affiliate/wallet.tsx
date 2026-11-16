import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { History, Landmark } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, PageHeader } from "@/components/affiliate/ui";
import { TxHistory } from "@/components/shared/finance/TxHistory";
import { MultiCurrencyWallet } from "@/components/shared/finance/Wallet";
import { useAffiliate } from "@/lib/affiliate/store";
import { meta } from "@/lib/affiliate/meta";
import { affiliatePayoutBlockers, affiliateBalances } from "@/lib/affiliate/finance";
import { beneficiaryLabel, maskedLast4, preferredBeneficiary } from "@/lib/shared/finance/beneficiaries";
import type { CurrencyCode } from "@/lib/shared/finance/currencies";

export const Route = createFileRoute("/affiliate/wallet")({
  head: () => meta("Wallet", "Your affiliate balances in every currency you earn."),
  component: Wallet,
});

function Wallet() {
  const { state } = useAffiliate();
  const navigate = useNavigate();
  const setOpen = (cur: CurrencyCode) => void navigate({ to: "/affiliate/wallet/withdraw", search: { cur } });
  const balances = affiliateBalances(state);
  const pref = preferredBeneficiary(state.beneficiaries);
  return (
    <div>
      <PageHeader eyebrow="Wallet" title="Your wallet" description="Commission you've earned in each currency, and what's ready to withdraw." />
      <MultiCurrencyWallet balances={balances} displayCurrency={state.finance.displayCurrency} onWithdraw={setOpen}
        accountsLink="/affiliate/settings/bank-account" settingsLink="/affiliate/settings/currency"
        accountLabel={<><Landmark className="h-4 w-4 shrink-0 text-lime" /><span className="truncate">{pref ? `${beneficiaryLabel(pref)} ${maskedLast4(pref)}` : "Add payout account"}</span></>}
        footer={
          <TxHistory title="Wallet activity" description="Commission credits and withdrawals, with references and status." rows={[]}
            empty={<EmptyState compact icon={History} title="No wallet activity yet" description="Commission credits and withdrawals will appear here as they happen." action={<Button asChild variant="outline"><Link to="/affiliate/market">Start promoting</Link></Button>} />} />
        } />
    </div>
  );
}
