import { useEffect, useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BadgePercent, BookOpenCheck, ChevronLeft, ChevronRight, Download, Package, Receipt, Wallet, LineChart as LineIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Switch } from "@/components/dashboard-ui/switch";
import { PageHeader, Panel, EmptyState, SearchInput, FilterSelect, StatusBadge } from "@/components/affiliate/ui";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { Skeleton } from "@/components/dashboard-ui/skeleton";
import { useCreator } from "@/lib/creator/store";
import { kindInfo } from "@/lib/creator/data";
import {
  PERF_CURRENCIES, PERF_RANGES, commissionOf, convert, emptyTxFilters, filterTx, inRange, money, monthlyCommission, realSales,
  revenueSeries, sampleSales, statusText, summary, topProducts, txCsv, type PerfCurrency, type PerfRange, type TxFilters, type CommissionStatus,
} from "@/lib/creator/performance";
import { downloadCsv } from "../shared";
import { currencySymbol, formatMoney } from "@/lib/shared/finance/currencies";
import { cn } from "@/lib/utils";

const tipStyle = { background: "var(--card)", borderColor: "var(--line)", borderRadius: 12, color: "var(--foreground)", fontSize: 12 };
const axis = { fill: "var(--muted-foreground)", fontSize: 11 };
const PAGE = 8;
const statusTone: Record<CommissionStatus, "success" | "pending" | "info"> = { paid: "success", pending: "pending", processing: "info" };

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { key: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border bg-card p-1">
      {options.map((o) => (
        <button key={o.key} type="button" role="radio" aria-checked={value === o.key} onClick={() => onChange(o.key)}
          className={cn("min-h-9 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-cobalt",
            value === o.key ? "bg-cobalt text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-ice hover:text-cobalt")}>{o.label}</button>
      ))}
    </div>
  );
}

function Metric({ art, label, value, lines, featured }: { art: string; label: string; value: string; lines: string[]; featured?: boolean }) {
  return (
    <div className={cn("stat-card surface group relative flex min-w-0 flex-col gap-3 overflow-hidden p-5", featured && "is-featured")}>
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">{featured && <span className="neon-dot shrink-0" aria-hidden="true" />}{label}</p>
        <BrandIcon src={art} className="stat-art -mr-1 -mt-1 h-12 w-12" />
      </div>
      <p className="truncate text-2xl font-extrabold tabular-nums text-foreground sm:text-[26px]">{value}</p>
      {lines.length > 0 && <div className="space-y-0.5 text-xs text-muted-foreground">{lines.map((l) => <p key={l}>{l}</p>)}</div>}
      <div className="stat-card-bar absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
    </div>
  );
}

const KIND_COLORS = ["var(--cobalt)", "var(--sky)", "var(--lime-press)", "var(--warning)", "var(--midnight)"];

