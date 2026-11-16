import { useEffect, useRef, useState } from "react";

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

/** Reduced motion from the device setting or the visitor's own header toggle. */
export { useReducedMotion as usePrefersReducedMotion } from "./motion";
