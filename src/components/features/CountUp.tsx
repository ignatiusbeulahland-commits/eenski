import { useEffect, useState } from "react";
import { useInView } from "./useInView";
import { isMotionReduced } from "./motion";

/**
 * Counts a figure up from zero every time it scrolls into view (either direction).
 * `value` is the final label (e.g. "₦4.8M", "2,184", "74%"); the number part animates.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5, false);
  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? "0";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? numStr.split(".")[1]!.length : 0;
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
    const tickFn = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(target * eased);
      if (t < 1) raf = requestAnimationFrame(tickFn);
    };
    setN(0);
    raf = requestAnimationFrame(tickFn);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const shown = grouped
    ? Math.round(n).toLocaleString("en-US")
    : n.toFixed(decimals);

  return (
    <span ref={ref} className="tabular-nums">
      {match ? `${prefix}${shown}${suffix}` : value}
    </span>
  );
}
