import { useCallback, useEffect, useState } from "react";

/**
 * Page motion preference.
 * - No saved choice: follows the device's "reduce motion" accessibility setting (and its live changes).
 * - Saved "reduce" / "full": the visitor's own choice from the header toggle.
 * The effective value lives on <html data-motion="reduce|full"> so CSS and JS read one source.
 * The theme switch animation is deliberately independent of this setting.
 */
export type Motion = "reduce" | "full";
export const MOTION_KEY = "enski-motion";
const SYSTEM_QUERY = "(prefers-reduced-motion: reduce)";

/** Runs in <head> before paint so reduced motion applies from the first frame. */
export const motionInitScript = `(function(){var m="full";try{var s=localStorage.getItem("${MOTION_KEY}");if(s==="reduce"||s==="full"){m=s}else if(window.matchMedia("${SYSTEM_QUERY}").matches){m="reduce"}}catch(e){}document.documentElement.setAttribute("data-motion",m)})();`;

function readSaved(): Motion | null {
  try {
    const s = localStorage.getItem(MOTION_KEY);
    return s === "reduce" || s === "full" ? s : null;
  } catch {
    return null;
  }
}

/** On this site there is no header motion toggle, so the device setting decides unless data-motion is set. */
function current(): Motion {
  const set = document.documentElement.getAttribute("data-motion");
  if (set === "reduce" || set === "full") return set;
  return window.matchMedia(SYSTEM_QUERY).matches ? "reduce" : "full";
}

/** True when page motion should stay still. Updates live when the toggle or device setting changes. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia(SYSTEM_QUERY);
    const sync = () => setReduced(current() === "reduce");
    // Follow the device setting live, unless the visitor picked their own.
    const onSystem = () => {
      if (!readSaved()) root.setAttribute("data-motion", mq.matches ? "reduce" : "full");
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
    mq.addEventListener("change", onSystem);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  return reduced;
}

/** Synchronous check for one-off effects (e.g. starting a count-up). */
export function isMotionReduced() {
  return typeof document !== "undefined" && current() === "reduce";
}

export function useMotionPreference() {
  const reduced = useReducedMotion();
  const setMotion = useCallback((m: Motion) => {
    document.documentElement.setAttribute("data-motion", m);
    try {
      localStorage.setItem(MOTION_KEY, m);
    } catch {
      /* storage blocked: still applies for this visit */
    }
  }, []);
  const toggle = useCallback(() => setMotion(reduced ? "full" : "reduce"), [reduced, setMotion]);
  return { reduced, setMotion, toggle };
}
