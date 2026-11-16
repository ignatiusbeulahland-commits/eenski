import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, BookOpen, Briefcase, Clock, Flag, Instagram, Linkedin, Share2, Star, Store, Twitter, Youtube } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ProductCover } from "@/components/creator/products/ProductChrome";
import { BuyButton } from "@/components/site/checkout/BuyGate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import enskiLogo from "@/assets/enski-logo.png";
import { findStore, orderedItems, storeShopItem, type PublicStore } from "@/lib/creator/publicStore";
import type { CreatorItem, ItemKind } from "@/lib/creator/rules";
import { useDemoProfile } from "@/lib/demo/profile";
import { useFollowing } from "@/lib/follows";
import { fetchReviews, summarizeReviews } from "@/lib/reviews/reviews";
import { cn } from "@/lib/utils";

import { ACCENT, OfferCard, SectionTitle, TikTokIcon, naira, safeUrl, videoEmbed } from "./parts";

const KIND_FILTER: Record<ItemKind, string> = { course: "Courses", ebook: "Ebooks", live: "Live sessions", coaching: "Coaching", service: "Services" };
const INITIAL = 8;
const sheet = "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:max-h-[85vh] overflow-y-auto";

type Review = { id: string; name: string; rating: number; body: string; product: string; verified: boolean };

/** A creator's public profile + storefront: identity, credibility, offerings, reviews. */
export function PublicStorefront({ handle, itemId }: { handle: string; itemId?: string | undefined }) {
  const [store, setStore] = useState<PublicStore | null | undefined>(undefined);
  useEffect(() => setStore(findStore(handle)), [handle]);

  if (store === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-16" aria-busy="true">
        <div className="aspect-[3/1] animate-pulse bg-soft" />
        <div className="-mt-10 ml-2 h-24 w-24 animate-pulse rounded-full bg-muted ring-4 ring-background" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-soft" />)}</div>
      </div>
    );
  }
  if (!store) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center px-5 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-soft text-brand"><Store className="h-7 w-7" aria-hidden="true" /></span>
        <h1 className="mt-5 text-3xl font-extrabold text-ink">This page isn't open</h1>
        <p className="mt-3 text-muted-foreground">There's no live creator page at this link. The creator may have hidden it or changed their link.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/dreamverse">Explore creators</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/courses">Browse courses</Link></Button>
        </div>
      </div>
    );
  }
  return <Profile store={store} itemId={itemId} />;
}

