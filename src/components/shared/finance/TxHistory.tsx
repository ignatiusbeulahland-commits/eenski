import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Copy, History, Undo2, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, FilterSelect, SearchInput, dateRanges } from "@/components/affiliate/ui";
import { formatMoney } from "@/lib/shared/finance/currencies";
import { filterTx, paginate, txSummary, TX_STATUS_LABEL, type TxRow, type TxStatus } from "@/lib/shared/finance/history";
import { cn } from "@/lib/utils";

const TONE: Record<TxStatus, string> = {
  successful: "bg-lime-100 text-lime-text",
  pending: "bg-warning-soft text-warning-foreground",
  processing: "bg-ice text-cobalt",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-soft text-muted-foreground ring-1 ring-line",
  reversed: "bg-muted text-muted-foreground",
};

export function TxStatusBadge({ status }: { status: TxStatus }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold", TONE[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", status === "processing" && "motion-safe:animate-pulse")} aria-hidden="true" />
      {TX_STATUS_LABEL[status]}
    </span>
  );
}

const when = (iso: string) => {
  const d = new Date(iso);
  return { date: d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }), time: d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }) };
};

function TxIcon({ r }: { r: TxRow }) {
  const Icon = r.status === "reversed" || r.status === "refunded" ? Undo2 : r.status === "failed" ? X : r.direction === "in" ? ArrowDownLeft : ArrowUpRight;
  return <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[14px] ring-1", r.direction === "in" && r.status === "successful" ? "bg-cobalt text-lime ring-cobalt" : "bg-ice text-cobalt ring-line")} aria-hidden="true"><Icon className="h-[18px] w-[18px]" /></span>;
}

function Amount({ r, className }: { r: TxRow; className?: string }) {
  const sign = r.direction === "in" ? "+" : "−";
  return <span className={cn("font-extrabold tabular-nums", r.status === "reversed" || r.status === "refunded" || r.status === "failed" ? "text-muted-foreground line-through decoration-1" : r.direction === "in" ? "text-foreground" : "text-foreground", className)}>{sign}{formatMoney(r.amount, r.currency)}</span>;
}

function Ref({ value }: { value: string }) {
  return (
    <button type="button" onClick={() => { void navigator.clipboard?.writeText(value).then(() => toast.success("Reference copied", { description: value }), () => toast.error("Couldn't copy the reference", { description: `Copy it by hand: ${value}` })); }}
      className="group relative z-[1] inline-flex min-w-0 items-center gap-1 rounded-md font-mono text-[11px] font-semibold tracking-wide text-muted-foreground hover:text-cobalt" aria-label={`Copy reference ${value}`}>
      <span className="truncate">{value}</span><Copy className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden="true" />
    </button>
  );
}

function Title({ r }: { r: TxRow }) {
  const text = <span className="block truncate text-sm font-extrabold">{r.description}</span>;
  // The link stretches over its whole row (rows are `relative`), so a tap anywhere opens the details;
  // the copy and row-action buttons sit above it.
  return r.href ? <Link to={r.href.to as "/"} params={r.href.params as never} className="min-w-0 rounded-sm after:absolute after:inset-0 after:content-[''] hover:text-cobalt focus-visible:outline-none focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-cobalt">{text}</Link> : text;
}

/** Totals for the rows currently shown, one line per currency (never mixed). */
function Summary({ rows }: { rows: TxRow[] }) {
  const totals = txSummary(rows);
  if (!totals.length) return null;
  return (
    <div className="space-y-2 border-b px-3 py-3 sm:px-5" aria-label="Totals for the transactions shown">
      {totals.map((t) => {
        const cells: [string, string, (string | undefined)?][] = [
          ["Money in", `+${formatMoney(t.moneyIn, t.currency)}`],
          ["Money out", `−${formatMoney(t.moneyOut, t.currency)}`, t.inFlight > 0 ? `${formatMoney(t.inFlight, t.currency)} on its way` : undefined],
          t.refunded > 0 ? ["Refunded", formatMoney(t.refunded, t.currency)] : ["Transactions", String(t.count)],
        ];
        return (
          <dl key={t.currency} className="grid grid-cols-3 divide-x divide-line rounded-[16px] bg-soft/60 py-2.5">
            {cells.map(([k, v, hint]) => (
              <div key={k} className="min-w-0 px-3">
                <dt className="truncate text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">{k}{totals.length > 1 && ` · ${t.currency}`}</dt>
                <dd className="mt-0.5 truncate text-sm font-extrabold tabular-nums sm:text-[15px]">{v}</dd>
                {hint && <dd className="truncate text-[11px] font-semibold text-muted-foreground">{hint}</dd>}
              </div>
            ))}
          </dl>
        );
      })}
    </div>
  );
}

