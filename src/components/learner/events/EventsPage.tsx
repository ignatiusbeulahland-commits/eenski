import { Link } from "@tanstack/react-router";
import { Briefcase, CalendarCheck, CalendarDays, CalendarRange, ChevronRight, Code2, LayoutGrid, Palette, PenTool, TrendingUp, X, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, PageHeader, SearchInput, StatusBadge } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { categories, type Category } from "@/lib/affiliate/products";
import { events, featuredEvents, isPast, publishedEvents, type LearnerEvent } from "@/lib/learner/catalog";
import { activeFilterChips, dateOptions, defaultEventFilters, filterEvents, formatOptions, groupUpcoming, priceOptions, type DateFilter, type EventFilters, type FormatFilter, type PriceFilter } from "@/lib/learner/eventFilters";
import { registration } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { dayIn, timeIn, useViewerTimeZone, zoneLabel } from "@/lib/learner/timezone";
import { cn } from "@/lib/utils";
import { EventCalendar } from "../EventCalendar";
import { EventCard } from "../shared";
import { FeaturedEvents } from "./FeaturedEvents";

const TOPIC_ICON: Record<Category, LucideIcon> = { Tech: Code2, Business: TrendingUp, Career: Briefcase, Design: PenTool, Creativity: Palette };
const TOPIC_LINE: Record<Category, string> = {
  Tech: "Build with AI and code",
  Business: "Earn from what you know",
  Career: "Get hired and grow",
  Design: "Design that gets noticed",
  Creativity: "Create and grow an audience",
};

