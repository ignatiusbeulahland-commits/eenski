import { ArrowRight } from "lucide-react";
import { ctaImage } from "./creatorImages";
import { Button } from "@/components/ui/button";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";
import { links } from "@/components/site/data";

export function FinalCta() {
  return (
    <section className="bg-background px-5 pb-16 pt-24 lg:pb-24 lg:pt-36">
      {/* Rounded action bar: the creator rises out of it, breaking the top edge */}
      <div className="relative mx-auto max-w-[1200px] rounded-[32px] bg-cobalt-light text-primary-foreground lg:rounded-[48px]">
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="absolute inset-0 bg-dots opacity-50" />
        </div>
        <div className="relative grid items-end gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="px-6 pb-4 pt-10 lg:px-14 lg:py-16">
            <h2 className="text-h2 lg:text-[52px] lg:leading-[1.1]">
              Your knowledge can change lives… <span className="text-lime">and your income.</span>
            </h2>
            <p className="mt-4 max-w-md text-[17px] text-on-blue">
              Build courses, e-books, or live sessions and let Enski handle everything else.
            </p>
            <Button asChild variant="lime" size="lg" className="mt-8 w-full sm:w-auto">
              <a href={links.register}>
                Get started free <ArrowRight />
              </a>
            </Button>
          </Reveal>
          <Reveal delay={120} className="relative mx-auto h-[380px] w-full max-w-[400px] lg:-mt-32 lg:h-[540px]">
            <img
              {...ctaImage}
              alt="Smiling young creator in a cobalt Enski hoodie waving, holding a tablet and notebooks"
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <FloatChip className="left-0 top-[30%]" tilt={-5} tone="lime" icon="ebook" title="Free forever plan" />
            <Icon3D name="video" className="absolute bottom-[10%] right-[2%] z-20 size-20 rotate-6 animate-bob lg:size-24" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
