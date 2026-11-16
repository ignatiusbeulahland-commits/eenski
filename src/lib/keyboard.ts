import { useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])';

/** Focusable items inside a container, skipping disabled, hidden and inert content. */
export function focusableItems(container: HTMLElement, selector = FOCUSABLE): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.closest("[inert]") && !el.closest('[aria-hidden="true"]') && el.getAttribute("aria-disabled") !== "true",
  );
}

type ArrowOptions = { selector?: string; orientation?: "vertical" | "horizontal"; loop?: boolean; activate?: boolean };

/**
 * Moves focus between items with the arrow keys, Home and End.
 * Tab still leaves the group as normal. Returns true when the key was handled.
 */
export function handleArrowKeys(e: ReactKeyboardEvent<HTMLElement> | KeyboardEvent, container: HTMLElement, opts: ArrowOptions = {}) {
  const { selector, orientation = "vertical", loop = false, activate = false } = opts;
  if (e.altKey || e.ctrlKey || e.metaKey) return false;
  const next = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prev = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  const target = e.target as HTMLElement;
  const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
  if (![next, prev, "Home", "End"].includes(e.key) || (typing && (e.key === "Home" || e.key === "End"))) return false;
  const items = focusableItems(container, selector);
  if (!items.length) return false;
  const current = items.findIndex((el) => el === target || el.contains(target));
  let i = current;
  if (e.key === "Home") i = 0;
  else if (e.key === "End") i = items.length - 1;
  else if (e.key === next) i = current < 0 ? 0 : current + 1;
  else i = current < 0 ? items.length - 1 : current - 1;
  if (i >= items.length) i = loop ? 0 : items.length - 1;
  if (i < 0) i = loop ? items.length - 1 : 0;
  e.preventDefault();
  const el = items[i]!;
  el.focus();
  if (activate && el !== target) el.click();
  return true;
}

/** Side navigation: up/down/Home/End between links; right opens and left closes a group toggle. */
export function navKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
  const t = e.target as HTMLElement;
  const expanded = t.getAttribute("aria-expanded");
  if (expanded !== null && ((e.key === "ArrowRight" && expanded === "false") || (e.key === "ArrowLeft" && expanded === "true"))) {
    e.preventDefault();
    t.click();
    return;
  }
  handleArrowKeys(e, e.currentTarget, { selector: "a[href], button:not([disabled])" });
}

/** WAI-ARIA tabs: arrows/Home/End move between tabs and select them. */
export function tablistKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
  handleArrowKeys(e, e.currentTarget, { selector: '[role="tab"]:not([disabled])', orientation: "horizontal", loop: true, activate: true });
}

/** Search popups: arrow down from the field into results, up and back to the field. */
export function searchListKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
  handleArrowKeys(e, e.currentTarget, { selector: "input, a[href], [data-search-result]" });
}

/**
 * Dialogs and drawers opened from code (not a Radix trigger) otherwise drop focus on <body> when closed.
 * Remembers what was focused as the popup opened (or the menu button, if opened from a menu item)
 * and returns focus there on close.
 */
export function useReturnFocus(handlers: { onOpenAutoFocus?: ((e: Event) => void) | undefined; onCloseAutoFocus?: ((e: Event) => void) | undefined }) {
  const origin = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (e: Event) => {
      const el = document.activeElement as HTMLElement | null;
      const menu = el?.closest<HTMLElement>('[role="menu"]');
      const opener = menu?.id ? document.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(menu.id)}"]`) : null;
      origin.current = el && el !== document.body ? (opener ?? el) : null;
      handlers.onOpenAutoFocus?.(e);
    },
    onCloseAutoFocus: (e: Event) => {
      handlers.onCloseAutoFocus?.(e);
      if (e.defaultPrevented) return;
      const el = origin.current;
      origin.current = null;
      if (el?.isConnected) {
        e.preventDefault();
        el.focus();
        return;
      }
      // The opener is gone (e.g. its row was deleted): land on the page content, not the top of the document.
      const main = document.getElementById("main-content");
      if (el && main) {
        e.preventDefault();
        main.focus({ preventScroll: true });
      }
    },
  };
}
