import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Motion kit mirrored from the Tryenski Com project: scroll reveals that replay in both
 * directions, word-by-word headline rise, count-up figures. All of it stays still when the
 * device asks for reduced motion (CSS handles the visuals, `isMotionReduced` the JS bits).
 */

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export function isMotionReduced() {
  return typeof window !== "undefined" && window.matchMedia(REDUCE_QUERY).matches;
}

/** True once (or while, with `once: false`) the element is on screen. */
export function useInView<T extends Element>(threshold = 0.3, once = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const on = !!e?.isIntersecting;
        if (on && once) {
          setInView(true);
          io.disconnect();
        } else if (!once) setInView(on);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return [ref, inView] as const;
}

type RevealTag = "div" | "li" | "section" | "article" | "ol" | "ul";

/**
 * Animates content in every time it enters the viewport, in both scroll directions:
 * rises from below when scrolling down, drops in from above when scrolling up.
 * Resets only once fully off screen, so nothing flickers while visible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: RevealTag;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState<"top" | "bottom">("bottom");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          const rootTop = entry.rootBounds?.top ?? 0;
          setFrom(entry.boundingClientRect.top < rootTop ? "top" : "bottom");
          setVisible(false);
        } else if (entry.intersectionRatio >= 0.1 || entry.intersectionRect.height >= 120) {
          setVisible(true);
        }
      },
      { threshold: [0, 0.1, 0.25] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-from={from}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

/** Splits a phrase into words that rise in one by one (real spaces kept, so it reads and copies normally). */
export function RiseWords({
  text,
  start = 0,
  popLast = false,
}: {
  text: string;
  start?: number;
  popLast?: boolean;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span
            className={cn("word-rise", popLast && i === words.length - 1 && "word-pop")}
            style={{ "--i": start + i } as CSSProperties}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

/**
 * Counts a figure up from zero every time it scrolls into view.
 * `value` is the final label (e.g. "₦248,500", "5,000+", "68%"); only the number part animates.
 * Labels without a number (e.g. "Low data") render as-is.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5, false);
  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? "0";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
  const grouped = numStr.includes(",");
  const [n, setN] = useState(target);

  useEffect(() => {
    if (!inView || !match) return;
    if (isMotionReduced()) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setN(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const shown = grouped ? Math.round(n).toLocaleString("en-US") : n.toFixed(decimals);
  return (
    <span ref={ref} className="tabular-nums">
      {match ? `${prefix}${shown}${suffix}` : value}
    </span>
  );
}
