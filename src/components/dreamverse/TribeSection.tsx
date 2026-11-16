import { ArrowRight } from "lucide-react";

import tribeImg from "@/assets/dreamverse/tribe-friends.webp";
import tribeImgSm from "@/assets/dreamverse/tribe-friends-700.webp";
import { Button } from "@/components/dreamverse/button";
import { ENSKI } from "@/lib/enski-links";

import { Icon3D } from "./icons3d";

const WHO = ["Creators", "Learners", "Students", "Professionals"];

/**
 * Closing community band. Per the brand guide the people are cut out and
 * break out of the top of the cobalt bar instead of sitting in a boxed photo.
 */
export function TribeSection() {
  return (
    <section aria-labelledby="tribe-title" className="overflow-x-clip pt-10 pb-16 md:pt-24 lg:pt-32 lg:pb-24">
      <div className="container-page">
        <div className="relative rounded-[32px] bg-cobalt-light text-on-blue md:rounded-[48px]">
          <div aria-hidden className="texture-dots absolute inset-0 rounded-[inherit] opacity-50" />
          <div className="relative grid lg:grid-cols-[1.1fr_1fr]">
            <div className="relative z-10 px-6 pt-10 pb-2 sm:px-10 md:px-14 md:pt-16 lg:pb-16">
              <p className="dv-eyebrow text-lime">The Dreamers Trybe</p>
              <h2 id="tribe-title" className="dv-h2 mt-3 max-w-[16ch] lg:text-[48px] lg:leading-[1.1]">
                Big dreams grow <span className="text-lime">better together.</span>
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-on-blue-muted">
                Connect with creators, learners and ambitious people building their next chapter.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Who's in the Trybe">
                {WHO.map((w) => (
                  <li key={w} className="rounded-full border border-on-blue/25 px-3.5 py-1.5 text-sm font-extrabold">
                    {w}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="lime" size="lg">
                  <a href={ENSKI.dreamersTribe}>
                    Join the Dreamers Trybe <ArrowRight />
                  </a>
                </Button>
                <Button asChild variant="outline-on-blue" size="lg">
                  <a href={ENSKI.community}>Learn more</a>
                </Button>
              </div>
            </div>

            {/* People break out of the top of the bar on desktop */}
            {/* Phones: the photo fits the card width under a band for the label, so no face or arm is cut off */}
            <div className="relative overflow-hidden rounded-b-[32px] pt-16 sm:h-[430px] sm:pt-0 lg:h-auto lg:overflow-visible lg:rounded-none">
              {/* Glow stays clipped to the card so it never spills onto the page */}
              <div aria-hidden className="absolute inset-0 overflow-hidden lg:rounded-r-[48px]">
                <div className="absolute bottom-6 left-1/2 aspect-square w-[80%] max-w-[420px] -translate-x-1/2 rounded-full bg-sky-light-glow opacity-60 blur-2xl lg:bottom-0" />
              </div>
              <img
                src={tribeImg}
                srcSet={`${tribeImgSm} 700w, ${tribeImg} 1100w`}
                sizes="(min-width: 1024px) 680px, 100vw"
                alt="Three young African friends laughing together while taking a selfie"
                width={1100}
                height={820}
                loading="lazy"
                decoding="async"
                className="relative block h-auto w-full object-contain object-bottom sm:absolute sm:bottom-0 sm:left-1/2 sm:h-[380px] sm:w-auto sm:max-w-none sm:-translate-x-1/2 lg:left-auto lg:right-0 lg:h-[470px] lg:translate-x-0 xl:h-[500px]"
              />
              <Icon3D
                name="share"
                className="absolute top-2 left-3 z-10 size-12 animate-bob sm:top-auto sm:bottom-8 sm:left-8 sm:size-20 lg:top-[-36px] lg:right-2 lg:bottom-auto lg:left-auto lg:size-24"
              />
              <Icon3D
                name="chat"
                className="absolute top-16 left-4 z-10 hidden size-14 -rotate-6 animate-bob [animation-delay:-2s] sm:block lg:top-0 lg:left-10"
              />
              <span className="absolute top-5 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-lime py-1.5 pr-4 pl-1.5 text-[13px] font-extrabold text-midnight shadow-float sm:right-8 lg:top-auto lg:right-2 lg:bottom-12">
                <Icon3D name="stars" className="size-7" />
                Events, discussions and resources
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
