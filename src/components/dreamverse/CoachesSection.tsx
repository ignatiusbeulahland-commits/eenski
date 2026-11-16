import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Link2,
  MessagesSquare,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import emptyArt from "@/assets/dreamverse/empty-search-3d.webp";
import coachImg from "@/assets/dreamverse/coach-mentor-close.webp";
import financeImg from "@/assets/dreamverse/coach-area-finance.webp";
import financeSmall from "@/assets/dreamverse/coach-area-finance-600.webp";
import generalImg from "@/assets/dreamverse/coach-area-general.webp";
import generalSmall from "@/assets/dreamverse/coach-area-general-600.webp";
import marketingImg from "@/assets/dreamverse/coach-area-marketing.webp";
import marketingSmall from "@/assets/dreamverse/coach-area-marketing-600.webp";
import { Button } from "@/components/dreamverse/button";
import { CURRENCIES, PRICE_RANGES, productKey } from "@/lib/dreamverse/catalog";
import {
  coachAreas,
  coachCurrencies,
  coachPriceIn,
  coachProgrammes,
  coachSuggestions,
  filterCoaches,
  type CoachFilters,
  type CoachSuggestion,
  COACH_SORTS,
  sortCoaches,
  type CoachSortId,
} from "@/lib/dreamverse/coaches";
import { coachFiltersFromSearch, coachSearchParams } from "@/lib/dreamverse/search";
import type { Coach, Product } from "@/lib/dreamverse/types";
import { ENSKI } from "@/lib/enski-links";
import { cn } from "@/lib/utils";

import { CreatorAvatar } from "./CreatorAvatar";
import { DuoIcon } from "./DuoIcon";
import { Icon3D, type Icon3DName } from "./icons3d";
import { CurrencySwitch } from "./FilterPanel";
import { Price } from "./Price";
import { SectionHeading } from "./SectionHeading";

// How booking works: browse, pick a programme, book it from its own page (a demo checkout here).
const STEPS: { icon: Icon3DName; t: string; d: string }[] = [
  { icon: "profile", t: "Choose a coach", d: "Browse their focus, topics and programmes." },
  { icon: "salespage", t: "Pick a programme", d: "Each one has its own goal, format and price." },
  { icon: "wallet", t: "Book your session", d: "Book from the programme page and pay at checkout." },
];

/** A real-photo desk scene for the coach's area, matched on keywords; a general coaching desk otherwise. */
const AREA_PHOTOS = {
  finance: { src: financeImg, small: financeSmall, alt: "Coins, a growth chart and a calculator on a desk" },
  marketing: { src: marketingImg, small: marketingSmall, alt: "A megaphone and a phone full of likes on a desk" },
  general: { src: generalImg, small: generalSmall, alt: "A laptop, notebook and coffee set up for a coaching call" },
} as const;

