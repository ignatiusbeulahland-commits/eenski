import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, CreditCard, Receipt, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { PaymentSummary } from "@/components/checkout/ConfirmPayment";
import { PaymentMethods, type PayDecision } from "@/components/checkout/PaymentMethods";
import { FlowSteps, OutcomeScreen, ProcessingScreen, outcomeButton, useProcessing } from "@/components/shared/outcome";
import { FAIL_COPY, makeReference, virtualAccount, type FailReason, type PayMethod } from "@/lib/checkout/card";
import { choiceFor, clearSummaryChoice, readSummaryChoice, saveSummaryChoice } from "@/lib/checkout/summary";
import { cartTotals, checkout, confirmTransfer, retryPurchase } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { LearnerNotFound, price } from "./shared";

const STEPS = ["Review", "Payment", "Summary", "Done"];
/** Failure reasons and the method label for each learner order, kept for this tab (the order itself stays in the learner store). */
const META_KEY = "enski:learner:checkout-meta";
type Meta = Record<string, { reason?: FailReason | undefined; methodLabel: string; method: PayMethod; reference: string }>;
function readMeta(): Meta {
  try {
    return JSON.parse(window.sessionStorage.getItem(META_KEY) ?? "{}") as Meta;
  } catch {
    return {};
  }
}
function writeMeta(id: string, m: Meta[string]) {
  try {
    window.sessionStorage.setItem(META_KEY, JSON.stringify({ ...readMeta(), [id]: m }));
  } catch {
    /* ignore */
  }
}

function Processing({ onDone, onCancel, amount }: { onDone: () => void; onCancel: () => void; amount: string }) {
  const steps = ["Contacting your bank", "Confirming payment", "Securing your order"];
  const { active, stop } = useProcessing(steps.length, onDone, 1000);
  return <ProcessingScreen title={`Processing ${amount}`} message="Please keep this page open. It only takes a moment." steps={steps} active={active} onCancel={() => { stop(); onCancel(); }} cancelLabel="Cancel payment" />;
}

