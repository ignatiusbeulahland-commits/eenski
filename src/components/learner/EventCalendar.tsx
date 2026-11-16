import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Eye, MapPin, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { eventLength, isPreviewEvent, type LearnerEvent } from "@/lib/learner/catalog";
import { addMonths, compareMonths, groupByDay, longDayLabel, monthGrid, monthLabel, monthOf, shortDayLabel } from "@/lib/learner/calendar";
import { dayKeyIn, timeIn, useViewerTimeZone, zoneLabel, zonePlace } from "@/lib/learner/timezone";
import { cn } from "@/lib/utils";
import { naira } from "@/lib/affiliate/products";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Month calendar of upcoming events in the learner's own time zone: pick a day, then open each event page. */
export function EventCalendar(props: { events: readonly LearnerEvent[]; empty: ReactNode }) {
  const tz = useViewerTimeZone();
  return <CalendarInner key={tz} tz={tz} {...props} />;
}

function CalendarInner({ events, empty, tz }: { events: readonly LearnerEvent[]; empty: ReactNode; tz: string }) {
  const today = dayKeyIn(new Date(), tz);
  const byDay = useMemo(() => groupByDay(events, tz), [events, tz]);
  const days = useMemo(() => [...byDay.keys()].sort(), [byDay]);
  const firstDay = days.find((d) => d >= today) ?? today;
  const [selected, setSelected] = useState(firstDay);
  const [month, setMonth] = useState(() => monthOf(firstDay));
  const focusNext = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filters can remove the chosen day's events; jump to the first remaining one.
  useEffect(() => {
    if (!byDay.has(selected) && days.length) { setSelected(firstDay); setMonth(monthOf(firstDay)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.join()]);

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${selected}"]`)?.focus();
  }, [selected, month]);

  if (!events.length) return <div className="surface">{empty}</div>;

  const thisMonth = monthOf(today);
  const weeks = monthGrid(month);
  const pick = (key: string) => { setSelected(key); setMonth(monthOf(key)); };
  const shiftMonth = (n: number) => {
    const next = addMonths(month, n);
    if (compareMonths(next, thisMonth) < 0) return;
    setMonth(next);
    const firstWithEvents = days.find((d) => d >= today && compareMonths(monthOf(d), next) === 0);
    setSelected(firstWithEvents ?? (compareMonths(next, thisMonth) === 0 ? today : `${next.year}-${String(next.month + 1).padStart(2, "0")}-01`));
  };
  const onKey = (ev: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[ev.key];
    let key: string | undefined;
    if (step) {
      const d = new Date(`${selected}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + step);
      key = d.toISOString().slice(0, 10);
    } else if (ev.key === "Home") key = weeks.flat().find((c) => c.inMonth)!.key;
    else if (ev.key === "End") key = [...weeks.flat()].reverse().find((c) => c.inMonth)!.key;
    if (!key) return;
    ev.preventDefault();
    if (key < today && compareMonths(monthOf(key), thisMonth) < 0) return;
    focusNext.current = true;
    pick(key);
  };

  const list = byDay.get(selected) ?? [];
  const monthCount = days.filter((d) => compareMonths(monthOf(d), month) === 0).reduce((n, d) => n + byDay.get(d)!.length, 0);
  const nextDay = days.find((d) => d > selected);
  const canGoBack = compareMonths(month, thisMonth) > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      <section className="surface min-w-0 p-3 sm:p-5" aria-labelledby="cal-month">
        <div className="mb-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 id="cal-month" className="text-lg font-extrabold leading-tight" aria-live="polite">{monthLabel(month)}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>{monthCount ? `${monthCount} upcoming ${monthCount === 1 ? "event" : "events"}` : "No upcoming events this month"}</span>
              {(compareMonths(month, thisMonth) !== 0 || selected !== today) && (
                <button type="button" onClick={() => pick(today)} className="rounded font-bold text-cobalt underline-offset-2 hover:underline">Back to today</button>
              )}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)} disabled={!canGoBack} aria-label="Previous month"><ChevronLeft /></Button>
          <Button variant="outline" size="icon" onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight /></Button>
        </div>
        <div ref={gridRef} role="group" aria-label={`Days in ${monthLabel(month)}. Use arrow keys to move between days.`}>
          <div className="grid grid-cols-7 gap-1 pb-1" aria-hidden="true">
            {WEEKDAYS.map((w) => <span key={w} className="text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{w.slice(0, 1)}<span className="hidden sm:inline">{w.slice(1)}</span></span>)}
          </div>
          {weeks.map((week) => (
            <div key={week[0]!.key} className="grid grid-cols-7 gap-1">
              {week.map((c) => {
                const count = byDay.get(c.key)?.length ?? 0;
                const isSel = c.key === selected;
                const isToday = c.key === today;
                const past = c.key < today;
                return (
                  <button
                    key={c.key}
                    type="button"
                    data-day={c.key}
                    tabIndex={isSel ? 0 : -1}
                    disabled={past && !isSel}
                    onClick={() => pick(c.key)}
                    onKeyDown={onKey}
                    aria-pressed={isSel}
                    aria-current={isToday ? "date" : undefined}
                    aria-label={`${shortDayLabel(c.key)}${isToday ? ", today" : ""}${count ? `, ${count} ${count === 1 ? "event" : "events"}` : ", no events"}`}
                    className={cn(
                      "relative flex aspect-square min-h-10 flex-col items-center justify-center gap-1 rounded-xl text-sm font-semibold tabular-nums transition-colors sm:aspect-[5/4]",
                      !c.inMonth && "opacity-40",
                      past && "text-muted-foreground/60",
                      count && !isSel && "bg-ice font-extrabold text-cobalt hover:bg-sky-200",
                      !count && !isSel && !past && "hover:bg-muted",
                      isToday && !isSel && "ring-2 ring-inset ring-cobalt",
                      isSel && "bg-cobalt font-extrabold text-primary-foreground shadow-sm",
                    )}
                  >
                    <span>{c.day}</span>
                    {count > 0 && (
                      <span className="flex h-1.5 items-center gap-0.5" aria-hidden="true">
                        {Array.from({ length: Math.min(count, 3) }, (_, i) => <span key={i} className={cn("h-1.5 w-1.5 rounded-full", isSel ? "bg-lime" : "bg-cobalt")} />)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cobalt" aria-hidden="true" /> Days with events · times shown in your time zone ({zoneLabel(new Date(), tz)}{tz !== "Africa/Lagos" ? `, ${zonePlace(tz)}` : ""})
        </p>
      </section>

      <section className="surface min-w-0 p-3 sm:p-5" aria-labelledby="cal-day" aria-live="polite">
        <h2 id="cal-day" className="flex items-center gap-2.5 text-base font-extrabold"><span className="lime-tick" aria-hidden="true" />{selected === today ? "Today" : longDayLabel(selected)}</h2>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{list.length ? `${list.length} ${list.length === 1 ? "event" : "events"}` : "Nothing scheduled"}</p>
        {list.length ? (
          <ul className="space-y-2.5">
            {list.map((e) => <AgendaItem key={e.id} e={e} tz={tz} />)}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed p-5 text-center">
            <CalendarDays className="mx-auto h-6 w-6 text-cobalt" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold">No events on this day</p>
            {nextDay && <Button variant="soft" size="sm" className="mt-3" onClick={() => pick(nextDay)}>Next event · {shortDayLabel(nextDay)}</Button>}
          </div>
        )}
        {list.length > 0 && nextDay && (
          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => pick(nextDay)}>Next event day · {shortDayLabel(nextDay)} <ChevronRight /></Button>
        )}
      </section>
    </div>
  );
}

function AgendaItem({ e, tz }: { e: LearnerEvent; tz: string }) {
  const preview = isPreviewEvent(e);
  return (
    <li className="group relative flex gap-3 rounded-xl border bg-card p-2.5 transition-colors hover:border-cobalt has-[a:focus-visible]:shadow-[var(--focus-ring)]">
      <img src={e.image} alt="" loading="lazy" width={96} height={96} className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-bold text-cobalt"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{timeIn(e.start, tz)} {zoneLabel(e.start, tz)} · {eventLength(e.durationMinutes)}</p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">
          <Link to="/learner/events/$eventId" params={{ eventId: e.id }} className="after:absolute after:inset-0 focus-visible:outline-none">
            {e.title}
            {preview && <span className="sr-only"> (preview page)</span>}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {e.price === 0 ? <span className="rounded-md bg-lime px-1.5 py-0.5 text-[12px] font-extrabold text-midnight">Free</span> : <span className="text-sm font-extrabold tabular-nums">{naira(e.price)}</span>}
          <span className="event-chip">{e.mode === "Online" ? <Video aria-hidden="true" /> : <MapPin aria-hidden="true" />}{e.mode}</span>
          {preview && <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-cobalt"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Preview page</span>}
        </div>
      </div>
    </li>
  );
}
