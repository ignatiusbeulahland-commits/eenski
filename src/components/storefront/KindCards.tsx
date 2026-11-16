import { Award, BookOpen, Briefcase, CalendarClock, Clock, Download, FileText, Heart, MapPin, MonitorPlay, Phone, RefreshCw, ShoppingBag, Users, Video } from "lucide-react";
import type { ReactNode } from "react";

import { BrandIcon } from "@/components/affiliate/BrandIcon";
import { ProductCover, kindArt } from "@/components/creator/products/ProductChrome";
import { useCartAdd, useWishToggle } from "@/components/shop/ShopCard";
import { ShopLink } from "@/components/shop/ShopLink";
import { coachingOf, downloadOf, liveOf, serviceOf } from "@/lib/creator/products";
import { TYPE_LABEL, TYPE_PLURAL } from "@/lib/creator/publicStore";
import type { CreatorItem, ItemKind, StoreAccent } from "@/lib/creator/rules";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

import { ACCENT, naira } from "./parts";

/** Each product type gets its own feel: a classroom, a bookshelf, an event ticket, a booking, a brief. */
export const KIND_THEME: Record<ItemKind, { title: string; line: string; cta: string }> = {
  course: { title: TYPE_PLURAL.course, line: "Learn step by step, at your own pace", cta: "Start learning" },
  ebook: { title: TYPE_PLURAL.ebook, line: "Yours to keep, ready the moment you buy", cta: "Get it now" },
  live: { title: TYPE_PLURAL.live, line: "Join in real time and ask questions", cta: "Get a ticket" },
  coaching: { title: TYPE_PLURAL.coaching, line: "One-to-one time, booked around you", cta: "Book a session" },
  service: { title: TYPE_PLURAL.service, line: "Tell me what you need and I'll deliver it", cta: "Order now" },
};

const LAGOS = "Africa/Lagos";
function eventParts(iso: string) {
  const d = iso ? new Date(iso.length === 16 ? `${iso}:00+01:00` : iso) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit", timeZone: LAGOS }),
    month: d.toLocaleDateString("en-GB", { month: "short", timeZone: LAGOS }).toUpperCase(),
    time: d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: LAGOS }),
  };
}

const Meta = ({ icon: Icon, children }: { icon: typeof Clock; children: ReactNode }) => (
  <li className="inline-flex min-w-0 items-center gap-1 text-[11px] font-bold text-muted-foreground sm:text-xs"><Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{children}</span></li>
);

function useCardActions(shopItem: ShopItem) {
  return { wish: useWishToggle(shopItem), cart: useCartAdd(shopItem) };
}

function WishButton({ item, shopItem }: { item: CreatorItem; shopItem: ShopItem }) {
  const { wish } = useCardActions(shopItem);
  return (
    <button type="button" onClick={wish.toggle} aria-pressed={wish.wished} aria-label={wish.wished ? `Remove ${item.title} from wishlist` : `Save ${item.title} to wishlist`} className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/95 text-ink shadow-sm backdrop-blur transition-colors hover:text-destructive">
      <Heart className={cn("h-[18px] w-[18px]", wish.wished && "fill-destructive text-destructive")} aria-hidden="true" />
    </button>
  );
}