export function LearnerCheckout({ step, method }: { step: "review" | "pay" | "summary"; method: PayMethod }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const { lines, total, count } = cartTotals(state.cart);
  const [paying, setPaying] = useState<PayDecision | null>(null);
  /** The method shown on the Payment summary step; nothing is charged before it's confirmed. */
  const [confirming, setConfirming] = useState<PayDecision | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const amount = price(total);
  const go = (s: "review" | "pay" | "summary", m: PayMethod = method) => void navigate({ to: "/learner/checkout", search: { step: s, method: m } });
  useEffect(() => {
    if (step !== "summary") return setConfirming(null);
    const saved = choiceFor(readSummaryChoice("learner"), method);
    if (saved) setConfirming(saved);
    // An empty cart (e.g. just after paying) shows its own screen instead of the payment step.
    else if (lines.length) void navigate({ to: "/learner/checkout", search: { step: "pay", method }, replace: true });
    // Only re-check when the step or method in the address changes, never after paying.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, method]);

  const finish = (d: PayDecision) => {
    clearSummaryChoice("learner");
    const failed = d.plan !== "successful" && d.plan !== "pending";
    const r = checkout(state, d.method === "bank" || d.method === "ussd" ? "transfer" : "card", failed ? "failure" : "success");
    if (!r) return;
    update(r.patch);
    writeMeta(r.purchase.id, { reason: failed ? (d.plan as FailReason) : undefined, methodLabel: d.methodLabel, method: d.method, reference: makeReference() });
    void navigate({ to: "/learner/checkout/$purchaseId", params: { purchaseId: r.purchase.id } });
  };

  if (cancelled) {
    return (
      <OutcomeScreen
        tone="cancelled"
        title="Payment cancelled"
        message="You stopped the payment before it finished, so nothing was charged. Your cart is just as you left it."
        details={[{ label: "Amount", value: amount }, { label: "Items", value: `${count}` }]}
        actions={<><button type="button" onClick={() => { setCancelled(false); go("pay"); }} className={outcomeButton.primary}>Return to checkout</button><Link to="/learner/cart" className={outcomeButton.secondary}>Back to cart</Link></>}
        className="my-6"
      />
    );
  }
  if (paying) return <div className="py-6"><Processing amount={amount} onDone={() => finish(paying)} onCancel={() => { setPaying(null); setCancelled(true); }} /></div>;

  if (!lines.length) {
    return (
      <OutcomeScreen
        tone="info"
        eyebrow="Checkout"
        title="Your cart is empty"
        message="Add a resource or event ticket and it will be ready to pay for here."
        actions={<><Link to="/learner/resources" search={{ view: "discover" }} className={outcomeButton.primary}>Discover resources</Link><Link to="/learner/events" className={outcomeButton.secondary}>Browse events</Link></>}
        className="my-6"
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-2">
      <FlowSteps steps={STEPS} current={step === "review" ? 0 : step === "pay" ? 1 : 2} className="mx-auto mb-6 max-w-md" />
      <div className={cn("grid gap-6 lg:items-start", step === "summary" ? "mx-auto max-w-2xl" : "lg:grid-cols-[minmax(0,1fr)_300px]")}>
        <section key={step} className="surface screen-in p-5 sm:p-7">
          {step === "review" ? (
            <>
              <h1 className="text-2xl font-extrabold">Review your order</h1>
              <ul className="mt-5 divide-y rounded-[18px] border">
                {lines.map((l) => (
                  <li key={l.kind + l.id} className="flex items-center gap-3 p-3">
                    <img src={l.image} alt="" width={64} height={48} className="h-12 w-16 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.kind === "event" ? `Event ticket × ${l.qty}` : "Resource"}</p>
                    </div>
                    <p className="font-extrabold tabular-nums">{price(l.line)}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-[16px] bg-soft p-4 text-sm"><span className="font-extrabold">{state.profile.fullName}</span><span className="block text-muted-foreground">Receipt to {state.profile.email}</span></p>
              <div className="mt-6 grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
                <button type="button" onClick={() => go("pay")} className={outcomeButton.primary}>Continue to payment <ArrowRight aria-hidden="true" /></button>
                <Link to="/learner/cart" className={outcomeButton.quiet}><ArrowLeft aria-hidden="true" /> Back to cart</Link>
              </div>
            </>
          ) : step === "summary" ? (
            confirming ? (
              <PaymentSummary
                lines={lines.map((l) => ({ key: l.kind + l.id, title: l.title, meta: l.kind === "event" ? `Event ticket × ${l.qty}` : "Resource", price: price(l.line) }))}
                totals={[{ currency: "NGN", label: amount }]}
                amountLabel={amount}
                decision={confirming}
                buyer={{ name: state.profile.fullName, email: state.profile.email }}
                onEditOrder={() => go("review")}
                onChangeMethod={() => go("pay", confirming.method)}
                onPlace={(d) => (d.plan === "pending" ? finish(d) : setPaying(d))}
              />
            ) : <div className="h-96 animate-pulse rounded-[18px] bg-soft" />
          ) : (
            <>
              <h1 className="text-2xl font-extrabold">How would you like to pay?</h1>
              <p className="mt-1 text-sm text-muted-foreground">Paying {amount}.</p>
              <div className="mt-5">
                <PaymentMethods
                  method={method}
                  onMethod={(m) => go("pay", m)}
                  amountLabel={amount}
                  buyer={{ name: state.profile.fullName, email: state.profile.email }}
                  onPay={(d) => { saveSummaryChoice("learner", d); go("summary", d.method); }}
                  onCancel={() => setCancelled(true)}
                />
              </div>
              <button type="button" onClick={() => go("review")} className={cn(outcomeButton.quiet, "mt-4")}><ArrowLeft aria-hidden="true" /> Back to review</button>
            </>
          )}
        </section>
        <aside hidden={step === "summary"} className="surface p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-extrabold">Order summary</h2>
          <p className="mt-1 text-xs text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>
          <div className="mt-4 flex items-baseline justify-between border-t border-dashed pt-4"><span className="text-sm font-semibold text-muted-foreground">Total</span><span className="text-xl font-extrabold tabular-nums">{amount}</span></div>
        </aside>
      </div>
    </div>
  );
}

export function LearnerCheckoutResult({ id }: { id: string }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const p = state.purchases.find((x) => x.id === id);
  if (!p) return <LearnerNotFound what="purchase" />;
  const meta = typeof window === "undefined" ? undefined : readMeta()[id];
  const methodLabel = meta?.methodLabel ?? (p.method === "card" ? "Card" : "Bank transfer");
  const when = new Date(p.date).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const what = p.items.length === 1 ? p.items[0]!.title : `${p.items.length} items`;

  if (confirming) {
    return <div className="py-6"><ConfirmingTransfer onDone={() => { update((s) => confirmTransfer(s, id)); setConfirming(false); }} /></div>;
  }

  if (p.status === "paid") {
    const hasResource = p.items.some((i) => i.kind === "resource");
    return (
      <OutcomeScreen
        className="my-6"
        tone="success"
        title="Payment successful"
        message={`Thanks, ${state.profile.displayName || state.profile.fullName.split(" ")[0] || "there"}! Your payment went through and your ${p.items.length === 1 ? "item is" : "items are"} ready.`}
        details={[
          { label: "Amount paid", value: price(p.total), strong: true },
          { label: "Currency", value: "NGN" },
          { label: "Purchased", value: what },
          { label: "Transaction reference", value: p.orderNumber, copy: p.orderNumber, mono: true },
          { label: "Payment date", value: when },
          { label: "Paid with", value: methodLabel },
        ]}
        actions={
          <>
            {hasResource ? <Link to="/learner/resources" className={outcomeButton.primary}><BookOpen aria-hidden="true" /> Continue learning</Link> : <Link to="/learner/events" className={outcomeButton.primary}>See my events</Link>}
            <Link to="/learner/purchases/$purchaseId" params={{ purchaseId: p.id }} className={outcomeButton.secondary}><Receipt aria-hidden="true" /> View receipt</Link>
          </>
        }
        footer={<Link to="/learner/resources" search={{ view: "discover" }} className="font-bold text-brand hover:underline">Return to marketplace</Link>}
      />
    );
  }
  if (p.status === "pending") {
    const ref = meta?.reference ?? p.orderNumber;
    return (
      <OutcomeScreen
        className="my-6"
        tone="pending"
        eyebrow="Payment pending"
        title="Complete your transfer"
        message={`Transfer exactly ${price(p.total)} to the account below. Your items unlock as soon as it's confirmed.`}
        details={[
          { label: "Bank", value: "Wema Bank" },
          { label: "Account number", value: virtualAccount(ref), copy: virtualAccount(ref), mono: true },
          { label: "Account name", value: `Enski Checkout / ${p.orderNumber}` },
          { label: "Amount", value: price(p.total), copy: String(p.total), strong: true },
          { label: "Reference", value: p.orderNumber, copy: p.orderNumber, mono: true },
        ]}
        actions={
          <>
            <button type="button" onClick={() => setConfirming(true)} className={outcomeButton.primary}>I've sent the money</button>
            <Link to="/learner/purchases/$purchaseId" params={{ purchaseId: p.id }} className={outcomeButton.secondary}>View order</Link>
          </>
        }
        footer="You can leave this page. The order stays pending in Purchases until it's confirmed."
      />
    );
  }
  const copy = FAIL_COPY[meta?.reason ?? "declined"];
  const retry = (step: "review" | "pay", method: PayMethod) => {
    update((s) => retryPurchase(s, id));
    void navigate({ to: "/learner/checkout", search: { step, method } });
  };
  return (
    <OutcomeScreen
      className="my-6"
      tone="failed"
      eyebrow="Payment unsuccessful"
      title="Payment didn't go through"
      message={<><strong className="block text-ink">{copy.title}</strong>{copy.body} You haven't been charged.</>}
      details={[{ label: "Amount", value: price(p.total) }, { label: "Payment method", value: methodLabel }, { label: "Reference", value: p.orderNumber, copy: p.orderNumber, mono: true }]}
      actions={
        <>
          <button type="button" onClick={() => retry("pay", meta?.method ?? "card")} className={outcomeButton.primary}><RotateCcw aria-hidden="true" /> Try again</button>
          <button type="button" onClick={() => retry("pay", (meta?.method ?? "card") === "card" ? "bank" : "card")} className={outcomeButton.secondary}><CreditCard aria-hidden="true" /> Change payment method</button>
        </>
      }
      footer={<button type="button" onClick={() => retry("review", meta?.method ?? "card")} className="font-bold text-brand hover:underline">Return to checkout</button>}
    />
  );
}

function ConfirmingTransfer({ onDone }: { onDone: () => void }) {
  const steps = ["Looking for your transfer", "Matching the amount", "Unlocking your order"];
  const { active } = useProcessing(steps.length, onDone, 1100);
  return <ProcessingScreen title="Confirming your transfer" message="This usually takes under a minute. Please keep this page open." steps={steps} active={active} />;
}
