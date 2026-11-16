import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, CreditCard, Receipt, RotateCcw, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { FocusShell, OutcomeScreen, ProcessingScreen, outcomeButton, type OutcomeDetail } from "@/components/shared/outcome";
import { ShopImage } from "@/components/shop/ShopImage";
import { ShopLink } from "@/components/shop/ShopLink";
import { FAIL_COPY, METHOD_LABEL, USSD_BANKS, ussdString, virtualAccount } from "@/lib/checkout/card";
import { savePendingCheckout } from "@/lib/shop/panel";
import type { PaymentRecord } from "@/lib/shop/payments";
import { shop, usePayment, useShopReady } from "@/lib/shop/store";
import { useDemoProfile } from "@/lib/demo/profile";

const PROCESS_STEPS: Record<PaymentRecord["method"], string[]> = {
  card: ["Contacting your bank", "Confirming payment", "Securing your order"],
  stripe: ["Contacting Stripe", "Confirming payment", "Securing your order"],
  paypal: ["Connecting to PayPal", "Confirming payment", "Securing your order"],
  bank: ["Creating your account number", "Getting it ready"],
  ussd: ["Preparing your code", "Getting it ready"],
};

export const formatPayDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Re-reads the clock so time-based transitions (processing → result, transfer confirmed) apply. */
function useTick(reference: string, active: boolean) {
  const [, setN] = useState(0);
  useEffect(() => {
    shop.refreshPayment(reference);
    if (!active) return;
    const t = window.setInterval(() => {
      shop.refreshPayment(reference);
      setN((n) => n + 1);
    }, 700);
    return () => window.clearInterval(t);
  }, [reference, active]);
}

function ItemsList({ p }: { p: PaymentRecord }) {
  return (
    <ul className="mt-5 space-y-2 text-left">
      {p.items.map((item) => (
        <li key={item.key}>
          <ShopLink route={item.route} className="flex items-center gap-3 rounded-[16px] border border-line p-2.5 transition-colors hover:bg-soft">
            <span className="block size-12 shrink-0 overflow-hidden rounded-xl"><ShopImage image={item.image} sizes="48px" /></span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 text-sm font-extrabold text-ink">{item.title}</span>
              <span className="text-xs font-semibold text-brand">{item.typeLabel}{item.creator ? ` · ${item.creator.name}` : ""}</span>
            </span>
          </ShopLink>
        </li>
      ))}
    </ul>
  );
}

