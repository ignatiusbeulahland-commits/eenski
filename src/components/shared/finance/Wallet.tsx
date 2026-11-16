import { ArrowUpRight, Clock, Eye, EyeOff, Info, Plus, RefreshCw, CalendarClock, Coins, TrendingUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/dashboard-ui/button";
import { StatCard } from "@/components/affiliate/ui";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { CURRENCIES, formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { estimatedTotal, type Balance } from "@/lib/shared/finance/wallet";
import { rateTime, useRates } from "@/lib/shared/finance/rates";
import { useBalancePrivacy, MASK } from "@/lib/shared/finance/privacy";
import { cn } from "@/lib/utils";
import { CurrencyTag, Flag } from "./Marks";

/**
 * One card per currency balance. Totals are never summed across currencies; an estimate in the
 * display currency is shown separately with its rate source and time.
 */
export function MultiCurrencyWallet({ balances, displayCurrency, onWithdraw, accountsLink, accountLabel, settingsLink, footer, nextPayout }: {
  balances: Balance[];
  displayCurrency: CurrencyCode;
  onWithdraw: (currency: CurrencyCode) => void;
  accountsLink: string;
  accountLabel: ReactNode;
  settingsLink: string;
  footer?: ReactNode;
  /** Next scheduled payout. Enski payouts are on request, so this defaults to that unless a role supplies a schedule. */
  nextPayout?: { value: string; hint: string };
}) {
  const { hidden, toggle } = useBalancePrivacy();
  const [sel, setSel] = useState<CurrencyCode>(balances[0]?.currency ?? "NGN");
  const b = balances.find((x) => x.currency === sel) ?? balances[0];
  const multi = balances.length > 1;
  const { rates, error, loading } = useRates(displayCurrency, multi);
  const estimate = multi ? estimatedTotal(balances, rates, displayCurrency) : null;
  if (!b) return null;
  const m = (n: number, c: CurrencyCode, o?: { compact?: boolean }) => (hidden ? MASK : formatMoney(n, c, o));
  const next = nextPayout ?? (b.upcoming > 0
    ? { value: m(b.upcoming, b.currency), hint: "Requested · awaiting the provider" }
    : { value: "On request", hint: "Withdraw whenever you have a balance" });
  return (
    <div className="space-y-4">
      {multi && (
        <>
          <SectionDropdown heading="Balance" value={sel} onChange={(v) => setSel(v as CurrencyCode)} className="md:hidden"
            options={balances.map((x) => ({ value: x.currency, label: `${x.currency} · ${CURRENCIES[x.currency].name}`, count: m(x.available, x.currency, { compact: true }) }))} />
          <div className="hidden flex-wrap gap-2 md:flex" role="group" aria-label="Currency balances">
            {balances.map((x) => (
              <button key={x.currency} type="button" aria-pressed={sel === x.currency} onClick={() => setSel(x.currency)}
                className={cn("lime-pip inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors", sel === x.currency ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-100 hover:text-cobalt")}>
                <Flag code={CURRENCIES[x.currency].flag} className="h-3.5 w-5" />{x.currency}
                <span className={cn("chip-count rounded-full px-1.5 text-[11px] tabular-nums", sel === x.currency ? "bg-on-dark/20" : "bg-soft text-muted-foreground")}>{m(x.available, x.currency, { compact: true })}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section data-surface="dark" className="bg-brand-panel finance-wallet-card relative overflow-hidden rounded-[24px] p-5 text-on-dark sm:p-7" aria-label={`${b.currency} balance`}>
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-on-dark-muted"><span className="neon-dot" aria-hidden="true" />Available · <Flag code={CURRENCIES[b.currency].flag} className="h-3.5 w-5 ring-on-dark/30" />{b.currency}</p>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <p className="truncate text-3xl font-extrabold tabular-nums sm:text-[40px] sm:leading-tight" aria-live="polite">{hidden ? <><span aria-hidden="true">{MASK}</span><span className="sr-only">Balance hidden</span></> : formatMoney(b.available, b.currency)}</p>
                <button type="button" onClick={toggle} aria-pressed={hidden} aria-label={hidden ? "Show balances" : "Hide balances"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-on-dark/10 text-on-dark ring-1 ring-on-dark/20 transition-colors hover:bg-on-dark/20 hover:text-lime">{hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
              </div>
              <p className="mt-1 text-sm text-on-dark-muted">{b.available > 0 ? `${CURRENCIES[b.currency].name} balance ready to withdraw.` : b.pending > 0 ? "Nothing to withdraw yet. Your pending earnings move here once they clear." : `No ${CURRENCIES[b.currency].name} to withdraw yet. Earnings land here once they clear.`}</p>
            </div>
            <BrandIcon src={brandArtwork.wallet} className="product-hero-art h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
          </div>
          <dl className="relative mt-5 grid grid-cols-2 gap-2.5 sm:max-w-md">
            <div className="rounded-[16px] bg-on-dark/10 px-3.5 py-2.5 ring-1 ring-on-dark/15"><dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-dark-muted">Pending</dt><dd className="mt-0.5 truncate font-extrabold tabular-nums text-lime">{m(b.pending, b.currency)}</dd></div>
            <div className="rounded-[16px] bg-on-dark/10 px-3.5 py-2.5 ring-1 ring-on-dark/15"><dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-dark-muted">Withdrawing</dt><dd className="mt-0.5 truncate font-extrabold tabular-nums">{m(b.upcoming, b.currency)}</dd></div>
          </dl>
          <div className="relative mt-5 flex flex-wrap items-center gap-3">
            <Button variant={b.available > 0 ? "lime" : "glass"} onClick={() => onWithdraw(b.currency)}><ArrowUpRight />Withdraw {b.currency}</Button>
            <Link to={accountsLink as "/"} className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-on-dark/25 px-3 py-1.5 text-[13px] font-bold hover:border-lime hover:text-lime">{accountLabel}</Link>
          </div>
        </section>
        <section className="surface p-5 sm:p-6" aria-labelledby="fx-total">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="fx-total" className="flex items-center gap-2.5 text-[15px] font-extrabold"><span className="lime-tick" aria-hidden="true" />Your balances</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{balances.length} currenc{balances.length === 1 ? "y" : "ies"}, each kept separately.</p>
            </div>
            <BrandIcon src={brandArtwork.globe} className="h-11 w-11" />
          </div>
          <ul className="mt-4 divide-y">
            {balances.map((x) => (
              <li key={x.currency}>
                <button type="button" onClick={() => setSel(x.currency)} className={cn("flex w-full items-center gap-3 py-2.5 text-left", sel === x.currency && "text-cobalt")} aria-pressed={sel === x.currency}>
                  <Flag code={CURRENCIES[x.currency].flag} className="h-5 w-7 rounded-[5px]" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{x.currency}</span><span className="block truncate text-[11px] text-muted-foreground">{CURRENCIES[x.currency].name}</span></span>
                  <span className="text-right"><span className="block text-sm font-extrabold tabular-nums">{m(x.available, x.currency)}</span>{x.pending > 0 && !hidden && <span className="block text-[11px] text-muted-foreground tabular-nums">+{formatMoney(x.pending, x.currency)} pending</span>}</span>
                </button>
              </li>
            ))}
          </ul>
          {multi && (
            <div className="mt-3 rounded-[16px] bg-soft p-3.5 text-xs" aria-live="polite">
              {estimate !== null && rates ? (
                <>
                  <p className="font-bold text-muted-foreground">Estimated total in {displayCurrency}</p>
                  <p className="mt-0.5 text-lg font-extrabold tabular-nums">≈ {m(Math.round(estimate * 100) / 100, displayCurrency)}</p>
                  <p className="mt-1 text-muted-foreground">Indicative mid-market rates from <a href={rates.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-cobalt hover:underline">{rates.source}</a>, updated {rateTime(rates.updatedAt)}. Not a withdrawable amount.</p>
                </>
              ) : loading ? (
                <p className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="h-3.5 w-3.5 animate-spin" />Loading exchange rates…</p>
              ) : (
                <p className="flex items-start gap-2 text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error ? "Exchange rates couldn't load, so no combined estimate is shown." : "A combined total shows once every balance has an exchange rate."}</p>
              )}
            </div>
          )}
          <Link to={settingsLink as "/"} className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-cobalt hover:underline"><Plus className="h-3.5 w-3.5" />Show another currency</Link>
        </section>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Financial summary">
        <StatCard icon={Clock} art={brandArtwork.pending} label="Pending balance" value={m(b.pending, b.currency)} hint="Clearing, not yet withdrawable" />
        <StatCard icon={TrendingUp} art={brandArtwork.analytics} label="Total earnings" value={m(b.earned, b.currency)} hint={`All time, in ${b.currency}`} />
        <StatCard icon={Coins} art={brandArtwork.payout} label="Total withdrawals" value={m(b.paidOut + b.upcoming, b.currency)} hint={b.upcoming > 0 ? `${m(b.upcoming, b.currency)} still on its way` : "Paid out and requested"} />
        <StatCard icon={CalendarClock} art={brandArtwork.calendar} label="Next payout" value={next.value} hint={next.hint} />
      </div>
      {footer}
    </div>
  );
}

export { CurrencyTag };
