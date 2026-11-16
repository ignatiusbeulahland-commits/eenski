import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, Landmark } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, PageHeader } from "@/components/affiliate/ui";
import { useAffiliate } from "@/lib/affiliate/store";
import { MultiCurrencyWallet } from "@/components/shared/finance/Wallet";
import { TxHistory } from "@/components/shared/finance/TxHistory";
import { PayoutInfo } from "@/components/shared/finance/PayoutInfo";
import { affiliateBalances, affiliatePayoutBlockers } from "@/lib/affiliate/finance";
import { beneficiaryLabel, maskedLast4, preferredBeneficiary } from "@/lib/shared/finance/beneficiaries";
import type { CurrencyCode } from "@/lib/shared/finance/currencies";
import { meta } from "@/lib/affiliate/meta";
import { verificationComplete } from "@/lib/affiliate/rules";

export const Route = createFileRoute("/affiliate/payouts")({
  head: () => meta("Payouts", "Withdraw your affiliate earnings to your bank account."),
  component: Payouts,
});

function Payouts() {
  const { state } = useAffiliate();
  const navigate = useNavigate();
  const setOpen = (cur: CurrencyCode) => void navigate({ to: "/affiliate/wallet/withdraw", search: { cur } });
  const balances = affiliateBalances(state);
  const pref = preferredBeneficiary(state.beneficiaries);
  const requirements = [
    { label: "Accept the affiliate terms", done: state.termsAccepted, to: "/affiliate/dashboard" },
    { label: "Add a payout account", done: state.beneficiaries.length > 0, to: "/affiliate/settings/bank-account" },
    { label: "Complete verification", done: verificationComplete(state.verification), to: "/affiliate/settings/verification" },
    { label: "Have an available balance", done: balances.some((b) => b.available > 0), to: "/affiliate/market" },
  ];
  return (
    <div>
      <PageHeader eyebrow="Payouts" title="Payouts" description="Withdraw available earnings to your payout account and track every request." actions={<Button variant="lime" size="lg" onClick={() => setOpen(balances[0]?.currency ?? "NGN")}><Banknote />Request payout</Button>} />
      <MultiCurrencyWallet balances={balances} displayCurrency={state.finance.displayCurrency} onWithdraw={setOpen}
        accountsLink="/affiliate/settings/bank-account" settingsLink="/affiliate/settings/currency"
        accountLabel={<><Landmark className="h-4 w-4 shrink-0 text-lime" /><span className="truncate">{pref ? `${beneficiaryLabel(pref)} ${maskedLast4(pref)}` : "Add payout account"}</span></>}
        footer={
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <TxHistory title="Payout history" description="Each withdrawal with its reference, destination and status." rows={[]} directions={false}
              empty={<EmptyState compact icon={Banknote} title="No payouts yet" description="When you withdraw your available balance, each payout and its status will be listed here." action={!pref && <Button asChild variant="outline" size="sm"><Link to="/affiliate/settings/bank-account">Add payout account</Link></Button>} />} />
            <PayoutInfo account={pref} accountsLink="/affiliate/settings/bank-account" requirements={requirements} />
          </div>
        } />
    </div>
  );
}
