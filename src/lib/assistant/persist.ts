import { useSyncExternalStore } from "react";

/**
 * A tiny device-only store backed by localStorage. Reads are cached by the raw
 * string so React sees stable snapshots; other tabs update through the
 * `storage` event (so the Support dashboard and the chat panel stay in sync).
 */
export function localStore<T>(key: string, makeInitial: () => T, empty: T) {
  let cache: { raw: string | null; value: T } | null = null;
  /** Used when the browser refuses to save (private mode, storage full). */
  let memory: T | null = null;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const l of listeners) l();
  };

  function get(): T {
    if (typeof window === "undefined") return empty;
    if (memory !== null) return memory;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (cache && cache.raw === raw) return cache.value;
    let value: T;
    try {
      value = raw ? (JSON.parse(raw) as T) : makeInitial();
    } catch {
      value = makeInitial();
    }
    cache = { raw, value };
    return value;
  }

  /** Returns false when the change could only be kept until the page closes. */
  function set(update: (prev: T) => T): boolean {
    const next = update(get());
    const raw = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, raw);
      memory = null;
      cache = { raw, value: next };
      notify();
      return true;
    } catch {
      memory = next;
      notify();
      return false;
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function use(): T {
    return useSyncExternalStore(subscribe, get, () => empty);
  }

  /** Tests only: forget cached values. */
  function reset() {
    cache = null;
    memory = null;
  }

  return { get, set, use, subscribe, reset };
}

export const newId = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
