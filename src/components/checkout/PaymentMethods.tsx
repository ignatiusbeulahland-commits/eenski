import { ArrowLeft, Building2, Check, CreditCard, Landmark, Lock, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Field } from "@/components/affiliate/Field";
import { Input } from "@/components/dashboard-ui/input";
import { outcomeButton } from "@/components/shared/outcome";
import {
  BRAND_LABEL,
  cardBrand,
  cardResponse,
  formatCardNumber,
  formatExpiry,
  lastFour,
  OTP_ATTEMPTS,
  otpValid,
  USSD_BANKS,
  validateCard,
  type CardErrors,
  type FailReason,
  type PayMethod,
} from "@/lib/checkout/card";
import { cn } from "@/lib/utils";

/** What the chosen method decided: the processor's answer is applied after the processing screen. */
export interface PayDecision {
  method: PayMethod;
  methodLabel: string;
  plan: "successful" | "pending" | FailReason;
  /** Card payments ask the bank for a one-time code after the buyer confirms. */
  needsOtp?: boolean;
}

export const PAY_METHODS: { id: PayMethod; label: string; hint: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", hint: "Visa, Mastercard, Verve", icon: CreditCard },
  { id: "bank", label: "Bank transfer", hint: "Pay into a one-time account", icon: Landmark },
  { id: "ussd", label: "USSD", hint: "Dial a code on your phone", icon: Smartphone },
  { id: "paypal", label: "PayPal", hint: "Pay with your PayPal account", icon: Wallet },
  { id: "stripe", label: "Stripe", hint: "International cards", icon: Building2 },
];

