import type { Country, FieldId, Rail } from "./coverage";

/** Real format checks we can run locally. They confirm shape and checksums, never ownership. */
const IBAN_LENGTH: Record<string, number> = { DE: 22, FR: 27, NL: 18, IE: 22, ES: 24, IT: 27, BE: 16, PT: 25, AT: 20, FI: 18, GB: 22 };

export const digits = (v: string) => v.replace(/\D/g, "");
export const compact = (v: string) => v.replace(/\s+/g, "").toUpperCase();

export function ibanValid(raw: string, country?: string) {
  const v = compact(raw);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v)) return false;
  if (country && v.slice(0, 2) !== country) return false;
  const len = IBAN_LENGTH[v.slice(0, 2)];
  if (len && v.length !== len) return false;
  const rearranged = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of rearranged) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}

/** ABA routing number checksum (3-7-1 weights). */
export function routingValid(raw: string) {
  const d = digits(raw);
  if (!/^\d{9}$/.test(d)) return false;
  const n = d.split("").map(Number);
  const sum = 3 * (n[0]! + n[3]! + n[6]!) + 7 * (n[1]! + n[4]! + n[7]!) + (n[2]! + n[5]! + n[8]!);
  return sum % 10 === 0;
}

export const bicValid = (raw: string) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(compact(raw));

const ACCOUNT_RULES: Record<string, { re: RegExp; hint: string }> = {
  NG: { re: /^\d{10}$/, hint: "10-digit NUBAN" },
  GH: { re: /^\d{8,16}$/, hint: "8–16 digits" },
  KE: { re: /^\d{6,16}$/, hint: "6–16 digits" },
  ZA: { re: /^\d{7,11}$/, hint: "7–11 digits" },
  CI: { re: /^[A-Z0-9]{10,24}$/, hint: "10–24 letters or digits (RIB)" },
  RW: { re: /^\d{8,16}$/, hint: "8–16 digits" },
  GB: { re: /^\d{8}$/, hint: "8 digits" },
  US: { re: /^\d{4,17}$/, hint: "4–17 digits" },
};
export const accountHint = (country: string) => ACCOUNT_RULES[country]?.hint ?? "Account number";

/** Local mobile number length after the country code. */
const MOBILE_LEN: Record<string, number> = { GH: 9, KE: 9, CI: 10, RW: 9, UG: 9, SN: 9 };
export const mobileHint = (c: Country) => `${MOBILE_LEN[c.code] ?? 9} digits after +${c.dial ?? ""}`;

export type AccountDraft = Partial<Record<FieldId, string>> & { holder?: string };

export function validateAccount(country: Country, rail: Rail, d: AccountDraft) {
  const e: Partial<Record<FieldId | "holder", string>> = {};
  if (!d.holder || d.holder.trim().length < 3) e.holder = "Enter the full name on the account";
  for (const f of rail.fields) {
    const v = (d[f] ?? "").trim();
    switch (f) {
      case "accountNumber": {
        const rule = ACCOUNT_RULES[country.code];
        const val = country.code === "CI" ? compact(v) : digits(v);
        if (rule ? !rule.re.test(val) : val.length < 4) e.accountNumber = `Enter a valid account number (${accountHint(country.code)})`;
        break;
      }
      case "mobileNumber": {
        const local = digits(v).replace(new RegExp(`^${country.dial ?? ""}`), "").replace(/^0/, "");
        if (local.length !== (MOBILE_LEN[country.code] ?? 9)) e.mobileNumber = `Enter the mobile money number (${mobileHint(country)})`;
        break;
      }
      case "sortCode": if (!/^\d{6}$/.test(digits(v))) e.sortCode = "Enter the 6-digit sort code"; break;
      case "routingNumber": if (!routingValid(v)) e.routingNumber = "Enter a valid 9-digit ABA routing number"; break;
      case "iban": if (!ibanValid(v, country.code)) e.iban = `Enter a valid ${country.name} IBAN`; break;
      case "bic": if (v && !bicValid(v)) e.bic = "Enter an 8 or 11 character SWIFT/BIC"; break;
      case "accountType": if (!v) e.accountType = "Choose the account type"; break;
      case "address": if (v.length < 4) e.address = "Enter the account holder's street address"; break;
      case "city": if (v.length < 2) e.city = "Enter the city"; break;
      case "state": if (!/^[A-Za-z]{2}$/.test(v)) e.state = "Use the 2-letter state code, e.g. NY"; break;
      case "postCode": if (!/^\d{5}(-\d{4})?$/.test(v)) e.postCode = "Enter a 5-digit ZIP code"; break;
    }
  }
  return e;
}

/** The value whose last four digits identify the account. */
export function accountKey(country: Country, rail: Rail, d: AccountDraft) {
  if (rail.fields.includes("iban")) return compact(d.iban ?? "");
  if (rail.fields.includes("mobileNumber")) {
    const local = digits(d.mobileNumber ?? "").replace(new RegExp(`^${country.dial ?? ""}`), "").replace(/^0/, "");
    return `${country.dial ?? ""}${local}`;
  }
  return country.code === "CI" ? compact(d.accountNumber ?? "") : digits(d.accountNumber ?? "");
}
