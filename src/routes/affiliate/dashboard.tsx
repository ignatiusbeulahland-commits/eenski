import { createFileRoute, Link } from "@tanstack/react-router";
import { dashboardGreeting } from "@/lib/shared/greeting";
import { useIdentity } from "@/lib/shared/identity";
import { useWelcomeKind } from "@/lib/demo/useWelcome";
import { Activity, ArrowRight, BarChart3, Check, Coins, Copy, Link2, Lock, MousePointerClick, Share2, Store, Target, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CharmTip } from "@/components/assistant/CharmStage";
import { naira, products } from "@/lib/affiliate/products";
import { linkFor } from "@/lib/affiliate/promotions";
import { useCopyPromo } from "@/components/affiliate/promote/parts";
import { affiliateMilestones, prototypeBalances } from "@/lib/affiliate/rules";
import { timeAgo } from "@/components/shared/NotificationCentre";
import trophyIcon from "@/assets/dashboard/icons/enski-trophy.webp.asset.json";
import { Button } from "@/components/dashboard-ui/button";
import { TermsNotice } from "@/components/affiliate/TermsNotice";
import { EmptyState, Panel, StatCard } from "@/components/affiliate/ui";
import { useAffiliate } from "@/lib/affiliate/store";
import { meta } from "@/lib/affiliate/meta";
import { cn } from "@/lib/utils";
import { ConversionFunnel, ReferralSources } from "@/components/affiliate/Insights";
import walletIcon from "@/assets/dashboard/icons/enski-wallet.webp.asset.json";
import analyticsIcon from "@/assets/dashboard/icons/enski-analytics.webp.asset.json";
import { BrandIcon, brandArtwork, iconArtwork } from "@/components/affiliate/BrandIcon";

