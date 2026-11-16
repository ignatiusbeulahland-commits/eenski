import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { openApply, PhotoFader, SectionHead, Showcase, WordBand } from "@/components/ambassador/kit";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal, RiseWords } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  campusBenefits,
  campusDreams,
  campusHeroSlides,
  campusImages,
  campusRoles,
  campusSteps,
  universities,
} from "./data";

export function BackToProgrammes() {
  return (
    <Link
      to="/become-an-ambassador"
      hash="programmes"
      className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-[13px] font-bold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/20"
    >
      <ArrowLeft className="size-4" aria-hidden /> All ambassador programmes
    </Link>
  );
}

export function CampusHero() {
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-primary-foreground">
      <PhotoFader
        slides={campusHeroSlides}
        label="Students on campus"
        eager
        className="absolute inset-0 -z-10"
        imgClassName="object-[center_30%]"
        dots="bottom-5 right-4 sm:right-6"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/75 to-cobalt/30" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-midnight/85 to-transparent" aria-hidden />
      <div className="mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-end px-5 pb-20 pt-28 md:px-8 lg:min-h-[46rem]">
        <div className="animate-rise">
          <BackToProgrammes />
        </div>
        <p className="eyebrow-pill glass-dark mt-6 w-fit animate-rise text-lime">
          <span className="size-2 rounded-full bg-lime" aria-hidden />
          The Dreamers Campus Initiative
        </p>
        <h1 className="text-display mt-4 max-w-3xl">
          <RiseWords text="Four years on campus. Leave with more" />{" "}
          <span className="text-lime">
            <RiseWords text="than a certificate." start={7} popLast />
          </span>
        </h1>
        <p className="mt-6 max-w-[540px] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:700ms] lg:text-lg">
          The students who get ahead don't wait for graduation. They lead, earn and build a name while they're still in school. Your turn.
        </p>
        <div id="hero-apply" className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:800ms] sm:flex-row">
          <Button variant="lime" size="lg" onClick={() => openApply("campus_director")}>
            Become a campus director <ArrowRight />
          </Button>
          <Button variant="outline-light" size="lg" onClick={() => openApply("campus_ambassador")}>
            Become a campus ambassador
          </Button>
        </div>
        <p className="mt-5 animate-rise text-sm font-semibold text-on-blue [animation-delay:900ms]">
          Limited spots per campus · Free to apply
        </p>
      </div>
    </section>
  );
}

