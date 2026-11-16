import { z } from "zod";
import { CURRENCY_CODES } from "./currencies";

/**
 * Saved payout destinations. Only the last four characters of an account are kept, plus a
 * one-way fingerprint used to stop the same account being saved twice.
 */
export const beneficiarySchema = z.object({
  id: z.string(),
  country: z.string(),
  currency: z.enum(CURRENCY_CODES),
  railId: z.string(),
  method: z.enum(["bank", "mobile_money", "card", "paypal", "stripe"]),
  provider: z.enum(["paystack", "flutterwave", "wise", "paypal", "stripe"]),
  institution: z.object({ code: z.string(), name: z.string(), logo: z.string().nullable() }),
  holder: z.string(),
  nickname: z.string().default(""),
  last4: z.string(),
  /** Non-sensitive display details, e.g. "Checking" or "Sort code ••-••-34". */
  details: z.array(z.string()).default([]),
  /** "format_checked": our local checks passed. Ownership is only confirmed by the provider. */
  status: z.enum(["format_checked", "name_unconfirmed"]).default("name_unconfirmed"),
  preferred: z.boolean().default(false),
  fingerprint: z.string(),
  createdAt: z.string(),
});
export type Beneficiary = z.infer<typeof beneficiarySchema>;

export const financePrefsSchema = z.object({
  residence: z.string().default(""),
  payoutCurrency: z.enum(CURRENCY_CODES).nullable().default(null),
  displayCurrency: z.enum(CURRENCY_CODES).default("USD"),
  /** Extra currency balances the user chose to show in the wallet. */
  walletCurrencies: z.array(z.enum(CURRENCY_CODES)).default([]),
});
export type FinancePrefs = z.infer<typeof financePrefsSchema>;
export const defaultFinancePrefs: FinancePrefs = financePrefsSchema.parse({});

export async function fingerprintOf(parts: string[]) {
  const data = new TextEncoder().encode(parts.join("|").toUpperCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const isDuplicate = (list: Beneficiary[], fingerprint: string) => list.some((b) => b.fingerprint === fingerprint);

/** Adds an account; the first one becomes preferred. Returns null when it's already saved. */
export function addBeneficiary(list: Beneficiary[], b: Beneficiary): Beneficiary[] | null {
  if (isDuplicate(list, b.fingerprint)) return null;
  const first = list.length === 0;
  return [...list.map((x) => (b.preferred ? { ...x, preferred: false } : x)), { ...b, preferred: first || b.preferred }];
}
export const setPreferred = (list: Beneficiary[], id: string) => list.map((b) => ({ ...b, preferred: b.id === id }));
export function removeBeneficiary(list: Beneficiary[], id: string) {
  const removed = list.find((b) => b.id === id);
  const rest = list.filter((b) => b.id !== id);
  if (removed?.preferred && rest.length && !rest.some((b) => b.preferred)) rest[0] = { ...rest[0]!, preferred: true };
  return rest;
}
export const renameBeneficiary = (list: Beneficiary[], id: string, nickname: string) =>
  list.map((b) => (b.id === id ? { ...b, nickname: nickname.trim().slice(0, 40) } : b));
export const preferredBeneficiary = (list: Beneficiary[]) => list.find((b) => b.preferred) ?? list[0] ?? null;
export const maskedLast4 = (b: Pick<Beneficiary, "last4" | "method">) =>
  b.method === "paypal" || b.method === "stripe" ? b.last4 : b.method === "mobile_money" || b.method === "card" ? `•••• ${b.last4}` : `•••• •••• ${b.last4}`;
export const beneficiaryLabel = (b: Beneficiary) => b.nickname || b.institution.name;

/** Legacy single Nigerian bank → a saved account, so existing payout details carry over. */
export function legacyBank(bank: { holder: string; bank: string; last4: string }, logo: string | null, code: string): Beneficiary {
  return {
    id: `legacy-${bank.last4}`, country: "NG", currency: "NGN", railId: "ng-ngn-bank", method: "bank", provider: "paystack",
    institution: { code, name: bank.bank, logo }, holder: bank.holder, nickname: "", last4: bank.last4, details: [],
    status: "name_unconfirmed", preferred: true, fingerprint: `legacy|${code}|${bank.last4}`, createdAt: new Date(0).toISOString(),
  };
}
