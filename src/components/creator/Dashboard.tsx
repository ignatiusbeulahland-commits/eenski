import type React from "react";
import { dashboardGreeting } from "@/lib/shared/greeting";
import { useIdentity } from "@/lib/shared/identity";
import { useWelcomeKind } from "@/lib/demo/useWelcome";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Package, Eye, ShoppingBag, Banknote, Activity, UserCheck, MessageSquareText, Check, ChevronDown, UserPen, Store, Megaphone, Landmark, CalendarDays, Star, Wallet, type LucideIcon } from "lucide-react";
import { CharmTip } from "@/components/assistant/CharmStage";
import { StepCurtain } from "@/components/assistant/VictoryCurtain";
import { useMilestone } from "@/lib/assistant/milestones";
import { bookingRows, needsAction, upcomingSessions } from "@/lib/creator/bookings";
import { Button } from "@/components/dashboard-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { Panel, EmptyState } from "@/components/affiliate/ui";
import { BrandIcon, SemanticIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { useCreator } from "@/lib/creator/store";
import { totalEarnings, availableBalance, averageRating, KINDS } from "@/lib/creator/rules";
import { kindInfo } from "@/lib/creator/data";
import { naira } from "@/lib/affiliate/products";
import { cn } from "@/lib/utils";
import { itemPaths, shortDate } from "./shared";
import { SalesChart } from "./Analytics";
import { OrderRows } from "./Commerce";
import { kindIcon } from "./Items";
import { Journey } from "./universe/Journey";
export function CreateMenu({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="lime" size="lg" className={className}>
          <Plus />
          Create product
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {KINDS.map((k) => {
          const Icon = kindIcon[k];
          return (
            <DropdownMenuItem key={k} asChild>
              <Link to={itemPaths[k].create}>
                <Icon />
                {kindInfo[k].label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function CreatorDashboard() {
  const { state } = useCreator();
  const paid = state.orders.filter((o) => o.status === "paid");
  const steps: { done: boolean; label: string; hint: string; icon: LucideIcon; to: string }[] = [
    { done: Boolean(state.profile.firstName && state.profile.lastName && state.profile.bio), label: "Complete your profile", hint: "Name, photo and a short bio", icon: UserPen, to: "/creator/settings/manage-profile" },
    { done: Boolean(state.storefront.name && state.storefront.handle), label: "Set up your storefront", hint: "Pick a name and your link", icon: Store, to: "/creator/storefront" },
    { done: state.items.length > 0, label: "Create your first product", hint: "A course, e-book, session or service", icon: Package, to: "/creator/courses/create" },
    { done: state.items.some((i) => i.status === "published"), label: "Publish a product", hint: "Make it visible to buyers", icon: Megaphone, to: "/creator/courses" },
    { done: Boolean(state.bank), label: "Add bank account details", hint: "So you can withdraw earnings", icon: Landmark, to: "/creator/settings/bank-accounts" },
  ];
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const pct = Math.round((done / steps.length) * 100);
  const me = useIdentity();
  const first = me?.greet || state.profile.firstName;
  const welcome = useWelcomeKind();
  // A small curtain each time another studio setup step gets done.
  const [setupCheer, clearSetupCheer] = useMilestone(me?.email ? `creator-setup:${me.email.toLowerCase()}` : undefined, done);
  const glance = [
    { icon: Package, label: "Products", value: String(state.items.filter((i) => i.status !== "archived").length), to: "/creator/courses", hint: "Manage products" },
    { icon: Eye, label: "Published", value: String(state.items.filter((i) => i.status === "published").length), to: "/creator/courses", hint: "Live on Enski" },
    { icon: ShoppingBag, label: "Sales", value: String(paid.length), to: "/creator/performance", hint: "Sales report" },
    { icon: Banknote, label: "Earnings", value: naira(totalEarnings(state)), to: "/creator/wallet", hint: "Wallet & payouts" },
    { icon: UserCheck, label: "Subscribers", value: String(state.customers.length), to: "/creator/subscribers", hint: "Your dreamers" },
    { icon: MessageSquareText, label: "Reviews", value: String(state.reviews.length), to: "/creator/reviews", hint: "Read feedback" },
  ] as const;
  const rows = bookingRows(state);
  const soon = upcomingSessions(rows).slice(0, 3);
  const todo = needsAction(rows);
  const balance = availableBalance(state);
  const shown = state.reviews.filter((r) => !r.hidden);
  return (
    <div>
      {setupCheer && (
        <StepCurtain
          className="mb-6"
          eyebrow={`Studio setup · ${done} of ${steps.length}`}
          title={next ? "Another setup step done" : "Your studio is fully set up"}
          pose={next ? "clap" : "celebrate"}
          then={next ? "thumbsup" : "proud"}
          onClose={clearSetupCheer}
        >
          {next ? `Next up: ${next.label.toLowerCase()}.` : "Buyers can now find, pay for and enjoy what you make."}
        </StepCurtain>
      )}
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="bg-brand-panel relative isolate flex flex-col justify-center overflow-hidden rounded-3xl p-6 text-primary-foreground sm:p-8">
          <span className="hero-dots" aria-hidden="true" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-2 top-4 hidden sm:block">
            <BrandIcon src={brandArtwork.market} className="creator-hero-prop h-24 w-24 rotate-6 lg:h-28 lg:w-28" />
            <BrandIcon src={brandArtwork.bag} className="creator-hero-prop absolute -bottom-10 -left-10 h-14 w-14 -rotate-12 opacity-90" />
          </div>
          <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-lime self-start">
            <span className="neon-dot is-live" aria-hidden="true" />
            Creator studio
          </span>
          <h1 className="mt-4 max-w-md text-[28px] leading-tight sm:text-4xl">
            {dashboardGreeting("", welcome)}
            {first ? <>, <span className="text-lime">{first}</span></> : null}
          </h1>
          <p className="mt-2 max-w-md text-base font-medium text-on-dark-muted">Create something valuable. Share it with your world.</p>
          <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
            <CreateMenu className="w-full sm:w-auto" />
            <Button asChild size="lg" variant="outline" className="w-full border-2 sm:w-auto border-on-dark bg-transparent text-on-dark hover:bg-on-dark/12 hover:text-on-dark">
              <Link to="/creator/storefront">View storefront</Link>
            </Button>
          </div>
        </section>
        <section className="setup-card relative isolate flex flex-col overflow-hidden rounded-3xl border border-sky-200/70 bg-ice p-5 sm:p-6" aria-labelledby="creator-setup-title">
          <div className="flex items-center gap-4">
            <div className="setup-ring relative grid h-14 w-14 shrink-0 place-items-center rounded-full" style={{ "--setup-pct": `${pct}%` } as React.CSSProperties} aria-hidden="true">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-card text-sm font-extrabold tabular-nums text-cobalt">{pct}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-cobalt">
                <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_8px_var(--lime)]" aria-hidden="true" />
                Studio setup
              </p>
              <h2 id="creator-setup-title" className="mt-0.5 text-lg font-extrabold leading-tight">{next ? "Get started" : "You're all set"}</h2>
              <p className="text-xs font-semibold text-muted-foreground tabular-nums">{done} of {steps.length} steps done</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-card" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Setup progress">
            <div className="h-full rounded-full bg-gradient-to-r from-sky to-lime transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ol className="relative mt-4 flex-1 space-y-1.5">
            {steps.map((s) => {
              const isNext = s === next;
              return (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    aria-current={isNext ? "step" : undefined}
                    className={cn(
                      "group relative flex min-h-14 items-center gap-3 rounded-2xl border px-2.5 py-2 text-sm transition-colors",
                      isNext ? "border-lime/70 bg-card shadow-[0_8px_20px_-14px_var(--cobalt)]" : "border-transparent hover:border-sky-200 hover:bg-card/70",
                    )}
                  >
                    <span className="relative shrink-0">
                      <SemanticIcon icon={s.icon} className={cn("h-9 w-9", s.done && "opacity-60 grayscale-[35%]")} fallbackClassName="h-5 w-5 text-cobalt" />
                      {s.done ? (
                        <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-sky text-primary-foreground ring-2 ring-ice">
                          <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate font-bold group-hover:text-cobalt", s.done && "text-muted-foreground line-through decoration-sky/60")}>{s.label}</span>
                      <span className="block text-xs font-medium leading-snug text-muted-foreground">{s.done ? "Done" : s.hint}</span>
                    </span>
                    {isNext ? (
                      <span className="shrink-0 rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight">Next</span>
                    ) : !s.done ? (
                      <ArrowRight className="h-4 w-4 shrink-0 text-cobalt opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    ) : null}
                    <span className="sr-only">{s.done ? "(completed)" : isNext ? "(next step)" : "(to do)"}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Button asChild size="lg" className="mt-4 w-full">
            {next ? <Link to={next.to}>Continue setup <ArrowRight /></Link> : <Link to="/creator/storefront">Open storefront <ArrowRight /></Link>}
          </Button>
        </section>
      </div>
      <Panel title="Your studio at a glance" className="mb-6" bodyClassName="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {glance.map((g) => (
          <Link key={g.label} to={g.to} className="group flex min-w-0 items-center gap-3 rounded-2xl border bg-card p-3 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-sky/60 hover:shadow-[0_10px_24px_-18px_var(--cobalt)]" aria-label={`${g.label}: ${g.value}. ${g.hint}`}>
            <SemanticIcon icon={g.icon} className="h-10 w-10" fallbackClassName="h-5 w-5 text-cobalt" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-2xl font-extrabold leading-tight tabular-nums">{g.value}</p>
              <p className="truncate text-[13px] font-semibold text-muted-foreground">{g.label}</p>
              <p className="truncate text-[11px] font-bold text-cobalt opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{g.hint} →</p>
            </div>
          </Link>
        ))}
      </Panel>
      <Journey />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel
            title="Sales"
            actions={
              <Link to="/creator/performance" className="text-xs font-bold text-cobalt">
                Performance
                <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            }
          >
            <SalesChart orders={state.orders} />
          </Panel>
          <Panel
            title="Recent orders"
            actions={
              <Link to="/creator/wallet" className="text-xs font-bold text-cobalt">
                All orders
              </Link>
            }
          >
            <OrderRows orders={state.orders.slice().reverse().slice(0, 5)} />
          </Panel>
          <Panel
            title="Bookings & sessions"
            description={todo.length ? `${todo.length} need${todo.length === 1 ? "s" : ""} your action` : "Coaching, live sessions and services"}
            actions={<Link to="/creator/bookings" className="text-xs font-bold text-cobalt">Open bookings <ArrowRight className="ml-1 inline h-3 w-3" /></Link>}
          >
            {soon.length ? (
              <ul className="divide-y">
                {soon.map((r) => (
                  <li key={r.id}>
                    <Link to="/creator/bookings" className="group flex items-center gap-3 py-3 text-sm">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ice text-center leading-none text-cobalt" aria-hidden="true">
                        <span><span className="block text-[9px] font-extrabold uppercase">{new Date(r.when!).toLocaleDateString(undefined, { month: "short" })}</span><span className="block text-base font-extrabold">{new Date(r.when!).getDate()}</span></span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold group-hover:text-cobalt">{r.item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{r.who} · {new Date(r.when!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={CalendarDays} title="No sessions booked yet" description="Offer coaching, a live session or a service and bookings will appear here." action={<Button asChild size="sm" variant="outline"><Link to="/creator/bookings">See bookings</Link></Button>} />
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <section className="surface relative overflow-hidden p-5" aria-labelledby="creator-balance">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-cobalt"><Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Earnings & payouts</p>
            <p id="creator-balance" className="mt-2 text-3xl font-extrabold tabular-nums">{naira(balance)}</p>
            <p className="text-xs font-semibold text-muted-foreground">Available to withdraw · {naira(totalEarnings(state))} earned in total</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild><Link to="/creator/wallet/withdraw" search={{}}>Withdraw</Link></Button>
              <Button asChild variant="outline"><Link to="/creator/wallet">View earnings</Link></Button>
            </div>
          </section>
          <Panel title="Quick actions">
            <div className="divide-y">
              {KINDS.map((k) => {
                const Icon = kindIcon[k];
                return (
                  <Link key={k} to={itemPaths[k].create} className="flex min-h-14 items-center gap-3 py-3 text-sm font-bold hover:bg-soft">
                    <SemanticIcon icon={Icon} className="h-9 w-9" fallbackClassName="h-4 w-4 text-cobalt" />
                    <span className="flex-1">Create {kindInfo[k].label}</span>
                    <ArrowRight className="h-4 w-4 text-cobalt" />
                  </Link>
                );
              })}
            </div>
          </Panel>
          <Panel title="Latest reviews" actions={<Link to="/creator/reviews" className="text-xs font-bold text-cobalt">All reviews</Link>} description={shown.length ? `${averageRating(shown)} average` : undefined}>
            {shown.length ? (
              <ul className="space-y-3">
                {shown.slice(-2).reverse().map((r) => (
                  <li key={r.id} className="rounded-2xl bg-soft p-3 text-sm">
                    <p className="flex items-center gap-1 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-current text-warning" aria-hidden="true" />{r.rating}/5 · {r.customerName} · <span className="truncate font-semibold text-muted-foreground">{r.itemTitle}</span></p>
                    <p className="mt-1 line-clamp-2">{r.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={MessageSquareText} title="No reviews yet" description="When buyers rate your products, the newest ones show up here." compact />
            )}
          </Panel>
          {state.items.length === 0 && (
            <CharmTip pose="wave" then="thumbsup" title="Start with one thing you know well" actions={<Button asChild size="sm"><Link to="/creator/courses/create">Create a course</Link></Button>}>
              A short course or a single coaching call is plenty for a first product. You can add more later.
            </CharmTip>
          )}
          <Panel title="Recent activity">
            {state.activity.length ? (
              <ul className="divide-y">
                {state.activity
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((a) => (
                    <li key={a.id} className="py-3 text-sm">
                      <p>{a.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{shortDate(a.date)}</p>
                    </li>
                  ))}
              </ul>
            ) : (
              <EmptyState icon={Activity} title="No activity yet" description="What you do in your studio will show up here." compact />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
