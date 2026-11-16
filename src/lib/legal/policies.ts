import raw from "@/content/legal/policies.json";

export type LegalBlock = string | string[];
export type LegalSection = { n: string | null; title: string; blocks: LegalBlock[] };
export type LegalKey = "privacy" | "terms" | "cookies" | "copyright" | "kyc";
export type Policy = {
  title: string;
  effective: string | null;
  notice: string | null;
  intro: LegalBlock[];
  sections: LegalSection[];
};

/** Wording copied from the Enski staging site; edit the JSON, not the layout. */
export const policies = raw as Record<LegalKey, Policy>;

export const legalPages: { key: LegalKey; path: string; label: string; blurb: string }[] = [
  { key: "privacy", path: "/privacy-policy", label: "Privacy Policy", blurb: "What we collect, why, and your rights." },
  { key: "terms", path: "/terms", label: "Terms of Service", blurb: "The rules for using Enski." },
  { key: "cookies", path: "/cookies-settings", label: "Cookie Settings", blurb: "How cookies work and your choices." },
  { key: "copyright", path: "/copyright-policy", label: "Copyright Policy", blurb: "Who owns what, and reporting copies." },
  { key: "kyc", path: "/kyc-policy", label: "KYC Policy", blurb: "Identity checks before payouts." },
];

/** Plain-language summaries drawn from each policy and the rest of the site. */
export const highlights: Record<LegalKey, string[]> = {
  privacy: [
    "We never sell your personal information.",
    "Signed-in devices are listed in your settings and removed after 90 days unused.",
    "Error reports strip personal details and are deleted within 30 days.",
    "You can ask to see, change or delete your data at any time.",
  ],
  terms: [
    "Keep your login safe — you're responsible for activity on your account.",
    "Payments run through our payment partners; price changes never affect past purchases.",
    "Creators are fully responsible for imported landing pages.",
    "These terms follow the laws of the Federal Republic of Nigeria.",
  ],
  cookies: [
    "Essential cookies keep sign-in and security working and can't be switched off.",
    "Analytics, preference and marketing cookies are your choice.",
    "You can change your choice at any time below.",
  ],
  copyright: [
    "Creators keep ownership of everything they upload.",
    "Purchases are for your own learning — no sharing, reselling or reposting.",
    "Videos use expiring links and ebooks carry a personal watermark.",
    "Report copied work to support@enski.net, one complaint per product.",
  ],
  kyc: [
    "Learners only need a verified email address.",
    "Creators and affiliates verify their BVN through Paystack before withdrawing.",
    "Payouts go only to an approved bank account in your own name.",
    "BVN and bank details are masked and never sold.",
  ],
};

export const SUPPORT_EMAIL = "support@enski.net";
