import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Pause, Play } from "lucide-react";

import { FloatChip } from "@/components/site/FloatChip";
import type { Icon3DName } from "@/components/site/Icon3D";
import { canAutoPlay, loadSlide, PEOPLE_SLIDE_INTERVAL } from "@/components/site/slide-loading";
import { Button } from "@/components/ui/button";
import { prefersLowData } from "@/lib/offline/connection";
import { cn } from "@/lib/utils";

/**
 * Pieces shared by the two ambassador programme pages (campus and NYSC), rebuilt
 * from their source projects in Enski brand tokens: cobalt panels, midnight bands,
 * lime only as an accent on dark surfaces.
 */

/* ---------- photo fader ---------- */

export type FadeSlide = { src: string; alt: string; srcSet?: string; sizes?: string };

/**
 * Cover photos that cross-fade. Like the site's people slides, it only moves on
 * once the next photo has decoded, and stays still offscreen, while being touched,
 * on low data or when the device asks for reduced motion.
 */
export function PhotoFader({
  slides,
  label,
  className,
  imgClassName,
  eager = false,
  dots = "bottom-4 right-4",
  onChange,
  interval = PEOPLE_SLIDE_INTERVAL,
}: {
  slides: FadeSlide[];
  label: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  dots?: string | false;
  onChange?: (index: number) => void;
  interval?: number;
}) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [lowData, setLowData] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const request = useRef(0);

  const go = useCallback(
    async (index: number) => {
      const target = ((index % slides.length) + slides.length) % slides.length;
      const slide = slides[target];
      if (!slide) return;
      const id = ++request.current;
      if (!(await loadSlide(slide)) || id !== request.current) return;
      setLoaded((p) => (p.includes(target) ? p : [...p, target]));
      setActive(target);
      onChange?.(target);
    },
    [slides, onChange],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(mq.matches);
    change();
    setLowData(prefersLowData());
    mq.addEventListener("change", change);
    const ready = () => setPageReady(true);
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.15 });
    if (box.current) io.observe(box.current);
    return () => {
      request.current++;
      io.disconnect();
      mq.removeEventListener("change", change);
      window.removeEventListener("load", ready);
    };
  }, []);

  useEffect(() => {
    if (!pageReady || !canAutoPlay(paused || holding, reduced, lowData, visible)) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") void go(active + 1);
    }, interval);
    return () => window.clearInterval(t);
  }, [active, paused, holding, reduced, lowData, visible, pageReady, go, interval]);

  return (
    <div
      ref={box}
      className={cn("relative overflow-hidden touch-pan-y", className)}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
      onFocusCapture={() => setHolding(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHolding(false);
      }}
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40) void go(active + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map(
        (s, i) =>
          loaded.includes(i) && (
            <img
              key={s.src}
              src={s.src}
              srcSet={s.srcSet}
              sizes={s.sizes}
              alt={i === active ? s.alt : ""}
              aria-hidden={i !== active}
              draggable={false}
              loading={eager || i > 0 ? "eager" : "lazy"}
              fetchPriority={eager && i === 0 ? "high" : "low"}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
                imgClassName,
              )}
            />
          ),
      )}
      {dots !== false && slides.length > 1 ? (
        <div className={cn("absolute z-20 flex items-center rounded-full bg-midnight/70 px-1 backdrop-blur-sm", dots)}>
          {slides.map((s, i) => (
            <Button
              key={s.src}
              variant="ghost-light"
              size="icon"
              className="size-9 rounded-full"
              onClick={() => void go(i)}
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
              aria-current={i === active}
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-all motion-reduce:transition-none",
                  i === active ? "w-5 bg-lime" : "w-2 bg-primary-foreground/60",
                )}
              />
            </Button>
          ))}
          <Button
            variant="ghost-light"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play photos" : "Pause photos"}
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- cut-out person on a cobalt panel ---------- */

export type Chip = { icon?: Icon3DName; title: string; subtitle?: string };

