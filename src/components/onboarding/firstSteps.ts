import { BadgeCheck, BookOpen, CalendarDays, Compass, Megaphone, PackagePlus, Store, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import type { JoinRole } from "@/components/site/data";

export type FirstStepTo =
  | "/learner/resources" | "/learner/events" | "/learner/settings/profile"
  | "/creator/products" | "/creator/storefront" | "/creator/wallet/beneficiaries/new"
  | "/creator/live-trainings/create" | "/creator/coaching/create" | "/creator/badges"
  | "/affiliate/affiliations" | "/affiliate/guides" | "/affiliate/settings/bank-account";
export type FirstStep = { icon: ComponentType<{ className?: string }>; title: string; text: string; to: FirstStepTo };

/** Three good first things to do in each workspace, shown when setup is finished. */
export const FIRST_STEPS: Record<JoinRole, FirstStep[]> = {
  learner: [
    { icon: Compass, title: "Find your first course", text: "Courses, eBooks and coaching from creators across Africa.", to: "/learner/resources" },
    { icon: CalendarDays, title: "Join a live event", text: "Learn live with the community and earn a badge.", to: "/learner/events" },
    { icon: BadgeCheck, title: "Check your certificate name", text: "Choose exactly how your name prints on certificates.", to: "/learner/settings/profile" },
  ],
  creator: [
    { icon: PackagePlus, title: "Create your first product", text: "A course, eBook, coaching or live training, step by step.", to: "/creator/products" },
    { icon: Store, title: "Set up your storefront", text: "Your banner, photo and bio on one page you can share.", to: "/creator/storefront" },
    { icon: Wallet, title: "Add a payout account", text: "So your earnings can reach your bank, card or PayPal.", to: "/creator/wallet/beneficiaries/new" },
  ],
  affiliate: [
    { icon: Megaphone, title: "Pick a programme", text: "Promote courses you believe in and earn commission.", to: "/affiliate/affiliations" },
    { icon: BookOpen, title: "Read the starter guides", text: "Short guides on sharing links that people click.", to: "/affiliate/guides" },
    { icon: Wallet, title: "Add a payout account", text: "Choose where your commission is paid.", to: "/affiliate/settings/bank-account" },
  ],
};
