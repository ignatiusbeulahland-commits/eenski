import { ArrowRight } from "lucide-react";
import heroGroup from "@/assets/about/hero-trio.webp";
import { Button } from "@/components/ui/button";
import { FloatChip } from "@/components/site/FloatChip";
import { RiseWords } from "@/components/site/motion";
import { links } from "@/components/site/data";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-cobalt-light text-primary-foreground">
      <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1200px] items-end gap-4 px-5 pt-28 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:pt-36">
        <div className="pb-4 lg:pb-32">
          <p className="eyebrow animate-rise text-lime">Get to know us</p>
          <h1 className="text-display mt-5 max-w-[13ch] text-primary-foreground lg:max-w-none">
            <RiseWords text="Empowering Africa's" />{" "}
            <span className="text-lime">
              <RiseWords text="creators & builders." start={2} popLast />
            </span>
          </h1>
          <p className="mt-6 max-w-[34rem] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:700ms] lg:text-lg">
            We're building the infrastructure that lets African creators, experts and organisations
            sell what they know to the world, without borders.
          </p>

          <div className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:800ms] sm:flex-row">
            <Button asChild variant="lime" size="lg">
              <a href={links.register}>
                Become a creator <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href="#story">Read our story</a>
            </Button>
          </div>
        </div>

        {/* The builders stand in the glow and overlap the white lip below */}
        <div className="relative mx-auto h-[330px] w-full max-w-[560px] animate-rise [animation-delay:250ms] sm:h-[440px] lg:h-[560px] lg:max-w-none">
          <div
            className="absolute left-1/2 top-[4%] aspect-square w-[100%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-[10%] aspect-square w-[72%] -translate-x-1/2 rounded-full border border-primary-foreground/15"
            aria-hidden="true"
          />
          <img
            src={heroGroup}
            alt="Three young Enski builders laughing together over a laptop: a woman in a cobalt Enski sweatshirt, a woman in a plain sky-blue zip hoodie and a man in a navy Enski t-shirt"
            width={1344}
            height={998}
            fetchPriority="high"
            className="absolute bottom-0 left-1/2 z-10 h-auto w-[112%] max-w-none -translate-x-1/2 object-contain object-bottom sm:w-full"
          />

          <FloatChip
            className="left-0 top-[4%] lg:left-[-2%]"
            tilt={-5}
            icon="globe"
            subtitle="Sell anywhere"
            title="No borders"
          />
          <FloatChip
            className="right-0 top-[16%] lg:right-[-3%]"
            tilt={4}
            delay={1.2}
            tone="lime"
            icon="video"
            subtitle="Teach live"
            title="Host big streams"
          />
          <FloatChip
            className="bottom-[8%] right-[-1%] hidden sm:block lg:right-[-4%]"
            tilt={-3}
            delay={0.6}
            icon="wallet"
            subtitle="Get paid"
            title="Global checkout"
          />
        </div>
      </div>

      <div
        className="relative z-0 h-10 rounded-t-[40px] bg-background lg:h-14 lg:rounded-t-[64px]"
        aria-hidden="true"
      />
    </section>
  );
}
