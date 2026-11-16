import { Check, Clock, Printer, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { OutcomeScreen, ProcessingScreen, outcomeButton } from "@/components/shared/outcome";
import { formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { TX_STATUS_LABEL, type TxStatus } from "@/lib/shared/finance/history";
import { WITHDRAW_FAIL_COPY, type WithdrawFail } from "@/lib/shared/finance/withdrawals";
import { cn } from "@/lib/utils";

export interface WithdrawalView {
  id: string;
  amount: number;
  currency: CurrencyCode;
  fee: number;
  reference: string;
  status: "processing" | "successful" | "failed" | "pending";
  reason?: WithdrawFail | undefined;
  date: string;
  settledAt?: string | undefined;
  resolveAt?: number | undefined;
  to: string;
  holder?: string | undefined;
  method: string;
  arrival?: string | undefined;
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Calls `onDue` once the withdrawal's processing time has passed (and keeps checking while open). */
export function useResolveWhenDue(w: WithdrawalView | null, onDue: () => void) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!w || w.status !== "processing") return;
    if (!w.resolveAt || Date.now() >= w.resolveAt) return onDue();
    const t = window.setInterval(() => {
      tick((n) => n + 1);
      if (Date.now() >= (w.resolveAt ?? 0)) onDue();
    }, 600);
    return () => window.clearInterval(t);
  }, [w?.status, w?.resolveAt]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function WithdrawalResult({ w, primary, secondary, retry, change, failedMore }: {
  w: WithdrawalView;
  primary: ReactNode;
  secondary: ReactNode;
  /** Failure actions. */
  retry: ReactNode;
  change: ReactNode;
  /** Extra failure links, e.g. transaction details and reviewing the payout account. */
  failedMore?: ReactNode;
}) {
  const receive = Math.max(0, w.amount - w.fee);
  if (w.status === "processing") {
    const total = Math.max(1, (w.resolveAt ?? Date.now()) - Date.parse(w.date));
    const steps = ["Checking your balance", `Sending to ${w.to}`, "Confirming the transfer"];
    const active = Math.min(steps.length - 1, Math.floor(((Date.now() - Date.parse(w.date)) / total) * steps.length));
    return <ProcessingScreen title={`Sending ${formatMoney(receive, w.currency)}`} message="Please keep this page open while we send your money." steps={steps} active={Math.max(0, active)} />;
  }
  if (w.status === "failed") {
    const copy = WITHDRAW_FAIL_COPY[w.reason ?? "bank_unavailable"];
    return (
      <OutcomeScreen
        tone="failed"
        eyebrow="Withdrawal failed"
        title="Withdrawal didn't go through"
        message={<><strong className="block text-ink">{copy.title}</strong>{copy.body}</>}
        details={[
          { label: "Amount", value: formatMoney(w.amount, w.currency) },
          { label: "Send to", value: w.to },
          { label: "Reference", value: w.reference, copy: w.reference, mono: true },
          { label: "Date", value: fmtDate(w.date) },
        ]}
        actions={<>{retry}{change}</>}
        moreActions={failedMore}
        footer={secondary}
      />
    );
  }
  const pending = w.status === "pending";
  return (
    <OutcomeScreen
      tone={pending ? "pending" : "success"}
      eyebrow={pending ? "On its way" : "Sent"}
      title={pending ? "Withdrawal requested" : "Withdrawal successful"}
      message={pending ? "Your request is in. We'll update this page and your history as soon as the transfer completes." : `${formatMoney(receive, w.currency)} is on its way to ${w.to}. ${w.arrival ?? ""}`.trim()}
      details={[
        { label: "Amount", value: formatMoney(w.amount, w.currency), strong: true },
        { label: "Fee", value: formatMoney(w.fee, w.currency) },
        { label: "You receive", value: formatMoney(receive, w.currency) },
        { label: "Currency", value: w.currency },
        { label: "Beneficiary", value: w.holder ? `${w.holder} · ${w.to}` : w.to },
        { label: "Reference", value: w.reference, copy: w.reference, mono: true },
        { label: "Date", value: fmtDate(w.settledAt ?? w.date) },
      ]}
      actions={<>{primary}{secondary}</>}
    />
  );
}

/** Receipt-style transaction details with a status timeline. */
export function TxDetails({ title, direction, amount, currency, status, rows, timeline, actions, notice }: {
  title: string;
  direction: "in" | "out";
  amount: number;
  currency: CurrencyCode;
  status: TxStatus;
  rows: [string, ReactNode][];
  timeline: { label: string; at: string | null; state: "done" | "failed" | "waiting" }[];
  actions: ReactNode;
  /** Short confirmation shown right after an action on this transaction (e.g. a refund). */
  notice?: { title: string; body: string } | undefined;
}) {
  return (
    <article className="surface screen-in mx-auto max-w-2xl overflow-hidden p-0 print:border-0 print:shadow-none">
      <header className="bg-brand-panel relative px-6 py-7 text-on-dark sm:px-8" data-surface="dark">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-dark-muted">Transaction details</p>
          <h1 className="mt-1 text-2xl font-extrabold">{title}</h1>
          <p className={cn("mt-3 text-4xl font-extrabold tabular-nums", (status === "refunded" || status === "reversed" || status === "failed") && "line-through decoration-2 opacity-70")}>{direction === "out" ? "−" : "+"}{formatMoney(amount, currency)}</p>
          <span className={cn("mt-3 inline-block rounded-full px-3 py-1 text-xs font-extrabold", status === "successful" ? "bg-lime text-midnight" : status === "failed" ? "bg-destructive text-destructive-foreground" : "bg-on-dark/15 text-on-dark")}>{TX_STATUS_LABEL[status]}</span>
        </div>
      </header>
      <div className="space-y-6 p-6 sm:p-8">
        {notice && (
          <div role="status" className="screen-in flex items-start gap-3 rounded-[18px] bg-ice p-4 text-sm">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="size-4" strokeWidth={3} aria-hidden="true" /></span>
            <span><strong className="block font-extrabold">{notice.title}</strong><span className="text-muted-foreground">{notice.body}</span></span>
          </div>
        )}
        <dl className="divide-y divide-dashed rounded-[20px] border-[1.5px] border-line text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 px-4 py-3"><dt className="shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0 break-words text-right font-bold">{v}</dd></div>
          ))}
        </dl>
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Status</h2>
          <ol className="mt-3 space-y-3">
            {timeline.map((t) => (
              <li key={t.label} className="flex items-center gap-3 text-sm">
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", t.state === "done" ? "bg-cobalt text-primary-foreground" : t.state === "failed" ? "bg-destructive text-destructive-foreground" : "bg-soft text-muted-foreground")}>
                  {t.state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : t.state === "failed" ? <X className="size-3.5" strokeWidth={3} /> : <Clock className="size-3.5" />}
                </span>
                <span className={cn("font-extrabold", t.state === "waiting" && "text-muted-foreground")}>{t.label}</span>
                {t.at && <span className="ml-auto text-xs font-semibold text-muted-foreground">{fmtDate(t.at)}</span>}
              </li>
            ))}
          </ol>
        </section>
        <div className="grid gap-2 print:hidden sm:flex sm:flex-row-reverse sm:justify-start">
          <button type="button" onClick={() => window.print()} className={outcomeButton.secondary}><Printer aria-hidden="true" /> Download receipt</button>
          {actions}
        </div>
      </div>
    </article>
  );
}