/** A cut-out person standing in a notched cobalt panel, breaking out of its top, with a floating chip. */
export function Showcase({
  src,
  slides,
  alt,
  chip,
  className,
  notch = "bg-background",
  fill = false,
}: {
  src?: string;
  slides?: string[];
  alt: string;
  chip?: Chip;
  className?: string;
  /** Colour of the surface behind the panel, so the notch reads as cut out. */
  notch?: string;
  /** For group photos cropped at the sides: run the photo edge to edge so the crop lines up with the panel (the notch dots would sit behind heads, so they're hidden). */
  fill?: boolean;
}) {
  return (
    <figure className={cn("relative mx-auto w-full max-w-[420px]", className)}>
      <div className="relative aspect-[4/5] w-full">
        <div className="absolute inset-x-0 bottom-0 top-[24%] overflow-hidden rounded-[32px] bg-cobalt-light">
          <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
          <div className={cn("absolute -right-px -top-px h-[22%] w-[26%] rounded-bl-[28px]", notch)} aria-hidden />
        </div>
        <div aria-hidden className={cn("absolute right-[3%] top-[26%] grid grid-cols-4 gap-2.5", fill && "hidden")}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="size-1.5 rounded-full bg-lime" />
          ))}
        </div>
        {slides ? (
          <CutSlides slides={slides} alt={alt} />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-x-0 bottom-0 mx-auto h-full rounded-b-[32px] object-contain object-bottom",
              fill ? "w-full" : "w-[94%] drop-shadow-xl",
            )}
          />
        )}
        {chip ? (
          <FloatChip
            className="bottom-[10%] left-[-2%] sm:left-[-6%]"
            tilt={-4}
            {...(chip.icon ? { icon: chip.icon } : {})}
            {...(chip.subtitle ? { subtitle: chip.subtitle } : {})}
            title={chip.title}
          />
        ) : null}
      </div>
    </figure>
  );
}

function CutSlides({ slides, alt }: { slides: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.2 });
    io.observe(ref);
    return () => io.disconnect();
  }, [ref]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canAutoPlay(false, reduced, prefersLowData(), visible) || slides.length < 2) return;
    const t = window.setInterval(() => {
      const next = (i + 1) % slides.length;
      void loadSlide(slides[next]!).then((ok) => ok && setI(next));
    }, 3500);
    return () => window.clearInterval(t);
  }, [i, visible, slides]);
  return (
    <div ref={setRef} className="absolute inset-x-0 bottom-0 top-0 overflow-hidden rounded-b-[32px]">
      {slides.map((s, k) => (
        <img
          key={s}
          src={s}
          alt={k === i ? alt : ""}
          aria-hidden={k !== i}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-x-0 bottom-0 mx-auto h-full w-[94%] object-contain object-bottom drop-shadow-xl transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none",
            k === i ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        />
      ))}
    </div>
  );
}

/* ---------- tilted word band ---------- */

