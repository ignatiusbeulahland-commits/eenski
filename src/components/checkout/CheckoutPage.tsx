import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field } from "@/components/affiliate/Field";
import { Input } from "@/components/dashboard-ui/input";
import { FlowSteps, FocusShell, OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { ShopPrice } from "@/components/shop/ShopCard";
import { ShopImage } from "@/components/shop/ShopImage";
import { makeReference, TRANSFER_WINDOW_MS, type PayMethod } from "@/lib/checkout/card";
import { useDemoProfile } from "@/lib/demo/profile";
import { subtotals } from "@/lib/shop/money";
import { readPendingCheckout } from "@/lib/shop/panel";
import { shop } from "@/lib/shop/store";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";
import { choiceFor, clearSummaryChoice, readSummaryChoice, saveSummaryChoice } from "@/lib/checkout/summary";
import { PaymentSummary } from "./ConfirmPayment";
import { PaymentMethods, type PayDecision } from "./PaymentMethods";

const GUEST_KEY = "enski:checkout:guest";
const STEPS = ["Order", "Payment", "Summary", "Done"];

export type CheckoutStep = "review" | "pay" | "summary";

/** How long the processor takes to answer, per method. */
const PROCESS_MS: Record<PayMethod, number> = { card: 3600, stripe: 3200, paypal: 3000, bank: 1800, ussd: 1800 };

export function CheckoutPage({ step, method }: { step: CheckoutStep; method: PayMethod }) {
  const navigate = useNavigate();
  const profile = useDemoProfile();
  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [guest, setGuest] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string | undefined; email?: string | undefined }>({});
  /** The method shown on the Payment summary step; nothing is sent until the buyer confirms there. */
  const [choice, setChoice] = useState<PayDecision | null>(null);
  useEffect(() => {
    if (step !== "summary") return setChoice(null);
    const saved = choiceFor(readSummaryChoice("site"), method);
    if (saved) setChoice(saved);
    else void navigate({ to: "/checkout", search: { step: "pay", method }, replace: true });
    // Only re-check when the step or method in the address changes, never after paying.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, method]);

  useEffect(() => {
    setItems(readPendingCheckout().filter((i) => i.price));
    try {
      const g = JSON.parse(window.sessionStorage.getItem(GUEST_KEY) ?? "null") as { name: string; email: string } | null;
      if (g) setGuest(g);
    } catch {
      /* ignore */
    }
  }, []);

  const totals = useMemo(() => subtotals((items ?? []).map((i) => i.price)), [items]);
  const free = totals.length > 0 && totals.every((t) => t.total === 0);
  const amountLabel = totals.map((t) => t.label).join(" + ");
  const buyer = profile ? { name: profile.name, email: profile.email } : guest;

  const go = (s: CheckoutStep, m: PayMethod = method) => void navigate({ to: "/checkout", search: { step: s, method: m }, replace: false });

  const continueToPay = () => {
    if (!profile) {
      const e: typeof errors = {};
      if (guest.name.trim().length < 2) e.name = "Enter your full name";
      if (!/^\S+@\S+\.\S+$/.test(guest.email.trim())) e.email = "Enter a valid email for your receipt";
      setErrors(e);
      if (Object.keys(e).length) return;
      try {
        window.sessionStorage.setItem(GUEST_KEY, JSON.stringify({ name: guest.name.trim(), email: guest.email.trim().toLowerCase() }));
      } catch {
        /* ignore */
      }
    }
    if (free) return place({ method: "card", methodLabel: "Free enrolment", plan: "successful" }, true);
    go("pay");
  };

  const place = (d: PayDecision, isFree = false) => {
    if (!items?.length) return;
    clearSummaryChoice("site");
    const now = Date.now();
    const reference = makeReference();
    const iso = new Date(now).toISOString();
    shop.startPayment({
      reference,
      items,
      totals: totals.map(({ currency, label, total }) => ({ currency, label, total })),
      method: d.method,
      methodLabel: d.methodLabel,
      buyer: buyer.email ? { name: buyer.name.trim(), email: buyer.email.trim().toLowerCase() } : null,
      status: "processing",
      createdAt: iso,
      updatedAt: iso,
      events: [{ status: "processing", at: iso }],
      plan: d.plan,
      resolveAt: now + (isFree ? 1400 : PROCESS_MS[d.method]),
      expiresAt: d.plan === "pending" ? now + PROCESS_MS[d.method] + TRANSFER_WINDOW_MS : undefined,
      free: isFree,
    });
    void navigate({ to: "/checkout/status/$reference", params: { reference } });
  };

  const cancelAtProvider = (m: PayMethod) => {
    if (!items?.length) return;
    const now = Date.now();
    const reference = makeReference();
    const iso = new Date(now).toISOString();
    shop.startPayment({
      reference, items, method: m, methodLabel: m === "paypal" ? "PayPal" : "Card",
      totals: totals.map(({ currency, label, total }) => ({ currency, label, total })),
      buyer: buyer.email ? buyer : null, status: "cancelled", createdAt: iso, updatedAt: iso,
      events: [{ status: "processing", at: iso }, { status: "cancelled", at: iso }], plan: "successful", resolveAt: now,
    });
    void navigate({ to: "/checkout/status/$reference", params: { reference } });
  };

  if (items === null) return <FocusShell secure><div className="mx-auto h-96 max-w-xl animate-pulse rounded-[28px] bg-soft" /></FocusShell>;

  if (items.length === 0) {
    return (
      <FocusShell secure>
        <OutcomeScreen
          tone="info"
          eyebrow="Checkout"
          title="Nothing to check out yet"
          message="Pick a course, eBook or session first. When you choose Buy, it lands here ready to pay."
          actions={
            <>
              <Link to="/courses" className={outcomeButton.primary}>Browse courses</Link>
              <Link to="/dreamverse" className={outcomeButton.secondary}>Explore Dreamverse</Link>
            </>
          }
        />
      </FocusShell>
    );
  }

  return (
    <FocusShell secure wide>
      <div className="mx-auto max-w-5xl">
        <FlowSteps steps={STEPS} current={step === "review" ? 0 : step === "pay" ? 1 : 2} className="mx-auto mb-8 max-w-lg" />
        <div className={cn("grid gap-6 lg:items-start", step === "summary" ? "mx-auto max-w-2xl" : "lg:grid-cols-[minmax(0,1fr)_360px]")}>
          <section key={step === "review" ? "review" : "pay"} className="screen-in rounded-[28px] border border-line bg-card p-5 shadow-card sm:p-8">
            {step === "review" ? (
              <>
                <h1 className="text-2xl font-extrabold text-ink sm:text-[28px]">Review your order</h1>
                <p className="mt-1 text-sm text-muted-foreground">Check what you're buying and where your receipt should go.</p>
                <ul className="mt-6 divide-y divide-line rounded-[20px] border border-line">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-3 p-3 sm:p-4">
                      <span className="block size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                        <ShopImage image={item.image} sizes="80px" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-extrabold text-brand">{item.typeLabel}</p>
                        <p className="line-clamp-2 text-sm font-extrabold leading-snug text-ink">{item.title}</p>
                        {item.creator && <p className="truncate text-xs font-semibold text-muted-foreground">by {item.creator.name}</p>}
                      </div>
                      <div className="shrink-0 text-right"><ShopPrice item={item} /></div>
                    </li>
                  ))}
                </ul>
                <h2 className="mt-8 text-base font-extrabold text-ink">Your details</h2>
                {profile ? (
                  <p className="mt-3 rounded-[16px] bg-soft p-4 text-sm text-ink">
                    <span className="font-extrabold">{profile.name}</span>
                    <span className="block text-muted-foreground">{profile.email}</span>
                  </p>
                ) : (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Field id="co-name" label="Full name" error={errors.name}>
                      <Input id="co-name" autoComplete="name" value={guest.name} onChange={(e) => { setGuest((g) => ({ ...g, name: e.target.value })); setErrors((x) => ({ ...x, name: undefined })); }} aria-invalid={!!errors.name} />
                    </Field>
                    <Field id="co-email" label="Email for your receipt" error={errors.email}>
                      <Input id="co-email" type="email" autoComplete="email" value={guest.email} onChange={(e) => { setGuest((g) => ({ ...g, email: e.target.value })); setErrors((x) => ({ ...x, email: undefined })); }} aria-invalid={!!errors.email} />
                    </Field>
                    <p className="text-xs text-muted-foreground sm:col-span-2">No account needed. <Link to="/auth" className="font-bold text-brand hover:underline">Log in</Link> to keep everything in your dashboard.</p>
                  </div>
                )}
                <div className="mt-8 grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
                  <button type="button" onClick={continueToPay} className={outcomeButton.primary}>
                    {free ? "Get it free" : "Continue to payment"} <ArrowRight aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => window.history.length > 1 ? window.history.back() : void navigate({ to: "/courses" })} className={outcomeButton.quiet}>
                    <ArrowLeft aria-hidden="true" /> Keep shopping
                  </button>
                </div>
              </>
            ) : (
              <>
                {step === "summary" && (choice ? (
                  <PaymentSummary
                    lines={items.map((i) => ({ key: i.key, title: i.title, meta: i.creator ? `${i.typeLabel} · by ${i.creator.name}` : i.typeLabel, price: <ShopPrice item={i} /> }))}
                    totals={totals}
                    amountLabel={amountLabel}
                    decision={choice}
                    buyer={buyer}
                    onEditOrder={() => go("review")}
                    onChangeMethod={() => go("pay", choice.method)}
                    onPlace={(d) => place(d)}
                  />
                ) : <div className="h-96 animate-pulse rounded-[20px] bg-soft" />)}
                <div hidden={step === "summary"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold text-ink sm:text-[28px]">How would you like to pay?</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Paying {amountLabel} as {buyer.name || buyer.email}.</p>
                  </div>
                </div>
                <div className="mt-6">
                  <PaymentMethods method={method} onMethod={(m) => go("pay", m)} amountLabel={amountLabel} buyer={buyer} onPay={(d) => { saveSummaryChoice("site", d); go("summary", d.method); }} onCancel={cancelAtProvider} />
                </div>
                <button type="button" onClick={() => go("review")} className={cn(outcomeButton.quiet, "mt-4")}>
                  <ArrowLeft aria-hidden="true" /> Back to order
                </button>
                </div>
              </>
            )}
          </section>
          <aside hidden={step === "summary"} className="rounded-[24px] border border-line bg-card p-5 shadow-soft lg:sticky lg:top-6">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink"><ShoppingBag className="size-4 text-brand" aria-hidden="true" /> Order summary</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between gap-3">
                  <span className="line-clamp-1 text-muted-foreground">{i.title}</span>
                  <span className="shrink-0 font-bold text-ink">{i.price ? <ShopPrice item={i} /> : null}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-dashed border-line pt-4">
              {totals.map((t) => (
                <div key={t.currency} className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Total{totals.length > 1 ? ` (${t.currency})` : ""}</span>
                  <span className="text-xl font-extrabold text-ink">{t.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </FocusShell>
  );
}
