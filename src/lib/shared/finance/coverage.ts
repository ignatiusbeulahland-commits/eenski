import type { CurrencyCode } from "./currencies";
import { paystackDirectory } from "./paystack-directory";
import { bankGroupLabels, nigerianBanks, popularBankNames } from "@/lib/shared/banks-ng";

/**
 * Payout coverage, taken from each provider's published documentation (Nov 2026):
 * - Paystack transfers & bank directory: https://paystack.com/docs/transfers/ (GET /bank?country=…)
 * - Flutterwave mobile money & bank transfers: https://developer.flutterwave.com/docs/mobile-money,
 *   https://developer.flutterwave.com/docs/bank-account
 * - Wise recipient account requirements (GBP sort code, USD ACH, EUR IBAN): https://docs.wise.com/
 * Only rails we hold a real institution list for are offered; the rest are listed as not available yet.
 */
export type ProviderId = "paystack" | "flutterwave" | "wise" | "paypal" | "stripe";
export const PROVIDERS: Record<ProviderId, { name: string; logo: string; docs: string }> = {
  paystack: { name: "Paystack", logo: "p-paystack", docs: "https://paystack.com/docs/transfers/" },
  flutterwave: { name: "Flutterwave", logo: "p-flutterwave", docs: "https://developer.flutterwave.com/docs/transfers" },
  wise: { name: "Wise", logo: "p-wise", docs: "https://docs.wise.com/" },
  paypal: { name: "PayPal", logo: "p-paypal", docs: "https://developer.paypal.com/docs/payouts/" },
  stripe: { name: "Stripe", logo: "p-stripe", docs: "https://docs.stripe.com/connect/payouts-connected-accounts" },
};

export type MethodId = "bank" | "mobile_money" | "card" | "paypal" | "stripe";
export const METHOD_LABEL: Record<MethodId, string> = { bank: "Bank transfer", mobile_money: "Mobile money", card: "Debit card", paypal: "PayPal", stripe: "Stripe" };

export type FieldId = "accountNumber" | "mobileNumber" | "sortCode" | "routingNumber" | "accountType" | "iban" | "bic" | "address" | "city" | "state" | "postCode";

/** How the provider can confirm an account before money is sent. Nothing here runs automatically. */
export type Verification =
  | { kind: "name_lookup"; label: string }
  | { kind: "id_validation"; label: string }
  | { kind: "on_transfer"; label: string };

export type InstitutionKind = "commercial" | "microfinance" | "other";
export type Institution = { code: string; name: string; logo: string | null; currency: CurrencyCode; group?: string; popular?: boolean; kind?: InstitutionKind };

export const KIND_LABEL: Record<InstitutionKind, string> = { commercial: "Commercial banks", microfinance: "Microfinance banks", other: "Other institutions" };
const MFB = /micro\s*finan|\bMFB\b/i;
/**
 * Commercial vs microfinance. Nigeria uses the directory's own category (CBN licence type);
 * elsewhere only names that say "Microfinance"/"MFB" count as microfinance, and savings & loans,
 * SACCOs, mortgage and central banks sit under "Other" rather than being guessed into either.
 */
export function institutionKind(i: Pick<Institution, "name" | "kind">): InstitutionKind {
  if (i.kind) return i.kind;
  if (MFB.test(i.name)) return "microfinance";
  if (/savings\s*(and|&)\s*loans|sacco|rural bank|community bank|mortgage|building society|central bank|^bank of ghana$/i.test(i.name)) return "other";
  if (/bank|banque|banco|\bplc\b/i.test(i.name)) return "commercial";
  return "other";
}

export type Rail = {
  id: string;
  method: MethodId;
  currency: CurrencyCode;
  provider: ProviderId;
  fields: FieldId[];
  verification: Verification;
  /** Bank or operator list. Empty with `unavailable` set when we don't hold the provider's list. */
  institutions: Institution[];
  institutionOptional?: boolean;
  unavailable?: string;
};

export type Region = "Africa" | "Europe" | "Americas";
export type Country = { code: string; name: string; region: Region; currency: CurrencyCode; dial?: string; rails: Rail[] };

