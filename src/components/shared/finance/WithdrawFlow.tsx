import { ArrowLeft, ArrowRight, Check, KeyRound, Lock, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { FlowSteps, OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { beneficiaryLabel, maskedLast4, type Beneficiary } from "@/lib/shared/finance/beneficiaries";
import { METHOD_LABEL, PROVIDERS } from "@/lib/shared/finance/coverage";
import { CURRENCIES, currencySymbol, formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import type { Balance } from "@/lib/shared/finance/wallet";
import { amountError, ARRIVAL, cleanAmount, groupedAmount, minWithdrawal, newPinError, PIN_ATTEMPTS, withdrawalFee } from "@/lib/shared/finance/withdrawals";
import { cn } from "@/lib/utils";
import { BankLogo, Flag } from "./Marks";

export interface WithdrawRequest {
  amount: number;
  currency: CurrencyCode;
  fee: number;
  receive: number;
  beneficiary: Beneficiary;
}

const STEPS = ["Amount", "Send to", "Review", "Confirm"];

type Step = 0 | 1 | 2 | 3;

function PinInput({ value, onChange, label, autoFocus, invalid }: { value: string; onChange: (v: string) => void; label: string; autoFocus?: boolean; invalid?: boolean }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="••••"
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={cn("mx-auto block h-14 w-full max-w-[200px] rounded-[14px] border-[1.5px] bg-card text-center font-mono text-2xl font-extrabold tracking-[0.6em] outline-none focus:border-cobalt focus:ring-4 focus:ring-ice", invalid ? "border-destructive" : "border-input")}
      />
    </label>
  );
}

/**
 * Full-page withdrawal: Amount → Send to → Review → PIN. The caller records the
 * withdrawal and opens its result screen; nothing leaves the balance before that.
 */
export function WithdrawFlow({
  balances, beneficiaries, initialCurrency, initialBeneficiary, blockers, pinSet, savePin, verifyPin, onSubmit, onLocked, onAddNew, cancel,
}: {
  balances: Balance[];
  beneficiaries: Beneficiary[];
  initialCurrency: CurrencyCode;
  initialBeneficiary?: string | undefined;
  blockers: { label: string; to: ReactNode }[];
  pinSet: boolean;
  savePin: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  onSubmit: (r: WithdrawRequest) => void;
  onLocked: (r: WithdrawRequest) => void;
  onAddNew: (state: { currency: CurrencyCode; amount: string }) => void;
  cancel: ReactNode;
}) {
  const [step, setStep] = useState<Step>(initialBeneficiary ? 1 : 0);
  const [cur, setCur] = useState<CurrencyCode>(initialCurrency);
  const [amount, setAmount] = useState(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("enski:withdraw:amount") ?? "" : ""));
  const [benId, setBenId] = useState(() => initialBeneficiary ?? beneficiaries.find((b) => b.preferred && b.currency === initialCurrency)?.id ?? beneficiaries.find((b) => b.currency === initialCurrency)?.id ?? "");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [tries, setTries] = useState(0);
  const [busy, setBusy] = useState(false);
  const [creatingPin, setCreatingPin] = useState(!pinSet);

  const bal = balances.find((b) => b.currency === cur);
  const available = bal?.available ?? 0;
  const ben = beneficiaries.find((b) => b.id === benId);
  const n = Number(amount);
  const method = ben?.method ?? "bank";
  const fee = withdrawalFee(method, n, cur);
  const receive = Math.max(0, Math.round((n - fee) * 100) / 100);
  const req = useMemo<WithdrawRequest | null>(() => (ben ? { amount: n, currency: cur, fee, receive, beneficiary: ben } : null), [ben, n, cur, fee, receive]);

  if (blockers.length) {
    return (
      <OutcomeScreen
        tone="info"
        eyebrow="Before you withdraw"
        title="A couple of things first"
        message="Finish these so we can send money to you safely."
        actions={cancel}
      >
        <ul className="mt-6 space-y-2 text-left">{blockers.map((b) => <li key={b.label}>{b.to}</li>)}</ul>
      </OutcomeScreen>
    );
  }

  const next = () => {
    if (step === 0) {
      const e = amountError(n, available, cur, withdrawalFee("bank", n, cur));
      if (e) return setError(e);
      setError("");
      return setStep(1);
    }
    if (step === 1) {
      if (!ben) return setError("Choose where to send the money.");
      const e = amountError(n, available, cur, fee);
      if (e) return setError(e);
      setError("");
      setChecked(false);
      return setStep(2);
    }
    if (step === 2) {
      if (!checked) return setError("Tick the box to confirm the details are right.");
      setError("");
      setPin("");
      setPin2("");
      return setStep(3);
    }
  };

  const confirm = async () => {
    if (!req) return;
    setBusy(true);
    try {
      if (creatingPin) {
        const e = newPinError(pin, pin2);
        if (e) return setError(e);
        if (!(await savePin(pin))) return setError("Your PIN wasn't saved. Your browser may be out of space. Free up some space, then try again.");
        setCreatingPin(false);
        try { window.sessionStorage.removeItem("enski:withdraw:amount"); } catch { /* ignore */ }
        return onSubmit(req);
      }
      if (!/^\d{4}$/.test(pin)) return setError("Enter your 4-digit PIN.");
      if (await verifyPin(pin)) {
        try { window.sessionStorage.removeItem("enski:withdraw:amount"); } catch { /* ignore */ }
        return onSubmit(req);
      }
      const t = tries + 1;
      setTries(t);
      setPin("");
      if (t >= PIN_ATTEMPTS) return onLocked(req);
      setError(`That PIN isn't right. ${PIN_ATTEMPTS - t} ${PIN_ATTEMPTS - t === 1 ? "attempt" : "attempts"} left.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <FlowSteps steps={STEPS} current={step} className="mx-auto mb-6 max-w-lg" />
      <section key={step} className="surface screen-in p-5 sm:p-8">
        {step === 0 && (
          <form noValidate onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold">How much would you like to withdraw?</h1>
              <p className="mt-1 text-sm text-muted-foreground">Available {cur}: <b className="tabular-nums text-foreground">{formatMoney(available, cur)}</b></p>
            </div>
            {balances.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Balance">
                {balances.map((b) => (
                  <button key={b.currency} type="button" aria-pressed={cur === b.currency} onClick={() => { setCur(b.currency); setError(""); setBenId(beneficiaries.find((x) => x.currency === b.currency)?.id ?? ""); }} className={cn("inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] px-3 text-[13px] font-extrabold", cur === b.currency ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card")}>
                    <Flag code={CURRENCIES[b.currency].flag} className="h-3.5 w-5" />{b.currency}
                  </button>
                ))}
              </div>
            )}
            <div className="finance-amount flex items-center rounded-[20px] border-[1.5px] border-input bg-card px-5 focus-within:border-cobalt focus-within:ring-4 focus-within:ring-ice" data-invalid={error ? "" : undefined}>
              <span className="text-2xl font-extrabold text-muted-foreground" aria-hidden="true">{currencySymbol(cur)}</span>
              <input id="wd-amount" aria-label={`Amount in ${cur}`} inputMode="decimal" autoComplete="off" autoFocus value={groupedAmount(amount)} onChange={(e) => { setAmount(cleanAmount(e.target.value)); setError(""); }} placeholder="0.00" aria-invalid={!!error || undefined} className="h-20 min-w-0 flex-1 bg-transparent px-2 text-4xl font-extrabold tabular-nums outline-none placeholder:text-muted-foreground/40" />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
              {([[0.25, "25%"], [0.5, "50%"], [1, "Max"]] as const).map(([f, l]) => (
                <button key={l} type="button" disabled={!available} onClick={() => { setAmount(String(Math.floor(available * f * 100) / 100)); setError(""); }} className="h-9 rounded-full border-[1.5px] border-line bg-card px-4 text-xs font-extrabold text-cobalt transition-colors hover:border-cobalt-100 hover:bg-ice disabled:opacity-50">{l}</button>
              ))}
            </div>
            {n > 0 && n > available ? (
              <p className="rounded-[14px] bg-warning-soft px-4 py-3 text-[13px] font-semibold text-warning-foreground">That's more than your available {formatMoney(available, cur)}.</p>
            ) : n > 0 ? (
              <dl className="screen-in divide-y divide-dashed rounded-[18px] border-[1.5px] border-line text-sm" aria-label="Withdrawal summary">
                {[
                  [ben ? `Fee to ${beneficiaryLabel(ben)} ${maskedLast4(ben)}` : "Transfer fee", ben ? formatMoney(fee, cur) : "Shown on the next step"],
                  ["You'll receive", ben ? formatMoney(receive, cur) : "—"],
                  ["Left in your wallet", formatMoney(Math.max(0, Math.round((available - n) * 100) / 100), cur)],
                ].map(([k, v], i) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 px-4 py-2.5"><dt className="min-w-0 truncate text-muted-foreground">{k}</dt><dd className={cn("shrink-0 tabular-nums", i === 1 ? "font-extrabold text-cobalt" : "font-bold")}>{v}</dd></div>
                ))}
              </dl>
            ) : null}
            <p className="text-xs text-muted-foreground">Minimum {formatMoney(minWithdrawal(cur), cur)}. You can change where it goes on the next step; the final fee is shown before you confirm.</p>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <div className="grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
              <Button type="submit" size="lg">Continue <ArrowRight /></Button>
              {cancel}
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold">Where should we send it?</h1>
              <p className="mt-1 text-sm text-muted-foreground">Withdrawing <b className="text-foreground">{formatMoney(n || 0, cur)}</b></p>
            </div>
            <ul className="space-y-2" role="radiogroup" aria-label="Payout account">
              {beneficiaries.map((b) => {
                const usable = b.currency === cur;
                const f = withdrawalFee(b.method, n, cur);
                return (
                  <li key={b.id}>
                    <button type="button" role="radio" aria-checked={benId === b.id} disabled={!usable} onClick={() => { setBenId(b.id); setError(""); }} className={cn("flex w-full items-center gap-3 rounded-[18px] border-[1.5px] p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55", benId === b.id ? "border-cobalt bg-ice/60 shadow-[inset_0_-3px_0_var(--lime)]" : "border-line bg-card hover:border-cobalt-100")}>
                      <BankLogo name={b.institution.name} logo={b.institution.logo} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-extrabold">{beneficiaryLabel(b)}</span>
                        <span className="block truncate text-xs text-muted-foreground">{maskedLast4(b)} · {METHOD_LABEL[b.method]}</span>
                      </span>
                      <span className="shrink-0 text-right text-xs">
                        {usable ? <><span className="block font-extrabold">Fee {formatMoney(f, cur)}</span><span className="block text-muted-foreground">{ARRIVAL[b.method]}</span></> : <span className="font-bold text-muted-foreground">Receives {b.currency}</span>}
                      </span>
                      {benId === b.id && <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="size-3.5" strokeWidth={3} /></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => { try { window.sessionStorage.setItem("enski:withdraw:amount", amount); } catch { /* ignore */ } onAddNew({ currency: cur, amount }); }} className="flex w-full items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-cobalt-100 p-3.5 text-left text-sm font-extrabold text-cobalt transition-colors hover:bg-ice">
              <span className="grid size-10 place-items-center rounded-[12px] bg-ice"><Plus className="size-5" /></span>
              Add bank account, card, PayPal or Stripe
            </button>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <div className="grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
              <Button size="lg" onClick={next}>Review withdrawal <ArrowRight /></Button>
              <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft /> Back</Button>
            </div>
          </div>
        )}

        {step === 2 && ben && (
          <div className="space-y-5">
            <h1 className="text-2xl font-extrabold">Review your withdrawal</h1>
            <div className="rounded-[22px] bg-soft/70 p-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">You'll receive</p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums text-cobalt">{formatMoney(receive, cur)}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{ARRIVAL[ben.method]}</p>
            </div>
            <dl className="divide-y divide-dashed rounded-[20px] border-[1.5px] border-line text-sm">
              {[
                ["Withdrawal amount", formatMoney(n, cur)],
                ["Transfer fee", formatMoney(fee, cur)],
                ["Currency", `${cur} · ${CURRENCIES[cur].name}`],
                ["Send to", `${beneficiaryLabel(ben)} ${maskedLast4(ben)}`],
                ["Account name", ben.holder],
                ["Method", `${METHOD_LABEL[ben.method]} via ${PROVIDERS[ben.provider].name}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-3"><dt className="shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0 break-words text-right font-bold">{v}</dd></div>
              ))}
            </dl>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-[14px] border-[1.5px] border-line p-3 text-[13px] font-semibold">
              <input type="checkbox" checked={checked} onChange={(e) => { setChecked(e.target.checked); setError(""); }} className="mt-0.5 h-4 w-4 accent-[var(--cobalt)]" />
              I've checked the recipient and the amount. Withdrawals can't be changed once sent.
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <div className="grid gap-2 sm:flex sm:flex-row-reverse sm:justify-between">
              <Button size="lg" onClick={next}><Lock /> Confirm withdrawal</Button>
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft /> Back</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form noValidate onSubmit={(e) => { e.preventDefault(); void confirm(); }} className="space-y-5 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-cobalt text-primary-foreground">{creatingPin ? <KeyRound className="size-7" /> : <ShieldCheck className="size-7" />}</span>
            <div>
              <h1 className="text-2xl font-extrabold">{creatingPin ? "Create your withdrawal PIN" : "Enter your withdrawal PIN"}</h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                {creatingPin ? "You'll use these 4 digits to approve every withdrawal. Keep it to yourself." : `Approve sending ${formatMoney(receive, cur)} to ${ben ? beneficiaryLabel(ben) : "your account"}.`}
              </p>
            </div>
            <PinInput label={creatingPin ? "New PIN" : "Withdrawal PIN"} value={pin} onChange={(v) => { setPin(v); setError(""); }} autoFocus invalid={!!error} />
            {creatingPin && <><p className="text-xs font-bold text-muted-foreground">Type it again</p><PinInput label="Confirm PIN" value={pin2} onChange={(v) => { setPin2(v); setError(""); }} invalid={!!error} /></>}
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <div className="grid gap-2">
              <button type="submit" disabled={busy} className={cn(outcomeButton.primary, "w-full sm:w-full")}><Lock /> {creatingPin ? "Save PIN and withdraw" : "Approve withdrawal"}</button>
              <Button type="button" variant="ghost" onClick={() => setStep(2)}><ArrowLeft /> Back to review</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
