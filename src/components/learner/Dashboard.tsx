import { Link } from "@tanstack/react-router";
import { dashboardGreeting, greetName } from "@/lib/shared/greeting";
import { useWelcomeKind } from "@/lib/demo/useWelcome";
import { ArrowRight, Award, Bell, BookOpen, Bookmark, CalendarDays, Check, Flame, History, Library, PlayCircle, ShoppingBag, ShoppingCart, Trophy } from "lucide-react";
import { CharmTip } from "@/components/assistant/CharmStage";
import { openCharm } from "@/lib/assistant/open";
import { timeAgo } from "@/components/shared/NotificationCentre";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, Panel, StatCard } from "@/components/affiliate/ui";
import { SemanticIcon } from "@/components/affiliate/BrandIcon";
import { events, findEvent, findResource, isPast } from "@/lib/learner/catalog";
import { localDateTime, useViewerTimeZone } from "@/lib/learner/timezone";
import { badgeDefs, dayKey, itemInfo, learningStreak, ownedResourceIds, profileCompletion, resourceProgress } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { BadgeArt } from "./BadgeArt";
import { LearnerAvatar } from "./Header";
import { EventCard, price, shortDate } from "./shared";
import { PurchaseStatus } from "./Purchases";
import { RecommendedForYou } from "./Recommended";

