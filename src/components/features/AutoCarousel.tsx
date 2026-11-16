import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView, usePrefersReducedMotion } from "./useInView";

/**
 * Auto-swiping, swipeable carousel.
 * - Plays only while on screen, pauses on hover / focus, never moves with reduced motion.
 * - Pause button (WCAG 2.2.2), arrow buttons, dots with a live progress fill.
 */
export function AutoCarousel({
  children,
  label,
  tone = "light",
  delay = 4200,
  slideClassName = "basis-[86%] sm:basis-1/2 lg:basis-1/3",
}: {
  children: ReactNode;
  label: string;
  tone?: "light" | "blue";
  delay?: number;
  slideClassName?: string;
}) {
  const slides = Children.toArray(children);
  const reduced = usePrefersReducedMotion();
  const [wrapRef, inView] = useInView<HTMLDivElement>(0.35, false);
  const autoplay = useRef(
    Autoplay({ delay, playOnInit: false, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }),
  );
  const [viewportRef, api] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false }, [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    const onInit = () => {
      setSnaps(api.scrollSnapList());
      onSelect();
    };
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    const onTimer = () => setTick((t) => t + 1);
    onInit();
    api.on("select", onSelect).on("reInit", onInit);
    api.on("autoplay:play", onPlay).on("autoplay:stop", onStop).on("autoplay:timerset", onTimer);
    return () => {
      api.off("select", onSelect).off("reInit", onInit);
      api.off("autoplay:play", onPlay).off("autoplay:stop", onStop).off("autoplay:timerset", onTimer);
    };
  }, [api]);

  // Run only while visible and allowed
  useEffect(() => {
    const ap = api?.plugins().autoplay;
    if (!ap) return;
    if (inView && !reduced && !userPaused) ap.play();
    else ap.stop();
  }, [api, inView, reduced, userPaused]);

  const go = useCallback((i: number) => api?.scrollTo(i), [api]);
  const blue = tone === "blue";

  return (
    <div
      ref={wrapRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") api?.scrollPrev();
        if (e.key === "ArrowRight") api?.scrollNext();
      }}
    >
      <div ref={viewportRef} className="-my-8 overflow-hidden px-1 py-8">
        <div className="-ml-4 flex touch-pan-y" aria-live={playing ? "off" : "polite"}>
          {slides.map((child, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className={cn("min-w-0 shrink-0 grow-0 pl-4", slideClassName)}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {snaps.map((_, i) => {
            const on = i === selected;
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={on}
                className="grid h-11 place-items-center px-0.5"
              >
                <span
                  className={cn(
                    "relative block h-2 overflow-hidden rounded-full transition-[width,background-color] duration-500",
                    on ? "w-10" : "w-2",
                    blue ? (on ? "bg-on-blue/25" : "bg-on-blue/35") : on ? "bg-ice" : "bg-line",
                  )}
                >
                  {on && (
                    <span
                      key={`${tick}-${playing}`}
                      className={cn(
                        "absolute inset-0 origin-left rounded-full",
                        blue ? "bg-lime" : "bg-cobalt",
                        playing && "animate-carousel-progress",
                      )}
                      style={playing ? { animationDuration: `${delay}ms` } : undefined}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <CtrlButton
            blue={blue}
            label={userPaused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => setUserPaused((p) => !p)}
            hidden={reduced}
          >
            {userPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
          </CtrlButton>
          <CtrlButton blue={blue} label="Previous slide" onClick={() => api?.scrollPrev()}>
            <ArrowLeft className="size-[18px]" />
          </CtrlButton>
          <CtrlButton blue={blue} label="Next slide" onClick={() => api?.scrollNext()}>
            <ArrowRight className="size-[18px]" />
          </CtrlButton>
        </div>
      </div>
    </div>
  );
}

function CtrlButton({
  children,
  label,
  onClick,
  blue,
  hidden,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  blue: boolean;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-full transition-[transform,background-color,color] duration-200 active:scale-90",
        blue
          ? "bg-on-blue/12 text-on-blue hover:bg-lime hover:text-midnight"
          : "bg-soft text-brand hover:bg-cobalt hover:text-primary-foreground",
      )}
    >
      {children}
    </button>
  );
}