export function EventsPage() {
  const { state } = useLearner();
  const tz = useViewerTimeZone();
  const [f, setF] = useState<EventFilters>(defaultEventFilters);
  const set = <K extends keyof EventFilters>(k: K, v: EventFilters[K]) => setF((cur) => ({ ...cur, [k]: v }));
  const [sort, setSort] = useState("soonest");
  const [layout, setLayout] = useState<"grid" | "calendar">("grid");
  const [tab, setTab] = useState("upcoming");
  const featured = useMemo(() => featuredEvents(), []);
  const order = (list: LearnerEvent[], past = false) =>
    [...list].sort((a, b) => (sort === "price" ? a.price - b.price || a.start.localeCompare(b.start) : sort === "latest" !== past ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start)));
  const filter = (list: LearnerEvent[]) => filterEvents(list, f, new Date(), tz);
  const upcoming = useMemo(() => order(filter(publishedEvents.filter((e) => !isPast(e)))), [f, sort, tz]);
  const past = useMemo(() => order(filter(publishedEvents.filter((e) => isPast(e))), true), [f, sort, tz]);
  const mine = useMemo(() => order(filter(events.filter((e) => registration(state, e.id)))), [f, sort, tz, state.registrations]);
  const groups = useMemo(() => (sort === "soonest" ? groupUpcoming(upcoming, new Date(), tz) : [{ key: "all", label: "", events: upcoming }]), [upcoming, sort, tz]);
  const chips = activeFilterChips(f);
  const clear = () => setF(defaultEventFilters);
  const clearOne = (k: keyof EventFilters) => setF((cur) => ({ ...cur, [k]: defaultEventFilters[k], ...(k === "date" ? { on: "" } : {}) }));
  const topicCount = (t: string) => filterEvents(publishedEvents.filter((e) => !isPast(e)), { ...f, topic: t }, new Date(), tz).length;
  const grid = (list: LearnerEvent[]) => <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">{list.map((e) => <EventCard key={e.id} e={e} />)}</div>;
  const noMatch = <div className="surface"><EmptyState icon={CalendarDays} title="No events match" description="Try a different search or clear your filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} /></div>;
  const pickTopic = (t: string) => { set("topic", f.topic === t ? "all" : t); setTab("upcoming"); };

  return (
    <div>
      <PageHeader eyebrow="Events" title="Learn live, together" description="Workshops, live sessions and meetups hosted by Enski creators. Save a seat in a few taps." />
      <FeaturedEvents list={featured} />

      <section aria-labelledby="topics-title" className="mb-8">
        <h2 id="topics-title" className="mb-3 flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />Browse by topic</h2>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const Icon = TOPIC_ICON[c];
            const on = f.topic === c;
            return (
              <li key={c}>
                <button type="button" onClick={() => pickTopic(c)} aria-pressed={on} className={cn("topic-tile group flex h-full w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-soft motion-reduce:hover:translate-y-0 sm:p-4", on ? "border-cobalt bg-cobalt text-primary-foreground" : "bg-card hover:border-cobalt")}>
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", on ? "bg-lime text-midnight" : "bg-ice text-cobalt")}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold">{c}</span>
                    <span className={cn("block truncate text-xs", on ? "text-primary-foreground/80" : "text-muted-foreground")}>{TOPIC_LINE[c]}</span>
                    <span className={cn("block text-xs font-bold tabular-nums", on ? "text-lime" : "text-cobalt")}>{topicCount(c)} upcoming</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Filter events" className="surface mb-5 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 lg:w-72"><span className="mb-1 block text-xs font-bold text-muted-foreground" aria-hidden="true">Search</span><SearchInput value={f.q} onChange={(v) => set("q", v)} placeholder="Search events or hosts" /></div>
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
            <LabeledSelect label="Date" value={f.date} onChange={(v) => setF((cur) => ({ ...cur, date: v as DateFilter, on: v === "on" ? cur.on : "" }))} options={dateOptions} />
            <LabeledSelect label="Price" value={f.price} onChange={(v) => set("price", v as PriceFilter)} options={priceOptions} />
            <LabeledSelect label="Format" value={f.format} onChange={(v) => set("format", v as FormatFilter)} options={formatOptions} />
            <LabeledSelect label="Sort by" value={sort} onChange={setSort} options={[["soonest", "Date: soonest"], ["latest", "Date: latest"], ["price", "Price: low to high"]]} />
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-full border bg-soft p-1 lg:inline-grid" role="group" aria-label="View events as">
            {([["grid", "Grid", LayoutGrid], ["calendar", "Calendar", CalendarRange]] as const).map(([v, label, Icon]) => (
              <button key={v} type="button" onClick={() => setLayout(v)} aria-pressed={layout === v} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors", layout === v ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}>
                <Icon className="h-4 w-4" aria-hidden="true" />{label}
              </button>
            ))}
          </div>
        </div>
        {f.date === "on" && (
          <label className="mt-3 block max-w-xs">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">Event date</span>
            <Input type="date" value={f.on} onChange={(e) => set("on", e.target.value)} className="bg-card" />
          </label>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-live="polite">
          <p className="text-sm font-semibold text-muted-foreground">
            {upcoming.length} upcoming {upcoming.length === 1 ? "event" : "events"}
            <span className="font-normal"> · times in {zoneLabel(new Date(), tz)}</span>
          </p>
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={() => clearOne(c.key)} className="inline-flex h-8 items-center gap-1 rounded-full border border-cobalt/30 bg-ice px-3 text-[13px] font-bold text-cobalt transition-colors hover:border-cobalt" aria-label={`Remove filter: ${c.label}`}>
              {c.label}<X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
          {chips.length > 1 && <button type="button" onClick={clear} className="h-8 rounded-full px-2 text-[13px] font-bold text-cobalt underline-offset-2 hover:underline">Clear all</button>}
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5 h-auto flex-wrap">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="mine">My events ({mine.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {layout === "calendar" ? (
            <EventCalendar events={upcoming} empty={noMatch} />
          ) : upcoming.length ? (
            <div className="space-y-8">
              {groups.map((g) => (
                <section key={g.key} aria-labelledby={g.label ? `group-${g.key}` : undefined}>
                  {g.label && (
                    <h3 id={`group-${g.key}`} className="mb-3 flex items-baseline gap-2 text-base font-extrabold">
                      <span className="lime-tick" aria-hidden="true" />{g.label}
                      <span className="text-sm font-semibold text-muted-foreground">{g.events.length} {g.events.length === 1 ? "event" : "events"}</span>
                    </h3>
                  )}
                  {grid(g.events)}
                </section>
              ))}
            </div>
          ) : noMatch}
        </TabsContent>
        <TabsContent value="mine">
          {mine.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">{mine.map((e) => <MyEventRow key={e.id} e={e} tz={tz} />)}</ul>
          ) : chips.length && state.registrations.length ? noMatch : (
            <div className="surface"><EmptyState icon={CalendarCheck} title="You haven't registered for any events" description="Find a session that interests you and save your seat. Your tickets will be listed here." action={<Button variant="outline" onClick={() => setTab("upcoming")}>Browse upcoming events</Button>} /></div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {past.length ? <ul className="grid gap-3 lg:grid-cols-2">{past.map((e) => <PastEventRow key={e.id} e={e} tz={tz} />)}</ul> : noMatch}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly (readonly [string, string])[] }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-xs font-bold text-muted-foreground" aria-hidden="true">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-card" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function RowShell({ e, children, dim }: { e: LearnerEvent; children: React.ReactNode; dim?: boolean }) {
  return (
    <li className="surface group relative flex min-w-0 gap-3 overflow-hidden p-3 transition-shadow hover:shadow-lift has-[a:focus-visible]:shadow-[var(--focus-ring)] sm:gap-4">
      <img src={e.image} alt="" width={160} height={120} loading="lazy" className={cn("h-24 w-28 shrink-0 rounded-xl object-cover sm:h-28 sm:w-36", dim && "grayscale-[50%]")} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
    </li>
  );
}

function MyEventRow({ e, tz }: { e: LearnerEvent; tz: string }) {
  const { state } = useLearner();
  const reg = registration(state, e.id)!;
  const ended = isPast(e);
  return (
    <RowShell e={e} dim={ended}>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-sky-text">{dayIn(e.start, tz)} · {timeIn(e.start, tz)}</p>
      <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
        <Link to="/learner/events/$eventId" params={{ eventId: e.id }} className="after:absolute after:inset-0 focus-visible:outline-none">{e.title}</Link>
      </h3>
      {reg.reference && <p className="font-mono text-xs font-bold tabular-nums text-muted-foreground">{reg.reference}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <StatusBadge tone={reg.attendedAt ? "success" : ended ? "neutral" : "success"}>{reg.attendedAt ? "Attended" : ended ? "Ended" : `${reg.tickets} ${reg.tickets > 1 ? "tickets" : "ticket"} · confirmed`}</StatusBadge>
        <span className="inline-flex items-center text-[13px] font-extrabold text-cobalt" aria-hidden="true">View ticket<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </RowShell>
  );
}

function PastEventRow({ e, tz }: { e: LearnerEvent; tz: string }) {
  const { state } = useLearner();
  const reg = registration(state, e.id);
  return (
    <RowShell e={e} dim>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{dayIn(e.start, tz)} · {e.mode === "Online" ? "Online" : e.venue}</p>
      <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
        <Link to="/learner/events/$eventId" params={{ eventId: e.id }} className="after:absolute after:inset-0 focus-visible:outline-none">{e.title}</Link>
      </h3>
      {e.recap && <p className="line-clamp-2 text-xs text-muted-foreground">{e.recap}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <StatusBadge tone={reg?.attendedAt ? "success" : "neutral"}>{reg?.attendedAt ? "You attended" : "Ended"}</StatusBadge>
        <span className="inline-flex items-center text-[13px] font-extrabold text-cobalt" aria-hidden="true">Read recap<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </RowShell>
  );
}