export function MethodPicker({ value, onChange }: { value: PayMethod; onChange: (m: PayMethod) => void }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PAY_METHODS.map((m) => {
        const on = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m.id)}
            className={cn(
              "relative flex min-h-[84px] flex-col items-start justify-between gap-2 rounded-[18px] border-[1.5px] p-3.5 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.98]",
              on ? "border-cobalt bg-ice" : "border-line bg-card hover:border-sky",
            )}
          >
            <span className={cn("grid size-9 place-items-center rounded-xl", on ? "bg-cobalt text-primary-foreground" : "bg-soft text-brand")}>
              <m.icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-ink">{m.label}</span>
              <span className="block text-[11px] font-semibold leading-snug text-muted-foreground">{m.hint}</span>
            </span>
            {on && (
              <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-cobalt text-primary-foreground" aria-hidden="true">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PayButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled} className={cn(outcomeButton.primary, "w-full sm:w-full")}>
      <Lock aria-hidden="true" /> {children}
    </button>
  );
}

function Secured({ by }: { by: string }) {
  return (
    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
      <ShieldCheck className="size-3.5 text-success" aria-hidden="true" /> {by}
    </p>
  );
}

function CardFields({ value, set, errors, compact = false }: {
  value: { number: string; expiry: string; cvc: string; name: string };
  set: (k: "number" | "expiry" | "cvc" | "name", v: string) => void;
  errors: CardErrors;
  compact?: boolean;
}) {
  const id = useId();
  const brand = cardBrand(value.number);
  if (compact) {
    // Stripe-style single card element.
    return (
      <div className="space-y-3">
        <div>
          <label htmlFor={`${id}-n`} className="text-[13px] font-bold text-ink">Card information</label>
          <div className={cn("mt-1.5 overflow-hidden rounded-[14px] border-[1.5px] bg-card focus-within:border-cobalt focus-within:ring-4 focus-within:ring-ice", errors.number || errors.expiry || errors.cvc ? "border-destructive" : "border-input")}>
            <div className="flex items-center border-b border-line">
              <input id={`${id}-n`} inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" value={value.number} onChange={(e) => set("number", formatCardNumber(e.target.value))} className="h-12 min-w-0 flex-1 bg-transparent px-4 text-base font-medium outline-none md:text-sm" aria-invalid={!!errors.number} />
              <span className="pr-3 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{brand === "unknown" ? "" : BRAND_LABEL[brand]}</span>
            </div>
            <div className="grid grid-cols-2">
              <input aria-label="Expiry date" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={value.expiry} onChange={(e) => set("expiry", formatExpiry(e.target.value))} className="h-12 min-w-0 border-r border-line bg-transparent px-4 text-base font-medium outline-none md:text-sm" aria-invalid={!!errors.expiry} />
              <input aria-label="Security code" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" maxLength={4} value={value.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, ""))} className="h-12 min-w-0 bg-transparent px-4 text-base font-medium outline-none md:text-sm" aria-invalid={!!errors.cvc} />
            </div>
          </div>
          {(errors.number || errors.expiry || errors.cvc) && <p className="mt-1.5 text-xs font-semibold text-destructive">{errors.number ?? errors.expiry ?? errors.cvc}</p>}
        </div>
        <Field id={`${id}-name`} label="Name on card" error={errors.name}>
          <Input id={`${id}-name`} autoComplete="cc-name" value={value.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
        </Field>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id={`${id}-n`} label="Card number" error={errors.number}>
          <div className="relative">
            <Input id={`${id}-n`} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={value.number} onChange={(e) => set("number", formatCardNumber(e.target.value))} aria-invalid={!!errors.number} className="pr-24 font-mono tracking-wide" />
            <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-extrabold", brand === "unknown" ? "text-muted-foreground" : "bg-ice text-brand")}>
              {brand === "unknown" ? <CreditCard className="size-4" aria-hidden="true" /> : BRAND_LABEL[brand]}
            </span>
          </div>
        </Field>
      </div>
      <Field id={`${id}-e`} label="Expiry date" error={errors.expiry}>
        <Input id={`${id}-e`} inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={value.expiry} onChange={(e) => set("expiry", formatExpiry(e.target.value))} aria-invalid={!!errors.expiry} />
      </Field>
      <Field id={`${id}-c`} label="Security code (CVV)" error={errors.cvc} hint="3 digits on the back">
        <Input id={`${id}-c`} inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={value.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, ""))} aria-invalid={!!errors.cvc} />
      </Field>
      <div className="sm:col-span-2">
        <Field id={`${id}-name`} label="Name on card" error={errors.name}>
          <Input id={`${id}-name`} autoComplete="cc-name" placeholder="As printed on the card" value={value.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
        </Field>
      </div>
    </div>
  );
}

function useCard(defaultName: string) {
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: defaultName });
  const [errors, setErrors] = useState<CardErrors>({});
  const set = (k: keyof typeof card, v: string) => {
    setCard((c) => ({ ...c, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  return { card, errors, setErrors, set };
}

/** Card details → review → one-time code from the bank (3-D Secure) → decision. */
function CardPanel({ amountLabel, defaultName, onPay }: { amountLabel: string; defaultName: string; onPay: (d: PayDecision) => void }) {
  const { card, errors, setErrors, set } = useCard(defaultName);
  return (
    <form
      noValidate
      className="screen-in"
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateCard(card);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        const r = cardResponse(card.number);
        onPay({ method: "card", methodLabel: `${BRAND_LABEL[cardBrand(card.number)]} •••• ${lastFour(card.number)}`, plan: r === "approved" ? "successful" : r, needsOtp: true });
      }}
    >
      <CardFields value={card} set={set} errors={errors} />
      <div className="mt-6">
        <PayButton>Review payment of {amountLabel}</PayButton>
        <Secured by="Your card details are encrypted and never stored by Enski." />
      </div>
    </form>
  );
}

/** The bank's one-time code screen (3-D Secure), shown after the buyer confirms a card payment. */
export function OtpStep({ amountLabel, decision, onDone, onBack }: { amountLabel: string; decision: PayDecision; onDone: (d: PayDecision) => void; onBack: () => void }) {
  const [otp, setOtp] = useState("");
  const [tries, setTries] = useState(0);
  const [otpError, setOtpError] = useState("");
  return (
    <form
      className="screen-in"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otp)) return setOtpError("Enter all 6 digits");
        if (!otpValid(otp)) {
          const n = tries + 1;
          setTries(n);
          setOtp("");
          if (n >= OTP_ATTEMPTS) return onDone({ ...decision, plan: "otp_failed" });
          return setOtpError(`That code isn't right. ${OTP_ATTEMPTS - n} ${OTP_ATTEMPTS - n === 1 ? "attempt" : "attempts"} left.`);
        }
        onDone(decision);
      }}
    >
      <div className="rounded-[20px] border border-line bg-soft/60 p-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cobalt text-primary-foreground"><ShieldCheck className="size-6" aria-hidden="true" /></span>
        <h2 className="mt-3 text-lg font-extrabold text-ink">Verify it's you</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">Your bank needs a one-time code to approve {amountLabel} on {decision.methodLabel}. Find it in your banking app or text messages.</p>
        <label htmlFor="otp" className="sr-only">One-time code</label>
        <input
          id="otp"
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
            setOtpError("");
          }}
          placeholder="••••••"
          aria-invalid={!!otpError}
          className={cn("mx-auto mt-4 block h-14 w-full max-w-[240px] rounded-[14px] border-[1.5px] bg-card text-center font-mono text-2xl font-extrabold tracking-[0.5em] outline-none focus:border-cobalt focus:ring-4 focus:ring-ice", otpError ? "border-destructive" : "border-input")}
        />
        {otpError && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{otpError}</p>}
      </div>
      <div className="mt-5 grid gap-2">
        <PayButton>Approve {amountLabel}</PayButton>
        <button type="button" onClick={onBack} className={cn(outcomeButton.quiet, "w-full sm:w-full")}>
          <ArrowLeft aria-hidden="true" /> Back to review
        </button>
      </div>
    </form>
  );
}