export function LearnerDashboard() {
  const { state } = useLearner();
  const tz = useViewerTimeZone();
  const owned = ownedResourceIds(state);
  const upcoming = state.registrations.map((r) => ({ r, e: findEvent(r.eventId) })).filter((x) => x.e && !isPast(x.e)).sort((a, b) => a.e!.start.localeCompare(b.e!.start));
  const recent = owned.map((id) => ({ id, at: state.progress[id]?.lastAccessed })).filter((x) => x.at).sort((a, b) => b.at!.localeCompare(a.at!)).slice(0, 3);
  const purchasedItems = state.purchases.filter((p) => p.status === "paid").flatMap((p) => p.items.map((i) => ({ ...i, date: p.date, purchaseId: p.id }))).slice(0, 4);
  const unlocked = badgeDefs.filter((b) => state.badges[b.id]);
  const completion = profileCompletion(state);
  const streak = learningStreak(state.learningDays);
  const learnedToday = state.learningDays.includes(dayKey(new Date()));
  const inProgress = recent.map(({ id }) => ({ id, p: resourceProgress(state, id) })).find((x) => !x.p.complete);
  const nextEvent = upcoming[0]?.e;
  const focus = [
    { done: learnedToday, title: "Learn something today", detail: learnedToday ? "Done. Your streak is safe." : "Open a resource or finish a lesson", to: "/learner/resources" as const, search: owned.length ? {} : { view: "discover" as const }, params: undefined },
    inProgress
      ? { done: false, title: "Continue where you stopped", detail: `${findResource(inProgress.id)?.title} · ${inProgress.p.pct}%`, to: "/learner/resources/$resourceId" as const, params: { resourceId: inProgress.id }, search: undefined }
      : { done: false, title: owned.length ? "Start a resource" : "Pick your first resource", detail: owned.length ? "Open something from your library" : "Browse the catalogue", to: "/learner/resources" as const, search: owned.length ? {} : { view: "discover" as const }, params: undefined },
    nextEvent
      ? { done: false, title: "Get ready for your next event", detail: `${nextEvent.title} · ${localDateTime(nextEvent.start, tz)}`, to: "/learner/events/$eventId" as const, params: { eventId: nextEvent.id }, search: undefined }
      : { done: false, title: "Join a live event", detail: "Register for an upcoming class or meetup", to: "/learner/events" as const, params: undefined, search: undefined },
  ];
  const first = greetName(state.profile.displayName, state.profile.fullName);
  const welcome = useWelcomeKind();
  const recommendedEvents = events.filter((e) => !isPast(e) && !state.registrations.some((r) => r.eventId === e.id)).slice(0, 3);
  const quick = [
    { label: "Browse events", to: "/learner/events", icon: CalendarDays },
    { label: "Discover resources", to: "/learner/resources", search: { view: "discover" as const }, icon: BookOpen },
    { label: "Open wishlist", to: "/learner/wishlist", icon: Bookmark },
    { label: "View cart", to: "/learner/cart", icon: ShoppingCart },
  ] as const;
  return (
    <div>
      <section className="bg-brand-panel mb-6 overflow-hidden rounded-2xl p-6 text-primary-foreground sm:p-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-lime"><span className="neon-dot is-live" aria-hidden="true" />Your learning space</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/12 px-3 py-1 text-xs font-extrabold text-on-dark ring-1 ring-on-dark/20" aria-label={streak ? `${streak} day learning streak` : "No learning streak yet"}>
                <Flame className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                {streak ? `Day ${streak} streak` : "Start your streak today"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl">{dashboardGreeting(first, welcome)}</h1>
            <p className="mt-2 max-w-lg text-sm text-on-dark-muted">Discover events, learn from creators you trust and collect badges as you grow.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="lime"><Link to="/learner/events">Find an event <ArrowRight /></Link></Button>
              <Button asChild variant="outline" className="border-on-dark/30 bg-transparent text-on-dark hover:bg-on-dark/10 hover:text-on-dark"><Link to="/learner/resources" search={{ view: "discover" }}>Discover resources</Link></Button>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-4 rounded-xl bg-midnight/40 p-4 md:w-72">
            <LearnerAvatar size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{state.profile.fullName}</p>
              <p className="text-xs text-on-dark-muted">Profile {completion}% complete</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-on-dark/15"><div className="h-full rounded-full bg-lime" style={{ width: `${completion}%` }} /></div>
              {completion < 100 && <Link to="/learner/settings/profile" className="mt-2 inline-block text-xs font-bold text-lime hover:underline">Complete profile</Link>}
            </div>
          </div>
        </div>
      </section>
      <ContinueLearning />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link to="/learner/resources" search={{}} className="dash-link-card" aria-label={`Resources owned: ${owned.length}. Open your library`}><StatCard icon={Library} label="Resources owned" value={String(owned.length)} hint="Open library" /></Link>
        <Link to="/learner/events" className="dash-link-card" aria-label={`Upcoming events: ${upcoming.length}. Open events`}><StatCard icon={CalendarDays} label="Upcoming events" value={String(upcoming.length)} tone="sky" hint={nextEvent ? localDateTime(nextEvent.start, tz) : "Find an event"} /></Link>
        <Link to="/learner/certificates" search={{}} className="dash-link-card" aria-label={`Certificates: ${state.certificates.length}. Open certificates`}><StatCard icon={Award} label="Certificates" value={String(state.certificates.length)} tone="midnight" hint="View and share" /></Link>
        <Link to="/learner/certificates" search={{ tab: "badges" }} className="dash-link-card" aria-label={`Badges: ${unlocked.length} of ${badgeDefs.length}. Open badges`}><StatCard icon={Trophy} label="Badges" value={`${unlocked.length}/${badgeDefs.length}`} tone="lime" hint="See your collection" /></Link>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quick.map((q) => (
          <Link key={q.label} to={q.to} search={"search" in q ? q.search : {}} className="surface flex min-h-14 items-center gap-3 p-3 text-sm font-bold transition-colors hover:border-cobalt hover:text-cobalt">
            <SemanticIcon icon={q.icon} className="h-9 w-9" fallbackClassName="h-4 w-4 text-cobalt" />
            <span className="min-w-0">{q.label}</span>
          </Link>
        ))}
      </div>
      <Panel className="mb-6" title="Today's focus" description="Small steps keep your streak going" bodyClassName="grid gap-2 p-3 sm:grid-cols-3">
        {focus.map((f) => (
          <Link key={f.title} to={f.to} params={f.params as never} search={f.search as never} className={cn("group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-soft", f.done && "bg-success-soft/60")}>
            <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2", f.done ? "border-success bg-success text-primary-foreground" : "border-line text-transparent group-hover:border-cobalt")}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-bold", f.done && "text-success")}>{f.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{f.detail}</span>
            </span>
          </Link>
        ))}
      </Panel>
      <RecommendedForYou />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Upcoming events" description="Events you've registered for" actions={<Link to="/learner/events" className="text-xs font-bold text-cobalt">All events</Link>}>
            {upcoming.length ? (
              <ul className="divide-y">
                {upcoming.slice(0, 3).map(({ e }) => (
                  <li key={e!.id}>
                    <Link to="/learner/events/$eventId" params={{ eventId: e!.id }} className="flex items-center gap-3 py-3 hover:text-cobalt">
                      <img src={e!.image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" loading="lazy" width={64} height={48} />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{e!.title}</span><span className="block text-xs text-muted-foreground">{localDateTime(e!.start, tz)} · {e!.mode}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={CalendarDays} title="No upcoming events" description="Register for an event and it will appear here with its date and joining details." action={<Button asChild size="sm"><Link to="/learner/events">Browse events</Link></Button>} />
            )}
          </Panel>
          <Panel title="Recently accessed" description="Pick up where you left off">
            {recent.length ? (
              <ul className="divide-y">
                {recent.map(({ id }) => {
                  const r = findResource(id)!;
                  const p = resourceProgress(state, id);
                  return (
                    <li key={id}>
                      <Link to="/learner/resources/$resourceId" params={{ resourceId: id }} className="flex items-center gap-3 py-3 hover:text-cobalt">
                        <img src={r.image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" loading="lazy" width={64} height={48} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{r.title}</span>
                          <span className="mt-1.5 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ice"><span className={cn("block h-full rounded-full", p.complete ? "bg-lime" : "bg-cobalt")} style={{ width: `${p.pct}%` }} /></span><span className="text-xs tabular-nums text-muted-foreground">{p.pct}%</span></span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState compact icon={BookOpen} title="Nothing opened yet" description={owned.length ? "Open a resource from your library to start learning." : "Resources you buy appear in your library, ready to open."} action={<Button asChild size="sm" variant="outline"><Link to="/learner/resources" search={owned.length ? {} : { view: "discover" }}>{owned.length ? "Open library" : "Discover resources"}</Link></Button>} />
            )}
          </Panel>
          <Panel title="Recently purchased" actions={<Link to="/learner/purchases" className="text-xs font-bold text-cobalt">All purchases</Link>}>
            {purchasedItems.length ? (
              <ul className="divide-y">
                {purchasedItems.map((i) => (
                  <li key={i.purchaseId + i.id} className="flex items-center gap-3 py-3">
                    {i.image && <img src={i.image} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" loading="lazy" width={56} height={40} />}
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{i.title}</p><p className="text-xs text-muted-foreground">{shortDate(i.date)} · {i.kind === "event" ? "Event ticket" : "Resource"}</p></div>
                    {i.kind === "resource" ? <Button asChild size="sm" variant="soft"><Link to="/learner/resources/$resourceId" params={{ resourceId: i.id }}>Open</Link></Button> : <Button asChild size="sm" variant="soft"><Link to="/learner/events/$eventId" params={{ eventId: i.id }}>View</Link></Button>}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={ShoppingBag} title="No purchases yet" description="When you buy a resource or event ticket, it shows up here." />
            )}
          </Panel>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Achievements" description={`${unlocked.length} of ${badgeDefs.length} badges · ${state.certificates.length} certificates`} actions={<Link to="/learner/certificates" className="text-xs font-bold text-cobalt">View all</Link>}>
            {unlocked.length ? (
              <div className="flex flex-wrap gap-3">{unlocked.slice(0, 6).map((b) => <Link key={b.id} to="/learner/badges/$badgeKey" params={{ badgeKey: b.id }} className="group flex w-20 flex-col items-center rounded-xl p-1 text-center transition-transform hover:-translate-y-0.5"><BadgeArt badge={b} unlocked size={56} /><p className="mt-1 text-xs font-bold leading-tight group-hover:text-cobalt">{b.title}</p></Link>)}</div>
            ) : (
              <div className="text-center">
                <div className="mb-3 flex justify-center -space-x-3">{badgeDefs.slice(0, 3).map((b) => <BadgeArt key={b.id} badge={b} unlocked={false} size={52} />)}</div>
                <p className="text-sm font-bold">Your first badge is waiting</p>
                <p className="mt-1 text-xs text-muted-foreground">Complete a lesson, finish a resource or attend an event to start your collection.</p>
              </div>
            )}
            {state.certificates.length > 0 && (
              <ul className="mt-4 divide-y border-t">
                {state.certificates.slice(0, 2).map((c) => (
                  <li key={c.id}>
                    <Link to="/learner/certificates/$certificateId" params={{ certificateId: c.id }} className="flex items-center gap-3 py-2.5 text-sm hover:text-cobalt">
                      <Award className="h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-bold">{c.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{shortDate(c.issuedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <LearnerNotifications />
          <Panel title="Saved items" actions={<Link to="/learner/wishlist" className="text-xs font-bold text-cobalt">Wishlist</Link>}>
            {state.wishlist.length ? (
              <ul className="divide-y">
                {state.wishlist.slice(0, 4).map((w) => {
                  const info = itemInfo(w);
                  if (!info) return null;
                  return (
                    <li key={w.kind + w.id}>
                      <Link to={w.kind === "resource" ? "/learner/resources/$resourceId" : "/learner/events/$eventId"} params={w.kind === "resource" ? { resourceId: w.id } : { eventId: w.id }} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-cobalt">
                        <span className="truncate font-semibold">{info.title}</span><span className="shrink-0 font-bold tabular-nums">{price(info.price)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState compact icon={Bookmark} title="Nothing saved yet" description="Tap the bookmark on any resource or paid event to save it for later." />
            )}
          </Panel>
          <Panel title="Recent activity">
            {state.purchases.length ? (
              <ul className="divide-y">
                {state.purchases.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link to="/learner/purchases/$purchaseId" params={{ purchaseId: p.id }} className="flex items-center justify-between gap-3 py-2.5 hover:text-cobalt">
                      <span className="min-w-0"><span className="block truncate text-sm font-bold">{p.orderNumber}</span><span className="text-xs text-muted-foreground">{shortDate(p.date)} · {price(p.total)}</span></span>
                      <PurchaseStatus status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={History} title="No activity yet" description="Your purchase activity will appear here." />
            )}
          </Panel>
        </div>
      </div>
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><h2 className="text-lg font-bold">Events you might like</h2><p className="text-xs text-muted-foreground">Upcoming sessions picked for you</p></div>
          <Link to="/learner/events" className="shrink-0 text-xs font-bold text-cobalt">More events</Link>
        </div>
        {recommendedEvents.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recommendedEvents.map((e) => <EventCard key={e.id} e={e} compact />)}</div>}
        {!recommendedEvents.length && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-lime-text" /> You're registered for every upcoming event.</p>}
      </section>
    </div>
  );
}

/** The one thing to do next: pick up the course you were last in, or start the first one. */
function ContinueLearning() {
  const { state } = useLearner();
  const owned = ownedResourceIds(state);
  const last = owned
    .map((id) => ({ id, at: state.progress[id]?.lastAccessed ?? "", p: resourceProgress(state, id) }))
    .sort((a, b) => Number(a.p.complete) - Number(b.p.complete) || b.at.localeCompare(a.at))[0];
  const r = last ? findResource(last.id) : undefined;
  if (!r || !last) {
    return (
      <CharmTip
        className="mb-6"
        pose="wave"
        then="thumbsup"
        title="Your learning starts here"
        actions={
          <>
            <Button asChild size="sm"><Link to="/learner/resources" search={{ view: "discover" }}>Discover courses <ArrowRight /></Link></Button>
            <Button size="sm" variant="outline" onClick={() => openCharm({ fresh: true, prompt: "What should I learn first?" })}>Ask me what to learn</Button>
          </>
        }
      >
        Pick a course or eBook and it will wait for you right here, with your progress and the next lesson.
      </CharmTip>
    );
  }
  const started = Boolean(last.at);
  return (
    <section className="continue-card surface group relative mb-6 grid overflow-hidden sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]" aria-labelledby="continue-title">
      <div className="relative aspect-[16/9] overflow-hidden sm:aspect-auto">
        <img src={r.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" width={480} height={300} />
        <span className="absolute inset-0 bg-gradient-to-t from-midnight/50 to-transparent" aria-hidden="true" />
        <PlayCircle className="absolute bottom-3 left-3 h-9 w-9 text-on-dark drop-shadow" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-3 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-cobalt">
          <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_8px_var(--lime)]" aria-hidden="true" />
          {last.p.complete ? "Completed" : started ? "Continue learning" : "Ready to start"}
        </p>
        <h2 id="continue-title" className="text-xl font-extrabold leading-snug sm:text-2xl">{r.title}</h2>
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{last.p.complete ? "All lessons done" : started ? `You stopped ${timeAgo(last.at).toLowerCase()}` : "Not opened yet"}</span>
            <span className="tabular-nums text-ink">{last.p.pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ice" role="progressbar" aria-valuenow={last.p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
            <div className={cn("h-full rounded-full transition-[width] duration-700", last.p.complete ? "bg-lime" : "bg-gradient-to-r from-cobalt to-sky")} style={{ width: `${Math.max(3, last.p.pct)}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/learner/resources/$resourceId" params={{ resourceId: r.id }}>{last.p.complete ? "Review course" : started ? "Continue learning" : "Start learning"} <ArrowRight /></Link></Button>
          <Button asChild variant="outline"><Link to="/learner/resources" search={{}}>My library</Link></Button>
        </div>
      </div>
    </section>
  );
}

const NOTE_LINK = {
  purchase: "/learner/purchases",
  event: "/learner/events",
  achievement: "/learner/certificates",
  product: "/learner/resources",
  account: "/learner/settings/profile",
  support: "/learner/help/requests",
} as const;

function LearnerNotifications() {
  const { state } = useLearner();
  const list = state.notifications.slice(0, 4);
  return (
    <Panel title="Notifications" description={list.some((n) => !n.read) ? `${state.notifications.filter((n) => !n.read).length} unread` : "You're up to date"}>
      {list.length ? (
        <ul className="divide-y">
          {list.map((n) => (
            <li key={n.id}>
              <Link to={NOTE_LINK[n.type]} className="group flex items-start gap-3 py-2.5 hover:text-cobalt">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-sky")} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{n.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.body} · {timeAgo(n.date)}</span>
                </span>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-cobalt" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState compact icon={Bell} title="No notifications yet" description="Purchases, event reminders and new badges will show up here." />
      )}
    </Panel>
  );
}
