/**
 * Card, OTP and payment-outcome rules for checkout. Pure functions, no storage.
 * Card numbers, CVCs and codes are never stored — only the brand and last four.
 */

export type PayMethod = "card" | "bank" | "ussd" | "paypal" | "stripe";
export type PayStatus = "processing" | "pending" | "successful" | "failed" | "cancelled";
export type FailReason = "declined" | "insufficient_funds" | "expired_card" | "otp_failed" | "timed_out" | "bank_unavailable";

export const METHOD_LABEL: Record<PayMethod, string> = {
  card: "Card",
  bank: "Bank transfer",
  ussd: "USSD",
  paypal: "PayPal",
  stripe: "Stripe",
};

export type CardBrand = "visa" | "mastercard" | "verve" | "amex" | "unknown";
export const BRAND_LABEL: Record<CardBrand, string> = { visa: "Visa", mastercard: "Mastercard", verve: "Verve", amex: "American Express", unknown: "Card" };

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

export function cardBrand(raw: string): CardBrand {
  const n = digitsOnly(raw);
  if (/^(506(0|1)|507(8|9)|6500)/.test(n)) return "verve";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function luhnValid(raw: string): boolean {
  const n = digitsOnly(raw);
  if (n.length < 12 || n.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Groups digits in fours (Amex 4-6-5) as the visitor types. */
export function formatCardNumber(raw: string): string {
  const n = digitsOnly(raw).slice(0, 19);
  if (cardBrand(n) === "amex") return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)].filter(Boolean).join(" ");
  return n.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(raw: string): string {
  const n = digitsOnly(raw).slice(0, 4);
  return n.length > 2 ? `${n.slice(0, 2)} / ${n.slice(2)}` : n;
}

export interface CardInput {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}
export type CardErrors = Partial<Record<keyof CardInput, string>>;

export function validateCard(c: CardInput, now = new Date()): CardErrors {
  const e: CardErrors = {};
  const n = digitsOnly(c.number);
  if (!n) e.number = "Enter your card number";
  else if (!luhnValid(n)) e.number = "That card number doesn't look right. Check the digits.";
  const ex = digitsOnly(c.expiry);
  if (ex.length !== 4) e.expiry = "Enter the expiry as MM / YY";
  else {
    const m = Number(ex.slice(0, 2));
    const y = 2000 + Number(ex.slice(2));
    if (m < 1 || m > 12) e.expiry = "Month must be 01 to 12";
    else if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) e.expiry = "This card has expired";
  }
  const cvcLen = cardBrand(n) === "amex" ? 4 : 3;
  if (!new RegExp(`^\\d{${cvcLen}}$`).test(c.cvc.trim())) e.cvc = `Enter the ${cvcLen}-digit security code`;
  if (c.name.trim().length < 2) e.name = "Enter the name on the card";
  return e;
}

/**
 * What the card network answers for this number. Uses the industry's standard
 * decline numbers so failures can be reproduced; every other valid card is approved.
 */
export function cardResponse(raw: string): "approved" | FailReason {
  const n = digitsOnly(raw);
  if (n === "4000000000000002") return "declined";
  if (n === "4000000000009995") return "insufficient_funds";
  if (n === "4000000000000069") return "expired_card";
  return "approved";
}

export const OTP_ATTEMPTS = 3;
/** A six-digit code. "000000" is never issued, so it always counts as wrong. */
export function otpValid(code: string): boolean {
  return /^\d{6}$/.test(code) && code !== "000000";
}

export const lastFour = (raw: string) => digitsOnly(raw).slice(-4);

/** Short, readable payment reference, e.g. ENS-7K4Q2M. No easily confused characters. */
export function makeReference(rand: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(rand() * alphabet.length)];
  return `ENS-${out}`;
}

export const FAIL_COPY: Record<FailReason, { title: string; body: string }> = {
  declined: { title: "Your bank declined this payment", body: "Your bank didn't approve the charge. Try another card, or call your bank to allow online payments, then try again." },
  insufficient_funds: { title: "Not enough funds on this card", body: "The card doesn't have enough available balance for this order. Top it up or use a different payment method." },
  expired_card: { title: "This card has expired", body: "Your bank says the card is no longer valid. Use a current card or choose another way to pay." },
  otp_failed: { title: "We couldn't verify the code", body: "The one-time code was entered incorrectly too many times, so the payment was stopped to protect you. You can start again." },
  timed_out: { title: "The payment window closed", body: "We didn't receive the transfer before the account expired. If you already sent money, it will be returned to you. Start a new payment to try again." },
  bank_unavailable: { title: "Your bank isn't responding", body: "Your bank's service is temporarily unavailable. Wait a few minutes and try again, or pay another way." },
};

/** Nigerian banks with USSD codes for paying from a phone. */
export const USSD_BANKS = [
  { id: "gtb", name: "GTBank", code: "*737" },
  { id: "access", name: "Access Bank", code: "*901" },
  { id: "zenith", name: "Zenith Bank", code: "*966" },
  { id: "uba", name: "UBA", code: "*919" },
  { id: "firstbank", name: "First Bank", code: "*894" },
  { id: "fidelity", name: "Fidelity Bank", code: "*770" },
  { id: "sterling", name: "Sterling Bank", code: "*822" },
  { id: "wema", name: "Wema Bank", code: "*945" },
] as const;

export function ussdString(bankCode: string, amount: number, reference: string): string {
  return `${bankCode}*000*${Math.round(amount)}*${reference.replace(/\D/g, "").slice(0, 4) || "0000"}#`;
}

/** A virtual account for one transfer: 10 digits derived from the reference so it stays stable. */
export function virtualAccount(reference: string): string {
  let h = 0;
  for (const ch of reference) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `99${String(h % 100000000).padStart(8, "0")}`;
}

export const TRANSFER_WINDOW_MS = 30 * 60 * 1000;
