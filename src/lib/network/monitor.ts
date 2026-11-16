/**
 * Watches the visitor's connection and whether the site's own host answers.
 *
 * - Browser offline/online events (navigator.onLine) tell us about the device's connection.
 * - A tiny uncached request for a static file (/robots.txt) tells us whether the site answers.
 *   The prototype has no backend, so this is the only request the monitor makes.
 * - Failed same-origin requests (pages, scripts) trigger that check, so an outage of the
 *   site host is noticed even while the device is online.
 * Nothing here reloads the page: recovery is handed to `onRecovered`.
 */
import { getNetworkState, setNetworkState } from "./store";
import { CHECK_TIMEOUT_MS, OFFLINE_GRACE_MS, isNetworkError, isServerOutageStatus, retryDelay } from "./timing";

export const HEALTH_PATH = "/robots.txt";

type CheckResult = "ok" | "offline" | "unreachable";

type Options = { onRecovered: () => void };

type Monitor = { stop: () => void; checkNow: () => Promise<CheckResult> };

let active: Monitor | null = null;

/** Runs a manual check (the "Try again" button). Safe to call before the monitor starts. */
export function checkConnectionNow(): Promise<CheckResult> {
  return active ? active.checkNow() : Promise.resolve(navigator.onLine ? "ok" : "offline");
}

function requestUrl(input: RequestInfo | URL): URL | null {
  try {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return new URL(raw, window.location.href);
  } catch {
    return null;
  }
}

export function startNetworkMonitor({ onRecovered }: Options): () => void {
  if (active) return active.stop;

  const nativeFetch = window.fetch.bind(window);
  let retryTimer: number | undefined;
  let offlineTimer: number | undefined;
  let attempt = 0;
  let inFlight: Promise<CheckResult> | null = null;

  const clearRetry = () => {
    if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    retryTimer = undefined;
  };

  async function ping(): Promise<CheckResult> {
    if (!navigator.onLine) return "offline";
    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), CHECK_TIMEOUT_MS);
    try {
      const res = await nativeFetch(`${HEALTH_PATH}?t=${Date.now()}`, {
        cache: "no-store",
        signal: ctrl.signal,
        headers: { accept: "text/plain" },
      });
      return res.ok ? "ok" : "unreachable";
    } catch {
      return navigator.onLine ? "unreachable" : "offline";
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function check(manual = false): Promise<CheckResult> {
    if (inFlight) return inFlight;
    clearRetry();
    setNetworkState({ checking: true, nextRetryAt: null });
    inFlight = ping().then((result) => {
      inFlight = null;
      const wasDown = getNetworkState().status !== "online";
      if (result === "ok") {
        attempt = 0;
        setNetworkState({ status: "online", checking: false });
        if (wasDown) onRecovered();
      } else if (result === "offline") {
        // The browser's "online" event will start the next check.
        setNetworkState({
          status: "offline",
          checking: false,
          failedTries: manual ? getNetworkState().failedTries + 1 : getNetworkState().failedTries,
        });
      } else {
        const delay = retryDelay(attempt++);
        retryTimer = window.setTimeout(() => void check(), delay);
        setNetworkState({
          status: "unreachable",
          checking: false,
          nextRetryAt: Date.now() + delay,
          failedTries: manual ? getNetworkState().failedTries + 1 : getNetworkState().failedTries,
        });
      }
      return result;
    });
    return inFlight;
  }

  const onOffline = () => {
    window.clearTimeout(offlineTimer);
    offlineTimer = window.setTimeout(() => {
      if (!navigator.onLine) {
        clearRetry();
        setNetworkState({ status: "offline", checking: false, nextRetryAt: null });
      }
    }, OFFLINE_GRACE_MS);
  };
  const onOnline = () => {
    window.clearTimeout(offlineTimer);
    attempt = 0;
    void check();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible" && getNetworkState().status !== "online") void check();
  };
  // Some browsers miss the "online" event; a cheap look at navigator.onLine (no request) covers that.
  const watch = window.setInterval(() => {
    const { status, checking } = getNetworkState();
    if (status === "offline" && !checking && navigator.onLine) void check();
  }, 5000);

  // Notice when our own server stops answering, without changing what callers receive.
  const observedFetch: typeof window.fetch = async (input, init) => {
    const url = requestUrl(input);
    const ours = url !== null && url.origin === window.location.origin && url.pathname !== HEALTH_PATH;
    try {
      const res = await nativeFetch(input, init);
      if (ours && isServerOutageStatus(res.status) && getNetworkState().status === "online") void check();
      return res;
    } catch (error) {
      if (ours && isNetworkError(error) && getNetworkState().status === "online") void check();
      throw error;
    }
  };
  window.fetch = observedFetch;

  window.addEventListener("offline", onOffline);
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisible);

  // Opened with no connection (for example a saved page on the published site).
  if (!navigator.onLine) setNetworkState({ status: "offline" });

  const stop = () => {
    clearRetry();
    window.clearTimeout(offlineTimer);
    window.clearInterval(watch);
    window.removeEventListener("offline", onOffline);
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisible);
    if (window.fetch === observedFetch) window.fetch = nativeFetch;
    active = null;
  };
  active = { stop, checkNow: () => check(true) };
  return stop;
}
