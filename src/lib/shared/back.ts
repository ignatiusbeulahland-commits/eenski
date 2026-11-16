export type BackTarget = { to: string; label: string; search?: Record<string, string> | undefined };

/** Parents with no page of their own that live as a tab on another page. */
export const BACK_ALIASES: Readonly<Record<string, BackTarget>> = {
  "/learner/badges": { to: "/learner/certificates", label: "Back to Certificates / Badges", search: { tab: "badges" } },
  "/affiliate/promote": { to: "/affiliate/market", label: "Back to Market" },
};

/**
 * Where the shared back button on an inner page leads: the nearest parent that is a
 * navigation item, else the nearest parent page that exists, else the role's Overview.
 * Top-level navigation pages (and Overview itself) get no back button.
 */
export function backTarget(path: string, nav: ReadonlyMap<string, string>, home: string, exists: (p: string) => boolean): BackTarget | null {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === home || nav.has(clean)) return null;
  const segs = clean.split("/");
  for (let i = segs.length - 1; i >= 3; i--) {
    const p = segs.slice(0, i).join("/");
    const alias = BACK_ALIASES[p];
    if (alias) return alias;
    const label = nav.get(p);
    if (label) return { to: p, label: `Back to ${label}` };
    if (exists(p)) return { to: p, label: "Back" };
  }
  return { to: home, label: `Back to ${nav.get(home) ?? "Overview"}` };
}
