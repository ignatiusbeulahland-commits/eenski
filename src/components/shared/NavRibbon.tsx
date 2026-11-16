import { useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";

/** Visible, interactive element the ribbon should sit beside: the current page link, or its group toggle when the group is closed. */
function findTarget(nav: HTMLElement): HTMLElement | null {
  const visible = (el: Element | null): el is HTMLElement =>
    !!el && el instanceof HTMLElement && el.getClientRects().length > 0 && el.offsetHeight > 0 && !el.closest("[inert]");
  const current = nav.querySelector('[aria-current="page"]');
  if (visible(current)) return current;
  const group = nav.querySelector('[data-nav-group-active="true"]');
  return visible(group) ? group : null;
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Enski signature ribbon: a hairline rail along the sidebar navigation with a slim Lime
 * accent that glides to the active item. Render it as the first child of a `relative` <nav>.
 */
export function NavRibbon() {
  const rail = useRef<HTMLSpanElement>(null);
  const ribbon = useRef<HTMLSpanElement>(null);
  const last = useRef<{ top: number; bottom: number } | null>(null);
  const path = useRouterState({ select: (s) => s.location.href });

  useIsoLayoutEffect(() => {
    const el = ribbon.current;
    const nav = rail.current?.parentElement;
    if (!el || !nav) return;
    let frame = 0;
    let settle = 0;
    const place = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = findTarget(nav);
        if (!target) {
          el.setAttribute("data-state", "hidden");
          return;
        }
        const n = nav.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        const inset = Math.round(t.height * 0.2);
        const top = Math.round(t.top - n.top) + inset;
        const bottom = Math.round(n.bottom - t.bottom) + inset;
        const prev = last.current;
        const moved = prev && (Math.abs(prev.top - top) > 2 || Math.abs(prev.bottom - bottom) > 2);
        const travel = prev && Math.abs(prev.top - top) > t.height;
        // Leading edge moves first, trailing edge follows: the ribbon stretches, then settles.
        const down = prev ? top > prev.top : true;
        el.style.transitionDuration = !prev ? "0ms, 0ms, 500ms, 200ms" : travel ? (down ? "560ms, 340ms, 500ms, 200ms" : "340ms, 560ms, 500ms, 200ms") : "240ms, 240ms, 500ms, 200ms";
        el.style.top = `${top}px`;
        el.style.bottom = `${bottom}px`;
        if (travel && moved) {
          el.setAttribute("data-state", "travel");
          clearTimeout(settle);
          settle = window.setTimeout(() => el.setAttribute("data-state", "rest"), 620);
        } else if (el.getAttribute("data-state") !== "travel") {
          el.setAttribute("data-state", "rest");
        }
        last.current = { top, bottom };
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    const mo = new MutationObserver(place);
    mo.observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-current", "aria-expanded", "inert", "data-nav-group-active"] });
    // Group panels open with a short height transition; re-measure when it finishes.
    nav.addEventListener("transitionend", place);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      ro.disconnect();
      mo.disconnect();
      nav.removeEventListener("transitionend", place);
    };
  }, [path]);

  return (
    <>
      <span ref={rail} className="nav-rail" aria-hidden="true" />
      <span ref={ribbon} className="nav-ribbon" data-state="hidden" aria-hidden="true" />
    </>
  );
}
