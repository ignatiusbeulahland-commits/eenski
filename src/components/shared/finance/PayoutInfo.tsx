import { ArrowRight, Check, Landmark } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PROVIDERS, METHOD_LABEL } from "@/lib/shared/finance/coverage";
import { beneficiaryLabel, maskedLast4, type Beneficiary } from "@/lib/shared/finance/beneficiaries";
import { cn } from "@/lib/utils";
import { BankLogo, CurrencyTag } from "./Marks";

export type PayoutRequirement = { label: string; done: boolean; to?: string };

/**
 * Payout facts the app actually enforces: withdrawals are on request, any amount above zero up to the
 * available balance, sent by the account's provider, who confirms the fee and arrival before sending.
 */
export function PayoutInfo({ account, accountsLink, requirements }: { account: Beneficiary | null; accountsLink: string; requirements: PayoutRequirement[] }) {
  const done = requirements.filter((r) => r.done).length;
  const ready = done === requirements.length;
  return (
    <section className="surface @container h-fit min-w-0 overflow-hidden" aria-labelledby="payout-info-title">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h2 id="payout-info-title" className="flex items-center gap-2.5 text-[15px] font-extrabold"><span className="lime-tick" aria-hidden="true" />Payout information</h2>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold", ready ? "bg-lime-100 text-lime-text" : "bg-warning-soft text-warning-foreground")}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{ready ? "Ready to withdraw" : `${requirements.length - done} step${requirements.length - done === 1 ? "" : "s"} left`}
        </span>
      </header>
      <div className="grid gap-x-8 p-5 @2xl:grid-cols-2">
        <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Linked payout account</p>
        {account ? (
          <Link to={accountsLink as "/"} className="mt-2 flex items-center gap-3 rounded-[16px] border-[1.5px] border-line p-3 transition-colors hover:border-cobalt-100">
            <BankLogo name={account.institution.name} logo={account.institution.logo} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold">{beneficiaryLabel(account)}</span><span className="block truncate text-xs text-muted-foreground"><span className="tabular-nums">{maskedLast4(account)}</span> · {account.holder}</span><span className="block truncate text-[11px] text-muted-foreground">{METHOD_LABEL[account.method]}</span></span>
            <CurrencyTag code={account.currency} className="text-xs" />
          </Link>
        ) : (
          <Link to={accountsLink as "/"} className="mt-2 flex items-center gap-3 rounded-[16px] border-[1.5px] border-dashed border-cobalt-100 bg-ice/40 p-3 text-sm font-extrabold text-cobalt hover:bg-ice">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-card ring-1 ring-line"><Landmark className="h-[18px] w-[18px]" /></span>Add a payout account<ArrowRight className="ml-auto h-4 w-4" />
          </Link>
        )}
        <dl className="mt-4 divide-y text-sm">
          <Fact k="Payout frequency" v="On request" d="You choose when to withdraw." />
          <Fact k="Minimum withdrawal" v="Above zero" d="Up to your available balance in that currency." />
          <Fact k="Processing" v={account ? PROVIDERS[account.provider].name : "Your account's provider"} d="Shows the transfer fee and arrival time before it sends." />
        </dl>
        </div>
        <div className="min-w-0">
        <p className="mt-4 @2xl:mt-0 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Payout status · {done} of {requirements.length}</p>
        <ul className="mt-2 space-y-1">
          {requirements.map((r) => {
            const body = <><span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full", r.done ? "bg-lime text-midnight" : "border-2 border-line")} aria-hidden="true">{r.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span><span className={cn("flex-1 font-semibold", r.done && "text-muted-foreground")}>{r.label}<span className="sr-only">{r.done ? " (done)" : " (to do)"}</span></span>{!r.done && r.to && <ArrowRight className="h-4 w-4 text-cobalt" aria-hidden="true" />}</>;
            return <li key={r.label}>{r.to && !r.done ? <Link to={r.to as "/"} className="flex items-center gap-3 rounded-[12px] p-2 text-sm hover:bg-soft">{body}</Link> : <div className="flex items-center gap-3 p-2 text-sm">{body}</div>}</li>;
          })}
        </ul>
        </div>
      </div>
    </section>
  );
}

function Fact({ k, v, d }: { k: string; v: string; d: string }) {
  return <div className="flex items-start justify-between gap-4 py-2.5"><dt className="min-w-0"><span className="block font-bold">{k}</span><span className="block text-xs text-muted-foreground">{d}</span></dt><dd className="shrink-0 text-right font-extrabold">{v}</dd></div>;
}