/** One transaction history for every role: search, status/direction filters and pages. Table from md, cards below. */
export function TxHistory({ title = "Transaction history", description, rows, empty, pageSize = 8, directions = true, summary = directions, action }: {
  title?: string;
  description?: string;
  rows: TxRow[];
  empty: ReactNode;
  pageSize?: number;
  directions?: boolean;
  /** Show money in / out / refunded totals for the rows that match the filters. */
  summary?: boolean;
  /** Optional per-row action the role already supports (e.g. refund a sale). */
  action?: (r: TxRow) => ReactNode;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [dir, setDir] = useState<"all" | "in" | "out">("all");
  const [range, setRange] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => filterTx(rows, q, status, dir, range === "all" ? undefined : Number(range)), [rows, q, status, dir, range]);
  const p = paginate(filtered, page, pageSize);
  const present = new Set(rows.map((r) => r.status));
  const reset = () => { setQ(""); setStatus("all"); setDir("all"); setRange("all"); setPage(1); };
  return (
    <section className="surface finance-history @container min-w-0 overflow-hidden" aria-labelledby="tx-history-title">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 id="tx-history-title" className="flex items-center gap-2.5 text-[15px] font-extrabold"><span className="lime-tick" aria-hidden="true" />{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {rows.length > 0 && <p className="text-xs font-bold text-muted-foreground tabular-nums">{rows.length} record{rows.length === 1 ? "" : "s"}</p>}
      </header>
      {!rows.length ? <div className="px-4 sm:px-5">{empty}</div> : (
        <>
          <div className="flex flex-col gap-2 border-b bg-soft/40 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5">
            <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search description or reference" />
            <div className={cn("grid gap-2 sm:flex", directions ? "grid-cols-3 max-[379px]:grid-cols-2" : "grid-cols-2")}>
              <FilterSelect label="Filter by status" value={status} onChange={(v) => { setStatus(v as TxStatus | "all"); setPage(1); }}
                options={[["all", "Status"], ...(Object.keys(TX_STATUS_LABEL) as TxStatus[]).filter((s) => present.has(s)).map((s) => [s, TX_STATUS_LABEL[s]] as [string, string])]} />
              {directions && <FilterSelect label="Money in or out" value={dir} onChange={(v) => { setDir(v as "all" | "in" | "out"); setPage(1); }} options={[["all", "In & out"], ["in", "Money in"], ["out", "Money out"]]} />}
              <FilterSelect value={range} onChange={(v) => { setRange(v); setPage(1); }} options={dateRanges} className={cn(directions && "max-[379px]:col-span-2")} />
            </div>
          </div>
          {summary && filtered.length > 0 && <Summary rows={filtered} />}
          {p.items.length ? (
            <>
              <table className="hidden w-full table-fixed text-left text-sm @3xl:table">
                <caption className="sr-only">{title}</caption>
                <thead className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  <tr className="border-b">
                    <th scope="col" className="w-[34%] px-5 py-3 font-bold">Transaction</th>
                    <th scope="col" className="w-[17%] px-3 py-3 font-bold">Reference</th>
                    <th scope="col" className="w-[15%] px-3 py-3 font-bold">Method</th>
                    <th scope="col" className="w-[14%] px-3 py-3 font-bold">Date & time</th>
                    <th scope="col" className="w-[10%] px-3 py-3 font-bold">Status</th>
                    <th scope="col" className="w-[14%] px-5 py-3 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {p.items.map((r) => { const w = when(r.date); return (
                    <tr key={r.id} className={cn("finance-tx-row relative", r.href && "transition-colors hover:bg-soft/50")}>
                      <td className="px-5 py-3.5"><div className="flex min-w-0 items-center gap-3"><TxIcon r={r} /><div className="min-w-0"><Title r={r} />{r.detail && <span className="block truncate text-xs text-muted-foreground">{r.detail}</span>}</div></div></td>
                      <td className="px-3 py-3.5"><Ref value={r.reference} /></td>
                      <td className="truncate px-3 py-3.5 text-xs font-semibold text-muted-foreground">{r.method}</td>
                      <td className="px-3 py-3.5 text-xs"><span className="block font-bold">{w.date}</span><span className="text-muted-foreground">{w.time}</span></td>
                      <td className="px-3 py-3.5"><TxStatusBadge status={r.status} /></td>
                      <td className="px-5 py-3.5 text-right"><Amount r={r} />{action && <div className="relative z-[1] mt-1 flex justify-end">{action(r)}</div>}</td>
                    </tr>
                  ); })}
                </tbody>
              </table>
              <ul className="divide-y @3xl:hidden">
                {p.items.map((r) => { const w = when(r.date); return (
                  <li key={r.id} className={cn("finance-tx-row relative px-4 py-3.5", r.href && "transition-colors active:bg-soft/60")}>
                    <div className="flex items-start gap-3">
                      <TxIcon r={r} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Title r={r} /></div><Amount r={r} className="shrink-0 text-sm" /></div>
                        <div className="mt-0.5 flex items-center justify-between gap-3"><span className="truncate text-xs text-muted-foreground">{w.date} · {w.time}</span><TxStatusBadge status={r.status} /></div>
                        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground"><Ref value={r.reference} /><span aria-hidden="true">·</span><span className="truncate">{r.method}</span>{action && <span className="relative z-[1] ml-auto">{action(r)}</span>}</div>
                      </div>
                    </div>
                  </li>
                ); })}
              </ul>
              {p.pages > 1 && (
                <nav className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs font-bold sm:px-5" aria-label="Transaction pages">
                  <span className="text-muted-foreground tabular-nums">{p.from}–{p.to} of {filtered.length}</span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={p.page <= 1} onClick={() => setPage(p.page - 1)} aria-label="Previous page"><ChevronLeft /></Button>
                    <span className="min-w-14 text-center tabular-nums" aria-current="page">{p.page} / {p.pages}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={p.page >= p.pages} onClick={() => setPage(p.page + 1)} aria-label="Next page"><ChevronRight /></Button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <EmptyState compact icon={History} title="No transactions match" description="Try a different status, date range or search." action={<Button variant="outline" onClick={reset}>Clear filters</Button>} />
          )}
        </>
      )}
    </section>
  );
}