function StripePanel({ amountLabel, defaultName, email, onPay }: { amountLabel: string; defaultName: string; email: string; onPay: (d: PayDecision) => void }) {
  const { card, errors, setErrors, set } = useCard(defaultName);
  const [country, setCountry] = useState("NG");
  return (
    <form
      noValidate
      className="screen-in rounded-[20px] border border-line bg-card p-5 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateCard(card);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        const r = cardResponse(card.number);
        onPay({ method: "stripe", methodLabel: `${BRAND_LABEL[cardBrand(card.number)]} •••• ${lastFour(card.number)} via Stripe`, plan: r === "approved" ? "successful" : r });
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-extrabold tracking-tight text-cobalt">stripe</span>
        <span className="text-xs font-bold text-muted-foreground">{email}</span>
      </div>
      <CardFields value={card} set={set} errors={errors} compact />
      <div className="mt-3">
        <label htmlFor="stripe-country" className="text-[13px] font-bold text-ink">Country or region</label>
        <select id="stripe-country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1.5 h-12 w-full rounded-[14px] border-[1.5px] border-input bg-card px-3 text-base font-medium md:text-sm">
          <option value="NG">Nigeria</option>
          <option value="GH">Ghana</option>
          <option value="KE">Kenya</option>
          <option value="ZA">South Africa</option>
          <option value="GB">United Kingdom</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>
      <div className="mt-5">
        <PayButton>Review payment of {amountLabel}</PayButton>
        <Secured by="Powered by Stripe. Payments are processed securely." />
      </div>
    </form>
  );
}

function PayPalPanel({ amountLabel, email: defaultEmail, onPay, onCancel }: { amountLabel: string; email: string; onPay: (d: PayDecision) => void; onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  if (!open) {
    return (
      <div className="screen-in text-center">
        <p className="text-sm text-muted-foreground">You'll log in to PayPal to approve {amountLabel}, then come straight back here.</p>
        <button type="button" onClick={() => setOpen(true)} className={cn(outcomeButton.primary, "mt-5 w-full sm:w-full")}>
          <Wallet aria-hidden="true" /> Continue to PayPal
        </button>
      </div>
    );
  }
  return (
    <form
      noValidate
      className="screen-in overflow-hidden rounded-[20px] border border-line bg-card shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter the email for your PayPal account");
        if (password.length < 6) return setError("Enter your PayPal password");
        onPay({ method: "paypal", methodLabel: `PayPal (${email.trim().toLowerCase()})`, plan: /\+decline@/i.test(email) ? "declined" : "successful" });
      }}
    >
      <div className="flex items-center justify-between bg-soft px-5 py-3">
        <span className="text-lg font-extrabold italic text-brand">Pay<span className="text-sky">Pal</span></span>
        <span className="text-xs font-bold text-muted-foreground">Enski · {amountLabel}</span>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-sm font-bold text-ink">Log in to pay with PayPal</p>
        <Field id="pp-email" label="Email">
          <Input id="pp-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
        </Field>
        <Field id="pp-pass" label="Password" error={error}>
          <Input id="pp-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
        </Field>
        <button type="submit" className={cn(outcomeButton.primary, "w-full sm:w-full")}>Continue to review</button>
        <button type="button" onClick={onCancel} className={cn(outcomeButton.quiet, "w-full sm:w-full")}>Cancel and return to Enski</button>
      </div>
    </form>
  );
}

