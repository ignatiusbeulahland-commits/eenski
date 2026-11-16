/**
 * The only place the offline service worker (/sw.js) is registered.
 * It never runs in development, inside the Lovable editor preview, in iframes,
 * or with ?sw=off — in those cases any existing registration is removed instead.
 */
import { canSaveInBackground } from "./connection";
import type { PictureSource } from "./pictures";

const SW_URL = "/sw.js";
const PROJECT_ID = "f8a6e56e-b2bc-4030-80d5-d2415aac8804";
const PREVIEW_PARENTS = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];

/** Main pages saved in the background so they open offline even before they're visited. */
export const OFFLINE_PAGES = [
  "/",
  "/courses",
  "/dreamverse",
  "/features",
  "/pricing",
  "/community",
  "/dreamers-trybe",
  "/blog",
  "/about",
  "/faq",
  "/become-an-ambassador",
  "/become-an-ambassador/campus",
  "/become-an-ambassador/nysc",
  "/auth",
];

declare const __ENSKI_BUILD__: string;
const WARM_KEY = "enski-offline-saved";

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  const label = host.split(".")[0] ?? "";
  for (const parent of PREVIEW_PARENTS) {
    if (!host.endsWith(parent)) continue;
    if (/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label)) return true;
    if (label === `project--${PROJECT_ID}-dev`) return true;
  }
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  return false;
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function unregisterAppWorker() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith(SW_URL)))
      .map((r) => r.unregister()),
  );
}

/** Quietly fetch the main pages and their photos once per release so the worker keeps a copy for offline use. */
async function savePagesForOffline() {
  const build = typeof __ENSKI_BUILD__ === "string" ? __ENSKI_BUILD__ : "dev";
  try {
    if (localStorage.getItem(WARM_KEY) === build) return;
  } catch {
    return;
  }
  const keepGoing = () => navigator.onLine && canSaveInBackground();
  if (!keepGoing()) return;
  const { picturesInPage, picturesShownLater, savePictures, dedupe } = await import("./pictures");
  const pictures: PictureSource[] = [];
  for (const path of OFFLINE_PAGES) {
    if (!keepGoing()) return;
    try {
      const res = await fetch(path, { headers: { "x-enski-offline": "1" }, credentials: "same-origin" });
      if (res.ok) pictures.push(...picturesInPage(await res.text(), window.location.origin));
    } catch {
      return;
    }
  }
  // Then the photos on those pages, so they still show without a connection.
  try {
    pictures.push(...(await picturesShownLater()));
  } catch {
    /* a list failed to load; save the rest */
  }
  await savePictures(dedupe(pictures), keepGoing);
  if (!keepGoing()) return;
  try {
    localStorage.setItem(WARM_KEY, build);
  } catch {
    /* storage full or blocked: try again next visit */
  }
}

export function registerOfflineSupport() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const blocked =
    !import.meta.env.PROD ||
    inIframe() ||
    isBlockedHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  if (blocked) {
    void unregisterAppWorker().catch(() => {});
    return;
  }

  const start = () => {
    navigator.serviceWorker
      .register(SW_URL, { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        // Wait until the page is idle so saving never competes with what the visitor is looking at.
        window.setTimeout(() => void savePagesForOffline(), 4000);
      })
      .catch(() => {});
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
