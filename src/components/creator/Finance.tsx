import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Landmark, Receipt, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { PageHeader, EmptyState } from "@/components/affiliate/ui";
import { MultiCurrencyWallet } from "@/components/shared/finance/Wallet";
import { TxHistory } from "@/components/shared/finance/TxHistory";
import { PayoutInfo } from "@/components/shared/finance/PayoutInfo";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { availableBalance, creatorBalances, creatorTransactions, currencyPayoutError, type Order } from "@/lib/creator/rules";
import { beneficiaryLabel, maskedLast4, preferredBeneficiary } from "@/lib/shared/finance/beneficiaries";
import { formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";

export function WalletPage() {
  const { state } = useCreator();
  const navigate = useNavigate();
  const [refund, setRefund] = useState<Order | null>(null);
  const balances = creatorBalances(state);
  const pref = preferredBeneficiary(state.beneficiaries);
  const rows = creatorTransactions(state);
  const requirements = [
    { label: "Add a payout account", done: state.beneficiaries.length > 0, to: "/creator/wallet/beneficiaries/new" },
    { label: "Verify your identity", done: state.verification === "submitted", to: "/creator/settings/verification" },
    { label: "Have an available balance", done: balances.some((b) => b.available > 0), to: "/creator/products" },
  ];
  return (
    <div>
      <PageHeader eyebrow="Finance" title="Wallet / payouts" description="Your balances in each currency, withdrawals and every money movement." />
      <MultiCurrencyWallet
        balances={balances}
        displayCurrency={state.finance.displayCurrency}
        onWithdraw={(currency) => void navigate({ to: "/creator/wallet/withdraw", search: { cur: currency } })}
        accountsLink="/creator/settings/bank-accounts"
        settingsLink="/creator/settings/currency"
        accountLabel={<><Landmark className="h-4 w-4 shrink-0 text-lime" /><span className="truncate">{pref ? `${beneficiaryLabel(pref)} ${maskedLast4(pref)}` : "Add payout account"}</span></>}
        footer={
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <TxHistory rows={rows} description="Sales, refunds and withdrawals that change your balances."
              action={(r) => {
                const o = r.id.startsWith("o-") && r.status === "successful" ? state.orders.find((x) => `o-${x.id}` === r.id) : undefined;
                return o ? <RefundButton onClick={() => setRefund(o)} /> : null;
              }}
              empty={<EmptyState icon={Receipt} title="No transactions yet" description="Sales, refunds and withdrawals will appear here with their reference and status." compact action={<Button asChild variant="outline" size="sm"><Link to="/creator/products">Set up a product</Link></Button>} />} />
            <PayoutInfo account={pref} accountsLink="/creator/settings/bank-accounts" requirements={requirements} />
          </div>
        }
      />
      <RefundSaleDialog order={refund} onClose={() => setRefund(null)} />
    </div>
  );
}

export function RefundButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button variant="outline" size="sm" className={className ?? "h-7 gap-1 rounded-full px-2.5 text-[11px]"} onClick={onClick}>
      <Undo2 className="size-3" aria-hidden="true" /> Refund
    </Button>
  );
}

/**
 * Confirms refunding one paid sale, then opens that sale's transaction details,
 * which show it as refunded with the date. The order itself stays in history.
 */
export function RefundSaleDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { state, commit } = useCreator();
  const navigate = useNavigate();
  const short = order ? availableBalance(state) < order.amount : false;
  return (
    <ConfirmDialog
      open={!!order}
      onOpenChange={(v) => !v && onClose()}
      art={brandArtwork.receipt}
      eyebrow="Refund"
      title="Refund this sale?"
      description={order ? `${order.itemTitle} · ${formatMoney(order.amount, order.currency)}` : ""}
      confirmLabel="Confirm refund"
      onConfirm={() => {
        if (!order) return false;
        if (short) { toast.error("Your available balance is lower than this sale, so you can't refund it yet. Try again once more sales clear."); return false; }
        const at = new Date().toISOString();
        const ok = commit((s) => ({ orders: s.orders.map((o) => (o.id === order.id ? { ...o, status: "refunded" as const, refundedAt: at } : o)), activity: [...s.activity, activityEntry(`Refunded: ${order.itemTitle}`)] }));
        if (!ok) { toast.error("The refund wasn't saved, so nothing changed. Your browser may be out of space. Free up some space, then try again."); return false; }
        onClose();
        void navigate({ to: "/creator/wallet/transactions/$txId", params: { txId: `o-${order.id}` }, search: { refunded: 1 } });
        return true;
      }}
    >
      <ConfirmNote>{short
        ? `Your available balance (${formatMoney(availableBalance(state), order?.currency ?? "NGN")}) is lower than this sale, so it can't be refunded until more sales clear.`
        : "The amount comes off your available balance and the sale stops counting towards your earnings. The order stays in your history marked as refunded."}</ConfirmNote>
    </ConfirmDialog>
  );
}
