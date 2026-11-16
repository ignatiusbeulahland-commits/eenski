import type { MethodId } from "./coverage";
import type { CurrencyCode } from "./currencies";

/**
 * Withdrawal rules shared by every role: minimums, daily limits, Enski's payout fees,
 * arrival times, the 4-digit PIN and what happens when a transfer can't go through.
 */

const ZERO_DECIMAL = new Set<CurrencyCode>(["TZS", "UGX", "XOF", "XAF", "RWF"]);
const MINIMUM: Partial<Record<CurrencyCode, number>> = { NGN: 1000, GHS: 50, KES: 500, ZAR: 100, TZS: 10000, UGX: 15000, XOF: 2500, XAF: 2500, RWF: 5000 };
const DAILY: Partial<Record<CurrencyCode, number>> = { NGN: 2_000_000, GHS: 20_000, KES: 250_000, ZAR: 35_000, TZS: 5_000_000, UGX: 7_500_000, XOF: 1_200_000, XAF: 1_200_000, RWF: 2_500_000 };

export const minWithdrawal = (c: CurrencyCode) => MINIMUM[c] ?? 5;
export const dailyLimit = (c: CurrencyCode) => DAILY[c] ?? 2000;

const round = (n: number, c: CurrencyCode) => (ZERO_DECIMAL.has(c) ? Math.round(n) : Math.round(n * 100) / 100);

/** Enski's payout fee for this method. Bank and mobile money are flat, cards and wallets a percentage. */
export function withdrawalFee(method: MethodId, amount: number, currency: CurrencyCode): number {
  if (!(amount > 0)) return 0;
  switch (method) {
    case "bank":
      return currency === "NGN" ? 50 : round(Math.min(Math.max(amount * 0.005, 0.5), 10), currency);
    case "mobile_money":
      return round(amount * 0.01, currency);
    case "card":
      return round(amount * 0.015, currency);
    case "paypal":
      return round(amount * 0.02, currency);
    case "stripe":
      return round(amount * 0.01, currency);
  }
}

export const ARRIVAL: Record<MethodId, string> = {
  bank: "Usually within minutes",
  mobile_money: "Usually within minutes",
  card: "Within 30 minutes",
  paypal: "Usually within an hour",
  stripe: "1 to 2 business days",
};

export function amountError(amount: number, available: number, currency: CurrencyCode, fee: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "Enter an amount to withdraw.";
  const min = minWithdrawal(currency);
  if (amount < min) return `The minimum withdrawal is ${min.toLocaleString()} ${currency}.`;
  if (amount > available) return "That's more than your available balance in this currency.";
  if (amount <= fee) return "The amount must be more than the transfer fee.";
  return "";
}

/** Withdrawals in this currency sent (or on their way) since local midnight. */
export function sentToday(list: { amount: number; currency: string; date: string; status: string }[], currency: CurrencyCode, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return list.filter((w) => w.currency === currency && w.status !== "failed" && new Date(w.date) >= start).reduce((n, w) => n + w.amount, 0);
}

export type WithdrawFail = "daily_limit" | "bank_unavailable" | "pin_locked";

/** The transfer partner refuses anything that would take today's total over the daily limit. */
export function planWithdrawal(todayTotal: number, amount: number, currency: CurrencyCode): "successful" | WithdrawFail {
  return todayTotal + amount > dailyLimit(currency) ? "daily_limit" : "successful";
}

export const WITHDRAW_FAIL_COPY: Record<WithdrawFail, { title: string; body: string }> = {
  daily_limit: { title: "This goes over today's withdrawal limit", body: "Withdrawals are capped each day to keep your money safe. Withdraw a smaller amount, or try again tomorrow." },
  bank_unavailable: { title: "The receiving bank isn't responding", body: "Their service is temporarily unavailable. Your balance hasn't changed. Try again in a few minutes or use another payout account." },
  pin_locked: { title: "Too many wrong PIN attempts", body: "We stopped this withdrawal to protect your account. Your balance hasn't changed. Try again and enter your withdrawal PIN carefully." },
};

export const PIN_ATTEMPTS = 3;
const WEAK = new Set(["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321", "0123", "9876"]);
export function newPinError(pin: string, confirm: string): string {
  if (!/^\d{4}$/.test(pin)) return "Your PIN must be 4 digits.";
  if (WEAK.has(pin)) return "Choose a PIN that's harder to guess.";
  if (pin !== confirm) return "The two PINs don't match.";
  return "";
}

export async function pinHash(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}|${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Short reference for a withdrawal, e.g. WD-7K4Q2M. */
export function withdrawalReference(rand: () => number = Math.random) {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(rand() * a.length)];
  return `WD-${s}`;
}

/** Masks an email for display: ada.okafor@mail.com → ad•••@mail.com */
export function maskEmail(email: string): string {
  const [user = "", domain = ""] = email.trim().toLowerCase().split("@");
  return `${user.slice(0, 2)}•••@${domain}`;
}

/** "12500.5" → "12,500.5" for display while typing; leading zeros are dropped. */
export const groupedAmount = (raw: string) => {
  const [i = "", d] = raw.split(".");
  const int = i.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return d === undefined ? int : `${int}.${d}`;
};

/** What someone typed → a plain amount: digits, one dot, at most two decimals. */
export const cleanAmount = (typed: string) => {
  const t = typed.replace(/[^\d.]/g, "");
  const dot = t.indexOf(".");
  return dot < 0 ? t : `${t.slice(0, dot)}.${t.slice(dot + 1).replace(/\./g, "").slice(0, 2)}`;
};
