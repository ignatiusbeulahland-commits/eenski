import { ArrowRight } from "lucide-react";
import ctaHoodie from "@/assets/people/cta-hoodie.webp";
import { Button } from "@/components/ui/button";
import { FloatChip } from "./FloatChip";
import { Icon3D } from "./Icon3D";
import { Reveal } from "./motion";

export function FinalCta() {
  return (
    <section className="bg-background px-5 pb-16 pt-24 lg:pb-24 lg:pt-32">
      {/* Rounded action bar — the person rises out of it, breaking the top edge */}
      <div className="relative mx-auto max-w-[1200px] rounded-[32px] bg-cobalt-light text-primary-foreground lg:rounded-[48px]">
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="absolute inset-0 bg-dots opacity-50" />
        </div>
        <div className="relative grid items-end gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="px-6 pb-4 pt-10 lg:px-14 lg:py-16">
            <h2 className="text-h2 lg:text-[52px] lg:leading-[1.1]">
              Start your learning journey <span className="text-lime">today.</span>
            </h2>
            <p className="mt-4 max-w-md text-[17px] text-on-blue">
              Join thousands of dreamers learning from creators who've been where you are.
            </p>
            <Button asChild variant="lime" size="lg" className="mt-8 w-full sm:w-auto">
              <a href="/courses">
                Explore courses <ArrowRight />
              </a>
            </Button>
          </Reveal>
          {/* Phones: the photo sits a little lower so the chip and trophy float above his shoulders, not over the hoodie */}
          <Reveal delay={120} className="relative mx-auto h-[400px] w-full max-w-[400px] sm:h-[360px] lg:-mt-28 lg:h-[520px]">
            <img
              src={ctaHoodie}
              alt="Smiling young man in a navy hoodie, clapping"
              width={730}
              height={1100}
              loading="lazy" decoding="async"
              className="absolute bottom-0 left-1/2 z-10 h-[340px] w-auto max-w-none -translate-x-1/2 object-contain object-bottom sm:h-full"
            />
            <FloatChip
              className="left-0 top-[2%] sm:top-[30%]"
              tilt={-5}
              tone="lime"
              icon="ebook"
              title="Free to start"
            />
            <Icon3D
              name="trophy"
              className="absolute right-[2%] top-[4%] z-20 size-16 rotate-6 animate-bob sm:top-auto sm:bottom-[10%] sm:size-20 lg:size-24"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