function BankPanel({ amountLabel, onPay }: { amountLabel: string; onPay: (d: PayDecision) => void }) {
  return (
    <div className="screen-in">
      <ol className="space-y-3 rounded-[20px] border border-line bg-soft/60 p-5 text-sm">
        {["We create a one-time account number just for this order.", `Transfer exactly ${amountLabel} from any bank app.`, "We confirm it automatically and unlock your order."].map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cobalt text-xs font-extrabold text-primary-foreground">{i + 1}</span>
            <span className="font-semibold text-ink">{s}</span>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => onPay({ method: "bank", methodLabel: "Bank transfer", plan: "pending" })} className={cn(outcomeButton.primary, "mt-5 w-full sm:w-full")}>
        <Landmark aria-hidden="true" /> Continue to review
      </button>
      <Secured by="The account expires after 30 minutes." />
    </div>
  );
}

function UssdPanel({ onPay }: { onPay: (d: PayDecision) => void }) {
  const [bank, setBank] = useState<string>("");
  const [error, setError] = useState("");
  return (
    <form
      noValidate
      className="screen-in"
      onSubmit={(e) => {
        e.preventDefault();
        const b = USSD_BANKS.find((x) => x.id === bank);
        if (!b) return setError("Choose the bank you'll pay from");
        onPay({ method: "ussd", methodLabel: `${b.name} USSD (${b.code}#)`, plan: "pending" });
      }}
    >
      <p className="text-[13px] font-bold text-ink">Choose your bank</p>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Bank">
        {USSD_BANKS.map((b) => (
          <button key={b.id} type="button" role="radio" aria-checked={bank === b.id} onClick={() => { setBank(b.id); setError(""); }} className={cn("flex min-h-12 items-center justify-between rounded-[14px] border-[1.5px] px-3 text-left text-sm font-extrabold transition-colors", bank === b.id ? "border-cobalt bg-ice text-brand" : "border-line text-ink hover:border-sky")}>
            {b.name}
            <span className="font-mono text-xs text-muted-foreground">{b.code}#</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{error}</p>}
      <div className="mt-5">
        <PayButton>Continue to review</PayButton>
      </div>
    </form>
  );
}

/** The payment step: pick a method, then that method's own interface. */
export function PaymentMethods({ method, onMethod, amountLabel, buyer, onPay, onCancel }: {
  method: PayMethod;
  onMethod: (m: PayMethod) => void;
  amountLabel: string;
  buyer: { name: string; email: string };
  onPay: (d: PayDecision) => void;
  /** The visitor backed out at the provider (PayPal "Cancel and return"). */
  onCancel: (m: PayMethod) => void;
}) {
  return (
    <div className="space-y-6">
      <MethodPicker value={method} onChange={onMethod} />
      <div key={method}>
        {method === "card" && <CardPanel amountLabel={amountLabel} defaultName={buyer.name} onPay={onPay} />}
        {method === "stripe" && <StripePanel amountLabel={amountLabel} defaultName={buyer.name} email={buyer.email} onPay={onPay} />}
        {method === "paypal" && <PayPalPanel amountLabel={amountLabel} email={buyer.email} onPay={onPay} onCancel={() => onCancel("paypal")} />}
        {method === "bank" && <BankPanel amountLabel={amountLabel} onPay={onPay} />}
        {method === "ussd" && <UssdPanel onPay={onPay} />}
      </div>
    </div>
  );
}
