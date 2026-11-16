import { useEffect, useState } from "react";

import logoLime from "@/assets/enski-logo-lime.webp";
import logoWhite from "@/assets/enski-logo-white.webp";
import { SPLASH_FADE_MS, splashHoldMs } from "@/lib/network/timing";

const SEEN_KEY = "enski-splash-seen";

/**
 * Runs in <head> before paint: the opening screen shows once per visit (browser tab),
 * so moving between pages or refreshing never shows it again.
 */
export const splashInitScript = `(function(){try{if(sessionStorage.getItem("${SEEN_KEY}"))document.documentElement.setAttribute("data-splash","off")}catch(e){}})();`;

/**
 * Branded opening screen. It is part of the first HTML so it appears instantly, lifts once the page
 * is ready (about 2 seconds), and a CSS fallback removes it by 3 seconds even if scripts are slow.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "leave" | "gone">("show");

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-splash") === "off") {
      setPhase("gone");
      return;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: it simply shows again next visit */
    }
    const hold = splashHoldMs(performance.now());
    const leave = window.setTimeout(() => setPhase("leave"), hold);
    const gone = window.setTimeout(() => {
      setPhase("gone");
      root.setAttribute("data-splash", "off");
    }, hold + SPLASH_FADE_MS);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      id="enski-splash"
      aria-hidden="true"
      data-leaving={phase === "leave" ? "" : undefined}
      className="splash fixed inset-0 z-(--z-splash) grid place-items-center bg-cobalt dark:bg-background"
    >
      <div className="flex flex-col items-center">
        <img
          src={logoWhite}
          alt=""
          width={288}
          height={106}
          fetchPriority="high"
          className="splash-logo h-14 w-auto dark:hidden sm:h-16"
        />
        <img
          src={logoLime}
          alt=""
          width={288}
          height={106}
          className="splash-logo hidden h-14 w-auto dark:block sm:h-16"
        />
        <div className="mt-8 h-1 w-28 overflow-hidden rounded-full bg-primary-foreground/15">
          <div className="splash-bar h-full w-1/3 rounded-full bg-lime" />
        </div>
      </div>
    </div>
  );
}
