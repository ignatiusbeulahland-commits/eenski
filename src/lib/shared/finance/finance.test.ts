import { describe, expect, it } from "vitest";
import { COUNTRIES, countryByCode, availableRails, isCountryAvailable, railById } from "./coverage";
import { ibanValid, routingValid, validateAccount, accountKey } from "./validate";
import { addBeneficiary, removeBeneficiary, setPreferred, type Beneficiary } from "./beneficiaries";
import { balancesByCurrency, estimatedTotal, quote, withdrawalError } from "./wallet";
import type { Rates } from "./rates";

const ben = (id: string, fingerprint: string, preferred = false): Beneficiary => ({
  id, country: "NG", currency: "NGN", railId: "ng-ngn-bank", method: "bank", provider: "paystack",
  institution: { code: "058", name: "Guaranty Trust Bank", logo: "ng-gtbank" }, holder: "Ada Obi", nickname: "", last4: "1234",
  details: [], status: "name_unconfirmed", preferred, fingerprint, createdAt: "",
});

describe("coverage", () => {
  it("covers the requested markets", () => {
    for (const c of ["NG", "GH", "KE", "ZA", "TZ", "UG", "RW", "SN", "CI", "CM", "GB", "US", "DE"]) expect(countryByCode(c)).toBeTruthy();
  });
  it("offers only rails we hold a real bank or operator list for", () => {
    expect(isCountryAvailable(countryByCode("TZ")!)).toBe(false);
    expect(isCountryAvailable(countryByCode("CM")!)).toBe(false);
    expect(availableRails(countryByCode("UG")!).map((r) => r.method)).toEqual(["mobile_money"]);
    for (const c of COUNTRIES) for (const r of availableRails(c)) expect(r.institutions.length > 0 || r.institutionOptional).toBe(true);
  });
  it("routes UK, US and euro accounts through Wise with country fields", () => {
    expect(railById("gb-gbp-bank")).toMatchObject({ provider: "wise", fields: ["sortCode", "accountNumber"] });
    expect(railById("us-usd-bank")?.fields).toContain("routingNumber");
    expect(railById("DE-eur-bank")?.fields).toEqual(["iban", "bic"]);
  });
  it("lists Ghana mobile money and Nigerian banks from Paystack", () => {
    expect(railById("gh-ghs-momo")?.institutions.map((i) => i.code)).toContain("MTN");
    expect(railById("ng-ngn-bank")?.institutions.find((i) => i.code === "058")?.logo).toBe("ng-gtbank");
  });
});

describe("account checks", () => {
  it("validates IBAN checksums and country", () => {
    expect(ibanValid("DE89 3704 0044 0532 0130 00", "DE")).toBe(true);
    expect(ibanValid("DE89 3704 0044 0532 0130 01", "DE")).toBe(false);
    expect(ibanValid("GB82WEST12345698765432", "DE")).toBe(false);
  });
  it("validates ABA routing numbers", () => {
    expect(routingValid("021000021")).toBe(true);
    expect(routingValid("021000022")).toBe(false);
  });
  it("requires a 10-digit NUBAN in Nigeria and a sort code in the UK", () => {
    const ng = countryByCode("NG")!; const gb = countryByCode("GB")!;
    expect(validateAccount(ng, railById("ng-ngn-bank")!, { holder: "Ada Obi", accountNumber: "12345" }).accountNumber).toBeTruthy();
    expect(validateAccount(ng, railById("ng-ngn-bank")!, { holder: "Ada Obi", accountNumber: "0123456789" })).toEqual({});
    expect(validateAccount(gb, railById("gb-gbp-bank")!, { holder: "Ada Obi", accountNumber: "12345678", sortCode: "12-34" }).sortCode).toBeTruthy();
  });
  it("normalises mobile money numbers with the country code", () => {
    const gh = countryByCode("GH")!;
    expect(accountKey(gh, railById("gh-ghs-momo")!, { mobileNumber: "024 123 4567" })).toBe("233241234567");
    expect(validateAccount(gh, railById("gh-ghs-momo")!, { holder: "Kofi Mensah", mobileNumber: "0241234567" })).toEqual({});
  });
});

describe("saved beneficiaries", () => {
  it("makes the first account preferred and blocks duplicates", () => {
    const one = addBeneficiary([], ben("a", "x"))!;
    expect(one[0]!.preferred).toBe(true);
    expect(addBeneficiary(one, ben("b", "x"))).toBeNull();
  });
  it("hands preferred to the next account when the preferred one is removed", () => {
    const list = setPreferred(addBeneficiary(addBeneficiary([], ben("a", "x"))!, ben("b", "y"))!, "a");
    expect(removeBeneficiary(list, "a")[0]!.preferred).toBe(true);
  });
});

