import { CreditCard, Landmark, Wallet, Building2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Field } from "@/components/affiliate/Field";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { ProcessingScreen, useProcessing } from "@/components/shared/outcome";
import { cardBrand, BRAND_LABEL, formatCardNumber, formatExpiry, lastFour, luhnValid, digitsOnly } from "@/lib/checkout/card";
import { fingerprintOf, isDuplicate, type Beneficiary } from "@/lib/shared/finance/beneficiaries";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { maskEmail } from "@/lib/shared/finance/withdrawals";
import { cn } from "@/lib/utils";
import { AddPayoutAccount } from "./AddAccount";

type Kind = "bank" | "card" | "paypal" | "stripe";
const KINDS: { id: Kind; label: string; icon: typeof Landmark; hint: string }[] = [
  { id: "bank", label: "Bank account", icon: Landmark, hint: "Local banks and mobile money" },
  { id: "card", label: "Debit card", icon: CreditCard, hint: "Visa, Mastercard, Verve" },
  { id: "paypal", label: "PayPal", icon: Wallet, hint: "Your PayPal balance" },
  { id: "stripe", label: "Stripe", icon: Building2, hint: "Connected Stripe account" },
];

function Verifying({ label, onDone }: { label: string; onDone: () => void }) {
  const steps = [label, "Checking the account holder", "Saving securely"];
  const { active } = useProcessing(steps.length, onDone, 800);
  return <ProcessingScreen title="Verifying your account" message="This only takes a moment." steps={steps} active={active} />;
}

