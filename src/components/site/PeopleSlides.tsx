import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefersLowData } from "@/lib/offline/connection";
import { cn } from "@/lib/utils";
import { canAutoPlay, loadSlide, PEOPLE_SLIDE_INTERVAL, slideSource, type SlideSource } from "./slide-loading";

export type PeopleSlide = {
  src: string; alt: string; width: number; height: number;
  /** Optional smaller copies (`srcset`) plus how wide the photo is drawn (`sizes`). */
  srcSet?: string; sizes?: string;
  /** Smallest copy, used for photos opened later on low data. */
  small?: string;
};

export function PeopleSlides({ slides, label, hero = false, className }: {
  slides: PeopleSlide[]; label: string; hero?: boolean; className?: string | undefined;
}) {
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [lowData, setLowData] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const container = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const ready = useRef(new Map<string, Promise<boolean>>());

  // The first photo is in the server HTML with its full size list; later photos may use the small copy on low data.
  const sourceFor = useCallback((index: number): SlideSource | undefined => {
    const slide = slides[index];
    if (!slide) return undefined;
    return slideSource(slide, index > 0 && lowData);
  }, [slides, lowData]);

  const prepare = useCallback((source: SlideSource) => {
    const key = source.srcSet ?? source.src;
    const cached = ready.current.get(key);
    if (cached) return cached;
    const pending = loadSlide(source).then((ok) => {
      if (!ok) ready.current.delete(key);
      return ok;
    });
    ready.current.set(key, pending);
    return pending;
  }, []);

  const go = useCallback(async (index: number) => {
    const target = ((index % slides.length) + slides.length) % slides.length;
    const source = sourceFor(target);
    if (!source) return;
    const id = ++request.current;
    if (!(await prepare(source)) || !mounted.current || id !== request.current) return;
    setLoaded((previous) => previous.includes(target) ? previous : [...previous, target]);
    setActive(target);
  }, [prepare, slides.length, sourceFor]);

  useEffect(() => {
    mounted.current = true;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(mq.matches);
    change();
    setLowData(prefersLowData());
    mq.addEventListener("change", change);
    const complete = () => setPageReady(true);
    if (document.readyState === "complete") complete();
    else window.addEventListener("load", complete, { once: true });
    const element = container.current;
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), { threshold: 0.15 });
    if (element) observer.observe(element);
    return () => {
      mounted.current = false;
      request.current++;
      observer.disconnect();
      mq.removeEventListener("change", change);
      window.removeEventListener("load", complete);
    };
  }, []);

  // Only warm the next photo when this section is visible and the opening page is ready.
  useEffect(() => {
    if (!visible || !pageReady || lowData || reduced) return;
    const next = sourceFor((active + 1) % slides.length);
    if (next) void prepare(next);
  }, [active, visible, pageReady, lowData, reduced, slides.length, sourceFor, prepare]);

  useEffect(() => {
    if (!pageReady || !canAutoPlay(paused || interacting, reduced, lowData, visible)) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void go(active + 1);
    }, PEOPLE_SLIDE_INTERVAL);
    return () => window.clearInterval(id);
  }, [active, paused, interacting, reduced, lowData, visible, pageReady, go]);

  return (
    <div ref={container} className={cn("absolute inset-0 touch-pan-y", className)}
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      onPointerDown={(event) => { startX.current = event.clientX; }}
      onPointerCancel={() => { startX.current = null; }}
      onPointerUp={(event) => {
        if (startX.current === null) return;
        const distance = event.clientX - startX.current;
        startX.current = null;
        if (Math.abs(distance) > 40) void go(active + (distance < 0 ? 1 : -1));
      }}
      aria-roledescription="carousel" aria-label={label}>
      {slides.map((slide, index) => loaded.includes(index) && (
        <img key={slide.src} {...sourceFor(index)} alt={slide.alt} width={slide.width} height={slide.height}
          draggable={false} loading={hero || index > 0 ? "eager" : "lazy"}
          fetchPriority={hero && index === 0 ? "high" : "low"} decoding="async"
          aria-hidden={index !== active}
          className={cn("absolute bottom-0 left-1/2 z-10 max-w-none -translate-x-1/2 select-none transition-opacity duration-700 ease-out motion-reduce:transition-none",
            hero ? "w-[132%] sm:w-[104%] lg:left-[-2%] lg:w-[106%] lg:translate-x-0" : "h-[calc(100%-48px)] w-auto object-contain object-bottom",
            index === active ? "opacity-100" : "pointer-events-none opacity-0")} />
      ))}
      <div className={cn("absolute z-20 flex items-center rounded-full bg-midnight/70 px-1 backdrop-blur-sm",
        hero ? "bottom-4 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2" : "bottom-1 left-1/2 -translate-x-1/2")}>
        {slides.map((slide, index) => (
          <Button key={slide.src} variant="ghost-light" size="icon" className="size-9 rounded-full"
            onClick={() => { void go(index); }} aria-label={`Show photo ${index + 1} of ${slides.length}`} aria-current={index === active}>
            <span className={cn("h-2 rounded-full transition-all motion-reduce:transition-none", index === active ? "w-5 bg-lime" : "w-2 bg-primary-foreground/60")} />
          </Button>
        ))}
        <Button variant="ghost-light" size="icon" className="size-9 rounded-full"
          onClick={() => setPaused((previous) => !previous)} aria-label={paused ? "Play photos" : "Pause photos"}>
          {paused ? <Play /> : <Pause />}
        </Button>
      </div>
    </div>
  );
}