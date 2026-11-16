import { Link, useNavigate } from "@tanstack/react-router";
import { Award, CalendarCheck, CalendarDays, CalendarPlus, CheckCircle2, ChevronRight, Clock, Globe2, Hourglass, MapPin, Share2, ShoppingCart, Ticket, Users, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { Panel, StatusBadge } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { eventActionLabel, eventLength, events, findEvent, isPast, isPreviewEvent, startsIn, type LearnerEvent } from "@/lib/learner/catalog";
import { downloadEventIcs } from "@/lib/learner/ics";
import { addToCart, canAddToCart, cancelRegistration, markAttended, registration } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { EVENT_TZ, dayIn, localDateTime, sameAsEventTime, timeIn, useViewerTimeZone, watDateTime, zoneLabel, zonePlace } from "@/lib/learner/timezone";
import { cn } from "@/lib/utils";
import { DateBlock, EventCard, HostAvatar, LearnerNotFound, PreviewBanner, WishlistButton, price } from "../shared";

export const shareEvent = async (e: Pick<LearnerEvent, "id" | "title">) => {
  const url = `${window.location.origin}/learner/events/${e.id}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Event link copied", { description: e.title });
  } catch {
    toast.error("Couldn't copy the link", { description: `Copy it by hand: ${url}` });
  }
};

export function EventDetails({ id }: { id: string }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const tz = useViewerTimeZone();
  const [cancel, setCancel] = useState(false);
  const e = findEvent(id);
  if (!e) return <LearnerNotFound what="event" />;
  const reg = registration(state, e.id);
  const past = isPast(e);
  const preview = isPreviewEvent(e);
  const inCart = state.cart.some((c) => c.kind === "event" && c.id === e.id);
  const draft = state.eventDrafts[e.id];
  const registerTo = { to: "/learner/events/$eventId/register", params: { eventId: e.id } } as const;
  const end = new Date(new Date(e.start).getTime() + e.durationMinutes * 60000);
  const hours = eventLength(e.durationMinutes);
  const sameWat = sameAsEventTime(e.start, tz);
  const free = e.price === 0;
  const countdown = startsIn(e);
  const addCart = () => {
    const check = canAddToCart(state, { kind: "event", id: e.id });
    if (!check.ok) { toast.error(check.reason); return; }
    update((s) => addToCart(s, { kind: "event", id: e.id }));
    toast.success("Ticket added to cart", { action: { label: "View cart", onClick: () => navigate({ to: "/learner/cart" }) } });
  };
  const facts = [
    { icon: CalendarDays, label: "Date", value: dayIn(e.start, tz) },
    { icon: Clock, label: "Time", value: `${timeIn(e.start, tz)} ${zoneLabel(e.start, tz)}` },
    { icon: Hourglass, label: "Duration", value: hours },
    { icon: e.mode === "Online" ? Video : MapPin, label: e.mode === "Online" ? "Where" : "Venue", value: e.mode === "Online" ? "Online" : e.venue },
  ];
  const goodToKnow = [
    e.mode === "Online"
      ? { icon: Video, title: "How to join", body: "It's a live online session. Your joining link is on your ticket once you've registered." }
      : { icon: MapPin, title: "Where to go", body: `${e.venue}. Arrive a little early so you don't miss the introductions.` },
    free
      ? { icon: CalendarCheck, title: "Free to attend", body: "Registering saves your seat. You can cancel any time before the event starts." }
      : { icon: Ticket, title: "Your ticket", body: "Choose up to 5 tickets, pay at checkout and your ticket is ready straight away." },
    { icon: Globe2, title: "Your time zone", body: sameWat ? "Times are shown in Lagos time (WAT), the time the host runs it." : `Times are shown in your time zone (${zonePlace(tz)}). The host runs it on Lagos time (WAT).` },
    ...(e.eligible ? [{ icon: Award, title: "Earn a badge", body: "Attending counts towards your participation badges." }] : []),
  ];
  const more = events
    .filter((x) => x.id !== e.id && !isPast(x))
    .sort((a, b) => Number(b.category === e.category) - Number(a.category === e.category) || a.start.localeCompare(b.start))
    .slice(0, 3);

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
      <nav aria-label="Breadcrumb" className="mb-3 text-sm">
        <ol className="flex min-w-0 items-center gap-1 text-muted-foreground">
          <li><Link to="/learner/events" className="font-bold text-cobalt hover:underline">Events</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li>{e.category}</li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="min-w-0 truncate font-semibold text-ink" aria-current="page">{e.title}</li>
        </ol>
      </nav>

      <section className="relative isolate mb-5 overflow-hidden rounded-[28px] bg-midnight text-on-dark shadow-lift" aria-label="Event overview">
        <img src={e.banner} alt={e.imageAlt} width={1600} height={912} className={cn("absolute inset-0 -z-10 h-full w-full object-cover", past && "grayscale-[50%]")} />
        <span className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/65 to-midnight/5 sm:bg-gradient-to-r sm:via-midnight/60" aria-hidden="true" />
        <div className="flex min-h-[340px] flex-col justify-end gap-4 p-5 sm:min-h-[420px] sm:p-8">
          <ul className="flex flex-wrap gap-1.5" aria-label="Event tags">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/15 px-3 py-1 text-xs font-extrabold backdrop-blur-sm"><span className={cn("h-1.5 w-1.5 rounded-full", past ? "bg-on-dark-muted" : "bg-lime")} aria-hidden="true" />{countdown}</li>
            <li className="rounded-full bg-on-dark/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">{e.category}</li>
            <li className="rounded-full bg-on-dark/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">{e.level}</li>
            {e.featured && !past && <li className="rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-midnight">Featured</li>}
            {e.eligible && <li className="inline-flex items-center gap-1 rounded-full bg-on-dark/15 px-3 py-1 text-xs font-bold backdrop-blur-sm"><Award className="h-3.5 w-3.5 text-lime" aria-hidden="true" />Badge eligible</li>}
          </ul>
          <div className="flex items-end gap-4">
            <DateBlock iso={e.start} tz={tz} size="lg" className="hidden sm:block" />
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-balance text-[28px] font-extrabold leading-[1.1] text-on-dark sm:text-[40px]">{e.title}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-on-dark-muted sm:text-base">{e.tagline}</p>
            </div>
          </div>
          <p className="flex items-center gap-2.5 text-sm">
            <HostAvatar name={e.host} size="md" className="ring-2 ring-lime/60" />
            <span className="min-w-0">Hosted by <span className="font-extrabold text-on-dark">{e.host}</span><span className="block text-xs text-on-dark-muted">{e.hostRole}</span></span>
          </p>
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
          {past && e.recap && (
            <section className="rounded-[20px] border border-sky-200 bg-ice p-5" aria-labelledby="recap-title">
              <h2 id="recap-title" className="flex items-center gap-2.5 text-[15px] font-extrabold text-cobalt"><span className="lime-tick" aria-hidden="true" />What happened</h2>
              <p className="mt-2 text-[15px] leading-relaxed">{e.recap}</p>
            </section>
          )}
          <Panel title="About this event"><p className="text-[15px] leading-relaxed">{e.description}</p></Panel>
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="What you'll leave with">
              <ul className="space-y-2.5">
                {e.outcomes.map((o) => <li key={o} className="flex gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" /><span>{o}</span></li>)}
              </ul>
            </Panel>
            <Panel title="Who it's for">
              <p className="text-sm leading-relaxed">{e.audience}</p>
              <p className="mt-3 flex flex-wrap gap-1.5">
                <span className="event-chip">{e.level}</span>
                <span className="event-chip"><Users aria-hidden="true" />{e.capacity} seats</span>
              </p>
            </Panel>
          </div>
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
          <Panel title="Your host">
            <div className="flex items-center gap-4">
              <HostAvatar name={e.host} size="lg" className="ring-4 ring-ice" />
              <div className="min-w-0">
                <p className="font-extrabold">{e.host}</p>
                <p className="text-sm text-muted-foreground">{e.hostRole}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Hosting this {e.mode === "Online" ? "live online session" : "in-person event"} on Enski</p>
              </div>
            </div>
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
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start" aria-label="Registration">
          <div className="surface overflow-hidden">
            <div className="bg-brand-panel px-5 py-4 text-on-dark">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-lime">{free ? "Free event" : "Tickets"}</p>
              <p className="mt-1 text-[28px] font-extrabold leading-none tabular-nums">{price(e.price)}{!free && <span className="text-sm font-semibold text-on-dark-muted"> / ticket</span>}</p>
            </div>
            <div className="p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="sr-only">Date and time</dt>
                    <dd className="font-semibold">{localDateTime(e.start, tz)}</dd>
                    {!sameWat && <dd className="text-xs text-muted-foreground">Your time · {zonePlace(tz)} · event time {watDateTime(e.start)}</dd>}
                  </div>
                </div>
                <div className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" /><div><dt className="sr-only">Duration</dt><dd>{hours} · ends {timeIn(end, tz)} {zoneLabel(end, tz)}{!sameWat && <span className="text-muted-foreground"> ({timeIn(end, EVENT_TZ)} WAT)</span>}</dd></div></div>
                <div className="flex gap-3">{e.mode === "Online" ? <Video className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" />}<div><dt className="sr-only">Venue</dt><dd>{e.venue}</dd></div></div>
                <div className="flex gap-3"><Users className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" /><div><dt className="sr-only">Seats</dt><dd>{e.capacity} seats{!free && " · up to 5 tickets per order"}</dd></div></div>
              </dl>
              <div className="mt-5 flex flex-col gap-2">
                {reg ? (
                  <>
                    <p className="flex items-center gap-2 rounded-xl bg-lime-100 p-3 text-sm font-bold text-lime-text"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />{reg.attendedAt ? "You attended this event" : free ? "You're registered" : `Ticket confirmed · ${reg.tickets} ${reg.tickets > 1 ? "tickets" : "ticket"}`}</p>
                    {reg.reference && <p className="rounded-xl border border-line bg-soft p-3 text-center font-mono text-sm font-bold tabular-nums" aria-label="Ticket reference">{reg.reference}</p>}
                    {!reg.attendedAt && !past && <Button variant="outline" onClick={() => { downloadEventIcs(e); toast.success("Calendar file downloaded", { description: "Open it to add the event to your calendar." }); }}><CalendarPlus /> Add to calendar</Button>}
                    {!reg.attendedAt && <Button variant="soft" onClick={() => { update((s) => markAttended(s, e.id)); toast.success("Attendance recorded"); }}><Ticket /> Mark as attended</Button>}
                    {!reg.attendedAt && free && <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setCancel(true)}>Cancel registration</Button>}
                  </>
                ) : past ? (
                  <p className="rounded-xl bg-muted p-3 text-sm font-semibold text-muted-foreground">This event has ended. Registration is closed.</p>
                ) : inCart ? (
                  <>
                    <Button asChild size="lg"><Link to="/learner/checkout" search={{ step: "pay", method: "card" }}><ShoppingCart /> Ticket in cart · Pay now</Link></Button>
                    <Button asChild variant="outline"><Link {...registerTo}>Change tickets</Link></Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link {...registerTo}>
                        {free ? <CalendarCheck /> : <Ticket />} {draft ? "Continue registration" : eventActionLabel(e)}
                      </Link>
                    </Button>
                    {draft && <p className="text-center text-xs text-muted-foreground">Your details are saved. Pick up where you left off.</p>}
                    {!free && <Button variant="outline" onClick={addCart}><ShoppingCart /> Add to cart</Button>}
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {!reg && !past && !free ? <WishlistButton item={{ kind: "event", id: e.id }} label className="w-full" /> : <span />}
                  <Button variant="ghost" onClick={() => void shareEvent(e)} className={cn(!(!reg && !past && !free) && "col-start-1 col-end-3")}><Share2 /> Share</Button>
                </div>
              </div>
              {!past && <p className="mt-3 flex justify-center"><StatusBadge tone="info">{countdown}</StatusBadge></p>}
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