function Countdown({ until }: { until: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, until - now);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return <span className="font-mono tabular-nums">{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>;
}

export function PaymentStatus({ reference }: { reference: string }) {
  const ready = useShopReady();
  const p = usePayment(reference);
  const navigate = useNavigate();
  const profile = useDemoProfile();
  const live = !!p && (p.status === "processing" || p.status === "pending");
  useTick(reference, live);

  if (!ready) return <FocusShell secure><div className="mx-auto h-96 max-w-xl animate-pulse rounded-[28px] bg-soft" /></FocusShell>;

  if (!p) {
    return (
      <FocusShell>
        <OutcomeScreen
          tone="info"
          eyebrow="Payment"
          title="We can't find this payment"
          message={<>There's no payment with the reference <strong className="text-ink">{reference}</strong> on this device. Check the reference on your receipt, or look in your orders.</>}
          actions={<><Link to="/courses" className={outcomeButton.primary}>Return to marketplace</Link><Link to="/" className={outcomeButton.secondary}>Go home</Link></>}
        />
      </FocusShell>
    );
  }

  const amount = p.totals.map((t) => t.label).join(" + ");
  const retry = (step: "review" | "pay") => {
    savePendingCheckout(p.items);
    void navigate({ to: "/checkout", search: { step, method: p.method } });
  };
  const baseDetails: OutcomeDetail[] = [
    { label: "Amount", value: amount, strong: true },
    { label: "Reference", value: p.reference, copy: p.reference, mono: true },
    { label: "Payment method", value: p.methodLabel },
    { label: "Date", value: formatPayDate(p.createdAt) },
  ];

  if (p.status === "processing") {
    const steps = PROCESS_STEPS[p.method];
    const total = Math.max(1, p.resolveAt - Date.parse(p.createdAt));
    const elapsed = Date.now() - Date.parse(p.createdAt);
    const active = Math.min(steps.length - 1, Math.floor((elapsed / total) * steps.length));
    return (
      <FocusShell secure back={<span />}>
        <ProcessingScreen
          title={p.free ? "Enrolling you" : p.method === "bank" || p.method === "ussd" ? "Setting up your payment" : `Processing ${amount}`}
          message="Please keep this page open. It only takes a moment."
          steps={p.free ? ["Reserving your place", "Unlocking access"] : steps}
          active={p.free ? Math.min(1, active) : active}
          onCancel={() => shop.cancelPayment(p.reference)}
          cancelLabel="Cancel payment"
        />
      </FocusShell>
    );
  }

  if (p.status === "pending") {
    const sent = !!p.confirmAt;
    const ussdBank = USSD_BANKS.find((b) => p.methodLabel.startsWith(b.name));
    const firstTotal = p.totals[0]?.total ?? 0;
    const details: OutcomeDetail[] =
      p.method === "bank"
        ? [
            { label: "Bank", value: "Wema Bank" },
            { label: "Account number", value: virtualAccount(p.reference), copy: virtualAccount(p.reference), mono: true },
            { label: "Account name", value: `Enski Checkout / ${p.reference}` },
            { label: "Amount", value: amount, copy: String(firstTotal), strong: true },
            { label: "Expires in", value: p.expiresAt ? <Countdown until={p.expiresAt} /> : "30:00" },
          ]
        : [
            { label: "Dial", value: ussdString(ussdBank?.code ?? "*737", firstTotal, p.reference), copy: ussdString(ussdBank?.code ?? "*737", firstTotal, p.reference), mono: true, strong: true },
            { label: "Bank", value: ussdBank?.name ?? "Your bank" },
            { label: "Amount", value: amount },
            { label: "Reference", value: p.reference, copy: p.reference, mono: true },
          ];
    return (
      <FocusShell secure>
        <OutcomeScreen
          tone="pending"
          eyebrow={sent ? "Confirming" : "Payment pending"}
          title={sent ? "We're confirming your payment" : p.method === "bank" ? "Complete your transfer" : "Dial the code to pay"}
          message={
            sent
              ? "This usually takes under a minute. Your order unlocks as soon as it's confirmed, and this page updates by itself."
              : p.method === "bank"
                ? `Transfer exactly ${amount} to the account below from any bank app. Use it once, before it expires.`
                : "Dial the code below on the phone linked to your bank account and approve the payment with your PIN."
          }
          details={sent ? baseDetails : details}
          actions={
            sent ? (
              <>
                <button type="button" onClick={() => shop.refreshPayment(p.reference)} className={outcomeButton.primary}><RotateCcw aria-hidden="true" /> Check status</button>
                <Link to="/courses" className={outcomeButton.secondary}>Keep browsing</Link>
              </>
            ) : (
              <>
                <button type="button" onClick={() => shop.markSent(p.reference, 6000)} className={outcomeButton.primary}>{p.method === "bank" ? "I've sent the money" : "I've approved it"}</button>
                <button type="button" onClick={() => shop.cancelPayment(p.reference)} className={outcomeButton.secondary}>Cancel payment</button>
              </>
            )
          }
          footer={sent ? "You can leave this page. Your order appears under Orders once it's confirmed." : undefined}
        />
      </FocusShell>
    );
  }

  if (p.status === "successful") {
    const first = p.items[0];
    return (
      <FocusShell back={<Link to="/courses" className={outcomeButton.quiet}>Marketplace</Link>}>
        <OutcomeScreen
          tone="success"
          eyebrow={p.free ? "Enrolled" : "Paid"}
          title={p.free ? "You're enrolled" : "Payment successful"}
          message={
            p.free
              ? "Your place is saved. You can start straight away."
              : <>Thanks{p.buyer?.name ? `, ${p.buyer.name.split(" ")[0]}` : ""}! Your payment went through and everything below is ready for you.</>
          }
          details={[
            { label: p.free ? "Price" : "Amount paid", value: p.free ? "Free" : amount, strong: true },
            { label: p.items.length > 1 ? "Items" : "Purchased", value: p.items.length > 1 ? `${p.items.length} items` : (first?.title ?? "") },
            { label: "Transaction reference", value: p.reference, copy: p.reference, mono: true },
            { label: "Payment date", value: formatPayDate(p.updatedAt) },
            ...(p.free ? [] : [{ label: "Currency", value: p.totals.map((t) => t.currency).join(" + ") }, { label: "Paid with", value: p.methodLabel }]),
          ]}
          actions={
            <>
              {first && profile?.type === "learner" && p.buyer?.email === profile.email.trim().toLowerCase() ? (
                <Link to="/learner/resources/$resourceId" params={{ resourceId: first.key }} className={outcomeButton.primary}><BookOpen aria-hidden="true" /> {first.typeLabel === "Course" ? "Start learning" : "Open it now"}</Link>
              ) : first && !profile ? (
                <Link to="/auth" search={{ s: "register" }} className={outcomeButton.primary}><BookOpen aria-hidden="true" /> Create your account to start</Link>
              ) : first ? (
                <ShopLink route={first.route} className={outcomeButton.primary}><BookOpen aria-hidden="true" /> View what you bought</ShopLink>
              ) : (
                <Link to="/courses" className={outcomeButton.primary}>Return to marketplace</Link>
              )}
              <Link to="/orders/$reference" params={{ reference: p.reference }} className={outcomeButton.secondary}><Receipt aria-hidden="true" /> View receipt</Link>
            </>
          }
          footer={<>{!profile && p.buyer ? <>Sign up with <strong className="text-ink">{p.buyer.email}</strong> and it's waiting in your library. </> : "Find this order any time under Orders in the top bar. "}<Link to="/courses" className="font-bold text-brand hover:underline">Return to marketplace</Link></>}
        >
          {p.items.length > 1 && <ItemsList p={p} />}
        </OutcomeScreen>
      </FocusShell>
    );
  }

  if (p.status === "failed") {
    const copy = FAIL_COPY[p.reason ?? "declined"];
    return (
      <FocusShell secure>
        <OutcomeScreen
          tone="failed"
          eyebrow="Payment unsuccessful"
          title="Payment didn't go through"
          message={<><strong className="block text-ink">{copy.title}</strong>{copy.body} You haven't been charged.</>}
          details={[
            { label: p.items.length > 1 ? "Items" : "Product", value: p.items.length > 1 ? `${p.items.length} items` : (p.items[0]?.title ?? "") },
            { label: "Amount", value: amount },
            { label: "Payment method", value: p.methodLabel },
            { label: "Reference", value: p.reference, copy: p.reference, mono: true },
            { label: "Attempted", value: formatPayDate(p.updatedAt) },
          ]}
          actions={
            <>
              <button type="button" onClick={() => retry("pay")} className={outcomeButton.primary}><RotateCcw aria-hidden="true" /> Try again</button>
              <button type="button" onClick={() => { savePendingCheckout(p.items); void navigate({ to: "/checkout", search: { step: "pay", method: p.method === "card" ? "bank" : "card" } }); }} className={outcomeButton.secondary}><CreditCard aria-hidden="true" /> Change payment method</button>
            </>
          }
          footer={<button type="button" onClick={() => retry("review")} className="font-bold text-brand hover:underline">Return to checkout</button>}
        />
      </FocusShell>
    );
  }

  // cancelled
  return (
    <FocusShell>
      <OutcomeScreen
        tone="cancelled"
        title="Payment cancelled"
        message={`You stopped this ${METHOD_LABEL[p.method].toLowerCase()} payment, so nothing was charged. Your items are still waiting at checkout.`}
        details={[
          { label: "Amount", value: amount },
          { label: "Reference", value: p.reference, copy: p.reference, mono: true },
        ]}
        actions={
          <>
            <button type="button" onClick={() => retry("review")} className={outcomeButton.primary}>Return to checkout</button>
            <Link to="/courses" className={outcomeButton.secondary}><ShoppingBag aria-hidden="true" /> Keep shopping</Link>
          </>
        }
      />
    </FocusShell>
  );
}
