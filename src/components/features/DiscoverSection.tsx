import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./motion";
import { BadgeCheck, Flame, LayoutGrid, MessageSquareHeart, Star, ThumbsUp, TrendingUp, type LucideIcon } from "lucide-react";
import { DuoIcon } from "./DuoIcon";
import { photos } from "./photos";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./primitives";

const items: { id: string; icon: LucideIcon; title: string; body: string; soon?: boolean }[] = [
  {
    id: "highlights",
    icon: Flame,
    title: "New and popular highlights",
    body: "We showcase trending and top-rated courses, so more learners see your work.",
  },
  {
    id: "reviews",
    icon: MessageSquareHeart,
    title: "Ratings and reviews",
    body: "Learners rate and review every course, so great feedback builds trust and pushes your course higher.",
  },
  {
    id: "profile",
    icon: BadgeCheck,
    title: "Creator profile pages",
    body: "A customisable public profile with your courses, portfolio, achievements and social links.",
  },
  {
    id: "category",
    icon: LayoutGrid,
    title: "Category placement",
    body: "Your course sits in the right category, so learners can actually find it.",
  },
];

const DURATION = 6000;

export function DiscoverSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-advance only on large screens, only while visible, and never with reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setAutoplay(mq.matches);
    update();
    mq.addEventListener("change", update);
    const el = sectionRef.current;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.35 });
    if (el) io.observe(el);
    return () => {
      mq.removeEventListener("change", update);
      io.disconnect();
    };
  }, []);

  const reduced = useReducedMotion();
  const running = autoplay && !reduced && inView && !paused;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % items.length), DURATION);
    return () => clearTimeout(t);
  }, [active, running]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + items.length) % items.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section ref={sectionRef} id="discover" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Get discovered"
          title="Stand out and let learners"
          highlight="find you."
          subtitle="Enski puts your products in front of the right people, at the right time."
        />

        <div
          className="mt-12 grid items-center gap-8 md:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            role="tablist"
            aria-label="Discovery features"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="flex flex-col gap-2"
          >
            {items.map((it, i) => {
              const on = i === active;
              return (
                <button
                  key={it.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`discover-tab-${it.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="discover-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative overflow-hidden rounded-[24px] p-4 text-left transition-colors duration-300 sm:p-5 md:p-6",
                    on ? "bg-soft" : "hover:bg-soft/60",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <DuoIcon
                      icon={it.icon}
                      size="md"
                      className={cn("transition-colors duration-300", on && "bg-card shadow-soft")}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn("fs-17 font-extrabold", on ? "text-ink" : "text-slate")}>
                          {it.title}
                        </span>
                        {it.soon && (
                          <span className="rounded-full bg-midnight px-2.5 py-0.5 fs-12 font-extrabold text-lime">
                            Coming soon
                          </span>
                        )}
                      </span>
                      {/* Always rendered so the list never changes height */}
                      <span className="mt-1.5 block fs-15 lh-24 text-muted-foreground">
                        {it.body}
                      </span>
                    </span>
                  </div>
                  {on && running && (
                    <span aria-hidden className="absolute inset-x-6 bottom-0 h-[3px] overflow-hidden rounded-full bg-line">
                      <span
                        key={active}
                        className="block h-full origin-left rounded-full bg-cobalt"
                        style={{ animation: `progress ${DURATION}ms linear forwards` }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Reveal className="relative">
            <div
              id="discover-panel"
              role="tabpanel"
              aria-labelledby={`discover-tab-${items[active]!.id}`}
              className="relative overflow-hidden rounded-[32px] bg-sky-light-glow [--ts:1] p-4 sm:p-6 md:p-10"
            >
              <div aria-hidden className="halo-white absolute -top-24 left-1/2 aspect-square w-[90%] max-w-96 -translate-x-1/2" />
              {/* Panels share one grid cell: the box is always as tall as the tallest panel, so nothing jumps */}
              <div className="relative grid min-h-[340px] place-items-center">
                {items.map((it, i) => (
                  <div
                    key={it.id}
                    aria-hidden={i !== active}
                    className={cn(
                      "flex w-full items-center justify-center transition-opacity duration-500 [grid-area:1/1]",
                      i === active ? "opacity-100" : "pointer-events-none invisible opacity-0",
                    )}
                  >
                    {i === 0 && <HighlightsPanel />}
                    {i === 1 && <ReviewsPanel />}
                    {i === 2 && <ProfilePanel />}
                    {i === 3 && <CategoryPanel />}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
      <style>{`@keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-[440px] rounded-[24px] bg-card p-5 shadow-lift", className)}>
      {children}
    </div>
  );
}

function HighlightsPanel() {
  const courses = [
    { t: "Afrobeat production 101", by: "Tobi A.", p: "₦25,000", tag: "Trending", img: photos.music },
    { t: "Jollof masterclass", by: "Funke A.", p: "₦18,000", tag: "New", img: photos.cooking },
  ];
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 fs-15 font-extrabold text-ink">
          <Flame className="size-4 text-brand" strokeWidth={2.25} /> Trending now
        </p>
        <span className="fs-12 font-bold text-brand">See all</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {courses.map((c, i) => (
          <div key={c.t} className="overflow-hidden rounded-[16px] border border-line">
            <div className="relative h-24 overflow-hidden bg-ice">
              <img
                src={c.img}
                alt={`${c.t} course cover`}
                width={768}
                height={960}
                loading="lazy"
                className={cn("size-full object-cover", i === 0 ? "object-[50%_25%]" : "object-[50%_20%]")}
              />
              <span className="absolute left-2 top-2 rounded-full bg-midnight px-2 py-0.5 fs-11 font-extrabold text-lime">
                {c.tag}
              </span>
            </div>
            <div className="p-2.5">
              <p className="fs-13 font-extrabold lh-16 text-ink">{c.t}</p>
              <p className="mt-1 fs-11 font-semibold text-muted-foreground">{c.by}</p>
              <p className="mt-1.5 fs-13 font-extrabold text-brand">{c.p}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** Illustrative preview of the live reviews tab (sample learners, like the other panels' sample store). */
function ReviewsPanel() {
  const sample = [
    { n: "Chiamaka O.", r: 5, t: "Clear, practical lessons. I redesigned my brand in a weekend." },
    { n: "Tunde B.", r: 4, t: "Loved the templates. More examples on pricing would be great." },
  ];
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <p className="fs-15 font-extrabold text-ink">Ratings and reviews</p>
        <span className="fs-12 font-bold text-brand">Write a review</span>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-soft p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-ice text-brand">
          <ThumbsUp aria-hidden className="size-5" strokeWidth={1.75} />
        </span>
        <p className="shrink-0 fs-20 font-extrabold leading-none text-ink">
          4.8<span className="fs-13 font-bold text-muted-foreground"> / 5</span>
        </p>
        <Stars value={5} />
      </div>
      {sample.map((s) => (
        <div key={s.n} className="mt-3 rounded-[16px] border border-line p-3.5">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-ice fs-11 font-extrabold text-brand">
              {s.n.slice(0, 1)}
            </span>
            <span className="flex-1 fs-13 font-extrabold text-ink">{s.n}</span>
            <Stars value={s.r} />
          </div>
          <p className="mt-2 fs-13 lh-20 text-muted-foreground">{s.t}</p>
        </div>
      ))}
    </Panel>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className={cn("size-3.5", n <= value ? "fill-sky text-sky" : "text-line")} />
      ))}
    </span>
  );
}

function ProfilePanel() {
  return (
    <Panel className="text-center">
      <div className="mx-auto -mt-1 grid size-20 place-items-center rounded-full bg-cobalt-light fs-26 font-extrabold text-on-blue">
        AD
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 fs-18 font-extrabold text-ink">
        Ada Designs <BadgeCheck className="size-5 text-sky" />
      </p>
      <p className="fs-13 font-semibold text-muted-foreground">Product designer · Lagos</p>
      <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-[16px] bg-soft py-3">
        {[
          ["12", "Products"],
          ["4.2k", "Learners"],
          ["4.9", "Rating"],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="fs-18 font-extrabold text-ink">{v}</p>
            <p className="fs-11 font-semibold text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-11 items-center justify-center rounded-full bg-cobalt fs-14 font-extrabold text-primary-foreground">
        View store
      </div>
    </Panel>
  );
}

function CategoryPanel() {
  const cats = ["Design", "Tech", "Music", "Business", "Beauty", "Finance"];
  return (
    <Panel>
      <p className="fs-15 font-extrabold text-ink">Browse categories</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {cats.map((c, i) => (
          <span
            key={c}
            className={cn(
              "rounded-full px-3 py-1.5 fs-13 font-bold",
              i === 0 ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand",
            )}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[
          { t: "Figma for beginners", img: photos.design },
          { t: "Brand identity in 7 days", img: photos.fashion },
          { t: "Code your first app", img: photos.tech },
        ].map(({ t, img }, i) => (
          <div key={t} className="flex items-center gap-3 rounded-[14px] bg-soft p-2.5">
            <img src={img} alt="" width={768} height={960} loading="lazy" className="size-11 rounded-[10px] object-cover object-top" />
            <span className="flex-1 fs-13 font-extrabold text-ink">{t}</span>
            {i === 0 && <TrendingUp className="size-4 text-brand" aria-label="Trending" />}
          </div>
        ))}
      </div>
    </Panel>
  );
}
