import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, MessageCircleHeart, Rocket, Search, UserPlus } from "lucide-react";

import aboutImg from "@/assets/dreamers-trybe/about-trio.webp";
import classModern from "@/assets/dreamers-trybe/class-modern.webp";
import { DuoIcon } from "@/components/site/DuoIcon";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal, RiseWords } from "@/components/site/motion";
import { canAutoPlay, loadSlide } from "@/components/site/slide-loading";
import { prefersLowData } from "@/lib/offline/connection";
import { cn } from "@/lib/utils";

import { DREAMS, FAQ, FAQ_CATS, HERO_POINTS, TICKER, TRYBE_HERO_SLIDES, type FaqCat } from "./data";
import { openJoin, TrybeForm } from "./JoinTrybe";

/*
 * The Enski Dreamers Trybe landing page, section for section and word for word,
 * recoloured to the Enski brand tokens (cobalt, midnight, sky, lime on dark only).
 */

function Cta({ children, href = "#join", tone = "lime", arrow = true }: { children: ReactNode; href?: string; tone?: "lime" | "brand" | "outline"; arrow?: boolean }) {
  const tones = {
    lime: "bg-lime text-midnight hover:bg-lime-hover active:bg-lime-press",
    brand: "bg-cobalt text-primary-foreground hover:bg-cobalt-hover active:bg-cobalt-press",
    outline: "border-2 border-primary-foreground/90 text-primary-foreground hover:bg-primary-foreground/10 active:bg-primary-foreground/20",
  } as const;
  return (
    <a
      href={href}
      onClick={(e) => {
        if (typeof children === "string" && /join/i.test(children)) {
          e.preventDefault();
          openJoin();
        }
      }}
      className={cn(
        "group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-7 text-[17px] font-extrabold transition-[colors,transform] active:scale-[0.98] sm:w-auto",
        tones[tone],
      )}
    >
      {children}
      {arrow ? <ArrowRight className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:translate-x-1" aria-hidden /> : null}
    </a>
  );
}

/** Centered heading: eyebrow, headline with one brand phrase, intro. */
function SectionHead({ eyebrow, title, brand, intro, id }: { eyebrow: string; title: string; brand: string; intro?: string; id?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="type-eyebrow text-brand">{eyebrow}</p>
      <h2 id={id} className="type-h1 mt-3 text-ink">
        {title} <span className="text-brand">{brand}</span>
      </h2>
      {intro ? <p className="type-body-lg mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

function TrybeChip({ children, className, tilt = "0deg", solid = false, fast = false }: { children: ReactNode; className?: string; tilt?: string; solid?: boolean; fast?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute z-10 flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 shadow-float",
        solid ? "bg-card text-ink" : "glass-on-blue text-primary-foreground",
        fast ? "animate-float-fast" : "animate-float-slow",
        className,
      )}
      style={{ ["--tilt" as string]: tilt }}
    >
      {children}
    </div>
  );
}

/* ---------- Hero ---------- */

/**
 * Cross-fading photo backdrop. Each photo shows whole over a blurred copy of itself.
 * The next photo is decoded before it fades in; autoplay waits for page load and
 * stops offscreen, on low data and with reduced motion.
 */
function HeroSlides() {
  const n = TRYBE_HERO_SLIDES.length;
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [ready, setReady] = useState<number[]>([0]);
  const [retry, setRetry] = useState(0);
  const [env, setEnv] = useState({ loaded: false, reduced: true, low: true, visible: true });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const low = prefersLowData();
    const mark = () => setEnv((e) => ({ ...e, loaded: true }));
    setEnv((e) => ({ ...e, reduced, low }));
    if (document.readyState === "complete") mark();
    else window.addEventListener("load", mark, { once: true });
    const el = ref.current;
    const io = el ? new IntersectionObserver(([en]) => setEnv((e) => ({ ...e, visible: !!en?.isIntersecting }))) : null;
    if (el && io) io.observe(el);
    return () => {
      window.removeEventListener("load", mark);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!env.loaded || !canAutoPlay(false, env.reduced, env.low, env.visible)) return;
    let cancelled = false;
    const next = (i + 1) % n;
    const t = window.setTimeout(async () => {
      const ok = ready.includes(next) || (await loadSlide(TRYBE_HERO_SLIDES[next]!));
      if (cancelled) return;
      if (!ok) return setRetry((r) => r + 1);
      setReady((r) => (r.includes(next) ? r : [...r, next]));
      setI(next);
    }, 5000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [i, n, ready, retry, env]);

  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {TRYBE_HERO_SLIDES.map((sl, k) => {
        if (!ready.includes(k)) return null;
        const on = k === i ? "scale-100 opacity-70" : "scale-105 opacity-0";
        const first = k === 0;
        return (
          <div key={sl.src} className={cn("absolute inset-0 h-full w-full transition-[opacity,transform] duration-[1500ms] ease-out motion-reduce:transition-none", on)}>
            <img src={sl.src} srcSet={sl.srcSet} sizes={sl.sizes} alt="" decoding="async" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
            <img
              src={sl.src}
              srcSet={sl.srcSet}
              sizes={sl.sizes}
              alt={sl.alt}
              loading="eager"
              decoding={first ? "sync" : "async"}
              {...(first ? { fetchPriority: "high" as const } : {})}
              className={sl.fill ? "absolute inset-0 h-full w-full object-cover" : "absolute inset-0 m-auto max-h-full max-w-full object-contain"}
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent), linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskComposite: "source-in",
                maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent), linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                maskComposite: "intersect",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function TrybeHero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-cobalt-light pt-[68px] text-primary-foreground">
      <HeroSlides />
      {/* Deep Cobalt light over the photos (never darker than Cobalt press) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cobalt-press via-cobalt/60 to-cobalt/25" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cobalt-press/90 via-cobalt/45 to-transparent" aria-hidden />
      <div aria-hidden className="dot-grid-on-blue absolute inset-0 -z-10 opacity-60" />
      <div className="relative mx-auto grid max-w-[1200px] px-5 md:px-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex min-h-[calc(88svh-68px)] flex-col justify-center pb-16 pt-10 sm:min-h-[calc(92svh-68px)] lg:min-h-[40rem] lg:pb-28 lg:pt-16">
          <p className="type-eyebrow animate-rise text-lime">Dreamers Trybe · Powered by Enski</p>
          <h1 className="type-display mt-5 max-w-3xl">
            <RiseWords text="Stop dreaming" />{" "}
            <span className="text-lime">
              <RiseWords text="alone." start={2} popLast />
            </span>
          </h1>
          <p className="type-h3 mt-4 animate-rise text-sky-light [animation-delay:400ms]">Build something real.</p>
          <p className="type-body-lg mt-4 max-w-[540px] animate-rise text-primary-foreground/85 [animation-delay:550ms]">
            A free community that helps young people turn big dreams into real jobs, skills, clients and income, with people who keep you going.
          </p>
          <div id="trybe-hero-cta" className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:700ms] sm:flex-row">
            <Cta>Join the Trybe</Cta>
            <Cta href="#dream" tone="outline" arrow={false}>See the dreams</Cta>
          </div>
          <ul className="mt-8 flex animate-rise flex-wrap gap-x-6 gap-y-3 [animation-delay:850ms]">
            {HERO_POINTS.map((t) => (
              <li key={t} className="flex items-center gap-2 text-[15px] font-semibold text-primary-foreground/90">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime text-midnight"><Check className="size-3" strokeWidth={3.5} aria-hidden /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        {/* Floating props over the photos, desktop only so phones keep the photo clear */}
        <div className="relative hidden lg:block">
          <Icon3D name="stars" eager className="absolute right-6 top-16 size-20 animate-bob" />
          <TrybeChip className="left-4 top-40" tilt="-4deg">
            <Icon3D name="trophy" eager className="-my-2 size-11" />
            <span>
              <span className="block text-xs font-semibold text-primary-foreground/75">Our goal</span>
              <span className="block text-[15px] font-extrabold">50,000 dreamers</span>
            </span>
          </TrybeChip>
          <TrybeChip solid fast className="right-0 top-64" tilt="3deg">
            <Icon3D name="chat" eager className="-my-2 size-10" />
            <span>
              <span className="block text-sm font-extrabold">Accountability buddies</span>
              <span className="block text-xs font-semibold text-muted-foreground">who check in on you</span>
            </span>
          </TrybeChip>
          <TrybeChip solid className="bottom-32 left-10" tilt="2deg">
            <Icon3D name="ebook" eager className="-my-2 size-10" />
            <span className="text-sm font-extrabold">Trainings and placements</span>
          </TrybeChip>
        </div>
      </div>
      {/* Soft curve into the page, like the other Enski heroes */}
      <div aria-hidden className="relative h-10 rounded-t-[40px] bg-background md:h-14 md:rounded-t-[56px]" />
    </section>
  );
}

/* ---------- Ticker ---------- */

/** Tilted brand band that scrolls endlessly. Clipped so it never causes sideways scroll. */
export function TrybeTicker() {
  const loop = [...TICKER, ...TICKER];
  return (
    <div aria-hidden className="relative -mt-2 overflow-hidden bg-background py-6 md:py-8">
      <div className="-mx-6 -rotate-2 bg-cobalt py-3 shadow-float md:py-4">
        <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
          {loop.map((it, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap pr-8 md:pr-12">
              <DuoIcon icon={it.icon} tone="blue" size="sm" className="rounded-full" />
              <span className="text-[17px] font-extrabold text-primary-foreground md:text-[22px]">{it.t}</span>
              <span className="ml-5 size-2.5 shrink-0 rounded-full bg-lime md:ml-9" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Join (three steps + form) ---------- */

const JOIN_STEPS = [
  { icon: UserPlus, t: "Sign up in 30 seconds", d: "Name, email and number. No approval wait." },
  { icon: MessageCircleHeart, t: "Share your dream", d: "Tell the Trybe what you're working toward." },
  { icon: Rocket, t: "Learn, build and earn", d: "Trainings, buddies and real opportunities." },
];

export function TrybeJoin() {
  return (
    <section id="join" className="scroll-mt-20 bg-background pt-10 md:pt-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <SectionHead
            eyebrow="Your next chapter starts here"
            title="You have the dream."
            brand="Let's build the reality."
            intro="Built for dreamers in Lagos, Abuja, Port Harcourt, Accra, Nairobi and beyond."
          />
        </Reveal>
        <Reveal className="relative mt-10 overflow-hidden rounded-[32px] bg-cobalt-light text-primary-foreground md:mt-14 md:rounded-[48px]">
          <img src={classModern} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-luminosity" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-cobalt via-cobalt/80 to-cobalt/40" />
          <div aria-hidden className="dot-grid-on-blue absolute inset-0 opacity-50" />
          <div className="relative grid items-center gap-8 p-5 sm:p-8 md:p-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
            <div className="hidden lg:block">
              <p className="type-eyebrow text-lime">Free to join</p>
              <h3 className="type-h2 mt-3">Three steps and you're in.</h3>
              <ul className="mt-8 space-y-5">
                {JOIN_STEPS.map((s) => (
                  <li key={s.t} className="flex items-start gap-4">
                    <DuoIcon icon={s.icon} tone="blue" />
                    <span>
                      <span className="block text-[17px] font-extrabold">{s.t}</span>
                      <span className="mt-0.5 block text-[15px] text-primary-foreground/80">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] border border-primary-foreground/15 bg-midnight/80 p-5 text-left shadow-lift backdrop-blur sm:p-6">
              <TrybeForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Our goal ---------- */

function GoalCount({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (!e?.isIntersecting) { setV(1); return; }
      const start = performance.now();
      const dur = 2200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setV(Math.max(1, Math.round(eased * to)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  const label = v >= to ? `${Math.round(to / 1000)}k` : v.toLocaleString("en-US");
  return <span ref={ref} className={cn("tabular-nums", className)}>{label}</span>;
}

export function TrybeGoal() {
  return (
    <section id="goal" className="scroll-mt-20 bg-background pt-16 md:pt-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-midnight px-6 py-10 text-center text-primary-foreground shadow-lift md:rounded-[48px] md:py-14 dark:bg-card">
          <div aria-hidden className="dot-grid-on-blue absolute inset-0 opacity-60" />
          <div aria-hidden className="halo-sky absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40" />
          <Icon3D name="trophy" className="absolute left-4 top-6 size-14 animate-bob sm:left-10 md:size-20" />
          <Icon3D name="stars" className="absolute bottom-6 right-4 size-14 animate-bob [animation-delay:1.2s] sm:right-10 md:size-20" />
          <div className="relative">
            <p className="type-eyebrow text-sky-light">Our goal</p>
            <GoalCount to={50000} className="mt-2 block text-[clamp(3.5rem,19vw,8rem)] font-extrabold leading-none tracking-[-0.03em] text-lime" />
            <p className="mt-2 text-lg font-extrabold tracking-[0.3em] sm:text-2xl">DREAMERS</p>
            <p className="mt-2 text-[15px] text-primary-foreground/80">building real things together. Will you be one of them?</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Questions ---------- */

export function TrybeFaq() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | FaqCat>("All");
  const term = q.trim().toLowerCase();
  const match = (f: (typeof FAQ)[number]) => (cat === "All" || f.c === cat) && (!term || (f.q + " " + f.a).toLowerCase().includes(term));
  const count = FAQ.filter(match).length;
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-background py-16 text-ink md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <SectionHead id="faq-title" eyebrow="Questions" title="Got a question?" brand="Find it fast." />
        </Reveal>
        <div className="relative mt-8">
          <label htmlFor="faq-search" className="sr-only">Search questions</label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="faq-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions, like free or time"
            autoComplete="off"
            className="h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-card pl-12 pr-4 text-[16px] font-medium text-ink shadow-soft outline-none transition-shadow placeholder:text-muted-foreground focus:border-sky focus:ring-[3px] focus:ring-sky-light/50"
          />
        </div>
        <div role="group" aria-label="Filter questions by topic" className="mt-4 flex flex-wrap justify-center gap-2">
          {(["All", ...FAQ_CATS] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn("min-h-11 rounded-full px-4 text-[14px] font-bold transition-colors", cat === c ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand hover:bg-line")}
            >
              {c}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-5 text-center text-[13px] font-semibold text-muted-foreground">
          {count ? `Showing ${count} of ${FAQ.length} questions` : "No questions match. Try another word, or ask us when you join."}
        </p>
        <div className="mt-4 grid gap-3">
          {FAQ.map((f) => (
            <details key={f.q} hidden={!match(f)} className="group rounded-[20px] border border-line bg-card px-5 py-4 shadow-soft transition-colors open:border-sky/50">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="mb-1 block text-[12px] font-bold text-brand">{f.c}</span>
                  {f.q}
                </span>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-ice text-xl leading-none text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- About + dreams ---------- */

export function TrybeAbout() {
  return (
    <section id="about" className="bg-background pb-8 pt-16 text-ink md:pt-24">
      <Reveal className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionHead eyebrow="There is room for you" title="Walk in with a dream." brand="Walk out with a plan." intro="No experience needed. Just the will to start." />
      </Reveal>
    </section>
  );
}

export function TrybeJourney() {
  const [more, setMore] = useState(false);
  const shown = more ? DREAMS : DREAMS.slice(0, 7);
  return (
    <section id="dream" aria-label="What you get in the Trybe" className="relative scroll-mt-20 bg-background pb-16 text-ink md:pb-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-soft px-5 py-8 sm:px-8 md:rounded-[40px] md:px-12 md:py-12">
          <div aria-hidden className="dot-grid absolute inset-0 opacity-70" />
          <ul className="relative grid gap-x-10 md:grid-cols-2">
            {shown.map((s) => (
              <li key={s.w} className="flex items-start gap-3 border-b border-line py-4 last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check aria-hidden className="size-3.5" strokeWidth={3} /></span>
                <p className="text-[15px] leading-snug sm:text-base"><span className="font-extrabold text-ink">{s.w}.</span> <span className="text-muted-foreground">{s.d}</span></p>
              </li>
            ))}
          </ul>
          <div className="relative mt-6 flex justify-center">
            <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="inline-flex h-11 items-center rounded-full border-[1.5px] border-brand bg-card px-5 text-sm font-extrabold text-brand transition-colors hover:bg-ice">
              {more ? "See less" : `See ${DREAMS.length - 7} more`}
            </button>
          </div>
        </Reveal>

        {/* Closing banner: Cobalt light panel, dreamers break out of the top (image comes first) */}
        <div id="trybe-final-cta" className="mt-24 md:mt-36">
        <Reveal className="relative rounded-[32px] bg-cobalt-light text-primary-foreground md:rounded-[48px]">
          <div aria-hidden className="dot-grid-on-blue absolute inset-0 rounded-[inherit] opacity-50" />
          <div className="relative grid lg:grid-cols-[1fr_1.15fr]">
            <div className="relative h-[280px] sm:h-[400px] lg:h-auto lg:min-h-[460px] lg:[clip-path:inset(-240px_-40px_0_0_round_0_0_0_48px)]">
              <div aria-hidden className="halo-white absolute bottom-0 left-1/2 aspect-square w-[95%] max-w-[460px] -translate-x-1/2" />
              <Icon3D name="trophy" className="absolute bottom-8 left-3 z-10 size-16 animate-bob sm:left-8 lg:-left-6 lg:bottom-16 lg:size-24" />
              <img
                src={aboutImg}
                alt="Three young African dreamers laughing together with a laptop, phone and camera"
                width={900}
                height={616}
                loading="lazy"
                decoding="async"
                className="absolute bottom-0 left-1/2 h-auto w-[min(100%,440px)] -translate-x-1/2 object-contain object-bottom sm:w-[min(100%,560px)] lg:w-full lg:max-w-[600px]"
              />
              <span aria-hidden className="glass-on-blue absolute left-3 top-0 z-10 inline-flex -rotate-6 items-center rounded-full px-4 py-1.5 text-[14px] font-extrabold sm:left-6 lg:left-10 lg:top-10">Learn</span>
              <span aria-hidden className="glass-on-blue absolute right-3 top-6 z-10 inline-flex rotate-6 items-center rounded-full px-4 py-1.5 text-[14px] font-extrabold sm:right-8">Build</span>
              <span aria-hidden className="absolute bottom-10 right-4 z-10 inline-flex -rotate-3 items-center rounded-full bg-lime px-4 py-1.5 text-[14px] font-extrabold text-midnight shadow-float sm:right-10">Earn</span>
            </div>
            <div className="relative z-10 px-6 pb-10 pt-8 sm:px-10 md:px-14 lg:py-16">
              <h2 className="type-h1 lg:text-[56px] lg:leading-[1.08]">
                Come with the dream. <span className="text-lime">Leave with a next step.</span>
              </h2>
              <p className="type-body-lg mt-5 max-w-md text-primary-foreground/80">No experience needed. Just the will to start. Joining is free.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Cta>Join the Trybe</Cta>
                <Cta href="#faq" tone="outline" arrow={false}>Read the questions</Cta>
              </div>
            </div>
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}
