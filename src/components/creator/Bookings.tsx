import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, CalendarDays, CircleAlert, MonitorPlay, Star, UsersRound, Wallet, Wrench } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge } from "@/components/affiliate/ui";
import { CharmTip } from "@/components/assistant/CharmStage";
import { useCreator } from "@/lib/creator/store";
import { bookingRows, facilitationEarnings, isFacilitation, needsAction, upcomingSessions, type BookingRow } from "@/lib/creator/bookings";
import { STAGES, stageLabel } from "@/lib/creator/products";
import { averageRating } from "@/lib/creator/rules";
import { naira } from "@/lib/affiliate/products";
import { cn } from "@/lib/utils";
import { ItemLink, itemPaths } from "./shared";

const KIND = {
  coaching: { label: "Coaching", icon: UsersRound },
  live: { label: "Live session", icon: MonitorPlay },
  service: { label: "Service", icon: Wrench },
} as const;

const TONE = { info: "info", success: "success", warn: "pending", muted: "neutral" } as const;

function DateBlock({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ice text-center leading-none text-cobalt" aria-hidden="true">
      <span>
        <span className="block text-[10px] font-extrabold uppercase tracking-wider">{d.toLocaleDateString(undefined, { month: "short" })}</span>
        <span className="mt-0.5 block text-xl font-extrabold tabular-nums">{d.getDate()}</span>
      </span>
    </span>
  );
}

