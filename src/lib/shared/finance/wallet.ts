import type { CurrencyCode } from "./currencies";
import type { Rates } from "./rates";

export type Ledger = { currency: CurrencyCode; amount: number; kind: "earning" | "pending" | "payout" | "payout_pending" };
export type Balance = { currency: CurrencyCode; available: number; pending: number; paidOut: number; upcoming: number; earned: number };

/** One balance per currency. Currencies are never added together. */
export function balancesByCurrency(entries: Ledger[], show: CurrencyCode[] = []): Balance[] {
  const map = new Map<CurrencyCode, Balance>();
  const get = (c: CurrencyCode) => map.get(c) ?? (map.set(c, { currency: c, available: 0, pending: 0, paidOut: 0, upcoming: 0, earned: 0 }), map.get(c)!);
  for (const c of show) get(c);
  for (const e of entries) {
    const b = get(e.currency);
    if (e.kind === "earning") { b.earned += e.amount; b.available += e.amount; }
    else if (e.kind === "pending") { b.pending += e.amount; b.earned += e.amount; }
    else if (e.kind === "payout") { b.paidOut += e.amount; b.available -= e.amount; }
    else { b.upcoming += e.amount; b.available -= e.amount; }
  }
  return [...map.values()];
}

/** Rate to turn 1 unit of `from` into `to`, from a single published table. */
export function rateFor(rates: Rates | null, from: CurrencyCode, to: CurrencyCode) {
  if (from === to) return 1;
  if (!rates) return null;
  const f = from === rates.base ? 1 : rates.rates[from];
  const t = to === rates.base ? 1 : rates.rates[to];
  if (!f || !t) return null;
  return t / f;
}

/** Estimated total in one display currency; null when any rate is missing. */
export function estimatedTotal(balances: Balance[], rates: Rates | null, display: CurrencyCode) {
  let sum = 0;
  for (const b of balances) {
    const amount = b.available + b.pending;
    if (!amount) continue;
    const r = rateFor(rates, b.currency, display);
    if (r === null) return null;
    sum += amount * r;
  }
  return sum;
}

export type Quote = { amount: number; from: CurrencyCode; to: CurrencyCode; rate: number | null; recipientEstimate: number | null; converts: boolean };
export function quote(amount: number, from: CurrencyCode, to: CurrencyCode, rates: Rates | null): Quote {
  const converts = from !== to;
  const rate = converts ? rateFor(rates, from, to) : 1;
  return { amount, from, to, rate, converts, recipientEstimate: rate === null ? null : Math.round(amount * rate * 100) / 100 };
}

export function withdrawalError(available: number, amount: number, hasDestination: boolean) {
  if (!hasDestination) return "Choose where to send the money.";
  if (!Number.isFinite(amount) || amount <= 0) return "Enter an amount to withdraw.";
  if (amount > available) return "That's more than your available balance in this currency.";
  return "";
}
