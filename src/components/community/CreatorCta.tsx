import { ArrowRight, Check } from "lucide-react";
import creatorImg from "@/assets/community/creator-live.webp";
import { Button } from "@/components/ui/button";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { links } from "./data";
import { Reveal } from "@/components/site/motion";

const formats = ["Courses", "Ebooks", "Live sessions"];

export function CreatorCta() {
  return (
    <section className="bg-soft px-5 pb-16 pt-24 lg:pb-24 lg:pt-36">
      {/* Rounded action bar; the creator rises out of it and breaks the top edge */}
      <div className="relative mx-auto max-w-[1200px] rounded-[32px] bg-cobalt-light text-primary-foreground lg:rounded-[48px]">
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="absolute inset-0 bg-dots opacity-50" />
          <div className="absolute -bottom-1/2 right-[5%] aspect-square w-[55%] rounded-full bg-glow-behind" />
          <div className="orbit-ring animate-orbit-slow absolute -bottom-[45%] right-[-4%] aspect-square w-[min(620px,120%)] lg:right-[2%] lg:w-[46%]" />
        </div>
        <Icon3D
          name="storefront"
          className="absolute -top-10 left-8 z-20 hidden size-20 -rotate-6 animate-bob lg:block"
        />
        <div className="relative grid items-end gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="px-6 pb-4 pt-10 lg:px-14 lg:py-16">
            <p className="eyebrow-pill glass-dark text-lime">
              <span className="size-2 rounded-full bg-lime" aria-hidden="true" />
              For creators
            </p>
            <h2 className="text-h2 mt-4 lg:text-[52px] lg:leading-[1.1]">
              Your knowledge can change lives… <span className="text-lime">and your income.</span>
            </h2>
            <p className="mt-4 max-w-md text-[17px] text-on-blue">
              Build courses, ebooks or live sessions and let Enski handle everything else.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {formats.map((f) => (
                <li key={f} className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold">
                  <Check className="size-4 text-lime" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="lime" size="lg">
                <a href={links.register}>
                  Get started free <ArrowRight />
                </a>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <a href={links.features}>See creator tools</a>
              </Button>
            </div>
          </Reveal>
          <Reveal
            delay={120}
            className="relative mx-auto h-[380px] w-full max-w-[420px] lg:-mt-32 lg:h-[580px]"
          >
            <img
              src={creatorImg}
              alt="Laughing young woman creator in a cobalt bomber jacket and lime top, speaking into a microphone as if teaching a live class"
              width={452}
              height={1080}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <FloatChip
              className="left-0 top-[30%]"
              tilt={-5}
              tone="lime"
              icon="cart"
              subtitle="New sale"
              title="₦45,000"
            />
            <FloatChip
              className="bottom-[16%] right-0"
              tilt={4}
              delay={1.1}
              tone="light"
              icon="coupon"
              subtitle="Coupon used"
              title="LAUNCH20"
            />
            <Icon3D
              name="wallet"
              className="absolute right-[2%] top-[8%] z-20 size-20 rotate-6 animate-bob [animation-delay:0.7s] lg:size-24"
            />
            <Icon3D
              name="ebook"
              className="absolute bottom-[44%] left-[4%] z-0 hidden size-14 -rotate-12 animate-bob [animation-delay:1.6s] sm:block"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
