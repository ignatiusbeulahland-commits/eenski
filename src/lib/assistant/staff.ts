import { useSyncExternalStore } from "react";
import { newId } from "./persist";
import { settingsStore } from "./store";

/** Who is working the Support dashboard in this tab (demo sign-in, tab-only). */
const KEY = "enski:support:staff";
let cached: { raw: string | null; value: string | null } = { raw: null, value: null };
const listeners = new Set<() => void>();

function read(): string | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cached.raw) cached = { raw, value: raw };
  return cached.value;
}

function write(agentId: string | null) {
  try {
    if (agentId) window.sessionStorage.setItem(KEY, agentId);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

export const staffSession = {
  /** Signs in by name: reuses a matching agent or adds a new one to the roster (online). */
  signIn(name: string, email: string) {
    const clean = name.trim().replace(/\s+/g, " ") || email.split("@")[0] || "Support agent";
    const agents = settingsStore.get().agents;
    const match = agents.find((a) => a.name.toLowerCase() === clean.toLowerCase());
    if (match) {
      settingsStore.set((s) => ({ ...s, agents: s.agents.map((a) => (a.id === match.id ? { ...a, status: "online" } : a)) }));
      write(match.id);
      return match.id;
    }
    const id = newId("agent");
    settingsStore.set((s) => ({ ...s, agents: [...s.agents, { id, name: clean, role: "Support agent", status: "online" }] }));
    write(id);
    return id;
  },
  workAs(agentId: string) {
    write(agentId);
  },
  signOut() {
    write(null);
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** The agent this tab works as; falls back to the first agent on the roster. */
export function useStaffAgentId(): string | null {
  const id = useSyncExternalStore(subscribe, read, () => null);
  const agents = settingsStore.use().agents;
  if (id && agents.some((a) => a.id === id)) return id;
  return agents[0]?.id ?? null;
}
