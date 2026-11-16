import { ArrowRight } from "lucide-react";
import { heroImage } from "./creatorImages";
import { Button } from "@/components/ui/button";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { RiseWords } from "@/components/site/motion";
import { links } from "@/components/site/data";

export function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-cobalt-light text-primary-foreground">
      <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1200px] items-end gap-4 px-5 pt-28 lg:grid-cols-[1.15fr_1fr] lg:pt-36">
        <div className="pb-4 lg:pb-28">
          <p className="eyebrow animate-rise text-lime">Simple! Transparent!!</p>
          <h1 className="text-display mt-5 text-primary-foreground">
            <RiseWords text="Built for creators who want to" />{" "}
            <span className="text-lime">
              <RiseWords text="earn without pressure." start={6} popLast />
            </span>
          </h1>
          <p className="mt-6 max-w-[34rem] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:700ms] lg:text-lg">
            No monthly subscriptions. No hidden fees. Pay only when you earn.
          </p>
          <div className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:800ms] sm:flex-row">
            <Button asChild variant="lime" size="lg">
              <a href={links.register}>
                Start for free <ArrowRight />
              </a>
            </Button>
          </div>
        </div>

        {/* The creator sits in the glow and overlaps the white lip below */}
        <div className="relative mx-auto h-[400px] w-full max-w-[500px] animate-rise [animation-delay:250ms] sm:h-[500px] lg:h-[600px]">
          <div
            className="absolute left-1/2 top-[4%] aspect-square w-[115%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-[10%] aspect-square w-[80%] -translate-x-1/2 rounded-full border border-primary-foreground/15"
            aria-hidden="true"
          />
          <img
            {...heroImage}
            alt="Joyful young creator in a lime top and cobalt jacket celebrating a sale on her phone"
            fetchPriority="high"
            decoding="async"
            className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
          />
          <FloatChip className="left-0 top-[50%] sm:left-[-4%] sm:top-[16%]" tilt={-5} tone="lime" icon="wallet" title="Pay only when you earn" />
          <FloatChip className="right-0 top-[68%] sm:top-[40%] lg:right-[-6%]" tilt={4} delay={1.2} icon="globe" title="Multi-currency support" />
          <FloatChip className="bottom-[10%] left-0 hidden sm:left-[-2%] sm:block" tilt={3} delay={0.6} icon="trophy" title="Fast payouts" />
          <Icon3D name="coupon" eager className="absolute right-[6%] top-[4%] z-0 size-16 rotate-12 animate-bob lg:size-20" />
        </div>
      </div>

      <div className="relative z-0 h-10 rounded-t-[40px] bg-background lg:h-14 lg:rounded-t-[64px]" aria-hidden="true" />
    </section>
  );
}
