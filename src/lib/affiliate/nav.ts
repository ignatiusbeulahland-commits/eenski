import {
  LayoutGrid, Link2, BarChart3, Users, Store, ReceiptText, Wallet, Banknote, Settings,
  UserPen, Landmark, ShieldCheck, Bell, Lock, BookOpen, LifeBuoy, Plug, Globe2, type LucideIcon } from "lucide-react";

export type NavItem = { label: string; to: string; icon: LucideIcon; keywords?: string };
export const mainNav: NavItem[] = [
  { label: "Overview", to: "/affiliate/dashboard", icon: LayoutGrid, keywords: "dashboard home" },
  { label: "My Affiliations", to: "/affiliate/my-affiliations", icon: Link2, keywords: "referral links products promoted" },
  { label: "Performance", to: "/affiliate/performance", icon: BarChart3, keywords: "clicks conversions chart" },
  { label: "Referrals", to: "/affiliate/referrals", icon: Users, keywords: "referred" },
  { label: "Market", to: "/affiliate/market", icon: Store, keywords: "marketplace courses products browse" },
  { label: "Transactions", to: "/affiliate/transactions", icon: ReceiptText, keywords: "history" },
  { label: "Wallet", to: "/affiliate/wallet", icon: Wallet, keywords: "balance earnings" },
  { label: "Payouts", to: "/affiliate/payouts", icon: Banknote, keywords: "withdraw" },
];
export const settingsIcon = Settings;
export const settingsNav: NavItem[] = [
  { label: "Manage Profile", to: "/affiliate/settings/profile", icon: UserPen, keywords: "name email phone photo" },
  { label: "Bank Account Details", to: "/affiliate/settings/bank-account", icon: Landmark, keywords: "account number" },
  { label: "Country & Currency", to: "/affiliate/settings/currency", icon: Globe2, keywords: "currency country payout residence exchange" },
  { label: "Verification", to: "/affiliate/settings/verification", icon: ShieldCheck, keywords: "kyc identity documents" },
  { label: "Integrations", to: "/affiliate/settings/integrations", icon: Plug, keywords: "whatsapp mailchimp google drive connect apps" },
  { label: "Notifications", to: "/affiliate/settings/notifications", icon: Bell, keywords: "email alerts preferences" },
  { label: "Password & Security", to: "/affiliate/settings/security", icon: Lock, keywords: "password security two-factor" },
];
export const resourceNav: NavItem[] = [
  { label: "Guides", to: "/affiliate/guides", icon: BookOpen, keywords: "learn articles" },
  { label: "Help", to: "/affiliate/help", icon: LifeBuoy, keywords: "support faq contact" },
];

/** Settings tabs shown on every settings page except Manage Profile's own layout. */
export const settingsTabs = settingsNav.map(({ label, to }) => ({ label, to }));
