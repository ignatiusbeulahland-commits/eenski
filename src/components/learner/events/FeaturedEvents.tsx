import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin, Ticket, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { eventLength, startsIn, type LearnerEvent } from "@/lib/learner/catalog";
import { registration } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { dayIn, timeIn, useViewerTimeZone, zoneLabel } from "@/lib/learner/timezone";
import { cn } from "@/lib/utils";
import { DateBlock, HostAvatar, price } from "../shared";

/** Big banner at the top of Events: one featured event at a time, with the others to pick from. */
export function FeaturedEvents({ list }: { list: LearnerEvent[] }) {
  const [i, setI] = useState(0);
  const { state } = useLearner();
  const tz = useViewerTimeZone();
  if (!list.length) return null;
  const at = Math.min(i, list.length - 1);
  const e = list[at]!;
  const reg = registration(state, e.id);
  const go = (n: number) => setI((n + list.length) % list.length);
  return (
    <section aria-roledescription="carousel" aria-label="Featured events" className="featured-events mb-8 overflow-hidden rounded-[28px] bg-midnight text-on-dark shadow-lift">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative isolate min-h-[420px] overflow-hidden sm:min-h-[460px]" aria-live="polite">
          {list.map((x, n) => (
            <img
              key={x.id}
              src={x.banner}
              alt={n === at ? x.imageAlt : ""}
              aria-hidden={n === at ? undefined : true}
              width={1600}
              height={912}
              loading={n === 0 ? "eager" : "lazy"}
              className={cn("absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none", n === at ? "opacity-100" : "opacity-0")}
            />
          ))}
          <span className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/10 lg:bg-gradient-to-r lg:from-midnight lg:via-midnight/75 lg:to-midnight/5" aria-hidden="true" />
          <div key={e.id} className="screen-in flex h-full min-h-[inherit] flex-col justify-end gap-4 p-5 sm:p-8 lg:max-w-[620px]">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-lime"><span className="neon-dot is-live" aria-hidden="true" />Featured event · {at + 1} of {list.length}</p>
            <div className="flex items-end gap-4">
              <DateBlock iso={e.start} tz={tz} size="lg" className="hidden sm:block" />
              <div className="min-w-0">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-sky">{e.category} · {e.level}</p>
                <h2 className="text-balance text-[26px] font-extrabold leading-[1.1] text-on-dark sm:text-[36px]">{e.title}</h2>
              </div>
            </div>
            <p className="max-w-xl text-[15px] leading-relaxed text-on-dark-muted">{e.tagline}</p>
            <ul className="flex flex-wrap gap-2 text-[13px] font-bold" aria-label="Event details">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1.5 backdrop-blur-sm"><Clock className="h-3.5 w-3.5 text-lime" aria-hidden="true" />{dayIn(e.start, tz)} · {timeIn(e.start, tz)} {zoneLabel(e.start, tz)}</li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1.5 backdrop-blur-sm">{e.mode === "Online" ? <Video className="h-3.5 w-3.5 text-lime" aria-hidden="true" /> : <MapPin className="h-3.5 w-3.5 text-lime" aria-hidden="true" />}{e.mode === "Online" ? "Online" : e.venue}</li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1.5 backdrop-blur-sm">{eventLength(e.durationMinutes)} · {startsIn(e)}</li>
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-on-dark/15 pt-4">
              <p className="flex min-w-0 items-center gap-2.5 text-sm">
                <HostAvatar name={e.host} size="md" className="ring-2 ring-lime/60" />
                <span className="min-w-0"><span className="block truncate font-extrabold text-on-dark">{e.host}</span><span className="block truncate text-xs text-on-dark-muted">{e.hostRole}</span></span>
              </p>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <span className="text-center text-xl font-extrabold tabular-nums text-on-dark sm:mr-2">{price(e.price)}</span>
                {reg ? (
                  <Button asChild variant="lime" size="lg"><Link to="/learner/events/$eventId" params={{ eventId: e.id }}><Ticket /> View my ticket</Link></Button>
                ) : (
                  <Button asChild variant="lime" size="lg"><Link to="/learner/events/$eventId" params={{ eventId: e.id }}>{e.price === 0 ? "View and register" : "View and get tickets"}<ArrowRight /></Link></Button>
                )}
              </div>
            </div>
            {list.length > 1 && (
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <div className="flex gap-1.5" role="group" aria-label="Choose a featured event">
                  {list.map((x, n) => (
                    <button key={x.id} type="button" onClick={() => setI(n)} aria-label={`Show ${x.title}`} aria-current={n === at ? "true" : undefined} className="grid h-8 w-6 place-items-center">
                      <span className={cn("h-2 rounded-full transition-all", n === at ? "w-6 bg-lime" : "w-2 bg-on-dark/40")} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" size="icon" onClick={() => go(at - 1)} aria-label="Previous featured event"><ChevronLeft /></Button>
                  <Button variant="glass" size="icon" onClick={() => go(at + 1)} aria-label="Next featured event"><ChevronRight /></Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {list.length > 1 && (
          <div className="hidden border-l border-on-dark/10 bg-midnight p-4 lg:flex lg:flex-col">
            <p className="mb-3 px-1 text-xs font-extrabold uppercase tracking-[0.14em] text-on-dark-muted">Also featured</p>
            <ol className="flex flex-1 flex-col gap-2">
              {list.map((x, n) => (
                <li key={x.id}>
                  <button
                    type="button"
                    onClick={() => setI(n)}
                    aria-current={n === at ? "true" : undefined}
                    className={cn("flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition-colors", n === at ? "border-lime/70 bg-on-dark/10" : "border-transparent hover:bg-on-dark/5")}
                  >
                    <img src={x.image} alt="" width={64} height={48} loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-extrabold uppercase tracking-wide text-sky">{dayIn(x.start, tz)}</span>
                      <span className="line-clamp-2 text-[13px] font-bold leading-snug text-on-dark">{x.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