function Profile({ store, itemId }: { store: PublicStore; itemId?: string | undefined }) {
  const { page } = store;
  const accent = ACCENT[page.accent];
  const name = store.name || store.owner;
  const items = useMemo(() => orderedItems(store.items, page), [store, page]);
  const featured = items.find((i) => i.id === page.featuredId) ?? null;
  const others = items.filter((i) => i.id !== featured?.id);
  const picked = itemId ? store.items.find((i) => i.id === itemId) ?? null : null;
  const fullBio = (page.bio || store.bio || "").trim();
  const intro = store.about.trim();
  const achievements = page.achievements.filter((a) => a.title.trim());
  const reviews = useReviews(store, items);
  const [open, setOpen] = useState<null | "bio" | "achievements" | "reviews" | "report">(null);

  useEffect(() => {
    if (picked) document.getElementById("store-item")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [picked]);

  return (
    <div className="screen-in pb-4">
      <Hero store={store} name={name} intro={intro} hasMore={Boolean(fullBio && fullBio !== intro)} onMore={() => setOpen("bio")} />

      <div className="mx-auto max-w-5xl space-y-10 px-4 pt-8 sm:px-6 sm:space-y-12">
        {achievements.length > 0 && (
          <section aria-label="Achievements">
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {achievements.slice(0, 3).map((a, n) => (
                <li key={a.id} className="surface flex items-center gap-3 p-3">
                  <img src={[brandArtwork.trophy, brandArtwork.graduate, brandArtwork.rating][n % 3]} alt="" aria-hidden="true" width={44} height={44} loading="lazy" decoding="async" className="h-11 w-11 shrink-0 object-contain" />
                  <div className="min-w-0"><p className="truncate text-[15px] font-extrabold text-ink">{a.title}</p>{a.detail && <p className="truncate text-xs text-muted-foreground">{a.detail}</p>}</div>
                </li>
              ))}
            </ul>
            {achievements.length > 3 && <button type="button" onClick={() => setOpen("achievements")} className={cn("mt-2 min-h-11 text-sm font-extrabold", accent.text)}>View achievements ({achievements.length})</button>}
          </section>
        )}

        {safeUrl(page.portfolio) && (
          <Button asChild variant="outline" size="lg" className="h-12 w-full sm:w-auto">
            <a href={safeUrl(page.portfolio)} target="_blank" rel="noopener noreferrer"><Briefcase aria-hidden="true" />View portfolio</a>
          </Button>
        )}

        {(page.video.trim() || fullBio) && (
          <section aria-labelledby="about-title" className={cn("grid gap-5", page.video.trim() && fullBio && "md:grid-cols-2 md:items-start")}>
            {page.video.trim() && <WelcomeVideo url={page.video.trim()} />}
            {fullBio && (
              <div>
                <h2 id="about-title" className="text-lg font-extrabold text-ink sm:text-xl">About me</h2>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{fullBio}</p>
                <button type="button" onClick={() => setOpen("bio")} className={cn("min-h-11 text-sm font-extrabold", accent.text)}>Read more</button>
              </div>
            )}
          </section>
        )}

        {picked && <ItemSpotlight id="store-item" store={store} item={picked} heading="Selected offering" back />}
        {!picked && featured && <ItemSpotlight store={store} item={featured} heading="Featured offering" />}

        {others.length > 0 && <Offerings store={store} items={others} />}

        {reviews.list.length > 0 && (
          <section aria-labelledby="reviews-title">
            <SectionTitle action={reviews.list.length > 3 ? <button type="button" onClick={() => setOpen("reviews")} className={cn("min-h-11 text-sm font-extrabold", accent.text)}>See all reviews</button> : undefined}>
              <span id="reviews-title">Reviews</span>
              {reviews.summary && <span className="ml-2 inline-flex items-center gap-1 align-middle text-sm font-bold text-muted-foreground"><Star className="h-4 w-4 fill-current text-lime-press" aria-hidden="true" />{reviews.summary.average.toFixed(1)} · {reviews.summary.count}</span>}
            </SectionTitle>
            <ul className="grid gap-3 md:grid-cols-3">{reviews.list.slice(0, 3).map((r) => <ReviewCard key={r.id} r={r} />)}</ul>
          </section>
        )}
      </div>

      <footer className="mx-auto mt-14 flex max-w-5xl flex-col items-center gap-3 border-t px-4 pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 font-semibold">Powered by <img src={enskiLogo} alt="Enski" width={72} height={20} className="h-5 w-auto dark:brightness-0 dark:invert" /></Link>
        <nav aria-label="Page links" className="flex flex-wrap items-center justify-center gap-x-5">
          <Link to="/terms" className="inline-flex min-h-11 items-center hover:text-ink">Terms</Link>
          <Link to="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-ink">Privacy</Link>
          <button type="button" onClick={() => setOpen("report")} className="inline-flex min-h-11 items-center gap-1.5 hover:text-ink"><Flag className="h-3.5 w-3.5" aria-hidden="true" />Report this page</button>
        </nav>
      </footer>

      <Dialog open={open === "bio"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className={sheet}>
          <DialogHeader><DialogTitle>About {name}</DialogTitle><DialogDescription className="sr-only">Full biography</DialogDescription></DialogHeader>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{fullBio || intro}</p>
        </DialogContent>
      </Dialog>
      <Dialog open={open === "achievements"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className={sheet}>
          <DialogHeader><DialogTitle>Achievements</DialogTitle><DialogDescription>Milestones shared by {name}.</DialogDescription></DialogHeader>
          <ul className="space-y-2">{achievements.map((a) => <li key={a.id} className="rounded-2xl bg-soft p-3"><p className="font-extrabold text-ink">{a.title}</p>{a.detail && <p className="text-sm text-muted-foreground">{a.detail}</p>}</li>)}</ul>
        </DialogContent>
      </Dialog>
      <Dialog open={open === "reviews"} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className={cn(sheet, "sm:max-w-2xl")}>
          <DialogHeader><DialogTitle>All reviews</DialogTitle><DialogDescription>{reviews.summary ? `${reviews.summary.average.toFixed(1)} out of 5 from ${reviews.summary.count} rating${reviews.summary.count === 1 ? "" : "s"}` : "What people say"}</DialogDescription></DialogHeader>
          <ul className="space-y-3">{reviews.list.map((r) => <ReviewCard key={r.id} r={r} />)}</ul>
        </DialogContent>
      </Dialog>
      <ReportDialog open={open === "report"} onClose={() => setOpen(null)} />
    </div>
  );
}

function Hero({ store, name, intro, hasMore, onMore }: { store: PublicStore; name: string; intro: string; hasMore: boolean; onMore: () => void }) {
  const { page } = store;
  const accent = ACCENT[page.accent];
  const profile = useDemoProfile();
  const navigate = useNavigate();
  const { following, toggle } = useFollowing(`store:${store.handle}`);
  const socials = [
    { key: "instagram", label: "Instagram", Icon: Instagram },
    { key: "youtube", label: "YouTube", Icon: Youtube },
    { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
    { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
    { key: "x", label: "X", Icon: Twitter },
  ] as const;
  const links = socials.map((s) => ({ ...s, href: safeUrl(page.socials[s.key]) })).filter((s) => s.href);

  const follow = () => {
    if (!profile) {
      toast("Sign in to follow creators", { description: "Create a free account or log in, then come back to follow." });
      void navigate({ to: "/auth", search: { s: "register" } as never });
      return;
    }
    const now = toggle();
    toast.success(now ? `You're following ${name}` : `You unfollowed ${name}`);
  };
  const share = async () => {
    const url = window.location.href.split("?")[0]!;
    try {
      if (navigator.share) { await navigator.share({ title: `${name} on Enski`, text: store.tagline || intro, url }); return; }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Couldn't copy the link", { description: url });
    }
  };

  return (
    <section aria-label={name}>
      <div data-surface="dark" className="bg-brand-panel relative mx-auto aspect-[3/1] max-h-80 w-full max-w-5xl overflow-hidden sm:aspect-[4/1]">
        {store.banner && <img src={store.banner} alt="" fetchPriority="high" className="h-full w-full object-cover" style={{ objectPosition: `50% ${page.bannerY}%` }} />}
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="-mt-11 flex items-end justify-between gap-3 sm:-mt-14">
          <div className="grid h-[88px] w-[88px] shrink-0 place-items-center overflow-hidden rounded-full bg-card text-3xl font-extrabold text-brand ring-4 ring-background sm:h-28 sm:w-28">
            {store.photo ? <img src={store.photo} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
          </div>
          <button type="button" onClick={share} aria-label="Share this page" className="mb-1 grid h-11 w-11 place-items-center rounded-full border bg-card text-ink transition-colors hover:text-cobalt"><Share2 className="h-[18px] w-[18px]" aria-hidden="true" /></button>
        </div>
        <h1 className="mt-3 flex items-center gap-1.5 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
          <span className="min-w-0 break-words">{name}</span>
          {store.verified && <BadgeCheck className="h-6 w-6 shrink-0 fill-cobalt text-primary-foreground" aria-label="Verified creator" />}
        </h1>
        {store.tagline && <p className="mt-1 text-[15px] font-bold text-ink/80">{store.tagline}</p>}
        {intro && <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">{intro} {hasMore && <button type="button" onClick={onMore} className={cn("font-extrabold", accent.text)}>Read more</button>}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={follow} aria-pressed={following} className={cn("h-11 min-w-32 rounded-full px-6 text-sm font-extrabold transition-colors", following ? "border bg-card text-ink" : accent.solid)}>
            {following ? "Following" : "Follow"}
          </button>
          {links.length > 0 && (
            <ul className="flex items-center gap-1" aria-label="Social links">
              {links.map(({ key, label, Icon, href }) => (
                <li key={key}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-soft hover:text-ink"><Icon className="h-[18px] w-[18px]" /></a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function WelcomeVideo({ url }: { url: string }) {
  const embed = videoEmbed(url);
  const href = safeUrl(url);
  if (!embed && !/\.(mp4|webm|mov)(\?|$)/i.test(url)) return null;
  return (
    <div className="overflow-hidden rounded-2xl bg-midnight">
      {embed ? (
        <iframe src={embed} title="Welcome video" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full" />
      ) : (
        <video src={href} controls preload="metadata" playsInline className="aspect-video w-full" />
      )}
    </div>
  );
}

function ItemSpotlight({ store, item, heading, back, id }: { store: PublicStore; item: CreatorItem; heading: string; back?: boolean; id?: string }) {
  const shopItem = storeShopItem(store, item);
  const accent = ACCENT[store.page.accent];
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  useEffect(() => { void fetchReviews(shopItem.reviewKey ?? shopItem.key).then((r) => setRating(summarizeReviews(r))); }, [shopItem.key, shopItem.reviewKey]);
  const lessons = item.lessons.filter(Boolean).length;
  return (
    <section id={id} aria-label={heading} className="scroll-mt-24">
      <SectionTitle action={back ? <Link to="/store/$handle" params={{ handle: store.handle }} search={{ item: undefined }} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All offerings</Link> : undefined}>{heading}</SectionTitle>
      <div className="surface grid overflow-hidden sm:grid-cols-[minmax(0,280px)_1fr]">
        <ProductCover src={item.image} alt={item.title} kind={item.kind} className="aspect-square w-full" />
        <div className="flex flex-col p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{shopItem.typeLabel}</p>
          <h3 className="mt-1 text-xl font-extrabold text-ink sm:text-2xl">{item.title}</h3>
          {rating && <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-ink"><Star className="h-4 w-4 fill-current text-lime-press" aria-hidden="true" />{rating.average.toFixed(1)} <span className="font-semibold text-muted-foreground">({rating.count})</span></p>}
          {item.description && <p className={cn("mt-2 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground", !back && "line-clamp-3")}>{item.description}</p>}
          {(lessons > 0 || item.duration > 0) && (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
              {item.kind === "course" && lessons > 0 && <li className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />{lessons} lessons</li>}
              {item.duration > 0 && (item.kind === "coaching" || item.kind === "service") && <li className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{item.kind === "coaching" ? `${item.duration}-minute sessions` : `Delivered in ${item.duration} days`}</li>}
            </ul>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
            <p className="text-2xl font-extrabold tabular-nums text-ink">{item.price ? naira(item.price) : "Free"}</p>
            {item.price > 0 ? (
              back ? <BuyButton label={item.kind === "course" ? "Get started" : "Buy now"} price={naira(item.price)} item={shopItem} /> : <Link to="/store/$handle" params={{ handle: store.handle }} search={{ item: item.id }} className={cn("inline-flex h-11 items-center rounded-full px-6 text-sm font-extrabold transition-colors", accent.solid)}>View details</Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Offerings({ store, items }: { store: PublicStore; items: CreatorItem[] }) {
  const kinds = (Object.keys(KIND_FILTER) as ItemKind[]).filter((k) => items.some((i) => i.kind === k));
  const [kind, setKind] = useState<ItemKind | "all">("all");
  const [all, setAll] = useState(false);
  const shown = items.filter((i) => kind === "all" || i.kind === kind);
  const visible = all ? shown : shown.slice(0, INITIAL);
  const accent = store.page.accent;
  return (
    <section aria-labelledby="offerings-title">
      <SectionTitle><span id="offerings-title">Offerings</span></SectionTitle>
      {kinds.length > 1 && (
        <div className="-mx-4 mb-4 overflow-x-auto px-4 [scrollbar-width:none]" role="group" aria-label="Filter offerings">
          <div className="flex w-max gap-2">
            {(["all", ...kinds] as const).map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setAll(false); }} className={cn("h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors", kind === k ? ACCENT[accent].solid + " border-transparent" : "bg-card text-ink hover:border-cobalt-100")}>
                {k === "all" ? "All" : KIND_FILTER[k]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((i) => <OfferCard key={i.id} item={i} shopItem={storeShopItem(store, i)} accent={accent} />)}
      </div>
      {shown.length > visible.length && <div className="mt-5 text-center"><Button variant="outline" size="lg" onClick={() => setAll(true)}>Explore all offerings ({shown.length})</Button></div>}
    </section>
  );
}

function useReviews(store: PublicStore, items: CreatorItem[]) {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => {
    let live = true;
    void Promise.all(items.map(async (i) => {
      const s = storeShopItem(store, i);
      return (await fetchReviews(s.reviewKey ?? s.key)).map((r) => ({ id: r.id, name: r.name, rating: r.rating, body: r.body, product: i.title, verified: true }));
    })).then((sets) => {
      if (!live) return;
      const shared = store.page.testimonials.filter((t) => t.quote.trim()).map((t) => ({ id: t.id, name: t.name, rating: t.rating, body: t.quote, product: items.find((i) => i.id === t.itemId)?.title ?? "", verified: false }));
      setList([...sets.flat(), ...shared]);
    });
    return () => { live = false; };
  }, [store, items]);
  const rated = list.filter((r) => r.verified);
  return { list, summary: summarizeReviews(rated) };
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <li className="surface flex flex-col p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ice text-sm font-extrabold text-cobalt">{r.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-ink">{r.name}</p>
          <p className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("h-3.5 w-3.5", n <= r.rating ? "fill-current text-lime-press" : "text-line")} aria-hidden="true" />)}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{r.body}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3 text-[11px] font-bold">
        {r.product && <span className="rounded-full bg-soft px-2.5 py-1 text-muted-foreground">{r.product}</span>}
        <span className={cn("rounded-full px-2.5 py-1", r.verified ? "bg-success-soft text-success" : "bg-soft text-muted-foreground")}>{r.verified ? "Buyer review" : "Shared by creator"}</span>
      </div>
    </li>
  );
}

function ReportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={sheet}>
        <DialogHeader><DialogTitle>Report this page</DialogTitle><DialogDescription>Tell us what's wrong. Our team reviews every report.</DialogDescription></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim().length < 5) { toast.error("Add a few words about the problem."); return; } toast.success("Thanks, your report was sent"); setText(""); onClose(); }} className="space-y-3">
          <Textarea aria-label="What's wrong" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. misleading claims, copied content, scam" />
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Send report</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