const fromDirectory = (cc: string, types: string[], currency: CurrencyCode): Institution[] =>
  (paystackDirectory[cc] ?? [])
    .filter((r) => types.includes(r[2]) && r[3] === currency)
    .map(([name, code, , cur, logo]) => ({ name, code, logo, currency: cur as CurrencyCode }));

const NG_LOGOS: Record<string, string> = {
  "Access Bank": "ng-access", "Guaranty Trust Bank": "ng-gtbank", "Zenith Bank": "ng-zenith", "United Bank For Africa": "ng-uba",
  "OPay Digital Services Limited (OPay)": "ng-opay", "Moniepoint MFB": "ng-moniepoint", "Kuda Bank": "ng-kuda", PalmPay: "ng-palmpay",
  "Wema Bank": "ng-wema", "First City Monument Bank": "ng-fcmb", "Stanbic IBTC Bank": "ng-stanbic", "Ecobank Nigeria": "ng-ecobank",
  "Sterling Bank": "ng-sterling", "Union Bank of Nigeria": "ng-union", "Polaris Bank": "ng-polaris", "Keystone Bank": "ng-keystone",
  "Providus Bank": "ng-providus", "Jaiz Bank": "ng-jaiz", "Globus Bank": "ng-globus", "Lotus Bank": "ng-lotus", "Parallex Bank": "ng-parallex",
  Carbon: "ng-carbon", Paga: "ng-paga", "PremiumTrust Bank": "ng-premiumtrust", "Premium Trust Bank": "ng-premiumtrust", "Optimus Bank Limited": "ng-optimus",
  "Signature Bank Ltd": "ng-signature", "Standard Chartered Bank": "ng-sc", "Citibank Nigeria": "ng-citi", "ALAT by WEMA": "ng-alat", "SunTrust Bank": "ng-suntrust",
};
const ngKind = (b: { name: string; group: string }): InstitutionKind =>
  b.group === "microfinance" || MFB.test(b.name) ? "microfinance" : b.group === "commercial" ? "commercial" : "other";
const ngBanks: Institution[] = nigerianBanks.map((b) => ({ name: b.name, code: b.code, logo: NG_LOGOS[b.name] ?? null, currency: "NGN", group: bankGroupLabels[b.group], popular: popularBankNames.includes(b.name), kind: ngKind(b) }));

const op = (name: string, code: string, logo: string | null, currency: CurrencyCode): Institution => ({ name, code, logo, currency });

const nameLookup = (p: string): Verification => ({ kind: "name_lookup", label: `${p} looks up the account name from the bank` });
const onTransfer = (p: string): Verification => ({ kind: "on_transfer", label: `${p} checks these details when the transfer is created` });

const GB_BANKS: Institution[] = [
  op("Barclays", "BARCGB22", "gb-barclays", "GBP"), op("HSBC UK", "HBUKGB4B", "gb-hsbc", "GBP"), op("Lloyds Bank", "LOYDGB2L", "gb-lloyds", "GBP"),
  op("NatWest", "NWBKGB2L", null, "GBP"), op("Santander UK", "ABBYGB2L", null, "GBP"), op("Nationwide", "NAIAGB21", "gb-nationwide", "GBP"),
  op("Halifax", "HLFXGB21", "gb-halifax", "GBP"), op("Monzo", "MONZGB2L", "gb-monzo", "GBP"), op("Starling Bank", "SRLGGB2L", "gb-starling", "GBP"),
  op("Revolut", "REVOGB21", "gb-revolut", "GBP"),
];
const US_BANKS: Institution[] = [
  op("Chase", "CHASUS33", "us-chase", "USD"), op("Bank of America", "BOFAUS3N", "us-bofa", "USD"), op("Wells Fargo", "WFBIUS6S", "us-wells", "USD"),
  op("Citibank", "CITIUS33", "us-citi", "USD"), op("Capital One", "capital-one", "us-capitalone", "USD"),
];

const pending = (country: string) => `${country}'s bank list isn't available on Enski yet.`;

const sepa = (code: string, name: string, dial: string): Country => ({
  code, name, region: "Europe", currency: "EUR", dial,
  rails: [{ id: `${code}-eur-bank`, method: "bank", currency: "EUR", provider: "wise", fields: ["iban", "bic"], verification: onTransfer("Wise"), institutions: [], institutionOptional: true }],
});

