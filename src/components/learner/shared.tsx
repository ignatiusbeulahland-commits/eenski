import { LoadErrorScreen, MissingScreen } from "@/components/shared/StatusScreen";
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Award, Bookmark, Check, CalendarDays, ChevronRight, Clock, Download, Eye, MapPin, Radio, Star, Video, type LucideIcon } from "lucide-react";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { StatusBadge } from "@/components/affiliate/ui";
import { naira } from "@/lib/affiliate/products";
import { dayIn, timeIn, useViewerTimeZone } from "@/lib/learner/timezone";
import { eventLength, isPast, isPreviewResource, type LearnerEvent, type LearnerResource } from "@/lib/learner/catalog";
import { owns, registration, toggleWishlist, type ItemRef } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";

export const price = (n: number) => (n === 0 ? "Free" : naira(n));
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export function WishlistButton({ item, className, label = false }: { item: ItemRef; className?: string; label?: boolean }) {
  const { state, update } = useLearner();
  const saved = state.wishlist.some((w) => w.kind === item.kind && w.id === item.id);
  return (
    <Button
      type="button"
      variant="outline"
      size={label ? "default" : "icon"}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(!label && "h-9 w-9", saved && "border-cobalt text-cobalt", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        update((s) => toggleWishlist(s, item));
        toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
      }}
    >
      <Bookmark className={cn(saved && "fill-current")} />
      {label && (saved ? "Saved" : "Save")}
    </Button>
  );
}

export function ResourceCard({ r }: { r: LearnerResource }) {
  const { state } = useLearner();
  const owned = owns(state, r.id);
  const preview = isPreviewResource(r);
  const minutes = r.units.reduce((a, u) => a + u.minutes, 0);
  return (
    <article className="surface group relative flex min-w-0 flex-col overflow-hidden transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lift has-[a:focus-visible]:shadow-[var(--focus-ring)] motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-ice">
        <img src={r.image} alt={r.imageAlt} loading="lazy" width={640} height={480} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
        {preview && <PreviewChip />}
        <span className="absolute bottom-2 left-2 rounded-lg bg-midnight/85 px-2 py-1 text-[12px] font-bold text-on-dark">{r.type}</span>
        {!owned && <WishlistButton item={{ kind: "resource", id: r.id }} className="absolute right-2 top-2 bg-card/95" />}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline gap-1.5">
          {owned ? <StatusBadge tone="success">In your library</StatusBadge> : r.price === 0
            ? <span className="rounded-lg bg-lime px-2 py-0.5 text-sm font-extrabold text-midnight">Free</span>
            : <span className="text-lg font-extrabold leading-none tabular-nums text-cobalt sm:text-xl">{naira(r.price)}</span>}
          {!owned && r.originalPrice && r.originalPrice > r.price && <s className="text-xs font-semibold text-muted-foreground tabular-nums">{naira(r.originalPrice)}</s>}
        </div>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
          <Link to="/learner/resources/$resourceId" params={{ resourceId: r.id }} className="after:absolute after:inset-0 focus-visible:outline-none">
            {r.title}
            {preview && <span className="sr-only"> (preview page)</span>}
          </Link>
        </h3>
        <p className="truncate text-xs text-muted-foreground">by {r.creator}</p>
        <ul className="mt-0.5 flex flex-wrap gap-1" aria-label="Resource details">
          {r.rating !== undefined && <li className="event-chip"><Star className="fill-current" aria-hidden="true" />{r.rating.toFixed(1)}</li>}
          <li className="event-chip"><Clock aria-hidden="true" />{eventLength(minutes)}</li>
          <li className="event-chip hidden sm:inline-flex">{r.category}</li>
          {r.certificate && <li className="event-chip is-badge"><Award aria-hidden="true" />Certificate</li>}
          {!r.certificate && r.downloadable && <li className="event-chip"><Download aria-hidden="true" />Download</li>}
        </ul>
        {preview && <PreviewPill />}
      </div>
    </article>
  );
}

/** Dropdown that switches a page between live items and preview pages, so they never show together. */
export function PreviewSwitch({ value, onChange, liveLabel, liveCount, previewCount, className }: { value: "live" | "preview"; onChange: (v: "live" | "preview") => void; liveLabel: string; liveCount: number; previewCount: number; className?: string }) {
  return (
    <SectionDropdown
      heading="Showing"
      value={value}
      onChange={(v) => onChange(v === "preview" ? "preview" : "live")}
      options={[
        { value: "live", label: liveLabel, count: liveCount, icon: Radio },
        { value: "preview", label: "Preview pages", count: previewCount, icon: Eye },
      ]}
      className={cn("w-full sm:max-w-xs", className)}
    />
  );
}