/** Add a payout destination of any kind. `onSave` must persist and return false on failure. */
export function AddDestination({ holder, country, currency: initialCurrency, existing, onSave, onCancel }: {
  holder: string;
  country: string;
  currency: CurrencyCode;
  existing: Beneficiary[];
  onSave: (b: Beneficiary) => boolean;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<Kind>("bank");
  /** Once a bank account is under way, the method cards fold into one line so the form stays in view. */
  const [folded, setFolded] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
  const [v, setV] = useState({ number: "", expiry: "", name: holder, email: "", stripeId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Beneficiary | null>(null);
  const [saveError, setSaveError] = useState("");
  const set = (k: keyof typeof v, val: string) => { setV((x) => ({ ...x, [k]: val })); setErrors((e) => ({ ...e, [k]: "" })); };

  if (pending) {
    return <Verifying label={kind === "card" ? "Contacting the card issuer" : kind === "paypal" ? "Connecting to PayPal" : "Connecting to Stripe"} onDone={() => { if (!onSave(pending)) { setSaveError("This account wasn't saved. Your browser may be out of space or blocking saves. Fix that, then try again."); setPending(null); } }} />;
  }

  const submit = async () => {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 2) e["name"] = "Enter the account holder's name";
    if (kind === "card") {
      if (!luhnValid(v.number)) e["number"] = "Enter a valid debit card number";
      const ex = digitsOnly(v.expiry);
      const now = new Date();
      if (ex.length !== 4 || Number(ex.slice(0, 2)) < 1 || Number(ex.slice(0, 2)) > 12) e["expiry"] = "Enter the expiry as MM / YY";
      else if (2000 + Number(ex.slice(2)) < now.getFullYear() || (2000 + Number(ex.slice(2)) === now.getFullYear() && Number(ex.slice(0, 2)) < now.getMonth() + 1)) e["expiry"] = "This card has expired";
    } else if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e["email"] = kind === "paypal" ? "Enter the email on your PayPal account" : "Enter the email on your Stripe account";
    setErrors(e);
    if (Object.keys(e).length) return;
    const key = kind === "card" ? digitsOnly(v.number) : v.email.trim().toLowerCase();
    const fingerprint = await fingerprintOf([kind, key, currency]);
    if (isDuplicate(existing, fingerprint)) return setErrors({ [kind === "card" ? "number" : "email"]: "This account is already saved" });
    const brand = BRAND_LABEL[cardBrand(v.number)];
    const name = kind === "card" ? `${brand} debit card` : kind === "paypal" ? "PayPal" : "Stripe";
    setPending({
      id: crypto.randomUUID(), country, currency, railId: `${kind}-${currency.toLowerCase()}`, method: kind === "bank" ? "card" : kind, provider: kind === "paypal" ? "paypal" : kind === "stripe" ? "stripe" : "flutterwave",
      institution: { code: kind, name, logo: null }, holder: v.name.trim(), nickname: "", last4: kind === "card" ? lastFour(v.number) : maskEmail(v.email),
      details: kind === "card" ? [`Expires ${formatExpiry(v.expiry)}`] : [maskEmail(v.email)], status: "format_checked", preferred: existing.length === 0,
      fingerprint, createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {folded && kind === "bank" ? (
        <div className="flex items-center gap-3 rounded-[18px] border-[1.5px] border-cobalt bg-ice p-3">
          <Landmark className="size-5 shrink-0 text-cobalt" aria-hidden="true" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">Bank account</span><span className="block text-[11px] font-semibold text-muted-foreground">Local banks and mobile money</span></span>
          <button type="button" onClick={() => setFolded(false)} className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-extrabold text-cobalt hover:bg-card" aria-expanded={false}>Other methods <ChevronDown className="size-3.5" aria-hidden="true" /></button>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Payout method">
        {KINDS.map((k) => (
          <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} onClick={() => { setKind(k.id); setErrors({}); }} className={cn("flex min-h-20 flex-col items-start justify-between gap-2 rounded-[18px] border-[1.5px] p-3 text-left transition-colors", kind === k.id ? "border-cobalt bg-ice" : "border-line bg-card hover:border-sky")}>
            <k.icon className={cn("size-5", kind === k.id ? "text-cobalt" : "text-muted-foreground")} aria-hidden="true" />
            <span><span className="block text-sm font-extrabold">{k.label}</span><span className="block text-[11px] font-semibold text-muted-foreground">{k.hint}</span></span>
          </button>
        ))}
      </div>
      )}
      {kind === "bank" ? (
        <AddPayoutAccount defaultHolder={holder} defaultCountry={country} existing={existing} onSave={onSave} onDone={onCancel} onProgress={setFolded} />
      ) : (
        <form noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }} className="screen-in space-y-4" key={kind}>
          {kind === "card" ? (
            <>
              <Field id="pd-n" label="Debit card number" error={errors["number"]}>
                <Input id="pd-n" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={v.number} onChange={(e) => set("number", formatCardNumber(e.target.value))} aria-invalid={!!errors["number"]} className="font-mono" />
              </Field>
              <Field id="pd-e" label="Expiry date" error={errors["expiry"]}>
                <Input id="pd-e" inputMode="numeric" placeholder="MM / YY" value={v.expiry} onChange={(e) => set("expiry", formatExpiry(e.target.value))} aria-invalid={!!errors["expiry"]} />
              </Field>
            </>
          ) : (
            <Field id="pd-email" label={kind === "paypal" ? "PayPal email" : "Stripe account email"} error={errors["email"]} hint={kind === "stripe" ? "We'll connect payouts to the Stripe account that uses this email." : undefined}>
              <Input id="pd-email" type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors["email"]} />
            </Field>
          )}
          <Field id="pd-name" label={kind === "card" ? "Name on card" : "Account holder name"} error={errors["name"]}>
            <Input id="pd-name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors["name"]} />
          </Field>
          <div className="space-y-1.5">
            <label htmlFor="pd-cur" className="text-[13px] font-bold">Payout currency</label>
            <select id="pd-cur" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="h-12 w-full rounded-[14px] border-[1.5px] border-input bg-card px-3 text-base font-medium md:text-sm">
              {(kind === "card" ? (["NGN", "GHS", "KES", "ZAR", "USD"] as CurrencyCode[]) : CURRENCY_CODES.filter((c) => ["USD", "GBP", "EUR", "NGN"].includes(c))).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {saveError && <p role="alert" className="text-sm font-semibold text-destructive">{saveError}</p>}
          <div className="grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
            <Button type="submit" size="lg">{kind === "card" ? "Verify and save card" : `Connect ${kind === "paypal" ? "PayPal" : "Stripe"}`}</Button>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
