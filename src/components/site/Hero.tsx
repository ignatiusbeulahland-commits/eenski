import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatChip } from "./FloatChip";
import { HeroSlides } from "./HeroSlides";
import { CountUp, RiseWords } from "./motion";
import { links } from "./data";

const stats = [
  { value: "20+", label: "top creators" },
  { value: "5,000+", label: "community members" },
  { value: "$70,000", label: "transaction volume processed" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cobalt-light text-primary-foreground">
      <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1200px] items-end gap-6 px-5 pt-28 lg:grid-cols-[1.05fr_1fr] lg:pt-36">
        <div className="pb-6 lg:pb-32">
          <p className="eyebrow animate-rise text-lime">Africa's platform for dreamers</p>
          <h1 className="text-display mt-5 max-w-[12ch] text-primary-foreground lg:max-w-none">
            <RiseWords text="Your future is not a dream," />{" "}
            <span className="text-lime">
              <RiseWords text="it's a skill away." start={6} popLast />
            </span>
          </h1>
          <p className="mt-6 max-w-[34rem] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:700ms] lg:text-lg">
            Learn the skills that shape your future. Teach the knowledge that shapes someone
            else's. All on one platform.
          </p>

          <div className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:800ms] sm:flex-row">
            <Button asChild variant="lime" size="lg">
              <a href={links.dreamverse}>
                Start learning <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href={links.register}>Become a creator</a>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg animate-rise grid-cols-3 gap-4 [animation-delay:900ms]">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-extrabold text-lime lg:text-[28px]">
                  <CountUp value={s.value} duration={1800} />
                </dd>
                <dd className="mt-1 text-[13px] font-semibold text-on-blue">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The crew sits in the glow, overlapping the section edge below */}
        <div className="relative mx-auto h-[440px] w-full max-w-[560px] animate-rise [animation-delay:250ms] sm:h-[500px] lg:h-[640px] lg:max-w-none">
          <div
            className="absolute left-1/2 top-[6%] aspect-square w-[110%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-[12%] aspect-square w-[78%] -translate-x-1/2 rounded-full border border-primary-foreground/15"
            aria-hidden="true"
          />
          <HeroSlides />

          <FloatChip
            className="left-0 top-[6%] sm:left-[-2%]"
            tilt={-5}
            icon="wallet"
            subtitle="New payout"
            title={<CountUp value="₦248,500" duration={1800} />}
          />
          <FloatChip
            className="right-0 top-[8%] sm:top-[14%] lg:right-[-4%]"
            tilt={4}
            delay={1.2}
            tone="lime"
            icon="video"
            subtitle="Live now"
            title={<CountUp value="128 watching" duration={1800} />}
          />
          <FloatChip
            className="bottom-[6%] left-[-2%] max-[399px]:hidden sm:left-[-4%]"
            tilt={3}
            delay={0.6}
            icon="trophy"
            subtitle="Just now"
            title="Certificate earned"
          />
          <FloatChip
            className="bottom-[3%] right-[-2%] hidden sm:block lg:right-[-4%]"
            tilt={-3}
            delay={1.8}
            icon="analytics"
            subtitle="Lesson 8 of 12"
            title={<CountUp value="68% complete" duration={1800} />}
          />
        </div>
      </div>

      {/* Rounded white lip that the person overlaps */}
      <div
        className="relative z-0 h-10 rounded-t-[40px] bg-background lg:h-14 lg:rounded-t-[64px]"
        aria-hidden="true"
      />
    </section>
  );
}
