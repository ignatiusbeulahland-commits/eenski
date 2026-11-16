import { legacyBank, preferredBeneficiary, type Beneficiary } from "./beneficiaries";
import { ngInstitutionByName } from "./coverage";

/** Turn an older single saved Nigerian bank into a saved payout account. */
export function migrateLegacyBank(bank: { holder: string; bank: string; last4: string } | null, list: Beneficiary[]) {
  if (!bank || list.length) return list;
  const inst = ngInstitutionByName(bank.bank);
  return [legacyBank(bank, inst?.logo ?? null, inst?.code ?? "")];
}

/** The preferred account, in the older single-bank shape other screens still read. */
export function bankSummary(list: Beneficiary[]) {
  const p = preferredBeneficiary(list);
  return p ? { holder: p.holder, bank: p.nickname || p.institution.name, last4: p.last4 } : null;
}