/** Midnight band of words separated by lime dots, slightly tilted like the ambassador marquee. */
export function WordBand({ words, className }: { words: string[]; className?: string }) {
  const row = [...words, ...words, ...words];
  return (
    <div role="marquee" className={cn("relative z-10 overflow-hidden py-5", className)} aria-label={words.join(", ")}>
      <div className="-rotate-2 scale-105 bg-midnight py-3.5 shadow-float dark:bg-cobalt md:py-4">
        <div className="flex w-max animate-marquee items-center gap-7" aria-hidden>
          {[...row, ...row].map((w, i) => (
            <span key={i} className="flex items-center gap-7 text-base font-extrabold text-primary-foreground md:text-xl">
              {w}
              <span className="size-2 rounded-full bg-lime" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- section heading ---------- */

export function SectionHead({
  eyebrow,
  title,
  accent,
  body,
  dark = false,
  center = false,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  accent?: ReactNode;
  body?: ReactNode;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      <p className={cn("eyebrow", dark ? "text-lime" : "text-sky-text")}>{eyebrow}</p>
      {/* Plain string on purpose: class merging would drop text-h2 next to a text colour. */}
      <h2 className={`text-h2 mt-4 ${dark ? "text-primary-foreground" : "text-ink"}`}>
        {title} {accent ? <span className={dark ? "text-lime" : "text-brand"}>{accent}</span> : null}
      </h2>
      {body ? (
        <p className={cn("mt-4 text-[17px] leading-relaxed md:text-lg", dark ? "text-on-blue" : "text-muted-foreground")}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- apply requests ---------- */

const APPLY_EVENT = "enski:programme-apply";

/** Opens the page's application form, optionally with a role picked. */
export function openApply(role?: string) {
  window.dispatchEvent(new CustomEvent(APPLY_EVENT, { detail: role ?? null }));
}

export function useApplyRequests(on: (role: string | null) => void) {
  const cb = useRef(on);
  cb.current = on;
  useEffect(() => {
    const handler = (e: Event) => cb.current((e as CustomEvent<string | null>).detail);
    window.addEventListener(APPLY_EVENT, handler);
    if (window.location.hash === "#apply") cb.current(null);
    return () => window.removeEventListener(APPLY_EVENT, handler);
  }, []);
}

/* ---------- form parts ---------- */

export const inputClass =
  "h-12 w-full min-w-0 rounded-xl border border-line bg-background px-4 text-base text-ink placeholder:text-muted-foreground outline-none transition-colors focus:border-brand focus:ring-[3px] focus:ring-sky-200 aria-[invalid=true]:border-destructive dark:focus:ring-cobalt";
export const selectClass = cn(inputClass, "appearance-none pr-10");

export function Field({
  id,
  label,
  error,
  optional,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
        {label}
        {optional ? <span className="font-medium text-muted-foreground">optional</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[13px] font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectBox({
  id,
  value,
  onChange,
  placeholder,
  options,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly (string | readonly [string, string])[];
  invalid?: boolean | undefined;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        className={selectClass}
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => {
          const [v, l] = typeof o === "string" ? [o, o] : o;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

export function Choice({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-ink">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[15px] font-semibold capitalize transition-colors focus-within:ring-[3px] focus-within:ring-sky-200",
              value === o ? "border-brand bg-ice text-brand dark:bg-cobalt/30" : "border-line text-ink hover:border-brand",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="size-4 accent-[var(--brand)]"
            />
            {o}
          </label>
        ))}
      </div>
      {error ? <p className="mt-1 text-[13px] font-semibold text-destructive">{error}</p> : null}
    </fieldset>
  );
}

const OTHER = "__other";

/** Two-step skill picker (track, then skill), with a typed answer for anything not listed. */
export function SkillPicker({
  id,
  groups,
  value,
  onChange,
  invalid,
}: {
  id: string;
  groups: readonly (readonly [string, readonly string[]])[];
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean | undefined;
}) {
  const found = groups.find(([, list]) => list.includes(value));
  const [track, setTrack] = useState(found ? found[0] : value ? OTHER : "");
  const [typing, setTyping] = useState(value !== "" && !found);
  const list = groups.find(([g]) => g === track)?.[1] ?? [];
  return (
    <div className="space-y-2">
      <SelectBox
        id={id}
        value={track}
        invalid={invalid}
        placeholder="Choose a skill area"
        options={[...groups.map(([g]) => g), [OTHER, "Something else (type it)"] as const]}
        onChange={(t) => {
          setTrack(t);
          setTyping(t === OTHER);
          onChange("");
        }}
      />
      {track && track !== OTHER ? (
        <SelectBox
          id={`${id}-skill`}
          value={typing ? OTHER : value}
          placeholder="Choose the skill"
          options={[...list, [OTHER, "Not listed? Type it"] as const]}
          onChange={(v) => {
            if (v === OTHER) {
              setTyping(true);
              onChange("");
            } else {
              setTyping(false);
              onChange(v);
            }
          }}
        />
      ) : null}
      {typing ? (
        <input
          aria-label="Type the skill"
          className={inputClass}
          placeholder="Type the skill"
          maxLength={120}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}
    </div>
  );
}