function areaPhoto(area: string | null | undefined) {
  const a = (area ?? "").toLowerCase();
  if (/financ|invest|money|wealth|account/.test(a)) return AREA_PHOTOS.finance;
  if (/market|sales|brand|advert/.test(a)) return AREA_PHOTOS.marketing;
  return AREA_PHOTOS.general;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** On-site creator page when the coach has one, else their Enski profile. */
function ProfileLink({ slug, coach, className, children }: { slug: string | null; coach: Coach; className?: string; children: ReactNode }) {
  return slug ? (
    <Link to="/creators/$slug" params={{ slug }} className={className}>
      {children}
    </Link>
  ) : (
    <a href={coach.url} className={className}>
      {children}
    </a>
  );
}

/** Opens a programme's details page, where it's booked. */
function ProgrammeRow({ programme, tone = "card" }: { programme: Product; tone?: "card" | "soft" }) {
  return (
    <Link
      to="/dreamverse/$slug"
      params={{ slug: productKey(programme) }}
      className={cn(
        "group/row flex items-center gap-3 rounded-[18px] border border-line p-2 pr-3.5 transition-colors hover:border-cobalt-100 hover:bg-ice",
        tone === "soft" ? "bg-soft" : "bg-card",
      )}
    >
      {programme.thumbnail ? (
        <img
          src={programme.thumbnail}
          alt=""
          width={1000}
          height={625}
          loading="lazy"
          decoding="async"
          className="h-12 w-[4.5rem] shrink-0 rounded-[12px] object-cover"
        />
      ) : (
        <DuoIcon icon={Target} size="sm" />
      )}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[14px] leading-snug font-extrabold text-ink">{programme.title}</span>
        <Price price={programme.price} className="mt-0.5 [&>span:first-child]:text-sm" />
      </span>
      <ArrowRight className="size-4 shrink-0 text-brand transition-transform group-hover/row:translate-x-0.5" aria-hidden />
    </Link>
  );
}

function BookButton({ coach, programme, size }: { coach: Coach; programme: Product | undefined; size?: "lg" }) {
  return (
    <Button asChild size={size} className="w-full sm:w-auto">
      {programme ? (
        <Link to="/dreamverse/$slug" params={{ slug: productKey(programme) }}>
          Book a session <ArrowRight />
        </Link>
      ) : (
        <a href={coach.session?.url ?? coach.url}>
          Book a session <ArrowRight />
        </a>
      )}
    </Button>
  );
}

function TopicChips({ topics, max = 4, className }: { topics: string[]; max?: number; className?: string }) {
  if (topics.length === 0) return null;
  const extra = topics.length - max;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Coaches on">
      {topics.slice(0, max).map((t) => (
        <li key={t} className="rounded-full border border-line px-2.5 py-1 text-[12px] font-bold text-slate">
          {t}
        </li>
      ))}
      {extra > 0 && <li className="px-1 py-1 text-[12px] font-bold text-muted-foreground">+{extra} more</li>}
    </ul>
  );
}

interface CoachView {
  coach: Coach;
  programmes: Product[];
  /** On-site profile slug, when the coach has a creator page here. */
  slug: string | null;
  count: number;
}

function CoachCard({ view }: { view: CoachView }) {
  const { coach, programmes, slug, count } = view;
  const photo = areaPhoto(coach.expertise);
  const listed = programmes.slice(0, 3);
  const more = programmes.length - listed.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-card shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-float">
      {/* Cover band: a photo for the coach's area */}
      <div className="relative h-32 overflow-hidden bg-cobalt">
        <img
          src={photo.src}
          srcSet={`${photo.small} 600w, ${photo.src} 1000w`}
          sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
          alt={photo.alt}
          width={1000}
          height={417}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover object-right transition-transform duration-700 group-hover:scale-105"
        />
        {coach.expertise && (
          <span className="absolute top-4 left-5 max-w-[60%] truncate rounded-full bg-cobalt/70 px-3 py-1 text-xs font-extrabold text-on-blue ring-1 ring-on-blue/25 ring-inset backdrop-blur-sm sm:left-6">
            {coach.expertise}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="relative z-10 -mt-10 flex items-end justify-between gap-3">
          <CreatorAvatar name={coach.name} src={coach.avatar} size="lg" className="ring-4 ring-card shadow-float" />
          <ProfileLink
            slug={slug}
            coach={coach}
            className="mb-1 inline-flex min-h-10 items-center gap-1 text-sm font-extrabold text-brand underline-offset-4 hover:underline"
          >
            View profile <ArrowUpRight className="size-4" aria-hidden />
          </ProfileLink>
        </div>

        <h3 className="mt-3 text-xl font-extrabold tracking-tight text-ink">{coach.name}</h3>
        {(coach.headline || coach.bio) && (
          <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">{coach.headline || coach.bio}</p>
        )}

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Coaching details">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-ice px-3 py-1.5 text-[13px] font-extrabold text-brand">
            <MessagesSquare className="size-3.5" strokeWidth={2} aria-hidden /> 1:1 coaching
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-ice px-3 py-1.5 text-[13px] font-extrabold text-brand">
            <CalendarCheck className="size-3.5" strokeWidth={2} aria-hidden /> {plural(count, "programme", "programmes")}
          </li>
        </ul>
        <TopicChips topics={coach.topics ?? []} className="mt-3" />

        {listed.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">Programmes</p>
            <ul className="mt-2 grid gap-2">
              {listed.map((p) => (
                <li key={p.id}>
                  <ProgrammeRow programme={p} tone="soft" />
                </li>
              ))}
            </ul>
            {more > 0 && (
              <ProfileLink
                slug={slug}
                coach={coach}
                className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-extrabold text-brand underline-offset-4 hover:underline"
              >
                +{more} more on their profile
              </ProfileLink>
            )}
          </div>
        ) : (
          coach.session && (
            <a
              href={coach.session.url}
              className="mt-4 flex items-center gap-3 rounded-[20px] border border-line bg-soft p-3.5 transition-colors hover:border-cobalt-100 hover:bg-ice"
            >
              <DuoIcon icon={Target} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                  Featured programme
                </span>
                <span className="mt-0.5 block truncate text-[15px] font-extrabold text-ink">{coach.session.title}</span>
                <Price price={coach.session.price} className="mt-0.5 [&>span:first-child]:text-base" />
              </span>
              <ArrowRight className="size-4 shrink-0 text-brand" aria-hidden />
            </a>
          )
        )}

        <div className="mt-auto pt-5 [&>*]:w-full">
          <BookButton coach={coach} programme={programmes[0]} />
        </div>
      </div>
    </article>
  );
}

