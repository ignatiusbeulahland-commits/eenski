import { LayoutDashboard, Compass, CalendarDays, Library, Bookmark, Award, ReceiptText, Settings, UserRound, Plug, Bell, LockKeyhole, BookOpenText, LifeBuoy, Globe, Globe2, type LucideIcon } from "lucide-react";

export const ENSKI_WEBSITE = "https://tryenski.com";

/** `match` separates the two views of /learner/resources; `also` lists extra paths that keep an item active. */
export type LearnerNavLink = {
  label: string;
  to: "/learner/dashboard" | "/learner/resources" | "/learner/events" | "/learner/wishlist" | "/learner/certificates" | "/learner/purchases" | "/learner/guides" | "/learner/help" | "/learner/settings/profile" | "/learner/settings/integrations" | "/learner/settings/notifications" | "/learner/settings/security" | "/learner/settings/currency";
  icon: LucideIcon;
  search?: { view: "discover" };
  match?: "discover" | "library";
  also?: readonly string[];
};
export type LearnerNavGroup = { label: string; icon: LucideIcon; children: readonly LearnerNavLink[] };
export type LearnerNavExternal = { label: string; href: string; icon: LucideIcon };
export type LearnerNavEntry = LearnerNavLink | LearnerNavGroup | LearnerNavExternal;

export const learnerSettings: readonly LearnerNavLink[] = [
  { label: "Manage Profile", to: "/learner/settings/profile", icon: UserRound },
  { label: "Country & Currency", to: "/learner/settings/currency", icon: Globe2 },
  { label: "Integrations", to: "/learner/settings/integrations", icon: Plug },
  { label: "Notifications", to: "/learner/settings/notifications", icon: Bell },
  { label: "Password & Security", to: "/learner/settings/security", icon: LockKeyhole },
];

/** Sidebar sections. Every link points at an existing Learner route. */
export const learnerSections: readonly { label: string; items: readonly LearnerNavEntry[] }[] = [
  {
    label: "Main menu",
    items: [
      { label: "Overview", to: "/learner/dashboard", icon: LayoutDashboard },
      { label: "Discover", to: "/learner/resources", search: { view: "discover" }, match: "discover", icon: Compass },
      { label: "Events", to: "/learner/events", icon: CalendarDays },
    ],
  },
  {
    label: "My library",
    items: [
      { label: "My Resources / Products", to: "/learner/resources", match: "library", icon: Library },
      { label: "Wishlist / Cart", to: "/learner/wishlist", icon: Bookmark, also: ["/learner/cart"] },
      { label: "Certificates / Badges", to: "/learner/certificates", icon: Award },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Purchases / Transactions", to: "/learner/purchases", icon: ReceiptText },
      { label: "Settings", icon: Settings, children: learnerSettings },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Guides", to: "/learner/guides", icon: BookOpenText },
      { label: "Support & Help", to: "/learner/help", icon: LifeBuoy },
      { label: "Back to website", href: ENSKI_WEBSITE, icon: Globe },
    ],
  },
];

/** Flat list of in-app pages (used by search). */
export const learnerLinks: LearnerNavLink[] = learnerSections.flatMap((sec) =>
  sec.items.flatMap((n): LearnerNavLink[] => ("children" in n ? [...n.children] : "to" in n ? [n] : [])),
);

/** Active-state rule shared by the sidebar and its tests. */
export function isLearnerLinkActive(n: LearnerNavLink, path: string, view?: string) {
  const under = (to: string) => path === to || path.startsWith(to + "/");
  if (n.match === "discover") return path === "/learner/resources" && view === "discover";
  if (n.match === "library") return (path === "/learner/resources" && view !== "discover") || path.startsWith("/learner/resources/");
  return under(n.to) || (n.also ?? []).some(under);
}

export const learnerMeta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Enski Learner` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Enski Learner` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
