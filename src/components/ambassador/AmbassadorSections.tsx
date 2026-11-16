import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import campusCard from "@/assets/campus/hero-2-800.webp";
import nyscCard from "@/assets/nysc/celebrate.webp";

import ctaImg from "@/assets/ambassador/ambassador-cta.webp";
import heroImg from "@/assets/ambassador/ambassador-hero.webp";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D, type Icon3DName } from "@/components/site/Icon3D";
import { CountUp, Reveal, RiseWords } from "@/components/site/motion";
import { Button } from "@/components/ui/button";

/** Sections of the Enski Ambassador Program project, shown at /become-an-ambassador. */

export { heroImg as ambassadorHeroImg };

const perks: { icon: Icon3DName; title: string; body: string }[] = [
  {
    icon: "profile",
    title: "Campus leadership",
    body: "Lead the Enski community on your campus and shape the future of learning.",
  },
  {
    icon: "trophy",
    title: "Exclusive certificates",
    body: "Receive official Enski Ambassador certificates to boost your resume.",
  },
  {
    icon: "globe",
    title: "Networking",
    body: "Connect with top creators, educators and industry leaders across Africa.",
  },
  {
    icon: "ebook",
    title: "Exclusive resources",
    body: "Access marketing materials, swag and exclusive creator tools.",
  },
];

const steps = [
  { title: "Apply", body: "Pick the campus or NYSC programme and send a two-minute application." },
  { title: "Get selected", body: "Our team reviews applications and reaches shortlisted people directly." },
  { title: "Train", body: "Complete the ambassador onboarding program and learn the ropes." },
  { title: "Lead", body: "Start building your community and earning rewards." },
];

const marquee: { icon: Icon3DName; label: string }[] = [
  { icon: "megaphone", label: "Lead your campus" },
  { icon: "wallet", label: "Earn commissions" },
  { icon: "trophy", label: "Get certified" },
  { icon: "globe", label: "Meet top creators" },
  { icon: "ebook", label: "Get the swag" },
  { icon: "stars", label: "VIP access" },
];