/** The featured coach, large: their cut-out breaks out of a cobalt panel, programmes listed beside them. */
function FeaturedCoach({ view }: { view: CoachView }) {
  const { coach, programmes, slug, count } = view;
  return (
    <article
      aria-labelledby="featured-coach-name"
      className="relative mt-6 grid overflow-hidden rounded-[32px] bg-card shadow-card ring-1 ring-line ring-inset md:mt-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:overflow-visible lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
    >
      {/* Photo panel: first on phones, on the right from tablets up */}
      <div className="relative h-[330px] overflow-hidden bg-cobalt-light sm:h-[380px] md:order-2 md:h-auto md:min-h-[440px] md:overflow-visible md:rounded-r-[32px]">
        <div aria-hidden className="absolute inset-0 overflow-hidden md:rounded-r-[32px]">
          <div className="texture-dots absolute inset-0 opacity-60" />
          <div className="absolute -right-20 -bottom-24 size-[360px] rounded-full bg-sky-light-glow opacity-60 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 aspect-square w-[78%] max-w-[340px] -translate-x-1/2 translate-y-1/4 rounded-full border border-on-blue/15" />
        </div>
        {coach.cutout ? (
          <img
            src={coach.cutout}
            alt={`${coach.name}, smiling`}
            width={400}
            height={469}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute bottom-0 left-1/2 h-[96%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom md:h-auto md:w-[min(96%,440px)]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <CreatorAvatar name={coach.name} src={coach.avatar} size="lg" className="size-32 text-4xl ring-4 ring-on-blue/20" />
          </div>
        )}
        <span className="absolute top-5 left-5 inline-flex -rotate-[5deg] items-center gap-1.5 rounded-full bg-lime px-3.5 py-2 text-[13px] font-extrabold text-midnight shadow-float animate-bob md:top-10 md:-left-6">
          <MessagesSquare className="size-4" aria-hidden /> 1:1 live sessions
        </span>
        <span className="absolute right-4 bottom-6 inline-flex rotate-[4deg] items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[13px] font-extrabold text-ink shadow-float md:right-6 md:bottom-10">
          <CalendarCheck className="size-4 text-brand" aria-hidden /> {plural(count, "programme", "programmes")}
        </span>
      </div>

      <div className="relative px-5 py-6 sm:px-8 sm:py-8 md:order-1 lg:px-10 lg:py-10">
        <p className="dv-eyebrow text-sky-text">Featured coach</p>
        <h3 id="featured-coach-name" className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight text-ink sm:text-[34px]">
          {coach.name}
        </h3>
        {coach.headline && <p className="mt-1.5 text-[15px] font-bold text-brand">{coach.headline}</p>}
        {coach.bio && (
          <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground sm:text-base">{coach.bio}</p>
        )}
        <TopicChips topics={coach.topics ?? []} max={6} className="mt-4" />

        {programmes.length > 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
              Choose a programme
            </p>
            <ul className="mt-2 grid gap-2 lg:grid-cols-1">
              {programmes.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <ProgrammeRow programme={p} tone="soft" />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <BookButton coach={coach} programme={programmes[0]} size="lg" />
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <ProfileLink slug={slug} coach={coach}>
              View profile
            </ProfileLink>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Summary of who's bookable right now — every number comes from the listings shown. */
function CoachSnapshot({ views }: { views: CoachView[] }) {
  const areas = new Set(views.map((v) => v.coach.expertise).filter(Boolean)).size;
  const programmes = views.reduce((n, v) => n + v.count, 0);
  const faces = views.slice(0, 4).map((v) => v.coach);
  const facts = [
    { v: views.length, l: views.length === 1 ? "coach" : "coaches" },
    { v: areas, l: areas === 1 ? "coaching area" : "coaching areas" },
    { v: programmes, l: programmes === 1 ? "programme" : "programmes" },
  ].filter((f) => f.v > 0);

  return (
    <div className="relative rounded-[28px] bg-cobalt-light p-5 text-on-blue shadow-float sm:p-6">
      <div aria-hidden className="texture-dots absolute inset-0 rounded-[inherit] opacity-60" />
      <Icon3D name="trophy" className="absolute -top-8 right-4 size-20 animate-bob sm:-top-10 sm:size-24" />
      <div className="relative">
        <div className="flex -space-x-3">
          {faces.map((c) => (
            <CreatorAvatar key={c.id} name={c.name} src={c.avatar} size="md" className="ring-[3px] ring-cobalt" />
          ))}
        </div>
        <p className="mt-3 text-lg font-extrabold">Ready to book now</p>
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {facts.map((f) => (
            <li key={f.l} className="glass-on-blue rounded-[16px] px-3 py-2.5">
              <span className="block text-2xl leading-none font-extrabold text-lime">{f.v}</span>
              <span className="mt-1 block text-xs font-bold text-on-blue-muted">{f.l}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Full-width invitation for coaches; the coach breaks out of the top of the bar like the other Enski CTAs. */
function CoachCta() {
  return (
    <div className="relative isolate mt-10 rounded-[32px] bg-cobalt-light text-on-blue md:mt-28 md:rounded-[40px]">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <div className="texture-dots absolute inset-0 opacity-60" />
        <div className="absolute -right-16 -bottom-32 size-[440px] rounded-full bg-sky-light-glow opacity-60 blur-3xl md:right-[10%]" />
      </div>
      <div className="grid md:grid-cols-[1.25fr_1fr] lg:grid-cols-[1.1fr_1fr]">
        <div className="relative z-10 px-6 pt-9 pb-2 sm:px-10 md:py-12 md:pl-12 lg:py-16 lg:pl-14">
          <p className="dv-eyebrow text-lime">For coaches</p>
          <h3 className="mt-3 max-w-[16ch] text-[28px] leading-[1.15] font-extrabold tracking-tight sm:text-[34px] lg:text-[40px]">
            Your experience is <span className="text-lime">someone's shortcut.</span>
          </h3>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-on-blue-muted sm:text-base">
            Offer coaching, mentorship or advisory sessions and get booked by ambitious people across Africa and beyond.
          </p>
          <div className="mt-7">
            <Button asChild variant="lime" size="lg">
              <a href={ENSKI.register}>
                Start coaching on Enski <ArrowRight />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative h-[340px] overflow-hidden rounded-b-[32px] sm:h-[400px] md:h-auto md:min-h-[320px] md:overflow-visible md:rounded-none">
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 aspect-square w-[82%] max-w-[380px] -translate-x-1/2 translate-y-1/4 rounded-full border border-on-blue/15"
          />
          <img
            src={coachImg}
            alt="Smiling coach in a white top and lime blazer, holding a tablet mid-explanation"
            width={618}
            height={650}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom md:left-[42%] lg:left-1/2 md:h-[94%] lg:h-[130%]"
          />
          <Icon3D
            name="chat"
            className="absolute top-6 left-5 size-16 animate-bob sm:left-10 md:top-0 md:left-0 lg:top-auto lg:bottom-20 lg:left-2 lg:size-20"
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-extrabold whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-sky-light focus-visible:outline-none",
        pressed
          ? "border-transparent bg-cobalt text-primary-foreground"
          : "border-line bg-card text-slate hover:border-cobalt-100 hover:bg-ice hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}

/** Copies the current address (filters included) pointing at the coaches section. */
function CopyFiltersLink() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    const { origin, pathname, search } = window.location;
    const url = `${origin}${pathname}${search}#coaches`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", { description: "It opens the coaches with these filters." });
    } catch {
      toast.error("Couldn't copy the link", { description: "Copy the address from your browser's address bar instead." });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-extrabold text-brand transition-colors hover:bg-ice focus-visible:ring-[3px] focus-visible:ring-sky-light focus-visible:outline-none"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

function CoachFiltersBar({
  coaches,
  filters,
  setFilters,
  shown,
}: {
  coaches: Coach[];
  filters: CoachFilters;
  setFilters: (f: CoachFilters) => void;
  shown: number;
}) {
  const areas = useMemo(() => coachAreas(coaches), [coaches]);
  const currencies = useMemo(() => coachCurrencies(coaches), [coaches]);
  const currencyCounts = useMemo(
    () => Object.fromEntries(currencies.map((c) => [c, coaches.filter((x) => coachPriceIn(x, c)).length])),
    [coaches, currencies],
  );
  const areaCount = (a: string) => coaches.filter((c) => c.expertise === a).length;
  const cur = filters.currency;
  const curInfo = cur ? CURRENCIES.find((c) => c.code === cur) : undefined;
  const active = !!(filters.area || filters.currency);
  const priceSortAcrossCurrencies =
    !filters.currency && (filters.sort === "price-asc" || filters.sort === "price-desc") && currencies.length > 1;

  return (
    <div className="mt-6 rounded-[24px] bg-card p-4 shadow-card ring-1 ring-line ring-inset sm:p-5" role="group" aria-label="Filter coaches">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        {areas.length > 0 && (
          <div className="min-w-0">
            <p className="mb-2 text-sm font-extrabold text-ink" id="coach-area-label">
              Coaching area
            </p>
            <div className="flex flex-wrap gap-2" aria-labelledby="coach-area-label" role="group">
              <Chip pressed={!filters.area} onClick={() => setFilters({ ...filters, area: undefined })}>
                All areas
              </Chip>
              {areas.map((a) => (
                <Chip key={a} pressed={filters.area === a} onClick={() => setFilters({ ...filters, area: a })}>
                  {a}
                  <span className={cn("text-xs font-bold", filters.area === a ? "opacity-80" : "text-muted-foreground")}>
                    {areaCount(a)}
                  </span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {currencies.length > 0 && (
          <div className="min-w-0">
            <p className="mb-2 text-sm font-extrabold text-ink" id="coach-price-label">
              Programme price
            </p>
            <div className="max-w-xs">
              <CurrencySwitch
                name="coach-currency"
                value={cur}
                options={currencies}
                counts={currencyCounts}
                unit="coaches"
                // Price bands differ per currency, so switching currency clears the band.
                onChange={(c) => setFilters({ ...filters, currency: c, price: undefined })}
              />
            </div>
            {cur ? (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="coach-price-label">
                <Chip pressed={!filters.price} onClick={() => setFilters({ ...filters, price: undefined })}>
                  Any price
                </Chip>
                {PRICE_RANGES[cur].map((r) => (
                  <Chip key={r.id} pressed={filters.price === r.id} onClick={() => setFilters({ ...filters, price: r.id })}>
                    {r.label}
                  </Chip>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
              {curInfo
                ? `Based on each coach's featured programme, priced in ${curInfo.name}. Prices are never converted.`
                : "Based on each coach's featured programme. Pick a currency to filter by price."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          Showing <span className="font-extrabold text-ink">{shown}</span> of {coaches.length}{" "}
          {coaches.length === 1 ? "coach" : "coaches"}
          {priceSortAcrossCurrencies && (
            <span className="block text-[13px] font-medium">
              Sorted within each currency, dollars first. Prices are never converted.
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <div className="relative mr-1">
            <label htmlFor="coach-sort" className="sr-only">
              Sort coaches
            </label>
            <select
              id="coach-sort"
              value={filters.sort ?? "featured"}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as CoachSortId })}
              className="h-10 appearance-none rounded-full border-[1.5px] border-line bg-background pr-9 pl-4 text-sm font-extrabold text-ink focus:border-brand focus:ring-4 focus:ring-ice focus:outline-none"
            >
              {COACH_SORTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id === "featured" ? "Sort: Featured" : `Sort: ${o.label}`}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
          {(active || filters.sort) && <CopyFiltersLink />}
          {active && (
            <button
              type="button"
              // Clearing filters keeps the chosen order.
              onClick={() => setFilters({ sort: filters.sort })}
              className="inline-flex min-h-10 items-center px-2 text-sm font-extrabold text-brand underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionGroup({
  title,
  items,
  onApply,
}: {
  title: string;
  items: CoachSuggestion[];
  onApply: (f: CoachFilters) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="w-full">
      <p className="text-[13px] font-extrabold text-ink">{title}</p>
      <ul className="mt-2 flex flex-wrap justify-center gap-2">
        {items.map((it) => (
          <li key={it.label}>
            <button
              type="button"
              onClick={() => onApply(it.filters)}
              className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-card px-4 text-sm font-extrabold whitespace-nowrap text-brand transition-colors hover:border-cobalt-100 hover:bg-ice focus-visible:ring-[3px] focus-visible:ring-sky-light focus-visible:outline-none"
            >
              {it.label}
              <span className="text-xs font-bold text-muted-foreground">
                {it.count} {it.count === 1 ? "coach" : "coaches"}
              </span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoCoaches({
  coaches,
  filters,
  onApply,
}: {
  coaches: Coach[];
  filters: CoachFilters;
  onApply: (f: CoachFilters) => void;
}) {
  const s = useMemo(() => coachSuggestions(coaches, filters), [coaches, filters]);
  const cur = filters.currency ? CURRENCIES.find((c) => c.code === filters.currency) : undefined;
  const band = filters.currency && filters.price
    ? PRICE_RANGES[filters.currency].find((r) => r.id === filters.price)
    : undefined;
  const current = [filters.area, cur && `${cur.symbol} ${cur.label}`, band?.label].filter(Boolean) as string[];
  const hasSuggestions = s.prices.length + s.areas.length + s.wider.length > 0;

  return (
    <div
      className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-line bg-card/70 p-6 text-center sm:p-8"
      aria-live="polite"
    >
      <img src={emptyArt} alt="" width={360} height={262} loading="lazy" className="h-auto w-32" />
      <p className="mt-3 text-lg font-extrabold text-ink">No coaches match these filters</p>
      {current.length > 0 && (
        <p className="mt-1 max-w-[36ch] text-[15px] text-muted-foreground">
          Nothing for <span className="font-bold text-ink">{current.join(" · ")}</span> yet.
          {hasSuggestions ? " These would show coaches:" : ""}
        </p>
      )}

      {hasSuggestions && (
        <div className="mt-5 flex w-full flex-col items-center gap-4">
          <SuggestionGroup title="Nearby price ranges" items={s.prices} onApply={onApply} />
          <SuggestionGroup title="Other coaching areas" items={s.areas} onApply={onApply} />
          <SuggestionGroup title="Widen your search" items={s.wider} onApply={onApply} />
        </div>
      )}

      <Button variant={hasSuggestions ? "link" : "outline"} className="mt-5" onClick={() => onApply({ sort: filters.sort })}>
        Clear all filters
      </Button>
    </div>
  );
}

export function CoachesSection({ coaches, products }: { coaches: Coach[]; products: Product[] }) {
  // Filters live in the URL (coachArea, coachCurrency, coachPrice) so a copied or bookmarked link restores them.
  const search = useSearch({ from: "/dreamverse" });
  const navigate = useNavigate({ from: "/dreamverse" });
  const filters = useMemo(
    () => coachFiltersFromSearch(search),
    [search.coachArea, search.coachCurrency, search.coachPrice, search.coachSort],
  );
  const setFilters = (f: CoachFilters) =>
    navigate({
      search: (prev) => ({ ...prev, ...coachSearchParams(f) }),
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    });
  const views = useMemo(() => {
    const byId = new Map<string, CoachView>();
    for (const coach of coaches) {
      const programmes = coachProgrammes(coach, products);
      byId.set(coach.id, {
        coach,
        programmes,
        slug: coach.slug ?? programmes[0]?.creator?.slug ?? null,
        count: programmes.length || coach.sessionCount,
      });
    }
    return byId;
  }, [coaches, products]);
  const shown = useMemo(
    () => sortCoaches(filterCoaches(coaches, filters), filters.sort, filters.currency),
    [coaches, filters],
  );
  if (coaches.length === 0) return null;
  const items = shown.length;
  // The featured coach gets the spotlight until a filter or sort is chosen; then everyone shares the grid.
  const browsing = !(filters.area || filters.currency || filters.price || filters.sort);
  const spotlight = browsing ? shown.find((c) => c.featured) : undefined;
  const grid = (spotlight ? shown.filter((c) => c.id !== spotlight.id) : shown).map((c) => views.get(c.id)!);
  const allViews = coaches.map((c) => views.get(c.id)!);
  return (
    <section id="coaches" aria-labelledby="coaches-title" className="relative isolate scroll-mt-20 overflow-hidden pt-16 lg:pt-24">
      <div aria-hidden className="texture-dots absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div aria-hidden className="absolute -top-32 -left-32 -z-10 size-[420px] rounded-full bg-sky-light-glow opacity-30 blur-3xl" />
      <div className="container-page">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_380px]">
        <SectionHeading
            id="coaches-title"
            eyebrow="Coaches and mentors"
            title={
              <>
                Learn directly from people <span className="text-brand">who've done it.</span>
              </>
            }
          >
            Book focused, one-to-one time with creators who share what they've learned building real careers and products.
          </SectionHeading>
          <CoachSnapshot views={allViews} />
        </div>

        {/* How it works */}
        <div className="relative mt-10 rounded-[28px] bg-card p-5 shadow-card sm:p-6 lg:p-8">
          <p className="dv-eyebrow text-sky-text">How it works</p>
          <ol className="relative mt-5 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5" aria-label="How booking works">
            {/* Dashed path joining the steps */}
            <div
              aria-hidden
              className="absolute top-8 right-[16%] left-[16%] hidden border-t-2 border-dashed border-cobalt-100 md:block"
            />
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative grid size-16 shrink-0 place-items-center rounded-[20px] bg-ice ring-4 ring-card dark:bg-cobalt/30">
                  <Icon3D name={s.icon} className="size-14" />
                  <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-cobalt text-xs font-extrabold text-primary-foreground ring-2 ring-card">
                    {i + 1}
                  </span>
                </span>
                <div className="min-w-0 md:mt-1">
                  <p className="text-base font-extrabold text-ink">{s.t}</p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground md:mx-auto md:max-w-[26ch]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {coaches.length > 1 && (
          <CoachFiltersBar coaches={coaches} filters={filters} setFilters={setFilters} shown={items} />
        )}

        {spotlight && <FeaturedCoach view={views.get(spotlight.id)!} />}

        {(items === 0 || grid.length > 0) && (
          <ul className={cn("mt-6 grid grid-cols-1 gap-5 md:grid-cols-2", grid.length >= 3 && "lg:grid-cols-3")}>
            {items === 0 ? (
              <li className="min-w-0 md:col-span-2 lg:col-span-full">
                <NoCoaches coaches={coaches} filters={filters} onApply={setFilters} />
              </li>
            ) : (
              grid.map((v) => (
                <li key={v.coach.id} className="min-w-0">
                  <CoachCard view={v} />
                </li>
              ))
            )}
          </ul>
        )}

        <CoachCta />
      </div>
    </section>
  );
}
