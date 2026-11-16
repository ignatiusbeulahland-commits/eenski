import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { WithdrawFlow } from "@/components/shared/finance/WithdrawFlow";
import { affiliateBalances, affiliatePayoutBlockers } from "@/lib/affiliate/finance";
import { meta } from "@/lib/affiliate/meta";
import { useAffiliate } from "@/lib/affiliate/store";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";

export const Route = createFileRoute("/affiliate/wallet_/withdraw")({
  validateSearch: (s: Record<string, unknown>): { cur?: CurrencyCode } => ({
    cur: (CURRENCY_CODES as readonly string[]).includes(String(s["cur"])) ? (s["cur"] as CurrencyCode) : "NGN",
  }),
  head: () => meta("Withdraw", "Withdraw your affiliate commission to your payout account."),
  component: Page,
});

/** Same withdrawal journey as creators; affiliates see what's left to unlock until commission is earned. */
function Page() {
  const { cur } = Route.useSearch();
  const { state } = useAffiliate();
  const navigate = useNavigate();
  const currency = cur ?? "NGN";
  const blockers = affiliatePayoutBlockers(state, currency);
  return (
    <div className="py-2">
      <WithdrawFlow
        balances={affiliateBalances(state)}
        beneficiaries={state.beneficiaries}
        initialCurrency={currency}
        blockers={blockers.map((b) => ({ label: b.label, to: <Link to={b.to as "/affiliate/market"} className="flex items-center gap-3 rounded-[16px] border-[1.5px] border-line p-3 text-sm font-extrabold transition-colors hover:border-cobalt-100 hover:bg-ice"><span className="h-5 w-5 rounded-full border-2 border-line" aria-hidden="true" />{b.label}<ArrowRight className="ml-auto h-4 w-4 text-cobalt" /></Link> }))}
        pinSet={false}
        savePin={async () => false}
        verifyPin={async () => false}
        onSubmit={() => void navigate({ to: "/affiliate/wallet" })}
        onLocked={() => void navigate({ to: "/affiliate/wallet" })}
        onAddNew={() => void navigate({ to: "/affiliate/settings/bank-account" })}
        cancel={<Button asChild variant="ghost"><Link to="/affiliate/wallet"><ArrowLeft /> Back to wallet</Link></Button>}
      />
    </div>
  );
}
