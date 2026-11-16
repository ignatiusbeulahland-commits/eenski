import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { openApply, PhotoFader, SectionHead, Showcase, WordBand } from "@/components/ambassador/kit";
import { BackToProgrammes } from "@/components/campus/CampusSections";
import { Reveal, RiseWords } from "@/components/site/motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { nyscBenefits, nyscFaqs, nyscHeroSlides, nyscImages, nyscSteps, vision } from "./data";

export function NyscHero() {
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-primary-foreground">
      <PhotoFader
        slides={nyscHeroSlides}
        label="Corps members in uniform"
        eager
        className="absolute inset-0 -z-10 md:left-auto md:w-1/2"
        imgClassName="object-[center_15%]"
        dots="bottom-5 right-4"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/70 to-cobalt/25 md:via-transparent md:to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/70 to-transparent md:bg-[linear-gradient(to_right,var(--midnight)_50%,transparent_75%)]" aria-hidden />
      <div className="mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-end px-5 pb-20 pt-28 md:px-8 lg:min-h-[46rem]">
        <div className="animate-rise">
          <BackToProgrammes />
        </div>
        <p className="eyebrow-pill glass-dark mt-6 w-fit animate-rise text-lime">
          <span className="size-2 rounded-full bg-lime" aria-hidden />
          Enski NYSC Initiative
        </p>
        <h1 className="text-display mt-4 max-w-2xl">
          <RiseWords text="Your service year. Your influence." />{" "}
          <span className="text-lime">
            <RiseWords text="Your next big opportunity." start={5} popLast />
          </span>
        </h1>
        <p className="mt-6 max-w-[480px] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:700ms] lg:text-lg">
          Turn service into skills, connections, income and opportunity.
        </p>
        <div id="hero-apply" className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:800ms] sm:flex-row">
          <Button variant="lime" size="lg" onClick={() => openApply()}>
            Join the initiative <ArrowRight />
          </Button>
          <Button variant="outline-light" size="lg" asChild>
            <a href="#benefits">Explore opportunities</a>
          </Button>
        </div>
        <p className="mt-5 animate-rise text-sm font-semibold text-on-blue [animation-delay:900ms]">
          Built for ambitious corps members · Free to join
        </p>
      </div>
    </section>
  );
}