export const COUNTRIES: Country[] = [
  { code: "NG", name: "Nigeria", region: "Africa", currency: "NGN", dial: "234", rails: [
    { id: "ng-ngn-bank", method: "bank", currency: "NGN", provider: "paystack", fields: ["accountNumber"], verification: nameLookup("Paystack"), institutions: ngBanks },
    { id: "ng-usd-bank", method: "bank", currency: "USD", provider: "paystack", fields: ["accountNumber"], verification: nameLookup("Paystack"), institutions: fromDirectory("NG", ["nuban"], "USD") },
  ] },
  { code: "GH", name: "Ghana", region: "Africa", currency: "GHS", dial: "233", rails: [
    { id: "gh-ghs-bank", method: "bank", currency: "GHS", provider: "paystack", fields: ["accountNumber"], verification: nameLookup("Paystack"), institutions: fromDirectory("GH", ["ghipss"], "GHS") },
    { id: "gh-ghs-momo", method: "mobile_money", currency: "GHS", provider: "paystack", fields: ["mobileNumber"], verification: nameLookup("Paystack"), institutions: [op("MTN Mobile Money", "MTN", "gh-mtn", "GHS"), op("Telecel Cash (Vodafone)", "VOD", "gh-telecel", "GHS"), op("AirtelTigo Money", "ATL", null, "GHS")] },
    { id: "gh-usd-bank", method: "bank", currency: "USD", provider: "paystack", fields: ["accountNumber"], verification: nameLookup("Paystack"), institutions: fromDirectory("GH", ["ghipss"], "USD") },
  ] },
  { code: "KE", name: "Kenya", region: "Africa", currency: "KES", dial: "254", rails: [
    { id: "ke-kes-bank", method: "bank", currency: "KES", provider: "paystack", fields: ["accountNumber"], verification: onTransfer("Paystack"), institutions: fromDirectory("KE", ["kepss"], "KES") },
    { id: "ke-kes-momo", method: "mobile_money", currency: "KES", provider: "paystack", fields: ["mobileNumber"], verification: onTransfer("Paystack"), institutions: [op("M-PESA", "MPESA", "ke-mpesa", "KES"), op("Airtel Money", "ATL_KE", "ke-airtel", "KES"), op("Telkom T-Kash", "97", "ke-telkom", "KES")] },
    { id: "ke-usd-bank", method: "bank", currency: "USD", provider: "paystack", fields: ["accountNumber"], verification: onTransfer("Paystack"), institutions: fromDirectory("KE", ["kepss"], "USD") },
  ] },
  { code: "ZA", name: "South Africa", region: "Africa", currency: "ZAR", dial: "27", rails: [
    { id: "za-zar-bank", method: "bank", currency: "ZAR", provider: "paystack", fields: ["accountNumber", "accountType"], verification: { kind: "id_validation", label: "Paystack validates the account against your South African ID before the first payout" }, institutions: fromDirectory("ZA", ["basa"], "ZAR") },
  ] },
  { code: "CI", name: "Côte d'Ivoire", region: "Africa", currency: "XOF", dial: "225", rails: [
    { id: "ci-xof-momo", method: "mobile_money", currency: "XOF", provider: "paystack", fields: ["mobileNumber"], verification: onTransfer("Paystack"), institutions: [op("MTN Mobile Money", "MTN_CI", "ci-mtn", "XOF"), op("Orange Money", "ORANGE_CI", "ci-orange", "XOF"), op("Wave", "WAVE_CI", "wave", "XOF")] },
    { id: "ci-xof-bank", method: "bank", currency: "XOF", provider: "paystack", fields: ["accountNumber"], verification: onTransfer("Paystack"), institutions: fromDirectory("CI", ["bceao"], "XOF") },
  ] },
  { code: "RW", name: "Rwanda", region: "Africa", currency: "RWF", dial: "250", rails: [
    { id: "rw-rwf-bank", method: "bank", currency: "RWF", provider: "paystack", fields: ["accountNumber"], verification: onTransfer("Paystack"), institutions: fromDirectory("RW", ["bnr"], "RWF") },
    { id: "rw-rwf-momo", method: "mobile_money", currency: "RWF", provider: "flutterwave", fields: ["mobileNumber"], verification: onTransfer("Flutterwave"), institutions: [op("MTN Mobile Money", "MTN", "rw-mtn", "RWF")] },
    { id: "rw-usd-bank", method: "bank", currency: "USD", provider: "paystack", fields: ["accountNumber"], verification: onTransfer("Paystack"), institutions: fromDirectory("RW", ["bnr"], "USD") },
  ] },
  { code: "UG", name: "Uganda", region: "Africa", currency: "UGX", dial: "256", rails: [
    { id: "ug-ugx-momo", method: "mobile_money", currency: "UGX", provider: "flutterwave", fields: ["mobileNumber"], verification: onTransfer("Flutterwave"), institutions: [op("MTN Mobile Money", "MTN", "ug-mtn", "UGX"), op("Airtel Money", "Airtel", "ug-airtel", "UGX")] },
    { id: "ug-ugx-bank", method: "bank", currency: "UGX", provider: "flutterwave", fields: ["accountNumber"], verification: onTransfer("Flutterwave"), institutions: [], unavailable: pending("Uganda") },
  ] },
  { code: "SN", name: "Senegal", region: "Africa", currency: "XOF", dial: "221", rails: [
    { id: "sn-xof-momo", method: "mobile_money", currency: "XOF", provider: "flutterwave", fields: ["mobileNumber"], verification: onTransfer("Flutterwave"), institutions: [op("Orange Money", "orangemoney", "sn-orange", "XOF"), op("Wave", "WAVE", "wave", "XOF"), op("Free Money (Yas)", "freemoney", "sn-free", "XOF")] },
    { id: "sn-xof-bank", method: "bank", currency: "XOF", provider: "flutterwave", fields: ["accountNumber"], verification: onTransfer("Flutterwave"), institutions: [], unavailable: pending("Senegal") },
  ] },
  { code: "TZ", name: "Tanzania", region: "Africa", currency: "TZS", dial: "255", rails: [
    { id: "tz-tzs-bank", method: "bank", currency: "TZS", provider: "flutterwave", fields: ["accountNumber"], verification: onTransfer("Flutterwave"), institutions: [], unavailable: pending("Tanzania") },
  ] },
  { code: "CM", name: "Cameroon", region: "Africa", currency: "XAF", dial: "237", rails: [
    { id: "cm-xaf-bank", method: "bank", currency: "XAF", provider: "flutterwave", fields: ["accountNumber"], verification: onTransfer("Flutterwave"), institutions: [], unavailable: pending("Cameroon") },
  ] },
  { code: "GB", name: "United Kingdom", region: "Europe", currency: "GBP", dial: "44", rails: [
    { id: "gb-gbp-bank", method: "bank", currency: "GBP", provider: "wise", fields: ["sortCode", "accountNumber"], verification: onTransfer("Wise"), institutions: GB_BANKS, institutionOptional: true },
  ] },
  sepa("DE", "Germany", "49"), sepa("FR", "France", "33"), sepa("NL", "Netherlands", "31"), sepa("IE", "Ireland", "353"), sepa("ES", "Spain", "34"),
  sepa("IT", "Italy", "39"), sepa("BE", "Belgium", "32"), sepa("PT", "Portugal", "351"), sepa("AT", "Austria", "43"), sepa("FI", "Finland", "358"),
  { code: "US", name: "United States", region: "Americas", currency: "USD", dial: "1", rails: [
    { id: "us-usd-bank", method: "bank", currency: "USD", provider: "wise", fields: ["routingNumber", "accountNumber", "accountType", "address", "city", "state", "postCode"], verification: onTransfer("Wise"), institutions: US_BANKS, institutionOptional: true },
  ] },
];

export const countryByCode = (code: string) => COUNTRIES.find((c) => c.code === code);
export const railById = (id: string) => COUNTRIES.flatMap((c) => c.rails).find((r) => r.id === id);
export const availableRails = (c: Country) => c.rails.filter((r) => !r.unavailable && (r.institutions.length > 0 || r.institutionOptional));
export const isCountryAvailable = (c: Country) => availableRails(c).length > 0;
export const countryCurrencies = (c: Country): CurrencyCode[] => [...new Set(availableRails(c).map((r) => r.currency))];

/** Nigerian bank by name (used to carry over a previously saved account). */
export const ngInstitutionByName = (name: string) => ngBanks.find((b) => b.name === name) ?? null;