export function CampusSchools() {
  const row = [...universities, ...universities];
  return (
    <section className="border-y border-primary-foreground/10 bg-midnight py-5 text-primary-foreground dark:bg-background" aria-label="Universities">
      <p className="mx-auto max-w-[1200px] px-5 text-[13px] font-semibold text-on-blue md:px-8">
        Open to students at universities across Nigeria, including
      </p>
      <div className="mask-fade-x mt-3 overflow-hidden">
        <ul className="flex w-max animate-marquee items-center gap-8 [animation-duration:45s]">
          {row.map((u, i) => (
            <li key={i} className="flex items-center gap-3" aria-hidden={i >= universities.length}>
              {/* Official crests are drawn for white, so the tile stays white in both themes. */}
              <span className="flex h-12 min-w-12 items-center justify-center rounded-xl bg-on-dark px-1.5 shadow-sm">
                <img src={u.logo} alt={`${u.name} crest`} loading="lazy" className="h-9 w-auto max-w-24 object-contain" />
              </span>
              <span className="whitespace-nowrap text-sm font-semibold">{u.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CampusIntro() {
  return (
    <section className="relative isolate overflow-hidden bg-midnight pb-16 text-primary-foreground md:flex md:aspect-[1600/912] md:items-center md:py-0">
      <img
        src={campusImages.introGroup}
        srcSet={`${campusImages.introGroupSmall} 800w, ${campusImages.introGroup} 1600w`}
        sizes="100vw"
        alt="A group of happy young Nigerian students laughing together on campus"
        loading="lazy"
        width={1600}
        height={912}
        className="block h-auto w-full md:absolute md:inset-0 md:-z-20 md:h-full md:object-cover md:object-right"
      />
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-midnight via-midnight/80 to-transparent md:block" />
      <div className="mx-auto mt-10 w-full max-w-[1200px] px-5 md:mt-0 md:px-8">
        <Reveal className="max-w-xl">
          <SectionHead
            dark
            eyebrow="The uncomfortable truth"
            title="A good CGPA alone"
            accent="won't set you apart."
            body="Thousands graduate every year with the same degree. What sets the few apart is what they did outside the lecture hall: the teams they led, the money they made, the people they knew."
          />
          <p className="mt-5 text-xl font-extrabold">The Dreamers Campus Initiative gives you all three, starting now.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function CampusCrew() {
  return (
    <section className="relative isolate overflow-hidden bg-cobalt-light py-16 text-primary-foreground md:py-24">
      <div className="absolute inset-0 -z-10 bg-dots opacity-50" aria-hidden />
      <Reveal className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHead
          dark
          center
          eyebrow="Meet the Dreamers Crew"
          title="Don't just join a program."
          accent="Join the movement."
          body="The Dreamers Crew is a growing network of students building the movement across Nigerian campuses: leading, creating, connecting and helping opportunities reach more students."
          className="max-w-3xl"
        />
      </Reveal>
    </section>
  );
}

export function CampusBenefits() {
  return (
    <section id="benefits" className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <SectionHead eyebrow="What you walk away with" title="Six reasons to say yes" accent="today." />
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {campusBenefits.map((b, i) => (
          <Reveal
            as="article"
            key={b.title}
            delay={(i % 3) * 80}
            className={cn(
              "lift group relative overflow-hidden rounded-card p-7",
              i === 0 ? "bg-cobalt-light text-primary-foreground" : "border border-line bg-card hover:border-sky-200 hover:shadow-card",
            )}
          >
            <Icon3D name={b.icon} className="size-16 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6" />
            <p className={cn("eyebrow mt-5", i === 0 ? "text-lime" : "text-sky-text")}>Perk {String(i + 1).padStart(2, "0")}</p>
            <h3 className={cn("mt-1 text-xl leading-7 md:text-2xl md:leading-8", i !== 0 && "text-ink")}>{b.title}</h3>
            <p className={cn("mt-2", i === 0 ? "text-on-blue" : "text-muted-foreground")}>{b.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CampusCommunity() {
  const items = [
    ["Learn", "skills that matter"],
    ["Connect", "with ambitious people"],
    ["Create", "real experiences"],
  ];
  return (
    <section className="bg-soft py-20 md:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <Reveal className="md:order-2">
          <SectionHead
            eyebrow="Your people are here"
            title="You become who"
            accent="you sit with."
            body="Surround yourself with students who push, build and win. Ambition is contagious. So is comfort. Choose your circle."
          />
          <ul className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
            {items.map(([w, l]) => (
              <li key={w} className="flex flex-col rounded-2xl border border-line bg-card p-3 sm:p-4">
                <span className="text-base font-extrabold leading-none text-brand sm:text-xl">{w}</span>
                <span className="mt-2 text-xs leading-snug text-muted-foreground sm:text-sm">{l}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <figure className="relative mx-auto w-full max-w-xl">
            <div aria-hidden className="absolute -inset-3 -z-10 rotate-2 rounded-[36px] bg-cobalt-light" />
            <img
              src={campusImages.community}
              alt="Nigerian university students hanging out on the campus lawn, chatting and laughing"
              width={1120}
              height={840}
              loading="lazy"
              className="block h-auto w-full rounded-[28px] shadow-float"
            />
            <figcaption className="glass-chip absolute bottom-4 left-4 rounded-2xl px-4 py-3 text-ink">
              <p className="text-lg font-extrabold leading-tight">Community</p>
              <p className="text-xs text-muted-foreground">find your people</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

export function CampusRoles() {
  return (
    <section id="roles" className="bg-midnight py-20 text-primary-foreground dark:bg-background md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <SectionHead
            dark
            eyebrow="Choose your role"
            title="One campus."
            accent="Limited seats."
            body="Each campus gets one director and a small team. Once they're filled, they're filled."
          />
        </Reveal>
      </div>
      <ul className="no-scrollbar mx-auto mt-12 flex max-w-[1200px] snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-4 md:grid md:grid-cols-3 md:overflow-visible md:px-8">
        {campusRoles.map((r, i) => (
          <Reveal as="li" key={r.value} delay={i * 100} className="w-[82%] shrink-0 snap-start sm:w-[60%] md:w-auto">
            <Showcase
              src={r.img}
              alt={r.alt}
              notch="bg-midnight dark:bg-background"
              fill={r.value === "executive_team"}
              chip={{ icon: i === 0 ? "trophy" : i === 1 ? "profile" : "megaphone", title: r.chip }}
            />
            <div className="mt-6">
              <span className="inline-block rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-midnight">{r.tag}</span>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight md:text-[28px]">{r.title}</h3>
              <p className="mt-3 text-on-blue">{r.desc}</p>
              <ul className="mt-4 grid gap-1.5 text-[15px]">
                {r.lines.map((l) => (
                  <li key={l} className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-lime text-midnight">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {l}
                  </li>
                ))}
              </ul>
              <Button variant="outline-light" className="mt-6" onClick={() => openApply(r.value)}>
                {r.cta} <ArrowRight />
              </Button>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function CampusMovement() {
  const [i, setI] = useState(0);
  return (
    <section className="py-20 md:py-28">
      <WordBand words={["Learn", "Lead", "Earn", "Connect", "Build", "Dream bigger"]} className="-mt-20 mb-14 md:-mt-28 md:mb-20" />
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-4xl">
          <PhotoFader
            slides={campusDreams}
            label="Life in the Dreamers Crew"
            onChange={setI}
            className="aspect-[1600/1008] w-full rounded-[32px] shadow-float"
            dots="bottom-4 left-1/2 -translate-x-1/2"
          />
          <p aria-live="polite" className="mt-4 text-center text-sm font-extrabold text-brand">
            {campusDreams[i]?.cap}
          </p>
        </Reveal>
        <Reveal className="mt-10">
          <SectionHead center eyebrow="The Dreamers · the movement" title="One student is a voice." accent="A campus is a movement." />
        </Reveal>
      </div>
    </section>
  );
}

export function CampusSteps() {
  return (
    <section id="how-it-works" className="bg-soft py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <SectionHead center eyebrow="How it works" title="Four steps between you" accent="and your seat." />
        </Reveal>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <span className="absolute left-7 top-7 h-[calc(100%-3.5rem)] w-0.5 bg-sky-200 md:left-[12.5%] md:right-[12.5%] md:h-0.5 md:w-auto" aria-hidden />
          {campusSteps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 120} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span
                className={cn(
                  "relative z-10 grid size-14 shrink-0 place-items-center rounded-full text-xl font-extrabold shadow-float",
                  i === campusSteps.length - 1 ? "bg-lime text-midnight" : "bg-cobalt text-primary-foreground",
                )}
              >
                {i + 1}
              </span>
              <div className="md:mt-6">
                <h3 className="text-xl leading-7 text-ink md:text-2xl md:leading-8">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CampusApplyCta() {
  return (
    <section id="apply-cta" className="relative isolate overflow-hidden bg-cobalt-light py-20 text-primary-foreground md:py-28">
      <img src={campusImages.prestige} alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cobalt/70 via-cobalt/60 to-midnight/80" aria-hidden />
      <Reveal className="mx-auto max-w-2xl px-5 text-center md:px-8">
        <SectionHead
          dark
          center
          eyebrow="Before your campus fills up"
          title="Someone will lead your campus."
          accent="Why not you?"
          body="Two minutes now. A story you'll tell for years."
        />
        <Button variant="lime" size="lg" className="mt-8" onClick={() => openApply()}>
          Claim your spot <ArrowRight />
        </Button>
      </Reveal>
    </section>
  );
}

export function CampusFinale() {
  return (
    <section className="py-20 md:py-28">
      <WordBand
        words={["Graduate ahead", "Dreamers", "Skills", "Network", "Income", "Your future starts now"]}
        className="-mt-20 mb-14 md:-mt-28 md:mb-20"
      />
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <img
            src={campusImages.grads}
            alt="Nigerian graduates throwing their caps high into the sky"
            loading="lazy"
            width={1400}
            height={882}
            className="block h-auto w-full rounded-[32px] shadow-float"
          />
        </Reveal>
        <Reveal className="mt-10">
          <SectionHead center eyebrow="The Dreamers Campus Initiative" title="A year from now, you'll wish" accent="you started today." />
          <Button size="lg" className="mt-8" onClick={() => openApply("campus_director")}>
            Become a campus director <ArrowRight />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
