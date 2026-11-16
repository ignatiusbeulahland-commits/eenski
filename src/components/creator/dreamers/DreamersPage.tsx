import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTip, XAxis, YAxis } from "recharts";
import {
  ArrowDownRight, ArrowUpRight, Banknote, CalendarDays, Compass, Download, Filter, Info, Mail, Megaphone, Phone, Store, UserCheck, UserPlus, UsersRound, Clock, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { Switch } from "@/components/dashboard-ui/switch";
import { DialogActions } from "@/components/shared/DialogActions";
import { PageHeader, Panel, EmptyState, SearchInput, FilterSelect, StatusBadge } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { BrandIcon, brandArtwork, SemanticIcon } from "@/components/affiliate/BrandIcon";
import { naira } from "@/lib/affiliate/products";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { isEmail, type ItemKind } from "@/lib/creator/rules";
import { kindInfo } from "@/lib/creator/data";
import { productLinks } from "@/lib/creator/nav";
import {
  CHANNELS, KINDS, RANGE_OPTIONS, SAMPLE_PRODUCTS, allDreamers, channelLabel, dreamersCsv, emptyFilters, filterDreamers, initials, percentChange,
  previousRange, resolveRange, series, statusLabel, total, type Channel, type Dreamer, type DreamerFilters, type DreamerStatus, type Metric, type RangeKey,
} from "@/lib/creator/dreamers";
import { downloadCsv } from "../shared";
import { cn } from "@/lib/utils";

const COLORS: Record<Channel, string> = { dreamverse: "var(--cobalt)", self: "var(--sky)", offline: "var(--lime-press)" };
const ART: Record<Channel, string> = { dreamverse: brandArtwork.market, self: brandArtwork.megaphone, offline: brandArtwork.people };
const ICONS: Record<Channel, typeof Compass> = { dreamverse: Compass, self: Megaphone, offline: Store };
const HINT: Record<Channel, string> = {
  self: "People who came through your own links, socials and marketing.",
  dreamverse: "People who found you through Enski's Dreamverse discovery.",
  offline: "People you enrolled or added by hand, without an online payment.",
};
const compact = (n: number) => (n >= 1e6 ? `₦${(n / 1e6).toFixed(1)}m` : n >= 1e3 ? `₦${Math.round(n / 1e3)}k` : `₦${n}`);
const fmt = (m: Metric, n: number) => (m === "money" ? naira(n) : n.toLocaleString());
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const tipStyle = { background: "var(--card)", borderColor: "var(--line)", borderRadius: 12, color: "var(--foreground)", fontSize: 12 };

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={text} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition hover:bg-ice hover:text-cobalt focus-visible:outline-2 focus-visible:outline-cobalt"><Info className="h-3.5 w-3.5" /></button>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">{text}</TooltipContent>
    </Tooltip>
  );
}
function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-text">New</span>;
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", up ? "bg-lime-100 text-lime-text" : "bg-destructive/10 text-destructive")}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{Math.abs(value)}%
    </span>
  );
}
function Spark({ data, k, color, id }: { data: Record<string, number | string>[]; k: string; color: string; id: string }) {
  return (
    <div className="h-12 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
          <Area type="monotone" dataKey={k} stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function MetricCard({ art, label, value, hint, children, tone = "bg-ice text-cobalt" }: { art: string; label: string; value: string; hint: string; children?: ReactNode; tone?: string }) {
  return (
    <div className="stat-card surface relative flex min-w-0 flex-col gap-3 overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <BrandIcon src={art} className="stat-art -ml-1 h-11 w-11" />
        <InfoTip text={hint} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-xl font-bold tabular-nums text-ink sm:text-2xl">{value}</p>
      </div>
      {children}
    </div>
  );
}

export function DreamersPage() {
  const { state, update } = useCreator();
  const [withSample, setWithSample] = useState(true);
  const [metric, setMetric] = useState<Metric>("people");
  const [rangeKey, setRangeKey] = useState<RangeKey>("30");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [trafficKey, setTrafficKey] = useState<RangeKey>("90");
  const [hidden, setHidden] = useState<Channel[]>([]);
  const [tab, setTab] = useState<"active" | "waitlist">("active");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<DreamerFilters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [profile, setProfile] = useState<Dreamer | null>(null);
  const [now] = useState(() => Date.now());

  const dreamers = useMemo(() => allDreamers(state, withSample, now), [state, withSample, now]);
  const range = resolveRange(rangeKey, dreamers, now, custom);
  const prev = previousRange(range);
  const points = useMemo(() => series(dreamers, metric, range), [dreamers, metric, range.start, range.end]);
  const tRange = resolveRange(trafficKey, dreamers, now, custom);
  const tPoints = useMemo(() => series(dreamers, metric, tRange), [dreamers, metric, tRange.start, tRange.end]);
  const cur = total(dreamers, metric, range);
  const change = range.comparable ? percentChange(cur, total(dreamers, metric, prev)) : undefined;
  const peopleInRange = total(dreamers, "people", range);

  const items = state.items.filter((i) => i.status !== "archived");
  const productCount = (k: ItemKind) => items.filter((i) => i.kind === k).length || (withSample ? SAMPLE_PRODUCTS.filter((p) => p.kind === k).length : 0);

  const pool = dreamers.filter((d) => (tab === "waitlist" ? d.status === "waitlisted" : d.status !== "waitlisted"));
  const shown = filterDreamers(pool, q, filters);
  const activeCount = dreamers.filter((d) => d.status !== "waitlisted").length;
  const waitCount = dreamers.length - activeCount;
  const filterCount = (filters.channel !== "all" ? 1 : 0) + filters.kinds.length + filters.statuses.length + (filters.from || filters.to ? 1 : 0);

  const activate = (d: Dreamer) => {
    if (d.customerId) update((s) => ({ customers: s.customers.map((c) => (c.id === d.customerId ? { ...c, status: "active" as const } : c)), activity: [...s.activity, activityEntry(`${d.name} moved off the waitlist`)] }));
    else update((s) => ({
      customers: [...s.customers, { id: crypto.randomUUID(), name: d.name, email: d.email, phone: d.phone, source: "manual" as const, date: d.joined, channel: d.channel, status: "active" as const, interested: d.interested, itemIds: [], sampleId: d.id }],
      activity: [...s.activity, activityEntry(`${d.name} moved off the waitlist`)],
    }));
    setProfile(null);
    toast.success(`${d.name} is now an active subscriber`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-w-0">
        <PageHeader
          eyebrow="Your audience"
          title="Dreamers & subscribers"
          description="See who's discovering your work, where they come from, and manage your learner community."
          actions={<Button onClick={() => setEnrolOpen(true)}><UserPlus />Enroll learner</Button>}
        />

        {/* Controls */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div role="radiogroup" aria-label="Show figures as" className="inline-flex w-full rounded-full border border-line bg-card p-1 sm:w-auto">
            {(["money", "people"] as Metric[]).map((m) => (
              <button key={m} role="radio" aria-checked={metric === m} onClick={() => setMetric(m)}
                className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 sm:flex-none", metric === m ? "bg-cobalt text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-cobalt")}>
                {m === "money" ? <Banknote className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}{m === "money" ? "Money" : "People"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Date range" value={rangeKey} onChange={(v) => setRangeKey(v as RangeKey)} options={RANGE_OPTIONS} className="flex-1 sm:w-44 sm:flex-none" />
            {rangeKey === "custom" && (
              <div className="flex w-full gap-2 sm:w-auto">
                <Input type="date" aria-label="From" value={custom.from} max={custom.to || undefined} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} className="min-w-0 flex-1 bg-card" />
                <Input type="date" aria-label="To" value={custom.to} min={custom.from || undefined} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} className="min-w-0 flex-1 bg-card" />
              </div>
            )}
            <label className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Switch checked={withSample} onCheckedChange={setWithSample} aria-label="Show sample dreamers" />Sample data
            </label>
          </div>
        </div>
        {rangeKey === "custom" && !(custom.from && custom.to) && <p className="-mt-2 mb-4 text-xs text-muted-foreground">Pick a start and end date — showing all time until then.</p>}

        {/* Overview */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="surface relative overflow-hidden p-5 sm:p-6" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  {metric === "people" ? "Total dreamers / subscribers" : "Total revenue"}
                  <InfoTip text={metric === "people" ? "New active and pending subscribers who joined in this period. Waitlisted people aren't counted." : "Money from sales in this period, after refunds. Offline enrolments add no revenue."} />
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-ink sm:text-4xl">{fmt(metric, cur)}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {change !== undefined ? <><Change value={change} /> vs previous period</> : "Across all time"}
                  {metric === "money" && <span>· {peopleInRange.toLocaleString()} dreamers</span>}
                </p>
              </div>
              <BrandIcon src={metric === "people" ? brandArtwork.people : brandArtwork.cash} className="h-14 w-14 drop-shadow-md" />
            </div>
            <div className="mt-4 h-40 w-full sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="ov" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cobalt)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--cobalt)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis width={metric === "money" ? 48 : 28} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(v) => (metric === "money" ? compact(Number(v)) : String(v))} />
                  <ChartTip contentStyle={tipStyle} formatter={(v) => [fmt(metric, Number(v)), metric === "money" ? "Revenue" : "New subscribers"]} />
                  <Area type="monotone" dataKey="total" stroke="var(--cobalt)" strokeWidth={2.5} fill="url(#ov)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
            {CHANNELS.map((c, i) => (
              <div key={c} className={cn(i === 2 && "col-span-2 lg:col-span-1 xl:col-span-2")}>
                <MetricCard art={ART[c]} label={metric === "money" ? (c === "offline" ? "Offline enrolments" : `Revenue · ${channelLabel[c]}`) : channelLabel[c]}
                  value={metric === "money" && c === "offline" ? `${total(dreamers, "people", range, c)} · no payment` : fmt(metric, total(dreamers, metric, range, c))} hint={HINT[c]}
                  tone={c === "offline" ? "bg-lime text-midnight" : c === "self" ? "bg-ice text-sky-text" : "bg-ice text-cobalt"}>
                  <Spark data={metric === "money" && c === "offline" ? series(dreamers, "people", range) as never : points as never} k={c} color={COLORS[c]} id={`sp-${c}`} />
                </MetricCard>
              </div>
            ))}
          </div>
        </div>

        {/* Product stats */}
        <h2 className="mb-3 mt-8 flex items-center gap-2.5 text-[15px] font-bold"><span className="lime-tick" aria-hidden="true" />Your offerings</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {productLinks.map((p, i) => {
            const k = KINDS[i]!;
            return (
              <Link key={p.to} to={p.to} className={cn("surface group flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-md focus-visible:outline-2 focus-visible:outline-cobalt", i === 4 && "col-span-2 sm:col-span-1")}>
                <SemanticIcon icon={p.icon} className="h-10 w-10 transition-transform group-hover:-translate-y-0.5" fallbackClassName="h-5 w-5 text-cobalt" />
                <span className="min-w-0"><span className="block text-xl font-bold tabular-nums text-ink">{productCount(k)}</span><span className="block truncate text-xs text-muted-foreground">{k === "coaching" ? "Consultations / coaching" : kindInfo[k].plural}</span></span>
              </Link>
            );
          })}
        </div>

        {/* Traffic channels */}
        <Panel className="mt-8" title="Traffic channels" description={metric === "people" ? "New subscribers per channel over time." : "Sales per channel, in approximate naira after refunds."}
          actions={<FilterSelect label="Traffic date range" value={trafficKey} onChange={(v) => setTrafficKey(v as RangeKey)} options={RANGE_OPTIONS.filter(([k]) => k !== "custom")} className="w-40" />}>
          <div className="px-2 pb-4 pt-4 sm:px-5">
            <div className="mb-3 flex flex-wrap gap-2 px-2 sm:px-0" role="group" aria-label="Show channels">
              {CHANNELS.map((c) => {
                const off = hidden.includes(c);
                return (
                  <button key={c} aria-pressed={!off} onClick={() => setHidden((h) => (off ? h.filter((x) => x !== c) : h.length === 2 ? h : [...h, c]))}
                    className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition", off ? "border-line text-muted-foreground line-through opacity-60" : "border-cobalt-100 bg-card text-ink")}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[c] }} />{channelLabel[c]}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div className="h-64 w-full sm:h-72" aria-label="Traffic channels chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tPoints} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} />
                  <YAxis width={metric === "money" ? 48 : 28} allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => (metric === "money" ? compact(Number(v)) : String(v))} />
                  <ChartTip contentStyle={tipStyle} formatter={(v, n) => [fmt(metric, Number(v)), channelLabel[n as Channel] ?? n]} />
                  {CHANNELS.filter((c) => !hidden.includes(c)).map((c) => (
                    <Line key={c} type="monotone" dataKey={c} name={c} stroke={COLORS[c]} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ChannelDonut data={CHANNELS.map((c) => ({ c, value: tPoints.reduce((n, pt) => n + Number((pt as Record<string, unknown>)[c] ?? 0), 0) }))} fmt={(v) => fmt(metric, v)} />
            </div>
          </div>
        </Panel>

        {/* Management */}
        <section className="mt-8" aria-label="Subscriber management">
          <div role="tablist" aria-label="Subscriber lists" className="mb-4 flex gap-1 border-b border-line">
            {([["active", "Active subscribers", activeCount], ["waitlist", "Waitlist", waitCount]] as const).map(([k, l, n]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={cn("-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition sm:px-4", tab === k ? "border-cobalt text-cobalt" : "border-transparent text-muted-foreground hover:text-ink")}>
                {l}<span className={cn("rounded-full px-2 py-0.5 text-xs tabular-nums", tab === k ? "bg-cobalt text-primary-foreground" : "bg-muted")}>{n}</span>
              </button>
            ))}
          </div>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput value={q} onChange={setQ} placeholder="Search dreamers and subscribers..." />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button variant="quiet" onClick={() => setFilterOpen(true)}><Filter />Filter{filterCount > 0 && <span className="rounded-full bg-cobalt px-1.5 text-xs text-primary-foreground">{filterCount}</span>}</Button>
              <Button variant="outline" disabled={!shown.length} onClick={() => { downloadCsv(`enski-${tab === "waitlist" ? "waitlist" : "subscribers"}.csv`, dreamersCsv(shown)); toast.success(`Downloaded ${shown.length} record${shown.length === 1 ? "" : "s"}`); }}><Download />Download history</Button>
            </div>
          </div>
          {shown.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.slice(0, 60).map((d) => <DreamerCard key={d.id} d={d} onView={() => setProfile(d)} onActivate={() => activate(d)} />)}
            </div>
          ) : (
            <div className="surface">
              <EmptyState icon={tab === "waitlist" ? Clock : UserCheck}
                title={pool.length ? "No one matches" : tab === "waitlist" ? "No one on your waitlist" : "No subscribers yet"}
                description={pool.length ? "Try another search or clear your filters." : tab === "waitlist" ? "People who ask to be told when an offering opens will appear here." : "Enroll a learner or share your products to grow your community."}
                action={pool.length ? <Button variant="quiet" onClick={() => { setQ(""); setFilters(emptyFilters); }}>Clear search and filters</Button> : <Button onClick={() => setEnrolOpen(true)}><UserPlus />Enroll learner</Button>} compact />
            </div>
          )}
          {shown.length > 60 && <p className="mt-3 text-center text-xs text-muted-foreground">Showing 60 of {shown.length}. Search or filter to narrow down, or download the full list.</p>}
        </section>

        <FilterDialog open={filterOpen} onOpenChange={setFilterOpen} value={filters} onApply={(f) => { setFilters(f); setFilterOpen(false); }} />
        <EnrolDialog open={enrolOpen} onOpenChange={setEnrolOpen} />
        <ProfileDialog d={profile} onClose={() => setProfile(null)} onActivate={activate} />
      </div>
    </TooltipProvider>
  );
}

function ChannelDonut({ data, fmt: f }: { data: { c: Channel; value: number }[]; fmt: (v: number) => string }) {
  const sum = data.reduce((n, d) => n + d.value, 0);
  if (!sum) return <p className="text-center text-sm text-muted-foreground">No activity in this period yet.</p>;
  return (
    <div>
      <div className="relative mx-auto h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="c" innerRadius="62%" outerRadius="96%" paddingAngle={2} cornerRadius={6} stroke="var(--card)" strokeWidth={2} animationDuration={600}>
              {data.map((d) => <Cell key={d.c} fill={COLORS[d.c]} />)}
            </Pie>
            <ChartTip contentStyle={tipStyle} formatter={(v, n) => [`${f(Number(v))} · ${Math.round((Number(v) / sum) * 100)}%`, channelLabel[n as Channel] ?? n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p><p className="text-base font-extrabold tabular-nums">{f(sum)}</p></div></div>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {data.map((d) => <li key={d.c} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.c] }} />{channelLabel[d.c]}</span><span className="tabular-nums text-muted-foreground">{Math.round((d.value / sum) * 100)}%</span></li>)}
      </ul>
    </div>
  );
}

function ChannelBadge({ c }: { c: Channel }) {
  const Icon = ICONS[c];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", c === "offline" ? "bg-lime-100 text-lime-text" : c === "self" ? "bg-ice text-sky-text" : "bg-ice text-cobalt")}><Icon className="h-3 w-3" />{channelLabel[c]}</span>;
}
function DreamerCard({ d, onView, onActivate }: { d: Dreamer; onView: () => void; onActivate: () => void }) {
  const n = d.purchases.length;
  return (
    <article className="surface flex min-w-0 flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cobalt text-sm font-bold text-primary-foreground ring-4 ring-ice" aria-hidden="true">{initials(d.name)}</span>
        <div className="min-w-0">
          <h3 className="truncate font-bold text-ink">{d.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">{d.status === "waitlisted" ? "Interested" : `${n} product${n === 1 ? "" : "s"}`}</span>
            <ChannelBadge c={d.channel} />
            {d.status === "pending" && <StatusBadge tone="pending">Pending</StatusBadge>}
          </div>
        </div>
      </div>
      <dl className="space-y-1.5 text-sm text-muted-foreground">
        {d.interested && d.status === "waitlisted" && <div className="truncate font-medium text-ink">{d.interested}</div>}
        <div className="flex min-w-0 items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /><dd className="truncate">{d.email}</dd></div>
        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /><dd>{d.phone || "No phone"}</dd></div>
        <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 shrink-0" /><dd>{when(d.joined)}</dd></div>
      </dl>
      <div className="mt-auto flex gap-2">
        <Button variant="soft" className="flex-1" onClick={onView}>View profile</Button>
        {d.status === "waitlisted" && <Button className="flex-1" onClick={onActivate}>Make active</Button>}
      </div>
    </article>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition", on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-100 hover:text-cobalt")}>{children}</button>;
}
function FilterDialog({ open, onOpenChange, value, onApply }: { open: boolean; onOpenChange: (v: boolean) => void; value: DreamerFilters; onApply: (f: DreamerFilters) => void }) {
  const [f, setF] = useState(value);
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
  return (
    <Dialog open={open} onOpenChange={(v) => { if (v) setF(value); onOpenChange(v); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Filter dreamers</DialogTitle><DialogDescription>Narrow the list by where people came from, what they joined and when.</DialogDescription></DialogHeader>
        <div className="space-y-5">
          <fieldset><legend className="mb-2 text-sm font-semibold">Acquisition channel</legend><div className="flex flex-wrap gap-2">
            <Chip on={f.channel === "all"} onClick={() => setF({ ...f, channel: "all" })}>All</Chip>
            {CHANNELS.map((c) => <Chip key={c} on={f.channel === c} onClick={() => setF({ ...f, channel: c })}>{channelLabel[c]}</Chip>)}
          </div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-semibold">Product type</legend><div className="flex flex-wrap gap-2">
            {KINDS.map((k) => <Chip key={k} on={f.kinds.includes(k)} onClick={() => setF({ ...f, kinds: toggle(f.kinds, k) })}>{k === "coaching" ? "Consultations / coaching" : kindInfo[k].plural}</Chip>)}
          </div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-semibold">Subscriber status</legend><div className="flex flex-wrap gap-2">
            {(["active", "pending", "waitlisted"] as DreamerStatus[]).map((s) => <Chip key={s} on={f.statuses.includes(s)} onClick={() => setF({ ...f, statuses: toggle(f.statuses, s) })}>{statusLabel[s]}</Chip>)}
          </div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-semibold">Date joined</legend><div className="grid grid-cols-2 gap-2">
            <Input type="date" aria-label="Joined from" value={f.from} max={f.to || undefined} onChange={(e) => setF({ ...f, from: e.target.value })} />
            <Input type="date" aria-label="Joined to" value={f.to} min={f.from || undefined} onChange={(e) => setF({ ...f, to: e.target.value })} />
          </div></fieldset>
        </div>
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={() => onApply(emptyFilters)}><X />Clear filters</Button>
          <Button onClick={() => onApply(f)}>Apply filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const blank = { first: "", last: "", email: "", phone: "", product: "", type: "free" as "free" | "paid" | "offline", payment: "na" as "paid" | "unpaid" | "na", notes: "" };
function EnrolDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { state, update } = useCreator();
  const [v, setV] = useState(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof blank, string>>>({});
  const items = state.items.filter((i) => i.status !== "archived");
  const options: [string, string][] = [...items.map((i) => [i.id, i.title] as [string, string]), ...SAMPLE_PRODUCTS.map((p, i) => [`sample:${i}`, `${p.title} (sample)`] as [string, string])];
  const set = (k: keyof typeof blank, x: string) => setV((s) => ({ ...s, [k]: x }));
  const submit = () => {
    const e: Partial<Record<keyof typeof blank, string>> = {};
    if (!v.first.trim()) e.first = "Enter a first name.";
    if (!v.last.trim()) e.last = "Enter a last name.";
    if (!isEmail(v.email)) e.email = "Enter a valid email address.";
    else if (state.customers.some((c) => c.email.toLowerCase() === v.email.trim().toLowerCase())) e.email = "This email is already one of your subscribers.";
    if (v.phone && v.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a full phone number, or leave it blank.";
    if (!v.product) e.product = "Choose a product.";
    if (v.type === "paid" && v.payment === "na") e.payment = "Paid enrolments need a payment status.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const item = items.find((i) => i.id === v.product);
    const price = item?.price ?? SAMPLE_PRODUCTS[Number(v.product.slice(7))]?.price ?? 0;
    const name = `${v.first.trim()} ${v.last.trim()}`;
    update((s) => ({
      customers: [...s.customers, {
        id: crypto.randomUUID(), name, email: v.email.trim().toLowerCase(), phone: v.phone.trim(), source: "manual" as const, date: new Date().toISOString(),
        channel: v.type === "offline" ? "offline" as const : "self" as const, status: v.type === "paid" && v.payment === "unpaid" ? "pending" as const : "active" as const,
        itemIds: [v.product], enrolType: v.type, payment: v.payment, amount: v.type === "paid" && v.payment === "paid" ? price : 0, notes: v.notes.trim() || undefined,
      }],
      activity: [...s.activity, activityEntry(`Enrolled ${name}`)],
    }));
    toast.success(`${name} enrolled`, { description: "Your figures and lists are updated." });
    setV(blank);
    onOpenChange(false);
  };
  const err = (k: keyof typeof blank) => errors[k] && <p role="alert" className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setErrors({}); onOpenChange(o); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Enroll learner</DialogTitle><DialogDescription>Add someone to one of your offerings. No email or payment is sent.</DialogDescription></DialogHeader>
        <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="en-first" label="First name"><Input id="en-first" value={v.first} onChange={(e) => set("first", e.target.value)} aria-invalid={!!errors.first} />{err("first")}</Field>
            <Field id="en-last" label="Last name"><Input id="en-last" value={v.last} onChange={(e) => set("last", e.target.value)} aria-invalid={!!errors.last} />{err("last")}</Field>
          </div>
          <Field id="en-email" label="Email address"><Input id="en-email" type="email" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />{err("email")}</Field>
          <Field id="en-phone" label="Phone number"><Input id="en-phone" type="tel" placeholder="+234 801 234 5678" value={v.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />{err("phone")}</Field>
          <div><p className="mb-1.5 text-sm font-medium">Select product</p><FilterSelect label="Select product" value={v.product || "none"} onChange={(x) => set("product", x === "none" ? "" : x)} options={[["none", "Choose a product"], ...options]} className="w-full sm:w-full" />{err("product")}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="mb-1.5 text-sm font-medium">Enrollment type</p><FilterSelect label="Enrollment type" value={v.type} onChange={(x) => setV((s) => ({ ...s, type: x as typeof s.type, payment: x === "paid" ? (s.payment === "na" ? "paid" : s.payment) : "na" }))} options={[["free", "Free"], ["paid", "Paid"], ["offline", "Offline"]]} className="w-full sm:w-full" /></div>
            <div><p className="mb-1.5 text-sm font-medium">Payment status</p><FilterSelect label="Payment status" value={v.payment} onChange={(x) => set("payment", x)} options={[["paid", "Paid"], ["unpaid", "Unpaid"], ["na", "Not applicable"]]} className="w-full sm:w-full" />{err("payment")}</div>
          </div>
          <Field id="en-notes" label="Notes (optional)"><Textarea id="en-notes" rows={3} value={v.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <DialogActions><Button type="submit"><UserPlus />Enroll learner</Button></DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileDialog({ d, onClose, onActivate }: { d: Dreamer | null; onClose: () => void; onActivate: (d: Dreamer) => void }) {
  return (
    <Dialog open={!!d} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        {d && (<>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cobalt text-lg font-bold text-primary-foreground ring-4 ring-ice">{initials(d.name)}</span>
              <div className="min-w-0 text-left"><DialogTitle className="truncate">{d.name}</DialogTitle><DialogDescription>{statusLabel[d.status]} · joined {when(d.joined)}{d.sample ? " · sample" : ""}</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="flex flex-wrap gap-2"><ChannelBadge c={d.channel} /></div>
          <dl className="grid gap-3 rounded-xl bg-ice/60 p-4 text-sm sm:grid-cols-2">
            <div className="min-w-0"><dt className="text-xs text-muted-foreground">Email</dt><dd className="break-all font-medium">{d.email}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Phone</dt><dd className="font-medium">{d.phone || "Not given"}</dd></div>
          </dl>
          <div>
            <h3 className="mb-2 text-sm font-bold">{d.status === "waitlisted" ? "Interested in" : "Products"}</h3>
            {d.status === "waitlisted" ? <p className="text-sm">{d.interested ?? "Any upcoming offering"}</p> : d.purchases.length ? (
              <ul className="divide-y rounded-xl border border-line">{d.purchases.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium">{p.title}</span><span className="text-xs text-muted-foreground">{kindInfo[p.kind].label}</span></span><span className="shrink-0 font-semibold tabular-nums">{p.amount ? naira(p.amount) : "No payment"}</span></li>
              ))}</ul>
            ) : <p className="text-sm text-muted-foreground">No products yet.</p>}
          </div>
          {d.notes && <div><h3 className="mb-1 text-sm font-bold">Notes</h3><p className="whitespace-pre-wrap text-sm text-muted-foreground">{d.notes}</p></div>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="quiet" onClick={onClose}>Close</Button>
            {d.status === "waitlisted" && <Button onClick={() => onActivate(d)}><UserCheck />Move to active</Button>}
          </div>
        </>)}
      </DialogContent>
    </Dialog>
  );
}
