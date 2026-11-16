import { useSyncExternalStore } from "react";

/**
 * online      – everything is fine
 * offline     – the device has no internet connection
 * unreachable – the device says it's connected, but Enski's server isn't answering
 */
export type ConnectionStatus = "online" | "offline" | "unreachable";

export type NetworkState = {
  status: ConnectionStatus;
  /** A connection check is running right now. */
  checking: boolean;
  /** When the next automatic check runs (ms timestamp), if one is scheduled. */
  nextRetryAt: number | null;
  /** The visitor chose to keep browsing; show the small notice instead of the full screen. */
  dismissed: boolean;
  /** Bumps after each manual "Try again" that didn't reconnect, so the screen can say so. */
  failedTries: number;
};

const INITIAL: NetworkState = {
  status: "online",
  checking: false,
  nextRetryAt: null,
  dismissed: false,
  failedTries: 0,
};

let state: NetworkState = INITIAL;
const listeners = new Set<() => void>();

export function getNetworkState(): NetworkState {
  return state;
}

export function setNetworkState(patch: Partial<NetworkState>) {
  const next = { ...state, ...patch };
  // A fresh outage always starts with the full screen.
  if (state.status === "online" && next.status !== "online") next.dismissed = patch.dismissed ?? false;
  if (next.status === "online") {
    next.dismissed = false;
    next.nextRetryAt = null;
    next.failedTries = 0;
  }
  if (
    next.status === state.status &&
    next.checking === state.checking &&
    next.nextRetryAt === state.nextRetryAt &&
    next.dismissed === state.dismissed &&
    next.failedTries === state.failedTries
  ) {
    return;
  }
  state = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNetworkState(): NetworkState {
  return useSyncExternalStore(subscribe, getNetworkState, () => INITIAL);
}
