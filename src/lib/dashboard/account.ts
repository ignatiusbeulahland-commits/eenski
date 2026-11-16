import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import type { AccountType } from "@/components/site/data";
import { currentDemoProfile, demoSession, type DemoProfile } from "@/lib/demo/profile";

/**
 * Links the Learner, Creator and Affiliate dashboards to the demo sign-in on /auth.
 * Each person (by email) gets their own saved dashboard on this device, starting empty,
 * and their own name: nobody inherits someone else's records or greeting.
 */

export const DASHBOARD_HOME = {
  learner: "/learner/dashboard",
  creator: "/creator/dashboard",
  affiliate: "/affiliate/dashboard",
} as const satisfies Record<AccountType, string>;

/** Storage key for one person's dashboard: the role's base key plus their email. */
export function accountStorageKey(base: string, profile: DemoProfile | null = currentDemoProfile()): string {
  return profile ? `${base}:${profile.email}` : base;
}

/** Every saved dashboard on this device for one role (all accounts), raw JSON strings. Browser-only. */
export function savedAccountValues(base: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key === base || key.startsWith(`${base}:`))) {
      const value = localStorage.getItem(key);
      if (value) out.push(value);
    }
  }
  return out;
}

export interface AccountPerson {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** The signed-in person's name and email, split for forms that keep first and last names apart. */
export function accountPerson(profile: DemoProfile | null = currentDemoProfile()): AccountPerson {
  const fullName = profile?.name.trim() ?? "";
  const [firstName = "", ...rest] = fullName.split(/\s+/).filter(Boolean);
  return { fullName, firstName, lastName: rest.join(" "), email: profile?.email ?? "" };
}

/** Short lower-case handle from the person's name, used in demo referral links. */
export function accountHandle(profile: DemoProfile | null = currentDemoProfile()): string {
  const first = accountPerson(profile).firstName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return first || "me";
}

/** Sign out of the demo from any dashboard and go back to the website. */
export function useDashboardSignOut() {
  const navigate = useNavigate();
  return () => {
    demoSession.signOut();
    toast.success("Logged out", { description: "Your dashboard stays saved on this device." });
    void navigate({ to: "/", replace: true });
  };
}
