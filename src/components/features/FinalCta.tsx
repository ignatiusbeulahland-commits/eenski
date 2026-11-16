import { ArrowRight } from "lucide-react";
import { Icon3D } from "./icons3d";
import { Button } from "@/components/features/button";
import { cutouts } from "./cutouts";
import { Container, Reveal } from "./primitives";
import { links } from "./links";

export function FinalCta() {
  return (
    <section className="overflow-x-clip pb-16 pt-24 md:pb-24 md:pt-40">
      <Container>
        <Reveal className="relative">
          <div className="relative rounded-[32px] bg-cobalt-light md:rounded-[48px]">
            <div aria-hidden className="dot-grid-on-blue absolute inset-0 rounded-[inherit] opacity-50" />
            <div className="relative grid lg:grid-cols-[1.2fr_1fr]">
              <div className="relative z-10 px-6 pb-2 pt-10 sm:px-10 md:px-14 md:pt-16 lg:pb-16">
                <h2 className="type-h1 text-on-blue lg:text-[length:calc(56px*var(--hs,1))] lg:leading-[1.1]">
                  Your knowledge can change lives…{" "}
                  <span className="text-lime">and your income.</span>
                </h2>
                <p className="type-body-lg mt-5 max-w-md text-on-blue/80">
                  Join creators across Africa who are building, selling and teaching on Enski. It
                  is free to start.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="lime" size="lg">
                    <a href={links.register}>
                      Get started free <ArrowRight />
                    </a>
                  </Button>
                  <Button asChild variant="outline-blue" size="lg">
                    <a href={links.pricing}>See pricing</a>
                  </Button>
                </div>
              </div>
              {/* Person breaks out of the top of the bar */}
              <div className="relative [--ts:1] h-[330px] overflow-hidden rounded-b-[32px] sm:h-[400px] lg:h-auto lg:overflow-visible lg:rounded-none">
                <div
                  aria-hidden
                  className="halo-white absolute bottom-0 left-1/2 aspect-square w-[90%] max-w-[420px] -translate-x-1/2"
                />
                <Icon3D
                  name="wallet"
                  className="absolute bottom-10 left-3 z-10 size-20 animate-bob sm:left-8 lg:-left-6 lg:bottom-20 lg:size-24"
                />
                <img
                  src={cutouts.cta.src}
                  srcSet={cutouts.cta.srcSet}
                  sizes={cutouts.cta.sizes}
                  alt="Enski creator celebrating with a tablet"
                  width={1024}
                  height={1280}
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom lg:h-[600px]"
                />
                <span
                  className="glass-on-blue absolute right-4 top-6 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 fs-13 font-extrabold text-on-blue animate-float-slow sm:right-6 lg:top-24"
                  style={{ ["--tilt" as string]: "5deg" }}
                >
                  <Icon3D name="coupon" className="size-8" /> Free to start
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
