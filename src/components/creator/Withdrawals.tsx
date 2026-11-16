import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CreditCard, Receipt, RotateCcw, Undo2, Wallet } from "lucide-react";
import { useState } from "react";
import { RefundSaleDialog } from "@/components/creator/Finance";
import { Button } from "@/components/dashboard-ui/button";
import { AddDestination } from "@/components/shared/finance/AddDestination";
import { fmtDate, TxDetails, useResolveWhenDue, WithdrawalResult, type WithdrawalView } from "@/components/shared/finance/WithdrawalResult";
import { WithdrawFlow, type WithdrawRequest } from "@/components/shared/finance/WithdrawFlow";
import { OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { activityEntry, useCreator } from "@/lib/creator/store";
import { creatorBalances, creatorTransactions, type CreatorState, type Order } from "@/lib/creator/rules";
import { addBeneficiary, beneficiaryLabel, maskedLast4 } from "@/lib/shared/finance/beneficiaries";
import { METHOD_LABEL, PROVIDERS } from "@/lib/shared/finance/coverage";
import { formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { ARRIVAL, pinHash, planWithdrawal, sentToday, withdrawalReference } from "@/lib/shared/finance/withdrawals";

const holderOf = (s: CreatorState) => `${s.profile.firstName} ${s.profile.lastName}`.trim();
type Payout = CreatorState["payouts"][number];

function toView(s: CreatorState, p: Payout): WithdrawalView {
  const b = s.beneficiaries.find((x) => x.id === p.beneficiaryId);
  return {
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    fee: p.fee ?? 0,
    reference: p.reference ?? `PAY-${p.id.slice(-6).toUpperCase()}`,
    status: p.status === "simulated" ? "pending" : p.status,
    reason: p.reason,
    date: p.date,
    settledAt: p.settledAt,
    resolveAt: p.resolveAt,
    to: b ? `${beneficiaryLabel(b)} ${maskedLast4(b)}` : (p.recipient ?? `•••• ${p.last4}`),
    holder: b?.holder,
    method: `${METHOD_LABEL[p.method ?? b?.method ?? "bank"]}${p.provider ? ` via ${PROVIDERS[p.provider].name}` : ""}`,
    arrival: ARRIVAL[p.method ?? b?.method ?? "bank"],
  };
}

export function CreatorWithdrawPage({ currency, beneficiary }: { currency: CurrencyCode; beneficiary?: string | undefined }) {
  const { state, commit } = useCreator();
  const navigate = useNavigate();
  const balances = creatorBalances(state);
  const blockers = [
    !state.beneficiaries.length && { label: "Add a payout account", to: "/creator/wallet/beneficiaries/new" as const },
    state.verification !== "submitted" && { label: "Verify your identity", to: "/creator/settings/verification" as const },
    !balances.some((b) => b.available > 0) && { label: "Make your first sale to build a balance", to: "/creator/products" as const },
  ].filter(Boolean) as { label: string; to: "/creator/wallet/beneficiaries/new" | "/creator/settings/verification" | "/creator/products" }[];

  const record = (r: WithdrawRequest, failed: boolean) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    const reference = withdrawalReference();
    const payout: Payout = {
      id, amount: r.amount, date: new Date(now).toISOString(), status: failed ? "failed" : "processing", last4: r.beneficiary.last4, currency: r.currency,
      beneficiaryId: r.beneficiary.id, payoutCurrency: r.beneficiary.currency, provider: r.beneficiary.provider, recipient: beneficiaryLabel(r.beneficiary),
      fee: r.fee, reference, method: r.beneficiary.method, resolveAt: now + 3600,
      plan: failed ? "pin_locked" : planWithdrawal(sentToday(state.payouts, r.currency), r.amount, r.currency),
      ...(failed ? { reason: "pin_locked" as const, settledAt: new Date(now).toISOString() } : {}),
    };
    const ok = commit((s) => ({
      payouts: [...s.payouts, payout],
      activity: [...s.activity, activityEntry(failed ? `Withdrawal stopped: ${formatMoney(r.amount, r.currency)} (PIN)` : `Withdrawal requested: ${formatMoney(r.amount, r.currency)} to ${beneficiaryLabel(r.beneficiary)}`)],
    }));
    if (ok) void navigate({ to: "/creator/wallet/withdrawals/$withdrawalId", params: { withdrawalId: id } });
  };

  return (
    <div className="py-2">
      <WithdrawFlow
        balances={balances}
        beneficiaries={state.beneficiaries}
        initialCurrency={currency}
        initialBeneficiary={beneficiary}
        blockers={blockers.map((b) => ({ label: b.label, to: <Link to={b.to} className="flex items-center gap-3 rounded-[16px] border-[1.5px] border-line p-3 text-sm font-extrabold transition-colors hover:border-cobalt-100 hover:bg-ice"><span className="h-5 w-5 rounded-full border-2 border-line" aria-hidden="true" />{b.label}<ArrowRight className="ml-auto h-4 w-4 text-cobalt" /></Link> }))}
        pinSet={!!state.payoutPin}
        savePin={async (pin) => commit({ payoutPin: await pinHash(pin, state.profile.email || "creator") })}
        verifyPin={async (pin) => (await pinHash(pin, state.profile.email || "creator")) === state.payoutPin}
        onSubmit={(r) => record(r, false)}
        onLocked={(r) => record(r, true)}
        onAddNew={({ currency: c }) => void navigate({ to: "/creator/wallet/beneficiaries/new", search: { from: "withdraw", cur: c } })}
        cancel={<Button asChild variant="ghost"><Link to="/creator/wallet"><ArrowLeft /> Back to wallet</Link></Button>}
      />
    </div>
  );
}

export function CreatorWithdrawalPage({ id }: { id: string }) {
  const { state, update } = useCreator();
  const p = state.payouts.find((x) => x.id === id);
  const view = p ? toView(state, p) : null;
  useResolveWhenDue(view, () => {
    update((s) => ({
      payouts: s.payouts.map((x) =>
        x.id === id && x.status === "processing"
          ? x.plan && x.plan !== "successful"
            ? { ...x, status: "failed" as const, reason: x.plan, settledAt: new Date().toISOString() }
            : { ...x, status: "successful" as const, settledAt: new Date().toISOString() }
          : x,
      ),
    }));
  });
  if (!p || !view) return <MissingWithdrawal />;
  return (
    <div className="py-6">
      <WithdrawalResult
        w={view}
        primary={<Link to="/creator/wallet/transactions/$txId" params={{ txId: `p-${id}` }} className={outcomeButton.primary}><Receipt aria-hidden="true" /> View transaction</Link>}
        secondary={<Link to="/creator/wallet" className={outcomeButton.secondary}><Wallet aria-hidden="true" /> Back to wallet</Link>}
        retry={<Link to="/creator/wallet/withdraw" search={{ cur: p.currency, ...(p.beneficiaryId ? { ben: p.beneficiaryId } : {}) }} className={outcomeButton.primary}><RotateCcw aria-hidden="true" /> Try again</Link>}
        change={<Link to="/creator/wallet/withdraw" search={{ cur: p.currency }} className={outcomeButton.secondary}><CreditCard aria-hidden="true" /> Change payout method</Link>}
        failedMore={<>
          <Link to="/creator/wallet/transactions/$txId" params={{ txId: `p-${id}` }} className={outcomeButton.quiet}><Receipt aria-hidden="true" /> View transaction details</Link>
          <Link to="/creator/settings/bank-accounts" className={outcomeButton.quiet}><CreditCard aria-hidden="true" /> Review payout account</Link>
        </>}
      />
    </div>
  );
}

function MissingWithdrawal() {
  return (
    <OutcomeScreen
      className="my-6"
      tone="info"
      eyebrow="Wallet"
      title="We can't find this transaction"
      message="The link may be old. You'll find every withdrawal in your wallet history."
      actions={<><Link to="/creator/wallet" className={outcomeButton.primary}>Back to wallet</Link><Link to="/creator/help" className={outcomeButton.secondary}>Get help</Link></>}
    />
  );
}

export function CreatorTxPage({ txId, justRefunded = false }: { txId: string; justRefunded?: boolean }) {
  const { state } = useCreator();
  const [refund, setRefund] = useState<Order | null>(null);
  const row = creatorTransactions(state).find((r) => r.id === txId);
  if (!row) return <MissingWithdrawal />;
  const payout = txId.startsWith("p-") ? state.payouts.find((p) => `p-${p.id}` === txId) : undefined;
  const v = payout ? toView(state, payout) : null;
  const order = txId.startsWith("o-") ? state.orders.find((o) => `o-${o.id}` === txId) : undefined;
  const rows: [string, React.ReactNode][] = v
    ? [
        ["Reference", <span className="font-mono">{v.reference}</span>],
        ["Date", fmtDate(v.date)],
        ["Sent to", v.to],
        ["Account name", v.holder ?? "—"],
        ["Method", v.method],
        ["Amount", formatMoney(v.amount, v.currency)],
        ["Fee", formatMoney(v.fee, v.currency)],
        ["Received", formatMoney(Math.max(0, v.amount - v.fee), v.currency)],
      ]
    : [
        ["Reference", <span className="font-mono">{row.reference}</span>],
        ["Date", fmtDate(row.date)],
        ["Description", row.description],
        ["Details", row.detail ?? "—"],
        ["Method", row.method],
        ["Currency", row.currency],
        ["Amount", formatMoney(row.amount, row.currency)],
        ...(order?.status === "refunded" ? [["Refunded", order.refundedAt ? fmtDate(order.refundedAt) : "Yes"] as [string, React.ReactNode]] : []),
      ];
  const timeline = v
    ? [
        { label: "Requested", at: v.date, state: "done" as const },
        v.status === "failed"
          ? { label: "Failed", at: v.settledAt ?? v.date, state: "failed" as const }
          : { label: v.status === "successful" ? "Sent" : "Sending", at: v.settledAt ?? null, state: v.status === "successful" ? ("done" as const) : ("waiting" as const) },
      ]
    : [
        { label: "Paid by buyer", at: row.date, state: "done" as const },
        { label: "Added to your balance", at: row.date, state: "done" as const },
        ...(order?.status === "refunded" ? [{ label: "Refunded to the buyer", at: order.refundedAt ?? null, state: "done" as const }] : []),
      ];
  return (
    <div className="py-6">
      <TxDetails
        title={row.description}
        direction={row.direction}
        amount={row.amount}
        currency={row.currency}
        status={row.status}
        rows={rows}
        timeline={timeline}
        notice={justRefunded && order?.status === "refunded" ? { title: "Sale refunded", body: `${formatMoney(order.amount, order.currency)} came off your available balance. The order stays here, marked as refunded.` } : undefined}
        actions={<>
          <Link to="/creator/wallet" className={outcomeButton.primary}>Back to wallet</Link>
          {order?.status === "paid" && <button type="button" onClick={() => setRefund(order)} className={outcomeButton.secondary}><Undo2 aria-hidden="true" /> Refund this sale</button>}
          <Link to="/creator/help" className={outcomeButton.quiet}>Get help with this</Link>
        </>}
      />
      <RefundSaleDialog order={refund} onClose={() => setRefund(null)} />
    </div>
  );
}

export function CreatorAddBeneficiaryPage({ from, currency }: { from: "withdraw" | "wallet"; currency: CurrencyCode }) {
  const { state, commit } = useCreator();
  const navigate = useNavigate();
  const back = () => (from === "withdraw" ? navigate({ to: "/creator/wallet/withdraw", search: { cur: currency } }) : navigate({ to: "/creator/wallet" }));
  return (
    <div className="mx-auto max-w-2xl py-2">
      <div className="surface screen-in p-5 sm:p-8">
        <h1 className="text-2xl font-extrabold">Add a payout account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose how you'd like to get paid. We check the details before saving.</p>
        <div className="mt-6">
          <AddDestination
            holder={holderOf(state)}
            country={state.finance.residence || "NG"}
            currency={currency}
            existing={state.beneficiaries}
            onSave={(b) => {
              const next = addBeneficiary(state.beneficiaries, b);
              if (!next) return false;
              const ok = commit({ beneficiaries: next });
              if (ok) void navigate({ to: "/creator/wallet/beneficiaries/$beneficiaryId/saved", params: { beneficiaryId: b.id }, search: { from } });
              return ok;
            }}
            onCancel={() => void back()}
          />
        </div>
      </div>
    </div>
  );
}

export function CreatorBeneficiarySavedPage({ id, from }: { id: string; from: "withdraw" | "wallet" }) {
  const { state } = useCreator();
  const b = state.beneficiaries.find((x) => x.id === id);
  if (!b) return <MissingWithdrawal />;
  return (
    <div className="py-6">
      <OutcomeScreen
        tone="success"
        eyebrow="Payout account"
        title="Beneficiary saved"
        message={from === "withdraw" ? "It's selected for your withdrawal. Pick up where you left off." : "You can now withdraw to this account any time."}
        details={[
          { label: METHOD_LABEL[b.method] === "Bank transfer" ? "Bank" : "Provider", value: b.institution.name },
          { label: "Account", value: maskedLast4(b), mono: true },
          { label: "Account name", value: b.holder },
          { label: "Currency", value: b.currency },
          { label: "Status", value: b.preferred ? "Preferred account" : "Saved" },
        ]}
        actions={
          <>
            <Link to="/creator/wallet/withdraw" search={{ cur: b.currency, ben: b.id }} className={outcomeButton.primary}>Withdraw now <ArrowRight aria-hidden="true" /></Link>
            <Link to="/creator/settings/bank-accounts" className={outcomeButton.secondary}>Back to payout accounts</Link>
          </>
        }
      />
    </div>
  );
}