describe("multi-currency wallet", () => {
  const rates: Rates = { base: "USD", rates: { NGN: 1500, GBP: 0.8, USD: 1 }, updatedAt: "2026-11-12T00:00:00Z", source: "t", sourceUrl: "" };
  it("keeps one balance per currency", () => {
    const b = balancesByCurrency([{ currency: "NGN", amount: 3000, kind: "earning" }, { currency: "GBP", amount: 20, kind: "earning" }, { currency: "NGN", amount: 1000, kind: "payout" }]);
    expect(b.find((x) => x.currency === "NGN")).toMatchObject({ available: 2000, paidOut: 1000 });
    expect(b.find((x) => x.currency === "GBP")?.available).toBe(20);
  });
  it("estimates a combined total only with every rate present", () => {
    const b = balancesByCurrency([{ currency: "NGN", amount: 1500, kind: "earning" }, { currency: "GBP", amount: 8, kind: "earning" }]);
    expect(estimatedTotal(b, rates, "USD")).toBe(11);
    expect(estimatedTotal(balancesByCurrency([{ currency: "KES", amount: 5, kind: "earning" }]), rates, "USD")).toBeNull();
  });
  it("quotes conversions from the published rate and never above balance", () => {
    expect(quote(3000, "NGN", "GBP", rates)).toMatchObject({ converts: true, recipientEstimate: 1.6 });
    expect(quote(100, "NGN", "NGN", null)).toMatchObject({ converts: false, recipientEstimate: 100 });
    expect(withdrawalError(500, 600, true)).toBeTruthy();
    expect(withdrawalError(500, 500, true)).toBe("");
  });
});

import { filterTx, paginate, refFrom, type TxRow } from "./history";
describe("transaction history", () => {
  const row = (id: string, status: TxRow["status"], date: string, direction: TxRow["direction"] = "in"): TxRow => ({ id, description: `Sale ${id}`, amount: 1, currency: "NGN", direction, date, reference: refFrom("ORD", id), method: "Enski checkout", status });
  const rows = [row("a1", "successful", "2026-11-01"), row("b2", "pending", "2026-11-03", "out"), row("c3", "reversed", "2026-11-02")];
  it("filters by status, direction and search, newest first", () => {
    expect(filterTx(rows, "", "all", "all").map((r) => r.id)).toEqual(["b2", "c3", "a1"]);
    expect(filterTx(rows, "", "reversed", "all").map((r) => r.id)).toEqual(["c3"]);
    expect(filterTx(rows, "", "all", "out").map((r) => r.id)).toEqual(["b2"]);
    expect(filterTx(rows, "ORD-0000A1", "all", "all").map((r) => r.id)).toEqual(["a1"]);
  });
  it("limits to a date range", () => {
    expect(filterTx(rows, "", "all", "all", 1, new Date("2026-11-03T12:00:00Z").getTime()).map((r) => r.id)).toEqual(["b2"]);
  });
  it("paginates with clamped pages", () => {
    const p = paginate([1, 2, 3, 4, 5], 9, 2);
    expect(p).toMatchObject({ page: 3, pages: 3, items: [5], from: 5, to: 5 });
  });
});

import { countryByCode as byCode, institutionKind as kindOf } from "./coverage";
describe("commercial vs microfinance banks", () => {
  const ng = byCode("NG")!.rails.find((r) => r.id === "ng-ngn-bank")!.institutions;
  const ngKind = (name: string) => kindOf(ng.find((i) => i.name === name)!);
  it("keeps Nigerian commercial banks out of microfinance", () => {
    expect(ngKind("Access Bank")).toBe("commercial");
    expect(ngKind("Guaranty Trust Bank")).toBe("commercial");
  });
  it("puts Nigerian microfinance banks under microfinance", () => {
    expect(ngKind("Accion Microfinance Bank")).toBe("microfinance");
    expect(ngKind("Moniepoint MFB")).toBe("microfinance");
  });
  it("classifies other countries only by an explicit microfinance name", () => {
    expect(kindOf({ name: "Faulu Microfinance Bank" })).toBe("microfinance");
    expect(kindOf({ name: "Equity Bank Kenya Ltd" })).toBe("commercial");
    expect(kindOf({ name: "Stima Sacco" })).toBe("other");
    expect(kindOf({ name: "Adehyeman Savings and Loans LTD" })).toBe("other");
  });
  it("never shows Nigerian banks for another country", () => {
    const gh = byCode("GH")!.rails.find((r) => r.id === "gh-ghs-bank")!.institutions;
    expect(gh.some((i) => i.name === "Zenith Bank")).toBe(false);
  });
});
