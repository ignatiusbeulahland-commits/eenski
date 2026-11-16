import { ArrowRight } from "lucide-react";
import ctaHoodie from "@/assets/about/cta-thumbsup.webp";
import { Button } from "@/components/ui/button";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";
import { links } from "@/components/site/data";

export function AboutCta() {
  return (
    <section className="bg-background px-5 pb-16 pt-24 lg:pb-24 lg:pt-32">
      {/* Rounded action bar: the person rises out of it, breaking the top edge */}
      <div className="relative mx-auto max-w-[1200px] rounded-[32px] bg-cobalt-light text-primary-foreground lg:rounded-[48px]">
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="absolute inset-0 bg-dots opacity-50" />
        </div>
        <div className="relative grid items-end gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="px-6 pb-4 pt-10 lg:px-14 lg:py-16">
            <h2 className="text-h2 lg:text-[52px] lg:leading-[1.1]">
              Build what's next <span className="text-lime">with us.</span>
            </h2>
            <p className="mt-4 max-w-md text-[17px] text-on-blue">
              Share what you know, reach learners everywhere and get paid without the headaches.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="lime" size="lg">
                <a href={links.register}>
                  Become a creator <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <a href={links.dreamverse}>Explore Dreamverse</a>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative mx-auto h-[360px] w-full max-w-[400px] lg:-mt-28 lg:h-[520px]">
            <img
              src={ctaHoodie}
              alt="Smiling young man in a navy Enski hoodie giving a thumbs up"
              width={712}
              height={1089}
              loading="lazy"
              className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <FloatChip className="left-0 top-[30%]" tilt={-5} tone="lime" icon="ebook" title="Free to start" />
            <Icon3D
              name="trophy"
              className="absolute bottom-[10%] right-[2%] z-20 size-20 rotate-6 animate-bob lg:size-24"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
