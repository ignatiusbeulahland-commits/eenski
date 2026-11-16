import { useEffect, useRef, useState } from "react";

import learners from "@/assets/dreamverse/hero-learners.webp";
import learnersSm from "@/assets/dreamverse/hero-learners-640.webp";
import creators from "@/assets/dreamverse/hero-slide-creators.webp";
import creatorsSm from "@/assets/dreamverse/hero-slide-creators-640.webp";
import mentor from "@/assets/dreamverse/hero-slide-mentor.webp";
import mentorSm from "@/assets/dreamverse/hero-slide-mentor-640.webp";
import { cn } from "@/lib/utils";

const slides = [
  {
    src: learners,
    srcSm: learnersSm,
    width: 1100,
    height: 1164,
    alt: "Two smiling young learners: a man in a sky-blue hoodie holding a laptop, and a woman in a lime cardigan holding books and a tablet",
  },
  {
    src: creators,
    srcSm: creatorsSm,
    width: 1100,
    height: 1181,
    alt: "Two young creators laughing: a woman in a cobalt Enski sweatshirt with headphones and a tablet, and a man in a white Enski t-shirt and lime overshirt holding a notebook",
  },
  {
    src: mentor,
    srcSm: mentorSm,
    width: 1100,
    height: 1154,
    alt: "A smiling mentor in a navy suit and white top explaining something on her laptop, next to a student in a sky-blue Enski hoodie giving a thumbs up",
  },
];

const INTERVAL = 4500;
const srcSetOf = (s: (typeof slides)[number]) => `${s.srcSm} 640w, ${s.src} 1100w`;
// Rendered width of the photo: about 570px at 600px tall on desktop, nearly full width on phones.
const SIZES = "(min-width: 1024px) 580px, (min-width: 640px) 480px, 100vw";

/** The same photos as the page shows them, so they can be saved for offline use. */
export const dreamverseHeroPictures = slides.map((s) => ({ src: s.src, srcSet: srcSetOf(s), sizes: SIZES }));

/**
 * Auto-swiping hero photos, same behaviour as the Enski Stays hero.
 * Pauses on hover, focus, a hidden tab and reduced motion; swipe or use the dots.
 */
export function HeroSlides({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Only the first photo loads with the page; the others wait until it has finished loading.
  const [extrasReady, setExtrasReady] = useState(false);
  const startX = useRef<number | null>(null);
  const n = slides.length;

  useEffect(() => {
    let idle = 0;
    const ready = () => {
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(() => setExtrasReady(true), { timeout: 2000 });
      else idle = window.setTimeout(() => setExtrasReady(true), 300);
    };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
    return () => {
      window.removeEventListener("load", ready);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (paused || reduced || !extrasReady) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setActive((a) => (a + 1) % n);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, reduced, extrasReady, n, active]);

  const go = (i: number) => {
    setExtrasReady(true);
    setActive(((i % n) + n) % n);
  };

  return (
    <div
      className={cn("absolute inset-0 touch-pan-y", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
      }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Dreamverse learners and creators"
    >
      {slides.map((s, i) => {
        if (i > 0 && !extrasReady) return null;
        const isActive = i === active;
        const isPrev = i === (active - 1 + n) % n;
        return (
          <img
            key={s.src}
            src={s.src}
            srcSet={srcSetOf(s)}
            sizes={SIZES}
            alt={s.alt}
            width={s.width}
            height={s.height}
            draggable={false}
            loading="eager"
            fetchPriority={i === 0 ? "high" : "auto"}
            decoding="async"
            aria-hidden={!isActive}
            className={cn(
              "absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom select-none duration-700 ease-out motion-reduce:transition-none lg:h-[600px]",
              isActive ? "opacity-100" : cn("pointer-events-none opacity-0", isPrev ? "-ml-10" : "ml-10"),
            )}
            style={{ transitionProperty: "opacity, margin" }}
          />
        );
      })}

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-4 rounded-full bg-midnight/50 px-4 py-2 backdrop-blur-sm">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show photo ${i + 1} of ${n}`}
            aria-current={i === active}
            className={cn(
              "relative h-2 rounded-full transition-all duration-300 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none",
              i === active ? "w-6 bg-lime" : "w-2 bg-primary-foreground/60 hover:bg-primary-foreground",
            )}
          />
        ))}
      </div>
    </div>
  );
}