function Row({ r, compact }: { r: BookingRow; compact?: boolean }) {
  const K = KIND[r.kind];
  const tab = r.kind === "coaching" ? "bookings" : r.kind === "service" ? "orders" : undefined;
  return (
    <li className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
      {r.when ? <DateBlock iso={r.when} /> : (
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ice text-cobalt" aria-hidden="true"><K.icon className="h-6 w-6" /></span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{r.item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {K.label} · {r.who}
          {r.when ? ` · ${new Date(r.when).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}` : ""}
        </p>
        {r.action && !compact && (
          <p className="mt-1 flex items-center gap-1 text-xs font-bold text-warning-foreground"><CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />{r.action}</p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        <StatusBadge tone={TONE[r.tone]}>{r.label}</StatusBadge>
        <Button asChild size="sm" variant="outline">
          <Link to={itemPaths[r.item.kind].detail} params={{ slug: r.item.id }} search={tab ? { tab } : {}}>Manage</Link>
        </Button>
      </div>
    </li>
  );
}

/** Facilitator workspace inside Creator: sessions, bookings and service orders in one place. */
export function CreatorBookings() {
  const { state } = useCreator();
  const rows = bookingRows(state);
  const upcoming = upcomingSessions(rows);
  const todo = needsAction(rows);
  const services = rows.filter((r) => r.kind === "service");
  const offers = state.items.filter((i) => isFacilitation(i.kind) && !i.binnedAt);
  const reviews = state.reviews.filter((rv) => !rv.hidden && offers.some((o) => o.id === rv.itemId));
  const avg = averageRating(reviews);

  return (
    <div>
      <PageHeader
        eyebrow="Facilitation"
        title="Bookings & sessions"
        description="Coaching calls, live sessions and service orders in one place, so you always know who you're meeting next and what needs your attention."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/creator/settings/availability">Availability</Link></Button>
            <Button asChild><Link to={itemPaths.coaching.create}>New coaching offer</Link></Button>
          </div>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Upcoming sessions" value={String(upcoming.length)} hint={upcoming[0]?.when ? new Date(upcoming[0].when).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "None booked yet"} />
        <StatCard icon={CircleAlert} label="Needs your action" value={String(todo.length)} tone="lime" hint={todo.length ? "See the list below" : "All clear"} />
        <StatCard icon={Wrench} label="Service orders open" value={String(services.filter((s) => s.label !== "Completed").length)} tone="sky" hint={`${services.length} in total`} />
        <StatCard icon={Wallet} label="Earned from sessions" value={naira(facilitationEarnings(rows))} tone="midnight" hint="Coaching, live and services" />
      </div>

      {!offers.length ? (
        <CharmTip
          pose="wave"
          title="Offer your time, not just your content"
          actions={
            <>
              <Button asChild size="sm"><Link to={itemPaths.coaching.create}>Create coaching</Link></Button>
              <Button asChild size="sm" variant="outline"><Link to={itemPaths.live.create}>Plan a live session</Link></Button>
              <Button asChild size="sm" variant="outline"><Link to={itemPaths.service.create}>Add a service</Link></Button>
            </>
          }
        >
          One-to-one coaching, live classes and done-for-you services all land here once people book them.
        </CharmTip>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Panel title="Needs your action" description="Sessions to close out and service orders waiting on you">
              {todo.length ? <ul className="divide-y">{todo.map((r) => <Row key={r.id} r={r} />)}</ul> : (
                <EmptyState compact icon={CalendarClock} title="Nothing waiting on you" description="When a session ends or a client sends a brief, it shows up here." />
              )}
            </Panel>
            <Panel title="Upcoming sessions" description="Soonest first">
              {upcoming.length ? <ul className="divide-y">{upcoming.slice(0, 8).map((r) => <Row key={r.id} r={r} compact />)}</ul> : (
                <EmptyState compact icon={CalendarDays} title="No sessions booked yet" description="Share your coaching or live session from your storefront to get your first booking." action={<Button asChild size="sm" variant="outline"><Link to="/creator/storefront">Open storefront</Link></Button>} />
              )}
            </Panel>
            <Panel title="Service orders" description="Each paid order and the stage it's at">
              <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STAGES.map((st, i) => {
                  const n = services.filter((s) => s.label === stageLabel[st]).length;
                  return (
                    <li key={st} className={cn("rounded-2xl border p-3", n ? "border-sky/40 bg-ice" : "bg-card")}>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Step {i + 1}</p>
                      <p className="mt-1 text-2xl font-extrabold tabular-nums">{n}</p>
                      <p className="text-xs font-semibold">{stageLabel[st]}</p>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </div>
          <div className="space-y-6">
            <Panel title="Your offers" actions={<Link to="/creator/coaching" className="text-xs font-bold text-cobalt">All offers <ArrowRight className="ml-1 inline h-3 w-3" /></Link>}>
              <ul className="divide-y">
                {offers.slice(0, 8).map((o) => {
                  const K = KIND[o.kind as keyof typeof KIND];
                  return (
                    <li key={o.id}>
                      <ItemLink item={o} className="group flex min-h-14 items-center gap-3 py-2.5 text-sm">
                        <K.icon className="h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold group-hover:text-cobalt">{o.title}</span>
                          <span className="block text-xs text-muted-foreground">{K.label}</span>
                        </span>
                        <StatusBadge tone={o.status === "published" ? "success" : "neutral"}>{o.status === "published" ? "Live" : o.status === "draft" ? "Draft" : "Archived"}</StatusBadge>
                      </ItemLink>
                    </li>
                  );
                })}
              </ul>
            </Panel>
            <Panel title="Client reviews" description={reviews.length ? `${avg} average from ${reviews.length}` : undefined} actions={<Link to="/creator/reviews" className="text-xs font-bold text-cobalt">All reviews</Link>}>
              {reviews.length ? (
                <ul className="space-y-3">
                  {reviews.slice(-3).reverse().map((rv) => (
                    <li key={rv.id} className="rounded-2xl bg-soft p-3 text-sm">
                      <p className="flex items-center gap-1 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-current text-warning" aria-hidden="true" />{rv.rating}/5 · {rv.customerName}</p>
                      <p className="mt-1 line-clamp-2">{rv.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={Star} title="No reviews yet" description="Clients can rate a session once it's done." />
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