export type JourneyStep = { label: string; done: boolean };

/** Banner on a preview detail page: buying and registering work, and a tracker shows each step of the learner journey. */
export function PreviewBanner({ what, steps }: { what: "event" | "resource"; steps: JourneyStep[] }) {
  const current = steps.findIndex((st) => !st.done);
  const doneCount = current === -1 ? steps.length : current;
  return (
    <section className="mb-4 rounded-2xl border border-sky-200 bg-ice p-4 sm:p-5" aria-label="Your steps">
      <div className="flex items-start gap-3 sm:items-center">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cobalt text-primary-foreground"><Eye className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-cobalt">{what === "event" ? "Your steps for this event" : "Your steps for this resource"}</p>
          <p className="text-sm text-muted-foreground">{what === "event" ? "Register or get a ticket, check out, then join on the day. Each step is ticked off as you go." : "Buy it, check out, then start learning. Each step is ticked off as you go."}</p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-extrabold tabular-nums text-cobalt sm:inline-flex">{doneCount} of {steps.length} done</span>
      </div>
      <ol className={cn("mt-4 grid gap-2", steps.length > 4 ? "grid-cols-3 sm:grid-cols-5" : steps.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        {steps.map((st, i) => {
          const isCurrent = i === current;
          return (
            <li key={st.label} aria-current={isCurrent ? "step" : undefined} className={cn("flex min-w-0 items-center gap-2 rounded-xl border bg-card px-2.5 py-2", isCurrent && "border-cobalt shadow-soft", st.done && "border-transparent")}>
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold", st.done ? "bg-lime-100 text-lime-text" : isCurrent ? "bg-cobalt text-primary-foreground" : "bg-soft text-muted-foreground")}>
                {st.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("min-w-0 truncate text-[13px] font-bold", st.done ? "text-muted-foreground" : "text-midnight")}>{st.label}</span>
              <span className="sr-only">{st.done ? " (done)" : isCurrent ? " (next step)" : ""}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Slim Enski-blue strip of real platform benefits above a shopping grid. */
export function PerkStrip({ perks, label }: { perks: readonly { icon: LucideIcon; label: string }[]; label: string }) {
  return (
    <ul className="bg-brand-panel mb-5 grid grid-cols-3 gap-1 rounded-2xl p-2 text-on-dark sm:gap-2 sm:p-2.5" aria-label={label}>
      {perks.map((p) => (
        <li key={p.label} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-center text-[12px] font-bold leading-tight sm:flex-row sm:justify-center sm:gap-2 sm:text-[13px]">
          <p.icon className="h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
          <span>{p.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Calendar-style date block (month strip, day, weekday) in the viewer's time zone. */
export function DateBlock({ iso, tz, size = "sm", className }: { iso: string; tz: string; size?: "sm" | "lg"; className?: string }) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-NG", { ...o, timeZone: tz });
  return (
    <span className={cn("block shrink-0 overflow-hidden rounded-xl bg-card text-center shadow-lift", size === "lg" ? "w-[76px]" : "w-12", className)} aria-hidden="true">
      <span className={cn("block bg-lime font-extrabold uppercase tracking-wider text-midnight", size === "lg" ? "py-1 text-[11px]" : "py-0.5 text-[10px]")}>{part({ month: "short" })}</span>
      <span className={cn("block font-extrabold leading-none tabular-nums text-midnight", size === "lg" ? "pt-1.5 text-3xl" : "pt-1 text-lg")}>{part({ day: "numeric" })}</span>
      <span className={cn("block font-bold text-slate-500 dark:text-muted-foreground", size === "lg" ? "pb-1.5 text-[11px]" : "pb-1 text-[10px]")}>{part({ weekday: "short" })}</span>
    </span>
  );
}

export const hostInitials = (name: string) => name.replace(/^Dr\.?\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
export function HostAvatar({ name, size = "sm", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "h-14 w-14 text-lg" : size === "md" ? "h-9 w-9 text-xs" : "h-6 w-6 text-[10px]";
  return <span className={cn("grid shrink-0 place-items-center rounded-full bg-cobalt font-extrabold text-primary-foreground", box, className)} aria-hidden="true">{hostInitials(name)}</span>;
}

export function EventCard({ e, compact }: { e: LearnerEvent; compact?: boolean }) {
  const { state } = useLearner();
  const reg = registration(state, e.id);
  const past = isPast(e);
  const tz = useViewerTimeZone();
  const inCart = state.cart.some((c) => c.kind === "event" && c.id === e.id);
  return (
    <article className="event-tile surface group relative flex min-w-0 flex-col overflow-hidden transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lift has-[a:focus-visible]:shadow-[var(--focus-ring)] motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-ice">
        <img src={e.image} alt={e.imageAlt} loading="lazy" width={640} height={400} className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none", past && "grayscale-[60%]")} />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-midnight/75 to-transparent" aria-hidden="true" />
        <DateBlock iso={e.start} tz={tz} className="absolute left-2 top-2 sm:left-3 sm:top-3" />
        {!past && e.price > 0 && !reg && <WishlistButton item={{ kind: "event", id: e.id }} className="absolute right-2 top-2 bg-card/95" />}
        <span className="absolute bottom-2 left-2 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full bg-midnight/70 px-2 py-0.5 text-[11px] font-bold text-on-dark backdrop-blur-sm sm:left-3 sm:text-[12px]">
          {e.mode === "Online" ? <Video className="h-3.5 w-3.5 shrink-0 text-lime" aria-hidden="true" /> : <MapPin className="h-3.5 w-3.5 shrink-0 text-lime" aria-hidden="true" />}
          <span className="truncate">{e.mode === "Online" ? "Online" : e.venue}</span>
        </span>
        {e.featured && !past && !compact && <span className="absolute bottom-2 right-2 hidden rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight sm:inline-flex">Featured</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p className="truncate text-[11px] font-extrabold uppercase tracking-wide text-sky-text">{e.category}<span className="hidden sm:inline"> · {e.level}</span></p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
          <Link to="/learner/events/$eventId" params={{ eventId: e.id }} className="after:absolute after:inset-0 focus-visible:outline-none">{e.title}</Link>
        </h3>
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><HostAvatar name={e.host} /><span className="truncate">{e.host}</span></p>
        <p className="flex min-w-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0 text-cobalt" aria-hidden="true" />
          <span className="truncate">{timeIn(e.start, tz)} · {eventLength(e.durationMinutes)}</span>
          <span className="sr-only">, {dayIn(e.start, tz)}</span>
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 border-t border-line pt-2.5">
          {e.price === 0
            ? <span className="rounded-full bg-lime px-2.5 py-0.5 text-[13px] font-extrabold text-midnight">Free</span>
            : <span className="text-base font-extrabold leading-none tabular-nums text-brand sm:text-lg">{naira(e.price)}</span>}
          {reg ? <StatusBadge tone="success">{reg.attendedAt ? "Attended" : "Registered"}</StatusBadge>
            : past ? <StatusBadge tone="neutral">Ended</StatusBadge>
            : inCart ? <StatusBadge tone="info">In cart</StatusBadge>
            : <span className="hidden items-center gap-0.5 text-[13px] font-extrabold text-cobalt sm:inline-flex" aria-hidden="true">{e.price === 0 ? "Register" : "Get tickets"}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>}
        </div>
        {e.eligible && !compact && <span className="sr-only">Attending counts towards a badge.</span>}
      </div>
    </article>
  );
}

function PreviewChip() {
  return <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-lg bg-cobalt px-2 py-0.5 text-[12px] font-extrabold text-primary-foreground shadow-sm"><Eye className="h-3 w-3" aria-hidden="true" />Preview</span>;
}
function PreviewPill() {
  return (
          <span className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-full bg-ice text-[13px] font-extrabold text-cobalt transition-colors group-hover:bg-sky-200" aria-hidden="true">
            <Eye className="h-4 w-4" /> Preview page
          </span>
  );
}

export function LearnerError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <LoadErrorScreen
      onRetry={async () => { await router.invalidate(); reset(); }}
      actions={<Button asChild variant="outline"><Link to="/learner/help">Visit Help</Link></Button>}
    />
  );
}
type LearnerMissing = "page" | "event" | "resource" | "purchase" | "certificate" | "article" | "guide";
const learnerTargets = {
  page: { to: "/learner/dashboard", label: "Go to overview" },
  event: { to: "/learner/events", label: "Browse events" },
  resource: { to: "/learner/resources", label: "Open My Resources" },
  purchase: { to: "/learner/purchases", label: "View purchase history" },
  certificate: { to: "/learner/certificates", label: "View my certificates" },
  article: { to: "/learner/help", label: "Search Help" },
  guide: { to: "/learner/guides", label: "Browse guides" },
} as const;
export function LearnerNotFound({ what = "page" }: { what?: LearnerMissing }) {
  const t = learnerTargets[what];
  return (
    <MissingScreen
      kind={what}
      actions={<>
        {what === "page"
          ? <Button asChild variant="outline"><Link to="/learner/help">Visit Help</Link></Button>
          : <Button asChild variant="outline"><Link to="/learner/dashboard">Go to overview</Link></Button>}
        <Button asChild><Link to={t.to}>{t.label}</Link></Button>
      </>}
    />
  );
}
