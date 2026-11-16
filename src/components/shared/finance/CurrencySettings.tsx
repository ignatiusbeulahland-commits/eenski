import { Globe2, Landmark, Repeat, Store, Wallet } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SettingsCard, SettingsGrid, SettingsTip } from "@/components/shared/SettingsKit";
import { availableRails, countryByCode } from "@/lib/shared/finance/coverage";
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { beneficiaryLabel, maskedLast4, type Beneficiary, type FinancePrefs } from "@/lib/shared/finance/beneficiaries";
import { cn } from "@/lib/utils";
import { BankLogo, CurrencyTag, Flag } from "./Marks";
import { CountryPicker, CurrencyPicker } from "./CountryPicker";

/**
 * Country & currency preferences. Residence, bank country, selling, earnings and payout currencies
 * are shown separately because they're often different.
 */
export function CurrencySettings({ prefs, onChange, preferred, earning, selling, accountsLink, payouts = true }: {
  prefs: FinancePrefs;
  onChange: (p: FinancePrefs) => void;
  preferred: Beneficiary | null;
  /** Currencies the user already has balances in. */
  earning: CurrencyCode[];
  /** e.g. "NGN — products are priced in naira". Omit for roles that don't sell. */
  selling?: { currency: CurrencyCode; note: string };
  accountsLink?: string;
  payouts?: boolean;
}) {
  const save = (p: Partial<FinancePrefs>, msg: string) => { onChange({ ...prefs, ...p }); toast.success(msg); };
  const bankCountry = preferred ? countryByCode(preferred.country) : null;
  const payoutOptions: CurrencyCode[] = bankCountry ? [...new Set(availableRails(bankCountry).map((r) => r.currency))] : [...CURRENCY_CODES];
  const payoutCurrency = prefs.payoutCurrency ?? preferred?.currency ?? null;
  const sources = [selling?.currency, ...earning].filter(Boolean) as CurrencyCode[];
  const converts = payoutCurrency ? sources.filter((c) => c !== payoutCurrency) : [];
  return (
    <SettingsGrid
      main={
        <>
          <SettingsCard icon={Globe2} title="Country of residence" description="Where you live. Used for tax and identity checks, not for where money is sent.">
            <div className="max-w-md"><CountryPicker id="fx-residence" label="Country of residence" value={prefs.residence} onChange={(c) => save({ residence: c }, "Country of residence saved")} placeholder="Choose where you live" /></div>
          </SettingsCard>

          {payouts && (
            <SettingsCard icon={Landmark} title="Bank account country" description="Comes from your preferred payout account." actions={accountsLink ? <Link to={accountsLink as "/"} className="text-sm font-extrabold text-cobalt hover:underline">Manage</Link> : undefined}>
              {preferred && bankCountry ? (
                <div className="flex items-center gap-3">
                  <BankLogo name={preferred.institution.name} logo={preferred.institution.logo} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{beneficiaryLabel(preferred)} {maskedLast4(preferred)}</p><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Flag code={bankCountry.code} className="h-3 w-4" />{bankCountry.name} · {preferred.currency}</p></div>
                </div>
              ) : <p className="text-sm text-muted-foreground">No payout account yet.</p>}
            </SettingsCard>
          )}

          {selling && (
            <SettingsCard icon={Store} title="Product selling currency" description="The currency your prices are set in.">
              <p className="flex items-center gap-3 text-sm"><CurrencyTag code={selling.currency} showName /><span className="text-muted-foreground">{selling.note}</span></p>
            </SettingsCard>
          )}

          {payouts && (
            <SettingsCard icon={Wallet} title="Earnings currencies" description="Each currency you earn in has its own balance. Add one to keep an eye on it in your wallet.">
              <div className="flex flex-wrap gap-2">
                {CURRENCY_CODES.map((c) => {
                  const has = earning.includes(c);
                  const on = has || prefs.walletCurrencies.includes(c);
                  return (
                    <button key={c} type="button" aria-pressed={on} disabled={has} title={has ? "You have a balance in this currency" : undefined}
                      onClick={() => save({ walletCurrencies: on ? prefs.walletCurrencies.filter((x) => x !== c) : [...prefs.walletCurrencies, c] }, on ? `${c} hidden from your wallet` : `${c} balance added to your wallet`)}
                      className={cn("lime-pip inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] px-3 text-[13px] font-extrabold transition-colors disabled:cursor-default", on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-100 hover:text-cobalt")}>
                      <Flag code={CURRENCIES[c].flag} className="h-3.5 w-5" />{c}
                    </button>
                  );
                })}
              </div>
            </SettingsCard>
          )}

          {payouts && (
            <SettingsCard icon={Repeat} title="Payout currency" description={bankCountry ? `Currencies your ${bankCountry.name} account can receive.` : "Add a payout account to see which currencies it can receive."}>
              <div className="max-w-md"><CurrencyPicker id="fx-payout-currency" label="Payout currency" value={payoutCurrency} options={payoutOptions} onChange={(c) => save({ payoutCurrency: c }, `Payouts will be sent in ${c}`)} /></div>
              {payoutCurrency && converts.length > 0 && (
                <p className="mt-3 rounded-[14px] bg-ice/60 p-3 text-[13px] text-muted-foreground">Withdrawals from your {converts.join(", ")} balance{converts.length > 1 ? "s" : ""} are converted to {payoutCurrency}. You'll see the rate and the amount that arrives before you confirm.</p>
              )}
            </SettingsCard>
          )}

          <SettingsCard icon={Globe2} title="Display currency" description="Used only for estimated totals across currencies. It never changes a balance.">
            <div className="max-w-md"><CurrencyPicker id="fx-display-currency" label="Display currency" value={prefs.displayCurrency} onChange={(c) => save({ displayCurrency: c }, `Estimates shown in ${c}`)} /></div>
          </SettingsCard>
        </>
      }
      side={
        <SettingsTip icon={Repeat} title="When conversion happens" items={[
          "Selling, earning and payout currencies can all differ.",
          "Balances are never added together. Estimates are labelled with their rate and time.",
          "If your payout account holds another currency, we show the rate and what arrives before you confirm.",
          "The provider sets the final rate and fee when the transfer is created.",
        ]} />
      }
    />
  );
}
