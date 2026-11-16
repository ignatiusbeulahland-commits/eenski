import type { Money } from "@/lib/dreamverse/types";

/** Countries people can pick to see a listing's price in their own currency. */
export const PRICE_COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "EG", name: "Egypt", currency: "EGP" },
  { code: "UG", name: "Uganda", currency: "UGX" },
  { code: "TZ", name: "Tanzania", currency: "TZS" },
  { code: "RW", name: "Rwanda", currency: "RWF" },
  { code: "ET", name: "Ethiopia", currency: "ETB" },
  { code: "ZM", name: "Zambia", currency: "ZMW" },
  { code: "MA", name: "Morocco", currency: "MAD" },
  { code: "CM", name: "Cameroon", currency: "XAF" },
  { code: "SN", name: "Senegal", currency: "XOF" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "EU", name: "Eurozone", currency: "EUR" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "AU", name: "Australia", currency: "AUD" },
] as const;

export type PriceCountry = (typeof PRICE_COUNTRIES)[number];

/** Eurozone members, so a visitor detected in e.g. France gets euros. */
const EURO = new Set(["AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"]);

export function findPriceCountry(code: string | null | undefined): PriceCountry | null {
  if (!code) return null;
  const c = code.toUpperCase();
  return PRICE_COUNTRIES.find((p) => p.code === c) ?? (EURO.has(c) ? PRICE_COUNTRIES.find((p) => p.code === "EU")! : null);
}

/** Units of each currency per 1 US dollar. */
export type Rates = Record<string, number>;

/** Friendly rounding for an estimate: whole units from 20 up, cents below. */
function roundEstimate(v: number): number {
  return v >= 20 ? Math.round(v) : Math.round(v * 100) / 100;
}

export interface LocalPrice {
  /** What to show. */
  shown: Money;
  /** True when the creator set this exact price; false for an exchange-rate estimate. */
  exact: boolean;
  /** The creator's own price that checkout actually charges. */
  charge: Money;
}

/**
 * The listing's price in `currency`: the creator's own price when they set one, otherwise an
 * estimate converted from their US dollar price (or their first price). Null when there's
 * nothing to convert or no rate for it.
 */
export function localPrice(prices: Money[], currency: string, rates: Rates | null | undefined): LocalPrice | null {
  const exact = prices.find((m) => m.currency === currency);
  if (exact) return { shown: exact, exact: true, charge: exact };
  if (prices.length === 0) return null;
  const base = prices.find((m) => m.currency === "USD") ?? prices[0]!;
  if (prices.every((m) => m.current === 0)) {
    return { shown: { currency, sign: "", amount: 0, current: 0, onSale: false }, exact: true, charge: base };
  }
  const from = rates?.[base.currency];
  const to = rates?.[currency];
  if (!from || !to) return null;
  const factor = to / from;
  const current = roundEstimate(base.current * factor);
  const amount = roundEstimate(base.amount * factor);
  return {
    shown: { currency, sign: "", amount, current, onSale: base.onSale && amount > current },
    exact: false,
    charge: base,
  };
}
