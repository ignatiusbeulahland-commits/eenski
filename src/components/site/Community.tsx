import { ArrowRight } from "lucide-react";
import communityGroup from "@/assets/people/dreamers-trybe-group.webp";
import { Button } from "@/components/ui/button";
import { FloatChip } from "./FloatChip";
import { communityLearners, links } from "./data";
import { CountUp, Reveal } from "./motion";

export function Community() {
  return (
    <section id="community" className="relative overflow-hidden bg-midnight text-primary-foreground">
      <div
        className="parallax-y absolute right-[-10%] top-[-20%] aspect-square w-[70%] rounded-full bg-glow-behind opacity-50"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-end gap-6 px-5 pt-16 lg:grid-cols-2 lg:pt-20">
        <Reveal className="pb-4 lg:pb-24">
          <p className="eyebrow text-lime">The Dreamers Trybe</p>
          <h2 className="text-display mt-4">
            Your network for <span className="text-lime">growth.</span>
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-on-blue">
            Collaborate with thousands of dreamers and tap into events, discussions and resources
            built to help you succeed.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-3">
              {communityLearners.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={192}
                  height={192}
                  loading="lazy" decoding="async"
                  className="size-11 rounded-full object-cover ring-2 ring-midnight"
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-on-blue">
              <span className="font-extrabold text-primary-foreground"><CountUp value="5,000+" /></span> dreamers and counting
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="lime" size="lg">
              <a href={links.community}>
                Join community <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href={links.communityInfo}>Learn more</a>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto h-[460px] w-full max-w-[560px] sm:h-[580px] lg:h-[660px]">
          <div
            className="absolute left-1/2 top-[10%] aspect-square w-[88%] -translate-x-1/2 rounded-full bg-cobalt-light"
            aria-hidden="true"
          />
          <img
            src={communityGroup}
            alt="Three dreamers together: a woman with a laptop in a plain navy polo and lime joggers, beside friends in a sky jacket and lime hoodie with the Dreamers Trybe logo"
            width={1024}
            height={1198}
            loading="lazy" decoding="async"
            className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
          />
          <FloatChip
            className="bottom-[17%] left-0"
            tilt={-5}
            tone="lime"
            icon="bell"
            subtitle="Friday · 7pm WAT"
            title="Pricing your first gig"
          />
          <FloatChip
            className="bottom-[7%] right-0"
            tilt={4}
            delay={1.2}
            tone="dark"
            icon="chat"
            subtitle="Active today"
            title={<CountUp value="1.2k discussions" />}
          />
        </Reveal>
      </div>
    </section>
  );
}