export const Route = createFileRoute("/affiliate/dashboard")({
  head: () => meta("Overview", "Your Enski affiliate activity, earnings and next steps at a glance."),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useAffiliate();
  const b = prototypeBalances;
  const promoting = state.joined.map((id) => products.find((p) => p.id === id)).filter((p): p is (typeof products)[number] => Boolean(p));
  const copyPromo = useCopyPromo();
  const copy = async (id: string) => {
    if (await copyPromo(id)) toast.success("Link copied", { description: "Paste it anywhere your audience hangs out." });
    else toast.error("Couldn't copy the link", { description: `Copy it by hand: ${linkFor(state.promotions, id).url}` });
  };
  const steps = [
    { title: "Explore the affiliate marketplace", desc: "Browse courses and ebooks from Enski creators.", to: "/affiliate/market", cta: "Open Market", done: state.visitedMarket, icon: Store },
    { title: "Choose a product to promote", desc: "Pick something your audience will genuinely value.", to: "/affiliate/market", cta: "Choose product", done: state.joined.length > 0, icon: Target },
    { title: "Generate your referral link", desc: "Promoting a product creates your unique link.", to: "/affiliate/my-affiliations", cta: "View links", done: state.joined.length > 0, icon: Link2 },
    { title: "Share your link", desc: "Copy your link and share it with your audience.", to: "/affiliate/my-affiliations", cta: "Copy link", done: state.linkCopied, icon: Share2 },
    { title: "Track referrals and earnings", desc: "Watch clicks, referrals and earnings come in.", to: "/affiliate/performance", cta: "Performance", done: false, icon: BarChart3 },
  ] as const;
  const done = steps.filter((s) => s.done).length;
  const nextIdx = steps.findIndex((s) => !s.done);
  const milestones = affiliateMilestones(state);
  const welcome = useWelcomeKind();
  const me = useIdentity();

  return (
    <div>
      <TermsNotice />

      <section className="bg-brand-panel relative mb-6 overflow-hidden rounded-2xl p-6 text-primary-foreground sm:p-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-lime"><span className="neon-dot is-live" aria-hidden="true" />Affiliate</p>
            <h1 className="mt-2 text-2xl sm:text-3xl">{dashboardGreeting(me?.greet || state.profile.firstName, welcome)}</h1>
            <p className="mt-1.5 text-sm text-on-dark-muted sm:text-[15px]">Here's an overview of your affiliate activity.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1 ring-1 ring-on-dark/15"><b className="tabular-nums">{state.joined.length}</b><span className="text-on-dark-muted">promoting</span></span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1 ring-1 ring-on-dark/15"><span className={cn("h-1.5 w-1.5 rounded-full", state.termsAccepted ? "bg-lime" : "bg-warning")} aria-hidden="true" /><span className="text-on-dark-muted">{state.termsAccepted ? "Account active" : "Terms not accepted"}</span></span>
            </div>
          </div>
          <Button asChild variant="lime" size="lg" className="shrink-0"><Link to="/affiliate/market">Explore the marketplace <ArrowRight /></Link></Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link to="/affiliate/performance" className="dash-link-card" aria-label={`Total clicks: ${b.clicks}. Open performance report`}><StatCard icon={MousePointerClick} label="Total clicks" value={String(b.clicks)} hint="See the click report" /></Link>
        <Link to="/affiliate/referrals" className="dash-link-card" aria-label={`Total referrals: ${b.referrals}. Open referrals`}><StatCard icon={Users} label="Total referrals" value={String(b.referrals)} hint="See who signed up" tone="sky" /></Link>
        <Link to="/affiliate/performance" className="dash-link-card" aria-label={`Conversions: ${b.conversions}. Open performance report`}><StatCard icon={Target} label="Conversions" value={String(b.conversions)} hint="Completed purchases" tone="lime" /></Link>
        <Link to="/affiliate/transactions" className="dash-link-card" aria-label={`Total earnings: ${naira(b.earnings)}. Open commissions`}><StatCard icon={Coins} label="Total earnings" value={naira(b.earnings)} hint="Commission history" tone="midnight" featured /></Link>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ConversionFunnel />
        <ReferralSources compact />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel title="Getting started" description={`${done} of ${steps.length} steps complete`} actions={
          <div role="progressbar" aria-label="Getting started progress" aria-valuenow={done} aria-valuemin={0} aria-valuemax={steps.length} className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${(done / steps.length) * 100}%` }} /></div>
        } bodyClassName="p-0">
          <ol>
            {steps.map((s, i) => (
              <li key={s.title} className={cn("flex items-center gap-4 border-b px-5 py-4 last:border-0", i === nextIdx && "bg-ice/50")}>
                <span className="relative shrink-0">
                  <BrandIcon src={iconArtwork.get(s.icon)!} className={cn("h-10 w-10", s.done && "opacity-60 grayscale-[35%]")} />
                  <span className={cn("absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold ring-2 ring-card", s.done ? "bg-success text-primary-foreground" : i === nextIdx ? "bg-cobalt text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    {s.done && <span className="sr-only">Done</span>}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-bold", s.done && "text-muted-foreground line-through decoration-1")}>{s.title}</p>
                  <p className="text-xs text-muted-foreground sm:text-[13px]">{s.desc}</p>
                </div>
                <Button asChild size="sm" variant={i === nextIdx ? "default" : "ghost"} className="h-10 shrink-0 sm:h-8"><Link to={s.to} aria-label={s.cta}><span className="hidden sm:inline">{s.cta}</span><ArrowRight className="sm:hidden" /></Link></Button>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="flex flex-col gap-6">
          <section className="surface p-5" aria-labelledby="aff-balance">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-cobalt"><Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Available balance</p>
            <p id="aff-balance" className="mt-2 text-3xl font-extrabold tabular-nums">{naira(b.available)}</p>
            <p className="text-xs font-semibold text-muted-foreground">{naira(b.pending)} pending · {state.bank ? "Payout account added" : "No payout account yet"}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild><Link to="/affiliate/wallet/withdraw" search={{}}>Withdraw</Link></Button>
              <Button asChild variant="outline"><Link to="/affiliate/wallet">Wallet</Link></Button>
            </div>
          </section>
          <Panel title="Your referral links" actions={<Link to="/affiliate/my-affiliations" className="text-xs font-bold text-cobalt">All links</Link>}>
            {promoting.length ? (
              <ul className="divide-y">
                {promoting.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" loading="lazy" width={80} height={80} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{linkFor(state.promotions, p.id).url.replace("https://", "")}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copy(p.id)} aria-label={`Copy link for ${p.title}`}><Copy /> <span className="hidden sm:inline">Copy</span></Button>
                  </li>
                ))}
              </ul>
            ) : (
              <CharmTip pose="wave" then="thumbsup" title="Pick your first product" actions={<Button asChild size="sm"><Link to="/affiliate/market">Browse the market</Link></Button>}>
                Choose something your audience would genuinely use and your personal link appears here.
              </CharmTip>
            )}
          </Panel>
          <Panel title="Quick actions" bodyClassName="grid grid-cols-2 gap-x-3 gap-y-1 p-3">
            {[
              { l: "Browse market", to: "/affiliate/market", artwork: brandArtwork.market },
              { l: "My Affiliations", to: "/affiliate/my-affiliations", artwork: brandArtwork.affiliations },
              { l: "Performance", to: "/affiliate/performance", artwork: analyticsIcon.url },
              { l: "Wallet", to: "/affiliate/wallet", artwork: walletIcon.url },
            ].map((a) => (
              <Link key={a.l} to={a.to} className="group flex flex-col gap-3 rounded-lg p-3.5 transition-colors hover:bg-soft focus-visible:bg-ice">
                <BrandIcon src={a.artwork} className="h-10 w-10 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5" />
                <span className="flex items-center justify-between gap-1 text-sm font-bold">{a.l}<ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-cobalt" /></span>
              </Link>
            ))}
          </Panel>
          <Panel title="Recent activity" bodyClassName={state.notifications.length ? "p-0" : "p-2"}>
            {state.notifications.length ? (
              <ul className="divide-y">
                {state.notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex gap-3 px-5 py-3.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(n.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={Activity} title="No activity yet" description="Clicks, referrals and conversions will appear here when you start promoting products." />
            )}
          </Panel>
        </div>
      </div>

      <Panel className="mt-6" title="Your milestones" description={`${milestones.filter((m) => m.earned).length} of ${milestones.length} earned · unlocked by what you actually do`} actions={<BrandIcon src={trophyIcon.url} className="h-9 w-9" />}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {milestones.map((m) => (
            <li key={m.id} className={cn("flex flex-col items-center rounded-2xl border p-4 text-center transition-colors", m.earned ? "border-lime/70 bg-ice shadow-[inset_0_-3px_0_var(--lime)]" : "border-dashed bg-card")}>
              {m.earned ? <BrandIcon src={brandArtwork.success} className="mb-2 h-12 w-12" /> : <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-soft text-muted-foreground"><Lock className="h-4 w-4" /></span>}
              <p className={cn("text-sm font-extrabold", !m.earned && "text-slate")}>{m.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
              <span className="sr-only">{m.earned ? "Earned" : "Locked"}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
