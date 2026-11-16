/**
 * Device-only storage for the prototype's simulated actions (newsletter,
 * reviews, article submissions, demo orders). Nothing leaves the browser.
 */
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("enski:demo-storage", { detail: key }));
    return true;
  } catch {
    return false;
  }
}

/** A short pause so simulated sends feel like a real request (skipped in tests). */
export const simulateDelay = (ms = 700) =>
  new Promise<void>((resolve) => setTimeout(resolve, import.meta.env.MODE === "test" ? 0 : ms));

export const demoId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