export function NyscIdea() {
  const flow = ["Serve", "Learn", "Connect", "Earn", "Build", "Grow"];
  const [i, setI] = useState(0);
  return (
    <section id="idea" className="py-20 md:py-28">
      <WordBand words={["Skills", "Opportunities", "Income", "Connections", "Leadership", "Career growth"]} className="-mt-24 mb-12 md:-mt-32 md:mb-16" />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <SectionHead
            eyebrow="01 · The idea"
            title="NYSC can be more than"
            accent="just service."
            body="Service lasts a year. What you learn, build and connect to lasts a career. We connect corps members to skills, certifications, internships, jobs, income, networks and leadership."
          />
          <ol className="mt-7 flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {flow.map((s, k) => (
              <li key={s} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-bold",
                    k === flow.length - 1 ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand dark:bg-cobalt/30 dark:text-primary-foreground",
                  )}
                >
                  {s}
                </span>
                {k < flow.length - 1 ? <ArrowRight className="size-3.5 text-sky" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal>
          <div className="relative mx-auto w-full max-w-xl">
            <PhotoFader
              slides={vision}
              label="What a service year with Enski can look like"
              onChange={setI}
              dots={false}
              className="aspect-[4/3] w-full rounded-[32px] shadow-float"
            />
            <div className="relative -mt-7 flex justify-center">
              <div className="glass-dark flex items-center gap-3 rounded-2xl bg-midnight/80 px-3 py-2 text-primary-foreground shadow-float">
                <span className="grid size-9 place-items-center rounded-xl bg-lime text-sm font-extrabold text-midnight">0{i + 1}</span>
                <div className="leading-tight" aria-live="polite">
                  <p className="text-sm font-extrabold">{vision[i]?.tag}</p>
                  <p className="text-xs text-on-blue">{vision[i]?.alt}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function NyscBenefits() {
  return (
    <section id="benefits" className="bg-soft py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <SectionHead
            eyebrow="02 · What you get"
            title="Walk in a corper."
            accent="Walk out ahead."
            body="We give you the skills, training, scholarships and connections that strengthen your CV, raise your chances and help you earn more."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {nyscBenefits.map((b, k) => (
            <Reveal
              as="article"
              key={b.title}
              delay={(k % 4) * 80}
              className="lift relative overflow-hidden rounded-card bg-midnight px-5 pb-7 pt-4 text-primary-foreground ring-1 ring-inset ring-primary-foreground/10"
            >
              <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-cobalt-glow/40 blur-3xl" />
              <Showcase slides={b.slides} alt={b.alt} chip={b.chip} notch="bg-midnight" className="max-w-[300px]" />
              <p className="eyebrow relative mt-6 text-lime">Perk 0{k + 1}</p>
              <h3 className="relative mt-1 text-xl font-extrabold leading-7">{b.title}</h3>
              <p className="relative mt-2 text-[15px] leading-snug text-on-blue">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NyscCommunity() {
  const pts = ["Practical learning", "Opportunity updates", "Peer connections", "Career conversations"];
  return (
    <section id="community" className="relative isolate overflow-hidden bg-cobalt-light py-20 text-primary-foreground md:py-28">
      <div className="absolute inset-0 -z-10 bg-dots opacity-40" aria-hidden />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <figure className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute -inset-3 -z-10 -rotate-2 rounded-[36px] bg-primary-foreground/10" />
            <img
              src={nyscImages.celebrate}
              alt="Corps members in uniform celebrating together"
              width={736}
              height={917}
              loading="lazy"
              className="block h-auto w-full rounded-[28px] shadow-float"
            />
            <figcaption className="glass-chip absolute bottom-4 left-4 rounded-2xl px-4 py-3 text-ink">
              <p className="text-lg font-extrabold leading-tight">Community</p>
              <p className="text-xs text-muted-foreground">you're not alone</p>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal>
          <SectionHead dark eyebrow="03 · Your community" title="Don't do service year" accent="alone." body="Corps members learning, building and earning together." />
          <ul className="mt-6 flex flex-wrap gap-2">
            {pts.map((p) => (
              <li key={p} className="flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-sm font-bold">
                <Check className="size-3.5 text-lime" strokeWidth={3} aria-hidden /> {p}
              </li>
            ))}
          </ul>
          <Button variant="outline-light" className="mt-7" onClick={() => openApply()}>
            Join the community <ArrowRight />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function NyscLeadership() {
  const pts = ["Represent Enski in your state", "Host meetups and sessions", "Mentor fellow corps members", "Get recognised for impact"];
  return (
    <section id="leadership" className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
      <Reveal>
        <SectionHead
          eyebrow="04 · Leadership"
          title="Your network is"
          accent="your superpower."
          body="Become an Enski NYSC ambassador. Connect corps members to opportunity and build your own leadership and network."
        />
        <ol className="mt-7 grid gap-2 sm:grid-cols-2">
          {pts.map((p, k) => (
            <li key={p} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-[15px] font-semibold text-ink">
              <span className="text-sm font-extrabold text-sky-text">0{k + 1}</span>
              {p}
            </li>
          ))}
        </ol>
        <Button className="mt-8" size="lg" onClick={() => openApply("nysc_ambassador")}>
          Become an Enski NYSC ambassador <ArrowRight />
        </Button>
      </Reveal>
      <Reveal>
        <Showcase src={nyscImages.lead} alt="A corps member speaking into a microphone" chip={{ icon: "mic", title: "Ambassador", subtitle: "lead your people" }} />
      </Reveal>
    </section>
  );
}

export function NyscSteps() {
  return (
    <section id="how-it-works" className="bg-soft py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <SectionHead center eyebrow="05 · How it works" title="Five steps." accent="No hassle." />
        </Reveal>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-5 md:gap-6">
          <span className="absolute left-7 top-7 h-[calc(100%-3.5rem)] w-0.5 bg-sky-200 md:left-[10%] md:right-[10%] md:h-0.5 md:w-auto" aria-hidden />
          {nyscSteps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 100} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span
                className={cn(
                  "relative z-10 grid size-14 shrink-0 place-items-center rounded-full text-xl font-extrabold shadow-float",
                  i === nyscSteps.length - 1 ? "bg-lime text-midnight" : "bg-cobalt text-primary-foreground",
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
        <Reveal className="relative mt-14 overflow-hidden rounded-[32px]">
          <img
            src={nyscImages.boots}
            alt="Corps members marching in step in orange jungle boots"
            width={735}
            height={490}
            loading="lazy"
            className="h-56 w-full scale-110 object-cover object-[center_65%] sm:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-transparent to-transparent" aria-hidden />
          <p className="absolute bottom-5 left-6 text-xl font-extrabold text-primary-foreground sm:text-2xl">One step at a time.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function NyscWhoCanJoin() {
  const tags = ["Any state or the FCT", "Any discipline", "Any skill level", "Ambitious corps members"];
  return (
    <section id="who" className="bg-midnight py-20 text-primary-foreground dark:bg-background md:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <Showcase
            src={nyscImages.duo}
            alt="Two young Nigerian corps members giving a thumbs up"
            notch="bg-midnight dark:bg-background"
            chip={{ icon: "profile", title: "Everyone", subtitle: "you're welcome" }}
          />
        </Reveal>
        <Reveal>
          <SectionHead dark eyebrow="06 · Who can join?" title="Serving in Nigeria?" accent="You're in." />
          <ul className="mt-6 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t} className="rounded-full bg-lime px-3 py-1.5 text-sm font-bold text-midnight">
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[17px] leading-relaxed text-on-blue md:text-lg">No need to have it all figured out. Just bring the drive.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function NyscApplyCta() {
  return (
    <section id="apply-cta" className="relative isolate overflow-hidden bg-cobalt-light pb-20 pt-10 text-primary-foreground md:pb-28">
      <div className="absolute inset-0 -z-10 bg-dots opacity-40" aria-hidden />
      <div className="relative mx-auto mb-6 max-w-3xl">
        <img
          src={nyscImages.crowd}
          alt="Corps members gathered at orientation camp under a big sky"
          loading="lazy"
          width={736}
          height={981}
          className="h-72 w-full object-cover object-[center_70%] sm:h-[28rem]"
          style={{
            maskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, black 45%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, black 45%, transparent 100%)",
          }}
        />
      </div>
      <Reveal className="mx-auto max-w-xl px-5 text-center md:px-8">
        <SectionHead dark center eyebrow="07 · Start here" title="Make your service year" accent="count." body="Learn. Connect. Earn. Lead." />
        <Button variant="lime" size="lg" className="mt-8" onClick={() => openApply()}>
          Apply now <ArrowRight />
        </Button>
      </Reveal>
    </section>
  );
}

export function NyscFaqs() {
  return (
    <section id="faqs" className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <SectionHead eyebrow="08 · FAQs" title="Questions?" accent="We've got you." />
      </Reveal>
      <Reveal>
        <img
          src={nyscImages.circle}
          alt="Corps members' orange boots in a circle"
          width={736}
          height={920}
          loading="lazy"
          className="mt-8 h-56 w-full rounded-[32px] object-cover sm:h-72"
        />
      </Reveal>
      <Accordion type="single" collapsible defaultValue="faq-0" className="mt-8 space-y-2">
        {nyscFaqs.map(([q, a], k) => (
          <AccordionItem key={q} value={`faq-${k}`} className="rounded-2xl border-0 bg-soft px-5">
            <AccordionTrigger className="text-left text-base font-extrabold text-ink hover:no-underline">{q}</AccordionTrigger>
            <AccordionContent className="text-[15px] leading-snug text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
