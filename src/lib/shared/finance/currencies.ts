/** Currencies Enski's payout providers support (Paystack, Flutterwave, Wise). */
export const CURRENCY_CODES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR", "TZS", "UGX", "XOF", "XAF", "RWF"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** `flag` is an ISO country (or EU) code used for the flag artwork. */
export const CURRENCIES: Record<CurrencyCode, { name: string; flag: string; decimals: number }> = {
  NGN: { name: "Nigerian Naira", flag: "NG", decimals: 2 },
  USD: { name: "US Dollar", flag: "US", decimals: 2 },
  GBP: { name: "British Pound", flag: "GB", decimals: 2 },
  EUR: { name: "Euro", flag: "EU", decimals: 2 },
  GHS: { name: "Ghanaian Cedi", flag: "GH", decimals: 2 },
  KES: { name: "Kenyan Shilling", flag: "KE", decimals: 2 },
  ZAR: { name: "South African Rand", flag: "ZA", decimals: 2 },
  TZS: { name: "Tanzanian Shilling", flag: "TZ", decimals: 0 },
  UGX: { name: "Ugandan Shilling", flag: "UG", decimals: 0 },
  XOF: { name: "West African CFA Franc", flag: "SN", decimals: 0 },
  XAF: { name: "Central African CFA Franc", flag: "CM", decimals: 0 },
  RWF: { name: "Rwandan Franc", flag: "RW", decimals: 0 },
};

export const isCurrency = (v: string): v is CurrencyCode => (CURRENCY_CODES as readonly string[]).includes(v);

export function formatMoney(amount: number, code: CurrencyCode, opts: { compact?: boolean } = {}) {
  const d = CURRENCIES[code].decimals;
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: whole ? 0 : Math.min(2, d),
    maximumFractionDigits: d,
    ...(opts.compact ? { notation: "compact" } : {}),
  }).format(amount);
}

/** Narrow currency symbol, e.g. "₦" for NGN, "GH₵" for GHS. */
export const currencySymbol = (code: CurrencyCode) =>
  new Intl.NumberFormat("en", { style: "currency", currency: code, currencyDisplay: "narrowSymbol" }).formatToParts(0).find((p) => p.type === "currency")?.value ?? code;
