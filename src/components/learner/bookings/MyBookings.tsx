import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, UserRound, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/affiliate/ui";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { Button } from "@/components/dashboard-ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { learnerBookings, type Booking } from "@/lib/learner/bookings";
import { cancelRegistration } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { dayIn, timeIn, useViewerTimeZone, zoneLabel } from "@/lib/learner/timezone";

const STATUS = {
  confirmed: { label: "Confirmed", tone: "success" },
  awaiting: { label: "Awaiting schedule", tone: "pending" },
  attended: { label: "Attended", tone: "info" },
  ended: { label: "Ended", tone: "neutral" },
} as const;

export function MyBookingsPage() {
  const { state, update } = useLearner();
  const tz = useViewerTimeZone();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [cancel, setCancel] = useState<Booking | null>(null);
  const all = useMemo(() => learnerBookings(state), [state.purchases, state.registrations]);
  const list = tab === "cancelled" ? [] : all.filter((b) => (tab === "past" ? b.when_past : !b.when_past));
  const counts = { upcoming: all.filter((b) => !b.when_past).length, past: all.filter((b) => b.when_past).length };

  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Bookings" title="My bookings" description="Your upcoming and past coaching sessions." />
      {all.length > 0 && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-5 w-full justify-start overflow-x-auto sm:w-auto">
            <TabsTrigger value="upcoming">Upcoming ({counts.upcoming})</TabsTrigger>
            <TabsTrigger value="past">Past ({counts.past})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {list.length > 0 ? (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="surface flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img src={b.image} alt="" loading="lazy" className="aspect-[16/10] w-full shrink-0 rounded-xl object-cover sm:w-36" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={STATUS[b.status].tone}>{STATUS[b.status].label}</StatusBadge>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-sky-text">{b.kind === "coaching" ? "Coaching" : "Live session"}</span>
                </div>
                <h2 className="text-base font-bold leading-snug">{b.title}</h2>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />{b.host}</p>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />
                  {b.when ? `${dayIn(b.when, tz)} · ${timeIn(b.when, tz)} ${zoneLabel(tz)}` : "Your coach will confirm a time with you"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {b.online ? <Video className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" /> : <MapPin className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />}
                  {b.online ? "Meeting link shared on the session page before it starts" : "In person, see session page for the venue"}
                  {b.reference && <span className="ml-1 truncate">· Ref {b.reference}</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                <Button asChild size="sm"><Link {...b.href}>View details</Link></Button>
                {b.cancellable && <Button size="sm" variant="outline" onClick={() => setCancel(b)}>Cancel</Button>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Panel>
          {all.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No bookings yet" description="Book a coaching session from your events page to see it here." action={<Button asChild><Link to="/learner/upcoming">Upcoming events</Link></Button>} />
          ) : (
            <EmptyState icon={CalendarDays} title={tab === "cancelled" ? "No cancelled bookings" : tab === "past" ? "No past sessions" : "No upcoming sessions"} description={tab === "upcoming" ? "Book another session to keep learning." : "Sessions will show here as they happen."} action={<Button asChild variant="outline"><Link to="/learner/upcoming">Upcoming events</Link></Button>} />
          )}
        </Panel>
      )}
      <ConfirmDialog
        open={!!cancel}
        onOpenChange={(v) => !v && setCancel(null)}
        art={brandArtwork.bin}
        eyebrow="Bookings"
        title="Cancel this booking?"
        description={cancel ? `Your seat for ${cancel.title} will be released.` : ""}
        confirmLabel="Cancel booking"
        onConfirm={() => {
          if (cancel) update((s) => cancelRegistration(s, cancel.id.slice(2)));
          setCancel(null);
          toast.success("Booking cancelled");
        }}
      >
        <ConfirmNote>You can register again while seats remain.</ConfirmNote>
      </ConfirmDialog>
    </div>
  );
}