/** Premium donut: share of revenue per product type, total in the centre. */
function KindDonut({ data, centre, fmt }: { data: { name: string; value: number }[]; centre: string; fmt: (v: number) => string }) {
  const sum = data.reduce((n, d) => n + d.value, 0) || 1;
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <div className="relative mx-auto h-52 w-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="96%" paddingAngle={2} cornerRadius={6} stroke="var(--card)" strokeWidth={2} animationDuration={600}>
              {data.map((d, i) => <Cell key={d.name} fill={KIND_COLORS[i % KIND_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tipStyle} formatter={(v, n) => [`${fmt(Number(v))} · ${Math.round((Number(v) / sum) * 100)}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p><p className="text-lg font-extrabold tabular-nums">{centre}</p></div>
        </div>
      </div>
      <ul className="space-y-2.5">
        {data.map((d, i) => {
          const pct = Math.round((d.value / sum) * 100);
          return (
            <li key={d.name} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND_COLORS[i % KIND_COLORS.length] }} /><span className="truncate">{d.name}</span></span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{fmt(d.value)} · <b className="text-foreground">{pct}%</b></span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: KIND_COLORS[i % KIND_COLORS.length] }} /></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PerformancePage() {
  const { state } = useCreator();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [currency, setCurrency] = useState<PerfCurrency>("NGN");
  const [range, setRange] = useState<PerfRange>("30");
  const [useSample, setUseSample] = useState(true);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [f, setF] = useState<TxFilters>(emptyTxFilters);
  const [page, setPage] = useState(0);

  const now = useMemo(() => Date.now(), []);
  const all = useMemo(() => [...realSales(state, now), ...(useSample ? sampleSales(now) : [])].sort((a, b) => b.date.localeCompare(a.date)), [state, useSample, now]);
  const sales = useMemo(() => inRange(all, range, now), [all, range, now]);
  const published = state.items.filter((i) => i.status === "published").length + (useSample ? 7 : 0);
  const s = summary(sales, published);
  const series = useMemo(() => revenueSeries(sales, range, now).map((b) => ({ ...b, revenue: convert(b.revenue, currency) })), [sales, range, now, currency]);
  const top = topProducts(sales);
  const shownTop = showAll ? top : top.slice(0, 5);
  const months = monthlyCommission(sales).map((m) => ({ ...m, value: convert(m.total, currency) }));
  const byKind = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of top) m.set(kindInfo[p.kind].plural, (m.get(kindInfo[p.kind].plural) ?? 0) + p.revenue);
    return [...m].map(([name, value]) => ({ name, value: Math.round(value) })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  }, [top]);
  const tx = filterTx(sales, f);
  const pages = Math.max(1, Math.ceil(tx.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const rows = tx.slice(cur * PAGE, cur * PAGE + PAGE);
  const products = [...new Set(sales.map((x) => x.product))].sort();
  const setFilter = (p: Partial<TxFilters>) => { setF((o) => ({ ...o, ...p })); setPage(0); };
  const fx = (v: unknown, compact = false) => formatMoney(Math.round(Number(v) * 100) / 100, currency, { compact });

  function exportCsv() {
    if (!tx.length) { toast.error("There are no transactions to download with these filters."); return; }
    try { downloadCsv(`enski-commissions-${range}-${currency}.csv`, txCsv(tx, currency)); toast.success(`Downloaded ${tx.length} transactions.`); }
    catch { toast.error("The download didn't start. Please try again."); }
  }

  const header = (
    <PageHeader eyebrow="Insights" title="Performance" description="Track your enrolments, revenue, and commission over time."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="Currency" value={currency} options={PERF_CURRENCIES.map((c) => ({ key: c.code, label: c.label }))} onChange={setCurrency} />
          <Segmented label="Reporting period" value={range} options={PERF_RANGES} onChange={(v) => { setRange(v); setPage(0); }} />
        </div>
      } />
  );

  if (!ready) return <div>{header}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div><Skeleton className="mt-6 h-80 rounded-2xl" /></div>;

  return (
    <div className="min-w-0">
      {header}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <span>{useSample ? "Showing sample sales alongside your own." : "Showing only your own sales."}{currency !== "NGN" && " Other currencies are estimates from saved rates."}</span>
        <label className="flex shrink-0 items-center gap-2 font-semibold text-foreground">Sample data <Switch checked={useSample} onCheckedChange={setUseSample} /></label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric art={brandArtwork.people} label="Total enrolments" value={s.enrolments.toLocaleString()} lines={[range === "all" ? "All time" : `Last ${range} days`]} />
        <Metric featured art={brandArtwork.cash} label="Total revenue" value={money(s.net, currency)} lines={[`Gross: ${money(s.gross, currency)}`, `Refunded: ${money(s.refunded, currency)}`]} />
        <Metric art={brandArtwork.conversion} label="Average commission" value={money(s.avgCommission, currency)} lines={[`Paid: ${money(s.commPaid, currency)}`, s.waiting ? `${s.waiting} more waiting to settle` : "Nothing waiting to settle"]} />
        <Metric art={brandArtwork.package} label="Products published" value={String(s.published)} lines={["Across all product types"]} />
      </div>

      <Panel title={`Revenue over time (${currency}, after refunds)`} className="mt-6" description="Hover a date for exact figures. Tap a legend item to hide it.">
        {s.enrolments ? (
          <div className="h-72 w-full min-w-0 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <defs><linearGradient id="perf-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cobalt)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--cobalt)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tick={axis} minTickGap={24} tickLine={false} />
                <YAxis yAxisId="rev" width={56} tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => fx(v, true)} />
                <YAxis yAxisId="sales" orientation="right" width={30} tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tipStyle} cursor={{ stroke: "var(--cobalt-100)", strokeWidth: 1.5 }} formatter={(v, n) => (n === "Total earnings" ? [fx(v), n] : [`${v} sale${Number(v) === 1 ? "" : "s"}`, n])} />
                <Legend wrapperStyle={{ fontSize: 12, cursor: "pointer" }} onClick={(e) => { const k = String((e as { dataKey?: unknown }).dataKey); setHidden((h) => ({ ...h, [k]: !h[k] })); }}
                  formatter={(v, e) => <span style={{ color: hidden[String((e as { dataKey?: unknown }).dataKey)] ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: hidden[String((e as { dataKey?: unknown }).dataKey)] ? "line-through" : "none" }}>{v}</span>} />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Total earnings" stroke="var(--cobalt)" strokeWidth={2.5} fill="url(#perf-rev)" dot={false} activeDot={{ r: 5 }} hide={!!hidden["revenue"]} animationDuration={500} />
                <Line yAxisId="sales" type="monotone" dataKey="sales" name="Sales" stroke="var(--warning)" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 4 }} hide={!!hidden["sales"]} animationDuration={500} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyState icon={LineIcon} title="No sales in this period" description="Pick a longer period, or share your products to see sales here." compact />}
      </Panel>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        <Panel title={`Top products (${currency})`} description="Ranked by number of sales"
          actions={top.length > 5 ? <Button size="sm" variant="outline" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show top 5" : `Show all ${top.length}`}</Button> : undefined}>
          {top.length ? (
            <div className="w-full min-w-0" style={{ height: Math.max(180, shownTop.length * 46 + 20) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shownTop.map((p) => ({ ...p, label: `${p.rank}. ${p.name}` }))} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" horizontal={false} />
                  <XAxis type="number" tick={axis} allowDecimals={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={128} tick={{ ...axis, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--ice)" }} contentStyle={tipStyle}
                    content={({ active, payload }) => {
                      const p = payload?.[0]?.payload as (typeof top)[number] | undefined;
                      if (!active || !p) return null;
                      return <div style={tipStyle} className="border px-3 py-2"><p className="font-bold">#{p.rank} {p.name}</p><p className="text-muted-foreground">{kindInfo[p.kind].label}</p><p>{p.sales} sales · {money(p.revenue, currency)}</p></div>;
                    }} />
                  <Bar dataKey="sales" radius={[0, 6, 6, 0]} maxBarSize={26} label={{ position: "right", fill: "var(--foreground)", fontSize: 11 }} animationDuration={500}>
                    {shownTop.map((p) => <Cell key={p.name} fill={p.rank === 1 ? "var(--cobalt)" : "var(--sky)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState icon={Package} title="No product sales yet" description="Your best sellers will be ranked here." compact />}
        </Panel>

        <Panel title={`Commission breakdown (${currencySymbol(currency)})`} description="Commission earned each month">
          {months.length ? (
            <>
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-ice px-3 py-1 font-bold text-cobalt">{months.length === 1 ? months[0]!.label : `${months[0]!.label} – ${months.at(-1)!.label}`}</span>
                <span className="rounded-full bg-lime px-3 py-1 font-bold text-midnight">Total: {money(s.commTotal, currency)}</span>
              </div>
              <div className="h-60 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="short" tick={axis} tickLine={false} />
                    <YAxis width={56} tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => fx(v, true)} />
                    <Tooltip cursor={{ fill: "var(--ice)" }} contentStyle={tipStyle} labelFormatter={(_, p) => (p?.[0]?.payload as { label?: string })?.label ?? ""} formatter={(v) => [fx(v), "Commission"]} />
                    <defs><linearGradient id="perf-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cobalt)" /><stop offset="100%" stopColor="var(--sky)" /></linearGradient></defs>
                    <Bar dataKey="value" fill="url(#perf-bar)" radius={[8, 8, 2, 2]} maxBarSize={44} animationDuration={500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : <EmptyState icon={BadgePercent} title="No commission yet" description="Commission appears here once sales settle." compact />}
        </Panel>
      </div>

      <Panel title={`Revenue by product type (${currency})`} className="mt-6" description="Share of earnings in this period, after refunds">
        {byKind.length ? <KindDonut data={byKind} centre={money(s.net, currency)} fmt={(v) => money(v, currency)} /> : <EmptyState icon={LineIcon} title="No revenue yet" description="Your earnings split by product type will show here." compact />}
      </Panel>

      <Panel title="Commission details" className="mt-6" bodyClassName="p-0"
        actions={<Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Download CSV</Button>}>
        <div className="grid grid-cols-2 gap-px border-b bg-line lg:grid-cols-4">
          {[["Total earned", s.commTotal], ["Paid", s.commPaid], ["Pending", s.commPending], ["Awaiting settlement", s.commPending + s.commProcessing]].map(([l, v]) => (
            <div key={String(l)} className="bg-card px-5 py-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 truncate font-extrabold tabular-nums">{money(Number(v), currency)}</p></div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:flex-wrap">
          <SearchInput value={f.q} onChange={(q) => setFilter({ q })} placeholder="Search product, customer or reference" />
          <FilterSelect label="Status" value={f.status} onChange={(v) => setFilter({ status: v as TxFilters["status"] })} options={[["all", "All statuses"], ["paid", "Paid"], ["pending", "Pending"], ["processing", "Processing"]]} />
          <FilterSelect label="Product" className="sm:w-48" value={f.product} onChange={(product) => setFilter({ product })} options={[["all", "All products"], ...products.map((p) => [p, p] as [string, string])]} />
          <div className="flex gap-2">
            <Input type="date" aria-label="From date" value={f.from} onChange={(e) => setFilter({ from: e.target.value })} className="min-w-0 sm:w-40" />
            <Input type="date" aria-label="To date" value={f.to} onChange={(e) => setFilter({ to: e.target.value })} className="min-w-0 sm:w-40" />
          </div>
          {(f.q || f.status !== "all" || f.product !== "all" || f.from || f.to) && <Button size="sm" variant="ghost" onClick={() => setFilter(emptyTxFilters)}>Clear</Button>}
        </div>
        {f.from && f.to && f.to < f.from ? (
          <p role="alert" className="p-6 text-center text-sm text-destructive">The end date is before the start date. Pick a later end date.</p>
        ) : rows.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{["Date", "Product", "Customer", "Sale", "Rate", "Commission", "Status", "Reference"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {rows.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-ice/50">
                      <td className="whitespace-nowrap px-4 py-3">{new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="px-4 py-3 font-semibold">{t.product}</td>
                      <td className="px-4 py-3">{t.customer}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">{money(t.amount, currency)}</td>
                      <td className="px-4 py-3 tabular-nums">{Math.round(t.rate * 100)}%</td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums">{money(commissionOf(t), currency)}</td>
                      <td className="px-4 py-3"><StatusBadge tone={statusTone[t.status]}>{statusText[t.status]}</StatusBadge></td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y md:hidden">
              {rows.map((t) => (
                <li key={t.id} className="space-y-2 p-4 text-sm">
                  <div className="flex items-start justify-between gap-3"><p className="min-w-0 font-bold">{t.product}</p><StatusBadge tone={statusTone[t.status]}>{statusText[t.status]}</StatusBadge></div>
                  <p className="text-xs text-muted-foreground">{t.customer} · {new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} · <span className="font-mono">{t.ref}</span></p>
                  <div className="flex justify-between text-xs"><span>Sale {money(t.amount, currency)} · {Math.round(t.rate * 100)}%</span><span className="font-bold">{money(commissionOf(t), currency)}</span></div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
              <span>{cur * PAGE + 1}–{cur * PAGE + rows.length} of {tx.length}</span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" aria-label="Previous page" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="px-2">Page {cur + 1} of {pages}</span>
                <Button size="icon" variant="outline" aria-label="Next page" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        ) : <EmptyState icon={Receipt} title="No transactions found" description="Try a different search, period or filter." compact />}
      </Panel>
    </div>
  );
}