function PriceRow({ item, shopItem, accent, cta }: { item: CreatorItem; shopItem: ShopItem; accent: StoreAccent; cta: string }) {
  const { cart } = useCardActions(shopItem);
  return (
    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-extrabold tabular-nums text-ink">{item.price ? naira(item.price) : "Free"}</p>
        <p className="hidden truncate text-[11px] font-bold text-muted-foreground sm:block">{cta}</p>
      </div>
      {shopItem.canCart && (
        <button type="button" onClick={cart.add} aria-label={cart.inCart ? `View cart (${item.title} is in it)` : `Add ${item.title} to cart`} className={cn("relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors", ACCENT[accent].solid)}>
          <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function Frame({ item, shopItem, className, children }: { item: CreatorItem; shopItem: ShopItem; className?: string; children: ReactNode }) {
  return (
    <article data-kind={item.kind} className={cn("surface group relative flex min-w-0 flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lift", className)}>
      <ShopLink route={shopItem.route} aria-label={item.title} className="absolute inset-0 z-[1] focus-visible:outline-none"><span className="sr-only">{item.title}</span></ShopLink>
      {children}
    </article>
  );
}

const Title = ({ children }: { children: ReactNode }) => <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-5 text-ink">{children}</h3>;
const Kicker = ({ kind }: { kind: ItemKind }) => <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px]">{TYPE_LABEL[kind]}</p>;
const LEVEL: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", all: "All levels" };

/** Course: a classroom feel — video cover, lesson count over the image, progress-style bar. */
function CourseCard({ item, shopItem, accent }: CardProps) {
  const lessons = item.lessons.filter(Boolean).length;
  const level = item.course?.level;
  return (
    <Frame item={item} shopItem={shopItem}>
      <div className="relative">
        <ProductCover src={item.image} alt="" kind={item.kind} className="aspect-square w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-midnight/80 to-transparent" />
        {lessons > 0 && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-extrabold text-ink"><MonitorPlay className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />{lessons} lessons</span>}
        <WishButton item={item} shopItem={shopItem} />
      </div>
      <div className="flex gap-1 px-3 pt-3" aria-hidden="true">{[0, 1, 2, 3].map((n) => <span key={n} className={cn("h-1 flex-1 rounded-full", n === 0 ? ACCENT[accent].solid : "bg-soft")} />)}</div>
      <div className="flex flex-1 flex-col p-3 pt-2 sm:p-3.5 sm:pt-2">
        <Kicker kind={item.kind} />
        <Title>{item.title}</Title>
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {level && <Meta icon={BookOpen}>{LEVEL[level]}</Meta>}
          {item.course?.certificate.enabled && <Meta icon={Award}>Certificate</Meta>}
        </ul>
        <PriceRow item={item} shopItem={shopItem} accent={accent} cta={KIND_THEME.course.cta} />
      </div>
    </Frame>
  );
}

/** Digital download: a bookshelf feel — the cover stands like a book with a spine and shadow. */
function DownloadCard({ item, shopItem, accent }: CardProps) {
  const d = downloadOf(item);
  return (
    <Frame item={item} shopItem={shopItem}>
      <div className="relative grid aspect-square place-items-center bg-ice px-6 pt-4 dark:bg-soft">
        <div className="relative aspect-[3/4] h-[86%] origin-bottom overflow-hidden rounded-r-md rounded-l-sm shadow-lift transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.03]">
          <ProductCover src={item.image} alt="" kind={item.kind} className="h-full w-full" />
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-midnight/45 via-midnight/15 to-transparent" />
        </div>
        <span aria-hidden="true" className="absolute bottom-3 h-2 w-2/3 rounded-full bg-midnight/15 blur-sm" />
        <WishButton item={item} shopItem={shopItem} />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <Kicker kind={item.kind} />
        <Title>{item.title}</Title>
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          <Meta icon={Download}>Instant download</Meta>
          {(d.format || d.files.length > 0) && <Meta icon={FileText}>{d.format || `${d.files.length} file${d.files.length === 1 ? "" : "s"}`}</Meta>}
        </ul>
        <PriceRow item={item} shopItem={shopItem} accent={accent} cta={KIND_THEME.ebook.cta} />
      </div>
    </Frame>
  );
}

/** Live session: an event-ticket feel — date block, live pill, perforated stub with time and seats. */
function LiveCard({ item, shopItem, accent }: CardProps) {
  const l = liveOf(item);
  const when = eventParts(item.date);
  return (
    <Frame item={item} shopItem={shopItem}>
      <div className="relative">
        <ProductCover src={item.image} alt="" kind={item.kind} className="aspect-square w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
        {when && <span className="absolute left-2 top-2 grid min-w-12 place-items-center rounded-xl bg-card px-2 py-1 text-center leading-none text-ink shadow-sm"><span className="text-[10px] font-extrabold tracking-wider text-cobalt">{when.month}</span><span className="mt-0.5 text-lg font-extrabold">{when.day}</span></span>}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-midnight/85 px-2.5 py-1 text-[11px] font-extrabold text-on-dark"><span className="relative grid h-2 w-2 place-items-center"><span className="absolute h-2 w-2 animate-ping rounded-full bg-lime motion-reduce:animate-none" /><span className="h-2 w-2 rounded-full bg-lime" /></span>Live</span>
        <WishButton item={item} shopItem={shopItem} />
      </div>
      <div className="relative border-t-2 border-dashed border-line" aria-hidden="true">
        <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-background" />
        <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-background" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <Kicker kind={item.kind} />
        <Title>{item.title}</Title>
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {when && <Meta icon={Clock}>{when.time} Lagos (GMT+1)</Meta>}
          <Meta icon={l.venue === "online" ? Video : MapPin}>{l.venue === "online" ? "Online" : "In person"}</Meta>
          {item.capacity > 0 && <Meta icon={Users}>{item.capacity} seats</Meta>}
        </ul>
        <PriceRow item={item} shopItem={shopItem} accent={accent} cta={KIND_THEME.live.cta} />
      </div>
    </Frame>
  );
}

/** Coaching: a booking feel — rounded portrait frame, session length and how you meet. */
function CoachingCard({ item, shopItem, accent }: CardProps) {
  const c = coachingOf(item);
  const how = c.location === "video" ? "Video call" : c.location === "phone" ? "Phone call" : "In person";
  return (
    <Frame item={item} shopItem={shopItem}>
      <div className="relative p-2.5 pb-0">
        <ProductCover src={item.image} alt="" kind={item.kind} className="aspect-square w-full overflow-hidden rounded-[22px] rounded-br-[64px]" imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className={cn("absolute bottom-1 right-3 grid h-11 w-11 place-items-center rounded-full shadow-lift ring-4 ring-card", ACCENT[accent].solid)} aria-hidden="true"><CalendarClock className="h-5 w-5" /></span>
        <WishButton item={item} shopItem={shopItem} />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <Kicker kind={item.kind} />
        <Title>{item.title}</Title>
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {item.duration > 0 && <Meta icon={Clock}>{item.duration} min · 1:1</Meta>}
          <Meta icon={c.location === "phone" ? Phone : c.location === "video" ? Video : MapPin}>{how}</Meta>
        </ul>
        <PriceRow item={item} shopItem={shopItem} accent={accent} cta={KIND_THEME.coaching.cta} />
      </div>
    </Frame>
  );
}

/** Service: a project-brief feel — clean cover with a delivery tag and revisions. */
function ServiceCard({ item, shopItem, accent }: CardProps) {
  const s = serviceOf(item);
  const pkg = s.packages[0];
  const days = item.duration || pkg?.days || 0;
  return (
    <Frame item={item} shopItem={shopItem}>
      <div className="relative">
        <ProductCover src={item.image} alt="" kind={item.kind} className="aspect-square w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
        {days > 0 && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-lime px-2 py-1 text-[11px] font-extrabold text-midnight">{days}-day delivery</span>}
        <WishButton item={item} shopItem={shopItem} />
      </div>
      <div className="flex flex-1 flex-col border-l-4 border-cobalt p-3 sm:p-3.5">
        <Kicker kind={item.kind} />
        <Title>{item.title}</Title>
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          <Meta icon={Briefcase}>Done for you</Meta>
          {pkg && pkg.revisions > 0 && <Meta icon={RefreshCw}>{pkg.revisions} revisions</Meta>}
        </ul>
        <PriceRow item={item} shopItem={shopItem} accent={accent} cta={KIND_THEME.service.cta} />
      </div>
    </Frame>
  );
}

type CardProps = { item: CreatorItem; shopItem: ShopItem; accent: StoreAccent };
const CARDS: Record<ItemKind, (p: CardProps) => ReactNode> = { course: CourseCard, ebook: DownloadCard, live: LiveCard, coaching: CoachingCard, service: ServiceCard };

export function KindCard(p: CardProps) {
  const C = CARDS[p.item.kind];
  return <C {...p} />;
}

/** Section heading with the type's 3D artwork and its own promise. */
export function KindHeading({ kind, count, id }: { kind: ItemKind; count: number; id: string }) {
  const t = KIND_THEME[kind];
  return (
    <div className="mb-4 flex items-center gap-3">
      <BrandIcon src={kindArt[kind]} className="h-11 w-11 shrink-0" />
      <div className="min-w-0">
        <h3 id={id} className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">{t.title}<span className="rounded-full bg-soft px-2 py-0.5 text-xs font-bold text-muted-foreground">{count}</span></h3>
        <p className="truncate text-[13px] text-muted-foreground">{t.line}</p>
      </div>
    </div>
  );
}
