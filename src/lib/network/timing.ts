/** Timing rules for the loading screen and connection retries (kept pure so they can be tested). */

/** The opening screen shows for about two seconds… */
export const SPLASH_MIN_MS = 2000;
/** …and never longer than three seconds, even if the page is slow to start. */
export const SPLASH_MAX_MS = 3000;
/** How long the opening screen takes to fade away. */
export const SPLASH_FADE_MS = 350;

/**
 * How much longer to keep the opening screen once the page is ready.
 * `elapsedMs` is the time since the visitor opened the page.
 */
export function splashHoldMs(elapsedMs: number): number {
  const latestStart = SPLASH_MAX_MS - SPLASH_FADE_MS;
  const wanted = SPLASH_MIN_MS - elapsedMs;
  return Math.max(0, Math.min(wanted, latestStart - elapsedMs));
}

/** Waits between automatic "can we reach Enski yet?" checks. Grows so we never hammer a struggling server. */
export const RETRY_DELAYS_MS = [3000, 6000, 12000, 20000, 30000];

export function retryDelay(attempt: number): number {
  return RETRY_DELAYS_MS[Math.min(Math.max(attempt, 0), RETRY_DELAYS_MS.length - 1)] ?? 30000;
}

/** A dropped connection must last this long before the offline screen appears (stops flicker on shaky Wi-Fi). */
export const OFFLINE_GRACE_MS = 600;

/** A single connection check gives up after this long. */
export const CHECK_TIMEOUT_MS = 6000;

/** Page changes that take longer than this get a "slow connection" hint. */
export const SLOW_NAVIGATION_MS = 4000;

/** Gateway errors mean our server (not the visitor's connection) is having trouble. */
export function isServerOutageStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

/** True for the error browsers throw when a request never reached the server. */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError") return false;
  const msg = error.message.toLowerCase();
  return (
    error.name === "TypeError" &&
    (msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network request failed") ||
      msg.includes("load failed") ||
      msg.includes("fetch failed"))
  );
}