export function AmbassadorHero() {
  return (
    <section className="relative isolate overflow-hidden bg-cobalt-light text-primary-foreground">
      <div className="absolute inset-0 -z-10 bg-dots opacity-60" aria-hidden />
      <div className="mx-auto grid max-w-[1200px] items-end gap-6 px-5 pt-28 lg:grid-cols-[1.05fr_1fr] lg:pt-36">
        <div className="pb-4 lg:pb-28">
          <p className="eyebrow-pill glass-dark animate-rise text-lime">
            <span className="size-2 rounded-full bg-lime" aria-hidden />
            Enski ambassador programmes
          </p>
          <h1 className="text-display mt-5 text-primary-foreground">
            <RiseWords text="Lead the movement" />{" "}
            <span className="text-lime">
              <RiseWords text="on campus or in service." start={3} popLast />
            </span>
          </h1>
          <p className="mt-6 max-w-[520px] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:700ms] lg:text-lg">
            Two ways to lead with Enski: the Dreamers Campus Initiative for university students, and the Enski NYSC Initiative for corps members.
          </p>
          <div id="hero-apply" className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:800ms] sm:flex-row">
            <Button variant="lime" size="lg" asChild>
              <a href="#programmes">
                Choose your programme <ArrowRight />
              </a>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          <ul className="mt-7 flex animate-rise flex-wrap gap-x-5 gap-y-2 text-[15px] font-semibold text-primary-foreground [animation-delay:900ms]">
            {["Campus or NYSC", "Earn and get certified", "Free to join"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-lime text-midnight">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Person in the glow, chips floating around */}
        <div className="relative mx-auto w-full max-w-[520px] animate-rise [animation-delay:250ms] lg:max-w-none">
          <div
            className="absolute left-1/2 top-[6%] -z-10 aspect-square w-[115%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-[14%] -z-10 aspect-square w-[80%] -translate-x-1/2 rounded-full border border-primary-foreground/15"
            aria-hidden
          />
          <img
            src={heroImg}
            alt="Smiling Enski campus ambassador in a lime Enski hoodie, holding a megaphone and a phone"
            width={1024}
            height={1280}
            fetchPriority="high"
            className="relative mx-auto block w-[88%] translate-y-1"
          />
          <Icon3D name="stars" eager className="absolute right-[4%] top-[2%] w-16 animate-bob md:w-24" />

          <FloatChip
            className="left-0 top-[34%] md:left-[-4%]"
            tilt={-6}
            icon="wallet"
            subtitle="Commission paid"
            title={<CountUp value="₦45,000" duration={1800} />}
          />
          <FloatChip
            className="right-0 top-[68%] lg:top-[52%]"
            tilt={3}
            delay={1.2}
            icon="profile"
            subtitle="Students referred"
            title={<CountUp value="128" duration={1800} />}
          />
          <FloatChip
            className="bottom-[14%] left-[4%]"
            tilt={-3}
            delay={0.6}
            tone="lime"
            icon="trophy"
            title="Certified ambassador"
          />
        </div>
      </div>
    </section>
  );
}

export function AmbassadorMarquee() {
  const row = [...marquee, ...marquee];
  return (
    <div className="relative z-10 -mt-6 overflow-hidden py-6 md:-mt-8" aria-hidden>
      <div className="-rotate-2 scale-105 bg-midnight py-4 shadow-float dark:bg-cobalt md:py-5">
        <div className="flex w-max animate-marquee items-center gap-8">
          {row.map((m, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="flex items-center gap-3 text-lg font-extrabold text-primary-foreground md:text-2xl">
                <Icon3D name={m.icon} eager className="size-9 md:size-11" />
                {m.label}
              </span>
              <span className="size-2.5 rounded-full bg-lime" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AmbassadorPerks() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <Reveal className="max-w-2xl">
        <p className="eyebrow text-sky-text">Why become an ambassador</p>
        <h2 className="text-h2 mt-4 text-ink">
          More than a title. <span className="text-brand">A head start.</span>
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground md:text-lg">
          Grow your influence, your income and your network while you're still in school or serving.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Featured perk: commissions */}
        <Reveal
          as="article"
          className="relative overflow-hidden rounded-card bg-cobalt-light p-7 text-primary-foreground md:row-span-2 md:p-8"
        >
          <Icon3D name="wallet" className="-mt-2 size-24 animate-bob" />
          <h3 className="mt-6 text-2xl leading-8">Earn commissions</h3>
          <p className="mt-3 text-on-blue">
            Earn commissions for every student you refer who enrolls in a course.
          </p>
          <div className="mt-8 rounded-[20px] bg-primary-foreground/10 p-5">
            <p className="text-[13px] font-semibold text-on-blue">Referred sales this month</p>
            <p className="mt-1 text-4xl font-extrabold text-lime">
              <CountUp value="₦320,000" duration={1600} />
            </p>
            <div className="mt-4 flex h-16 items-end gap-1.5" aria-hidden>
              {[30, 45, 38, 60, 52, 80, 95].map((h, i) => (
                <span
                  key={i}
                  className={i === 6 ? "bar-grow flex-1 rounded-md bg-lime" : "bar-grow flex-1 rounded-md bg-sky-light/60"}
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
          <Icon3D name="analytics" className="parallax-y absolute -right-6 top-6 w-28 rotate-12 opacity-90" />
        </Reveal>

        {perks.map((p, i) => (
          <Reveal
            as="article"
            key={p.title}
            delay={(i + 1) * 80}
            className="lift group relative rounded-card border border-line bg-card p-7 hover:border-sky-200 hover:shadow-card"
          >
            <Icon3D
              name={p.icon}
              className="size-16 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6"
            />
            <h3 className="mt-5 text-xl leading-7 text-ink md:text-2xl md:leading-8">{p.title}</h3>
            <p className="mt-2 text-muted-foreground">{p.body}</p>
          </Reveal>
        ))}

        <Reveal
          as="article"
          delay={120}
          className="relative flex flex-col gap-5 overflow-hidden rounded-card bg-midnight p-7 text-primary-foreground ring-1 ring-inset ring-primary-foreground/10 sm:flex-row sm:items-center md:col-span-2 md:p-8 lg:col-span-3"
        >
          <Icon3D name="stars" className="size-20 shrink-0 animate-bob" />
          <div className="flex-1">
            <h3 className="text-xl leading-7 md:text-2xl md:leading-8">
              VIP access <span className="text-lime">before anyone else.</span>
            </h3>
            <p className="mt-2 text-on-blue">Get early access to new features, events and premium content.</p>
          </div>
          <a href="#programmes" className="group inline-flex items-center gap-2 font-extrabold text-lime hover:underline">
            Claim your spot <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function AmbassadorHowItWorks() {
  return (
    <section id="how-it-works" className="bg-soft py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-sky-text">How it works</p>
          <h2 className="text-h2 mt-4 text-ink">
            Four steps to <span className="text-brand">leading your campus.</span>
          </h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <span
            className="absolute left-7 top-7 h-[calc(100%-3.5rem)] w-0.5 bg-sky-200 md:left-[12.5%] md:right-[12.5%] md:h-0.5 md:w-auto"
            aria-hidden
          />
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i * 120}
              className="relative flex gap-5 md:flex-col md:items-center md:text-center"
            >
              <span
                className={
                  i === steps.length - 1
                    ? "relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-lime text-xl font-extrabold text-midnight shadow-float"
                    : "relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-cobalt text-xl font-extrabold text-primary-foreground shadow-float"
                }
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

        <Reveal className="mt-14 flex justify-center" delay={200}>
          <Button size="lg" asChild>
            <a href="#programmes">
              Choose your programme <ArrowRight />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function AmbassadorFinalCta() {
  return (
    <section id="apply-cta" className="mx-auto max-w-[1200px] px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-36">
      <Reveal className="relative isolate grid items-end rounded-[32px] bg-cobalt-light text-primary-foreground md:grid-cols-[1.2fr_1fr]">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-dots opacity-50" aria-hidden />
        <div className="p-8 md:p-12 lg:p-16">
          <p className="eyebrow text-lime">Applications are open</p>
          <h2 className="mt-4 text-[32px] leading-[38px] md:text-5xl md:leading-[56px]">
            Your people are waiting. <span className="text-lime">Lead them.</span>
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-on-blue">
            Students lead on campus, corps members lead in their state. Pick your programme and join the next cohort.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="lime" size="lg" asChild>
              <Link to="/become-an-ambassador/campus">
                Campus programme <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link to="/become-an-ambassador/nysc">NYSC programme</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-2 h-[340px] md:-mt-24 md:h-full md:min-h-[460px]">
          <div
            className="absolute bottom-0 left-1/2 -z-10 aspect-square w-[110%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden
          />
          <img
            src={ctaImg}
            alt="Smiling Enski ambassador in an Enski T-shirt, waving and holding a laptop"
            width={1024}
            height={1280}
            loading="lazy"
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 rounded-b-[32px] object-contain object-bottom md:h-[125%]"
          />
          <FloatChip className="right-4 top-6 md:right-8 md:top-28" tilt={6} icon="trophy" title="New cohort" />
        </div>
      </Reveal>
    </section>
  );
}

const programmes = [
  {
    to: "/become-an-ambassador/campus" as const,
    eyebrow: "For university students",
    title: "Dreamers Campus Initiative",
    body: "Lead the movement on your campus as a campus director, a member of the executive team or a campus ambassador.",
    points: ["Get paid to lead", "Free scholarships and certificates", "Internships with Enski"],
    img: campusCard,
    w: 800,
    h: 504,
    alt: "Students laughing together on the steps of a campus building",
    cta: "Explore the campus programme",
  },
  {
    to: "/become-an-ambassador/nysc" as const,
    eyebrow: "For NYSC corps members",
    title: "Enski NYSC Initiative",
    body: "Make your service year count as an NYSC ambassador or part of the executive team in your state.",
    points: ["Skills, certifications and scholarships", "Internships, jobs and side income", "Any state or the FCT"],
    img: nyscCard,
    w: 736,
    h: 917,
    alt: "Corps members in uniform celebrating together",
    cta: "Explore the NYSC programme",
  },
];

/** The two ambassador programmes, each with its own page. */
export function ProgrammeChooser() {
  return (
    <section id="programmes" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-4 pt-16 md:px-8 md:pt-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-sky-text">Choose your programme</p>
        <h2 className="text-h2 mt-4 text-ink">
          One movement. <span className="text-brand">Two ways to lead.</span>
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {programmes.map((p, i) => (
          <Reveal
            as="article"
            key={p.to}
            delay={i * 100}
            className="lift group flex flex-col overflow-hidden rounded-[32px] border border-line bg-card hover:shadow-card"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={p.img}
                alt={p.alt}
                width={p.w}
                height={p.h}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span className="absolute left-4 top-4 rounded-full bg-midnight/80 px-3 py-1.5 text-xs font-extrabold text-primary-foreground backdrop-blur-sm">
                {p.eyebrow}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-7 md:p-8">
              <h3 className="text-2xl leading-8 text-ink md:text-[28px] md:leading-9">{p.title}</h3>
              <p className="mt-3 text-muted-foreground">{p.body}</p>
              <ul className="mt-5 grid gap-2 text-[15px] font-semibold text-ink">
                {p.points.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-cobalt text-primary-foreground">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <Button className="mt-7 w-full sm:w-auto sm:self-start" asChild>
                <Link to={p.to}>
                  {p.cta} <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
