import { ArrowDown, ArrowRight } from "lucide-react";
import heroGroup from "@/assets/community/community-selfie.webp";
import { Button } from "@/components/ui/button";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { communityLearners, links } from "./data";
import { CountUp, RiseWords } from "@/components/site/motion";

export function CommunityHero() {
  return (
    <section className="relative overflow-hidden bg-cobalt-light text-primary-foreground">
      <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1200px] items-end gap-4 px-5 pt-28 lg:grid-cols-[1fr_1.1fr] lg:gap-8 lg:pt-32">
        <div className="relative z-10 pb-6 lg:pb-28">
          <p className="eyebrow-pill glass-dark animate-rise text-lime">
            <span className="size-2 rounded-full bg-lime" aria-hidden="true" />
            Community
          </p>
          <h1 className="text-display mt-5">
            <RiseWords text="Join a community that" />{" "}
            <span className="text-lime">
              <RiseWords text="grows with you." start={4} popLast />
            </span>
          </h1>
          <p
            className="mt-5 max-w-md animate-rise text-[17px] leading-relaxed text-on-blue lg:text-lg"
            style={{ animationDelay: "500ms" }}
          >
            Learn together, share your journey and connect with thousands of creators and builders
            across Africa.
          </p>

          <div
            className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "650ms" }}
          >
            <Button asChild variant="lime" size="lg">
              <a href={links.community}>
                Join the Dreamers Trybe <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href="#how-it-works">
                See how it works <ArrowDown />
              </a>
            </Button>
          </div>

          <div
            className="mt-8 flex animate-rise items-center gap-3"
            style={{ animationDelay: "800ms" }}
          >
            <div className="flex shrink-0 -space-x-3">
              {communityLearners.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={192}
                  height={192}
                  decoding="async"
                  className="size-11 rounded-full object-cover ring-2 ring-cobalt"
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-on-blue">
              <span className="font-extrabold text-primary-foreground">
                <CountUp value="5,000+" />
              </span>{" "}
              dreamers already inside
            </p>
          </div>
        </div>

        {/* Friends sit in the glow inside orbit rings; 3D props and info float around them */}
        {/* Phones: the friends bleed edge to edge and are cropped at the knees so faces read big;
            tablet and up show them full length */}
        <div className="relative -mx-5 h-[390px] max-w-[600px] sm:mx-auto sm:h-[480px] sm:w-full lg:h-[620px]">
          <div
            className="absolute bottom-[-35%] left-1/2 aspect-square w-[115%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden="true"
          />
          <div
            className="orbit-ring animate-orbit-slow absolute bottom-[-30%] left-1/2 aspect-square w-[100%] -translate-x-1/2"
            aria-hidden="true"
          />
          <div
            className="orbit-ring absolute bottom-[-18%] left-1/2 aspect-square w-[72%] -translate-x-1/2"
            aria-hidden="true"
          />
          <img
            src={heroGroup}
            alt="Four laughing young friends in cobalt, sky blue, lime and navy Enski clothing taking a group selfie"
            width={1083}
            height={1100}
            fetchPriority="high"
            decoding="async"
            className="absolute left-[-6%] top-0 z-10 h-auto w-[112%] max-w-none sm:bottom-0 sm:left-1/2 sm:top-auto sm:h-full sm:w-auto sm:-translate-x-1/2 sm:object-contain sm:object-bottom"
          />
          <FloatChip
            className="bottom-4 left-4 sm:bottom-[26%] sm:left-[-6%]"
            tilt={-5}
            tone="lime"
            icon="bell"
            subtitle="Live tonight · 7pm WAT"
            title="Creator Q&A"
          />
          <FloatChip
            className="bottom-1 right-0 hidden sm:right-[-2%] sm:bottom-[10%] sm:block"
            tilt={4}
            delay={1.2}
            tone="light"
            icon="chat"
            subtitle="Peer feedback"
            title="New replies on your post"
          />
          <Icon3D
            name="mic"
            eager
            className="absolute right-3 top-[-11%] z-20 size-16 rotate-12 sm:right-[-2%] sm:top-[-8%] animate-bob sm:size-20 lg:right-[-4%] lg:size-24"
          />
          <Icon3D
            name="share"
            eager
            className="absolute left-[46%] top-[0%] z-0 hidden size-14 -rotate-12 animate-bob [animation-delay:1.5s] sm:block lg:size-16"
          />
          <Icon3D
            name="globe"
            eager
            className="absolute left-[-2%] top-[34%] z-20 hidden size-14 animate-bob [animation-delay:0.8s] lg:block"
          />
        </div>
      </div>
    </section>
  );
}
