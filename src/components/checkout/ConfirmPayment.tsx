import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Pencil, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { outcomeButton } from "@/components/shared/outcome";
import { cn } from "@/lib/utils";
import { OtpStep, PAY_METHODS, type PayDecision } from "./PaymentMethods";

export interface SummaryLine {
  key: string;
  title: string;
  /** Type or quantity, e.g. "Course" or "Event ticket × 2". */
  meta?: string | undefined;
  price: ReactNode;
}

/** What happens straight after "Confirm", per method, so the buyer is never surprised. */
function nextStep(d: PayDecision): string {
  switch (d.method) {
    case "card":
      return "Your bank will send a one-time code to approve this payment.";
    case "stripe":
      return "Charged to this card through Stripe's secure checkout.";
    case "paypal":
      return "Paid from this PayPal account.";
    case "bank":
      return "You'll get a one-time account number and 30 minutes to transfer.";
    case "ussd":
      return "You'll get a code to dial and 30 minutes to complete it.";
  }
}

/**
 * The dedicated Payment summary step for every checkout: order lines, total to pay, the chosen
 * method (with Change), receipt details and the terms, then "Confirm and pay". Card payments ask
 * for the bank's code afterwards. Nothing is charged before `onPlace`.
 */
export function PaymentSummary({ lines, totals, amountLabel, decision, buyer, onEditOrder, onChangeMethod, onPlace }: {
  lines: SummaryLine[];
  totals: { currency: string; label: string }[];
  amountLabel: string;
  decision: PayDecision;
  buyer: { name: string; email: string };
  onEditOrder: () => void;
  onChangeMethod: () => void;
  onPlace: (d: PayDecision) => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [otp, setOtp] = useState(false);
  if (otp) return <OtpStep amountLabel={amountLabel} decision={decision} onDone={onPlace} onBack={() => setOtp(false)} />;
  const Icon = (PAY_METHODS.find((m) => m.id === decision.method) ?? PAY_METHODS[0]!).icon;
  const itemCount = lines.length;

  return (
    <div className="screen-in">
      <h1 className="text-2xl font-extrabold text-ink sm:text-[28px]">Payment summary</h1>
      <p className="mt-1 text-sm text-muted-foreground">Check your total and payment method. Nothing is charged until you confirm.</p>

      <div className="mt-6 rounded-[22px] bg-cobalt p-5 text-primary-foreground sm:p-6">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-lime">
          <span className="neon-dot" aria-hidden="true" /> Total to pay
        </p>
        <div className="mt-2 space-y-1">
          {totals.map((t) => (
            <p key={t.currency} className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-3xl font-extrabold tabular-nums sm:text-4xl">{t.label}</span>
              <span className="text-sm font-bold opacity-80">{t.currency}</span>
            </p>
          ))}
        </div>
        <p className="mt-3 text-sm opacity-80">{itemCount} {itemCount === 1 ? "item" : "items"} · paying with {decision.methodLabel}</p>
      </div>

      <section aria-labelledby="sum-order" className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h2 id="sum-order" className="text-base font-extrabold text-ink">Your order</h2>
          <button type="button" onClick={onEditOrder} className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-extrabold text-brand hover:bg-ice">
            <Pencil className="size-3" aria-hidden="true" /> Edit order
          </button>
        </div>
        <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[20px] border border-line text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex items-start justify-between gap-3 p-4">
              <span className="min-w-0">
                <span className="line-clamp-2 font-bold text-ink">{l.title}</span>
                {l.meta && <span className="block text-xs text-muted-foreground">{l.meta}</span>}
              </span>
              <span className="shrink-0 font-extrabold text-ink tabular-nums">{l.price}</span>
            </li>
          ))}
          {totals.map((t) => (
            <li key={t.currency} className="flex items-baseline justify-between gap-3 bg-soft p-4">
              <span className="font-semibold text-muted-foreground">Total{totals.length > 1 ? ` (${t.currency})` : ""}</span>
              <span className="text-lg font-extrabold text-ink tabular-nums">{t.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sum-method" className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h2 id="sum-method" className="text-base font-extrabold text-ink">Payment method</h2>
          <button type="button" onClick={onChangeMethod} className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-xs font-extrabold text-brand hover:bg-ice">
            <Pencil className="size-3" aria-hidden="true" /> Change
          </button>
        </div>
        <div className="mt-2 flex items-start gap-3 rounded-[20px] border-[1.5px] border-cobalt bg-ice p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cobalt text-lime">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block break-words font-extrabold text-ink">{decision.methodLabel}</span>
            <span className="block text-sm text-muted-foreground">{nextStep(decision)}</span>
          </span>
        </div>
      </section>

      {buyer.email && (
        <section aria-labelledby="sum-receipt" className="mt-6">
          <h2 id="sum-receipt" className="text-base font-extrabold text-ink">Receipt</h2>
          <p className="mt-2 rounded-[16px] bg-soft p-4 text-sm">
            {buyer.name && <span className="block font-extrabold text-ink">{buyer.name}</span>}
            <span className="block break-all text-muted-foreground">{buyer.email}</span>
          </p>
        </section>
      )}

      <label className={cn("mt-6 flex items-start gap-3 rounded-[16px] border-[1.5px] p-4 text-sm", agreeError ? "border-destructive" : "border-line")}>
        <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setAgreeError(false); }} className="mt-0.5 size-4 accent-[var(--cobalt)]" />
        <span className="text-ink">I agree to Enski's <Link to="/faq" className="font-bold text-brand hover:underline">terms of purchase</Link> and understand digital products open straight away.</span>
      </label>
      {agreeError && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">Please agree to the terms to continue.</p>}
      <div className="mt-6 grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
        <button
          type="button"
          onClick={() => {
            if (!agreed) return setAgreeError(true);
            if (decision.needsOtp) return setOtp(true);
            onPlace(decision);
          }}
          className={outcomeButton.primary}
        >
          <Lock aria-hidden="true" /> {decision.plan === "pending" ? "Confirm and get payment details" : `Confirm and pay ${amountLabel}`}
        </button>
        <button type="button" onClick={onChangeMethod} className={outcomeButton.quiet}>
          <ArrowLeft aria-hidden="true" /> Back to payment
        </button>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground"><ShieldCheck className="size-3.5 text-success" aria-hidden="true" /> Secured checkout</p>
    </div>
  );
}
