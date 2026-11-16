import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { Link, useNavigate } from "@tanstack/react-router";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { Award, CalendarCheck, CalendarDays, CalendarPlus, CalendarRange, CheckCircle2, Clock, Eye, Globe2, Hourglass, LayoutGrid, MapPin, Share2, ShoppingCart, Ticket, Video, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { EVENT_TZ, dayIn, localDateTime, sameAsEventTime, timeIn, useViewerTimeZone, watDateTime, zoneLabel, zonePlace } from "@/lib/learner/timezone";
import { Input } from "@/components/dashboard-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { activeFilterChips, dateOptions, defaultEventFilters, filterEvents, formatOptions, priceOptions, type DateFilter, type EventFilters, type FormatFilter, type PriceFilter } from "@/lib/learner/eventFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { EmptyState, PageHeader, Panel, SearchInput, StatusBadge } from "@/components/affiliate/ui";
import { categories } from "@/lib/affiliate/products";
import { eventActionLabel, eventLength, events, findEvent, isPast, isPreviewEvent, publishedEvents, startsIn, type LearnerEvent } from "@/lib/learner/catalog";
import { downloadEventIcs } from "@/lib/learner/ics";
import { addToCart, canAddToCart, cancelRegistration, markAttended, registerFree, registration } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { EventCalendar } from "./EventCalendar";
import { EventCard, LearnerNotFound, PerkStrip, PreviewBanner, PreviewSwitch, WishlistButton, price } from "./shared";

export function EventsPage() {
  const { state } = useLearner();
  const tz = useViewerTimeZone();
  const [f, setF] = useState<EventFilters>(defaultEventFilters);
  const set = <K extends keyof EventFilters>(k: K, v: EventFilters[K]) => setF((cur) => ({ ...cur, [k]: v }));
  const [sort, setSort] = useState("soonest");
  const filter = (list: LearnerEvent[]) =>
    filterEvents(list, f, new Date(), tz).sort((a, b) => (sort === "soonest" ? a.start.localeCompare(b.start) : sort === "latest" ? b.start.localeCompare(a.start) : a.price - b.price));
  const upcoming = useMemo(() => filter(publishedEvents.filter((e) => !isPast(e))), [f, sort, tz]);
  const past = useMemo(() => filter(publishedEvents.filter((e) => isPast(e))), [f, sort, tz]);
  const mine = useMemo(() => filter(events.filter((e) => registration(state, e.id))), [f, sort, tz, state.registrations]);
  const allPreviews = useMemo(() => events.filter((e) => isPreviewEvent(e)), []);
  const previews = useMemo(() => filter(allPreviews), [f, sort, tz, allPreviews]);
  const [show, setShow] = useState<"live" | "preview">("live");
  const [layout, setLayout] = useState<"grid" | "calendar">("grid");
  const upcomingPreviews = useMemo(() => previews.filter((e) => !isPast(e)), [previews]);
  const chips = activeFilterChips(f);
  const filtered = chips.length > 0;
  const clear = () => setF(defaultEventFilters);
  const clearOne = (k: keyof EventFilters) => setF((cur) => ({ ...cur, [k]: defaultEventFilters[k], ...(k === "date" ? { on: "" } : {}) }));
  const base = show === "preview" ? allPreviews : publishedEvents;
  const topicCount = (t: string) => filterEvents(base, { ...f, topic: t }, new Date(), tz).length;
  const shown = show === "preview" ? (layout === "calendar" ? upcomingPreviews : previews) : upcoming;
  const grid = (list: LearnerEvent[], empty: React.ReactNode) => (list.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">{list.map((e) => <EventCard key={e.id} e={e} />)}</div> : <div className="surface">{empty}</div>);
  const noMatch = <EmptyState icon={CalendarDays} title="No events match" description="Try a different search or clear your filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />;
  const noEvents = (title: string) => (
    <EmptyState
      icon={CalendarDays}
      title={title}
      description="Creators haven't published any events yet. New workshops, live sessions and meetups will show up here as soon as they go live."
      action={<Button variant="soft" onClick={() => setShow("preview")}><Eye /> Open preview pages</Button>}
    />
  );
  const perks = [
    { icon: Ticket, label: "Free and paid tickets" },
    { icon: Video, label: "Online or in person" },
    { icon: Award, label: "Attend to earn badges" },
  ];
  return (
    <div>
      <PageHeader eyebrow="Events" title="Learn live, together" description="Discover workshops, live sessions and meetups hosted by Enski creators." />
      <PerkStrip perks={perks} label="What you get with Enski events" />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <PreviewSwitch value={show} onChange={setShow} liveLabel="Live events" liveCount={publishedEvents.length} previewCount={events.length} />
        <div className="grid grid-cols-2 gap-1 rounded-full border bg-card p-1 sm:inline-grid" role="group" aria-label="View events as">
          {([["grid", "Grid", LayoutGrid], ["calendar", "Calendar", CalendarRange]] as const).map(([v, label, Icon]) => (
            <button key={v} type="button" onClick={() => setLayout(v)} aria-pressed={layout === v} className={cn("lime-pip inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors", layout === v ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}>
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </div>
      <section aria-label="Filter events" className="mb-5">
        <SectionDropdown heading="Topic" value={f.topic} onChange={(v) => set("topic", v)} options={["all", ...categories].map((c) => ({ value: c, label: c === "all" ? "All topics" : c, count: topicCount(c) }))} className="mb-3 md:hidden" />
        <div className="mb-3 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Topic">
          {["all", ...categories].map((c) => (
            <button key={c} type="button" onClick={() => set("topic", c)} aria-pressed={f.topic === c} className={cn("lime-pip inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors", f.topic === c ? "border-cobalt bg-cobalt text-primary-foreground" : "bg-card hover:border-cobalt hover:text-cobalt")}>
              {c === "all" ? "All topics" : c}
              <span className="chip-count rounded-full bg-soft px-1.5 text-[11px] font-extrabold tabular-nums text-muted-foreground">{topicCount(c)}</span>
            </button>
          ))}
        </div>
        <div className="mb-3"><SearchInput value={f.q} onChange={(v) => set("q", v)} placeholder="Search events or hosts" /></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <LabeledSelect label="Date" value={f.date} onChange={(v) => setF((cur) => ({ ...cur, date: v as DateFilter, on: v === "on" ? cur.on : "" }))} options={dateOptions} />
          <LabeledSelect label="Price" value={f.price} onChange={(v) => set("price", v as PriceFilter)} options={priceOptions} />
          <LabeledSelect label="Format" value={f.format} onChange={(v) => set("format", v as FormatFilter)} options={formatOptions} />
          <LabeledSelect label="Sort by" value={sort} onChange={setSort} options={[["soonest", "Date: soonest"], ["latest", "Date: latest"], ["price", "Price: low to high"]]} />
        </div>
        {f.date === "on" && (
          <label className="mt-2 block max-w-xs">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">Event date</span>
            <Input type="date" value={f.on} onChange={(e) => set("on", e.target.value)} className="bg-card" />
          </label>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-live="polite">
          <p className="text-sm font-semibold text-muted-foreground">
            {show === "preview" ? `${shown.length} of ${layout === "calendar" ? allPreviews.filter((e) => !isPast(e)).length : allPreviews.length} preview events` : `${shown.length} upcoming ${shown.length === 1 ? "event" : "events"}`}
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
      {show === "live" ? (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4 h-auto flex-wrap">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="mine">My registered events ({mine.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">{layout === "calendar" ? <EventCalendar events={upcoming} empty={publishedEvents.length ? noMatch : noEvents("No events yet")} /> : grid(upcoming, publishedEvents.length ? noMatch : noEvents("No events yet"))}</TabsContent>
          <TabsContent value="mine">{grid(mine, filtered && state.registrations.length ? noMatch : <EmptyState icon={CalendarCheck} title="You haven't registered for any events" description="Find a session that interests you and save your seat. It will be listed here." />)}</TabsContent>
          <TabsContent value="past">{grid(past, publishedEvents.length ? noMatch : noEvents("No past events yet"))}</TabsContent>
        </Tabs>
      ) : (
        <section aria-labelledby="preview-events-title">
          <h2 id="preview-events-title" className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />Preview pages</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">{layout === "calendar" ? "Pick a date to see what's on, then open the event preview." : "Open any event to see the details, then register or get a ticket."}</p>
          {layout === "calendar" ? <EventCalendar events={upcomingPreviews} empty={noMatch} /> : grid(previews, noMatch)}
        </section>
      )}
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

export function EventDetails({ id }: { id: string }) {
  const { state, update } = useLearner();
  const [cancel, setCancel] = useState(false);
  const navigate = useNavigate();
  const tz = useViewerTimeZone();
  const e = findEvent(id);
  if (!e) return <LearnerNotFound what="event" />;
  const reg = registration(state, e.id);
  const past = isPast(e);
  const inCart = state.cart.some((c) => c.kind === "event" && c.id === e.id);
  const end = new Date(new Date(e.start).getTime() + e.durationMinutes * 60000);
  const hours = eventLength(e.durationMinutes);
  const preview = isPreviewEvent(e);
  const sameWat = sameAsEventTime(e.start, tz);
  const free = e.price === 0;
  const countdown = startsIn(e);
  const action = (thenCart: boolean) => {
    if (free) {
      update((s) => registerFree(s, e.id));
      toast.success("You're registered", { description: e.title });
      return;
    }
    const check = canAddToCart(state, { kind: "event", id: e.id });
    if (!check.ok) { toast.error(check.reason); return; }
    update((s) => addToCart(s, { kind: "event", id: e.id }));
    if (thenCart) navigate({ to: "/learner/cart" });
    else toast.success("Ticket added to cart", { action: { label: "View cart", onClick: () => navigate({ to: "/learner/cart" }) } });
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied");
    } catch {
      toast.error("Couldn't copy the link", { description: `Copy it by hand: ${window.location.href}` });
    }
  };
  const facts = [
    { icon: CalendarDays, label: "Date", value: dayIn(e.start, tz) },
    { icon: Clock, label: "Time", value: `${timeIn(e.start, tz)} ${zoneLabel(e.start, tz)}` },
    { icon: Hourglass, label: "Duration", value: hours },
    { icon: e.mode === "Online" ? Video : MapPin, label: e.mode === "Online" ? "Where" : "Venue", value: e.mode === "Online" ? "Online" : e.venue },
  ];
  const goodToKnow = [
    e.mode === "Online"
      ? { icon: Video, title: "How to join", body: "It's a live online session. The joining link is shared with you after you register." }
      : { icon: MapPin, title: "Where to go", body: `${e.venue}. Arrive a little early so you don't miss the introductions.` },
    free
      ? { icon: CalendarCheck, title: "Free to attend", body: "Registering saves your seat. You can cancel any time before the event starts." }
      : { icon: Ticket, title: "Your ticket", body: "Buy your ticket and check out. It's confirmed here and listed in your purchases." },
    { icon: Globe2, title: "Your time zone", body: sameWat ? "Times are shown in Lagos time (WAT), the time the host runs it." : `Times are shown in your time zone (${zonePlace(tz)}). The host runs it on Lagos time (WAT).` },
    ...(e.eligible ? [{ icon: Award, title: "Earn a badge", body: "Attending counts towards your participation badges." }] : []),
  ];
  const more = events
    .filter((x) => x.id !== e.id && !isPast(x))
    .sort((a, b) => Number(b.category === e.category) - Number(a.category === e.category) || a.start.localeCompare(b.start))
    .slice(0, 3);
  const initials = e.host.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div>
      {preview && (
        <PreviewBanner
          what="event"
          steps={[
            { label: "Find the event", done: true },
            ...(e.price > 0 ? [{ label: "Buy ticket", done: inCart || Boolean(reg) }, { label: "Check out", done: Boolean(reg) }] : [{ label: "Register", done: Boolean(reg) }]),
            { label: "Attend", done: Boolean(reg?.attendedAt) },
            ...(e.eligible ? [{ label: "Earn badge", done: Boolean(reg?.attendedAt) }] : []),
          ]}
        />
      )}
      <section className="relative mb-4 overflow-hidden rounded-2xl bg-midnight" aria-label="Event overview">
        <img src={e.image} alt={e.imageAlt} width={960} height={600} className={cn("absolute inset-0 h-full w-full object-cover", past && "grayscale-[50%]")} />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 to-midnight/5" aria-hidden="true" />
        <span className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {preview && <span className="rounded-lg bg-cobalt px-2.5 py-1 text-xs font-extrabold text-primary-foreground">Preview</span>}
          <span className="rounded-lg bg-card/95 px-2.5 py-1 text-xs font-bold">{e.category}</span>
          {e.eligible && <span className="inline-flex items-center gap-1 rounded-lg bg-card/95 px-2.5 py-1 text-xs font-bold"><Award className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />Badge eligible</span>}
        </span>
        <div className="relative flex min-h-[260px] items-end gap-4 p-4 pt-20 sm:min-h-[340px] sm:p-6">
          <div className="hidden shrink-0 overflow-hidden rounded-2xl bg-card text-center shadow-lift sm:block" aria-hidden="true">
            <p className="bg-lime px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-midnight">{new Date(e.start).toLocaleDateString("en-NG", { month: "short", timeZone: tz })}</p>
            <p className="px-4 pb-1.5 pt-1 text-3xl font-extrabold leading-none tabular-nums text-midnight">{new Date(e.start).toLocaleDateString("en-NG", { day: "numeric", timeZone: tz })}</p>
            <p className="pb-2 text-[11px] font-bold text-muted-foreground">{new Date(e.start).toLocaleDateString("en-NG", { weekday: "short", timeZone: tz })}</p>
          </div>
          <div className="min-w-0 text-on-dark">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-on-dark/15 px-3 py-1 text-xs font-extrabold backdrop-blur-sm">
              <span className={cn("h-1.5 w-1.5 rounded-full", past ? "bg-on-dark-muted" : "bg-lime")} aria-hidden="true" />{countdown}
            </p>
            <h1 className="text-2xl text-on-dark sm:text-4xl">{e.title}</h1>
            <p className="mt-2 text-sm text-on-dark-muted">Hosted by <span className="font-bold text-on-dark">{e.host}</span> · {e.mode}</p>
          </div>
        </div>
      </section>
      <ul className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4" aria-label="Event at a glance">
        {facts.map((f) => (
          <li key={f.label} className="surface flex min-w-0 items-center gap-3 p-3 sm:p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ice text-cobalt"><f.icon className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-muted-foreground">{f.label}</span>
              <span className="block truncate text-sm font-extrabold">{f.value}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Panel title="About this event"><p className="text-[15px] leading-relaxed">{e.description}</p></Panel>
          <Panel title="Agenda" description={`${e.agenda.length} parts · ${hours} in total`}>
            <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-line">
              {e.agenda.map((a, i) => (
                <li key={a} className="relative flex items-center gap-3 text-sm">
                  <span className={cn("relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ring-4 ring-card", i === 0 ? "bg-cobalt text-primary-foreground" : "bg-ice text-cobalt")}>{i + 1}</span>
                  <span className="font-semibold">{a}</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="Good to know">
            <ul className="grid gap-4 sm:grid-cols-2">
              {goodToKnow.map((g) => (
                <li key={g.title} className="flex gap-3">
                  <g.icon className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
                  <span className="min-w-0"><span className="block text-sm font-bold">{g.title}</span><span className="block text-sm text-muted-foreground">{g.body}</span></span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Your host">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cobalt text-lg font-extrabold text-primary-foreground ring-4 ring-ice" aria-hidden="true">{initials}</span>
              <div className="min-w-0">
                <p className="font-extrabold">{e.host}</p>
                <p className="text-sm text-muted-foreground">Creator on Enski · hosting this {e.mode === "Online" ? "live session" : "in-person event"}</p>
              </div>
            </div>
          </Panel>
        </div>
        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-2xl font-extrabold tabular-nums">{price(e.price)}{e.price > 0 && <span className="text-sm font-semibold text-muted-foreground"> / ticket</span>}</p>
              <StatusBadge tone={past ? "neutral" : "info"}>{countdown}</StatusBadge>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
                <div className="min-w-0">
                  <dt className="sr-only">Date and time</dt>
                  <dd className="font-semibold">{localDateTime(e.start, tz)}</dd>
                  {!sameWat && <dd className="text-xs text-muted-foreground">Your time · {zonePlace(tz)}</dd>}
                </div>
              </div>
              {!sameWat && (
                <div className="flex gap-3">
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-muted-foreground">Event time (WAT, Lagos)</dt>
                    <dd>{watDateTime(e.start)}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" /><div><dt className="sr-only">Duration</dt><dd>{hours} · ends {timeIn(end, tz)} {zoneLabel(end, tz)}{!sameWat && <span className="text-muted-foreground"> ({timeIn(end, EVENT_TZ)} WAT)</span>}</dd></div></div>
              <div className="flex gap-3">{e.mode === "Online" ? <Video className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" />}<div><dt className="sr-only">Venue</dt><dd>{e.venue}</dd></div></div>
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              {reg ? (
                <>
                  <p className="flex items-center gap-2 rounded-lg bg-lime-100 p-3 text-sm font-bold text-lime-text"><CheckCircle2 className="h-4 w-4" />{reg.attendedAt ? "You attended this event" : e.price > 0 ? `Ticket confirmed · ${reg.tickets} ${reg.tickets > 1 ? "tickets" : "ticket"}` : "You're registered"}</p>
                  {!reg.attendedAt && !past && <Button variant="outline" onClick={() => { downloadEventIcs(e); toast.success("Calendar file downloaded", { description: "Open it to add the event to your calendar." }); }}><CalendarPlus /> Add to calendar</Button>}
                  {!reg.attendedAt && (
                    <Button variant="soft" onClick={() => { update((s) => markAttended(s, e.id)); toast.success("Attendance recorded"); }}><Ticket /> Mark as attended</Button>
                  )}
                  {!reg.attendedAt && e.price === 0 && <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setCancel(true)}>Cancel registration</Button>}
                </>
              ) : past ? (
                <p className="rounded-lg bg-muted p-3 text-sm font-semibold text-muted-foreground">This event has ended. Registration is closed.</p>
              ) : inCart ? (
                <Button asChild size="lg"><Link to="/learner/cart"><ShoppingCart /> Ticket in cart · Checkout</Link></Button>
              ) : free ? (
                <Button size="lg" onClick={() => action(false)}><CalendarCheck /> {eventActionLabel(e)}</Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => action(true)}><Ticket /> {eventActionLabel(e)}</Button>
                  <Button variant="outline" onClick={() => action(false)}><ShoppingCart /> Add to cart</Button>
                </>
              )}
              {!reg && !past && e.price > 0 && <WishlistButton item={{ kind: "event", id: e.id }} label className="w-full" />}
              <Button variant="ghost" onClick={share}><Share2 /> Share event</Button>
            </div>
          </div>
        </aside>
      </div>
      {more.length > 0 && (
        <section aria-labelledby="more-events-title" className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="more-events-title" className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />More events you might like</h2>
            <Link to="/learner/events" className="text-sm font-bold text-cobalt hover:underline">See all events</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{more.map((x) => <EventCard key={x.id} e={x} />)}</div>
        </section>
      )}
      <ConfirmDialog
        open={cancel}
        onOpenChange={setCancel}
        art={brandArtwork.calendar}
        eyebrow="Your registration"
        title="Cancel your registration?"
        description={`Your seat at “${e.title}” will be released.`}
        cancelLabel="Keep my seat"
        confirmLabel="Cancel registration"
        onConfirm={() => { update((s) => cancelRegistration(s, e.id)); toast.success("Registration cancelled"); }}
      >
        <ConfirmNote>You can register again any time before the event starts.</ConfirmNote>
      </ConfirmDialog>
    </div>
  );
}
