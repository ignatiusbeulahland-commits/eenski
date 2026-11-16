/** Personal greetings: time of day from the person's own clock, first visit vs returning. Pure. */

export type PartOfDay = "morning" | "afternoon" | "evening";
export type WelcomeKind = "new" | "returning";

/** 05:00–11:59 morning, 12:00–16:59 afternoon, otherwise evening (late night reads as evening). */
export function partOfDay(now: Date = new Date()): PartOfDay {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "evening";
}

/** First word of a name, for a friendly greeting when no display name is set. */
export function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** The name to greet: the preferred display name, else the first word of the full name. */
export function greetName(displayName: string | undefined, fullName: string | undefined): string {
  return (displayName ?? "").trim() || firstWord(fullName ?? "");
}

/** Dashboard heading: new people are welcomed to Enski, returning people get the time of day. */
export function dashboardGreeting(name: string, kind: WelcomeKind, now: Date = new Date()): string {
  const n = name.trim();
  if (kind === "new") return n ? `Welcome to Enski, ${n}` : "Welcome to Enski";
  const g = `Good ${partOfDay(now)}`;
  return n ? `${g}, ${n}` : g;
}

/** One-off message right after signing in. */
export function signInWelcome(name: string, kind: WelcomeKind): string {
  const n = name.trim();
  if (kind === "new") return n ? `Welcome to Enski, ${n}!` : "Welcome to Enski!";
  return n ? `Welcome back, ${n}!` : "Welcome back!";
}
