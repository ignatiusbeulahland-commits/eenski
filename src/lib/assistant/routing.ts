import type { Audience } from "./types";

/** Ticket and live chat categories per kind of visitor (from the brief). */
export const SUPPORT_CATEGORIES: Record<Audience, string[]> = {
  learner: ["Purchases and payments", "Course and resource access", "Events", "Certificates", "Account issues", "Technical issues", "General enquiries"],
  creator: ["Product setup and publishing", "Sales and orders", "Wallet and payouts", "Verification", "Account issues", "Certificates", "Technical issues", "General enquiries"],
  affiliate: ["Referral tracking", "Affiliations", "Commissions", "Wallet and payouts", "Account issues", "Technical issues", "General enquiries"],
  public: ["General enquiries", "Registration", "Platform information", "Getting started", "Technical issues"],
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  public: "Visitor",
  learner: "Learner",
  creator: "Creator",
  affiliate: "Affiliate",
};

const CATEGORY_HINTS: { pattern: RegExp; category: string }[] = [
  { pattern: /\b(error|bug|crash(es|ed)?|glitch|blank page|keeps loading|not loading|won't load|slow|broken page)\b/, category: "Technical issues" },
  { pattern: /\b(payout|withdraw|wallet|bank)\b/, category: "Wallet and payouts" },
  { pattern: /\b(commission|earning)s?\b/, category: "Commissions" },
  { pattern: /\b(referral|ref link|tracking|clicks?)\b/, category: "Referral tracking" },
  { pattern: /\b(affiliation|promote|affiliate program)\b/, category: "Affiliations" },
  { pattern: /\b(verif|kyc|identity)/, category: "Verification" },
  { pattern: /\b(publish|create (a )?(course|product)|upload|draft|listing)\b/, category: "Product setup and publishing" },
  { pattern: /\b(order|sale|customer|sold)s?\b/, category: "Sales and orders" },
  { pattern: /\b(certificate|badge)s?\b/, category: "Certificates" },
  { pattern: /\b(event|webinar|live training|session)s?\b/, category: "Events" },
  { pattern: /\b(access|open|video|resource|lesson|course|ebook|download)s?\b/, category: "Course and resource access" },
  { pattern: /\b(pay|paid|payment|charged|refund|purchase|card|receipt)/, category: "Purchases and payments" },
  { pattern: /\b(register|sign ?up|create (an )?account|join)\b/, category: "Registration" },
  { pattern: /\b(start|begin|new here|how do i)\b/, category: "Getting started" },
  { pattern: /\b(what is|about|pricing|price|fees?|cost)\b/, category: "Platform information" },
  { pattern: /\b(log ?in|password|account|email|profile|locked)\b/, category: "Account issues" },
];

/** Best-fit category for this visitor, falling back to their first category. */
export function suggestCategory(audience: Audience, text: string): string {
  const options = SUPPORT_CATEGORIES[audience];
  const t = text.toLowerCase();
  for (const { pattern, category } of CATEGORY_HINTS) {
    if (options.includes(category) && pattern.test(t)) return category;
  }
  return options[0] ?? "General enquiries";
}

/** Money, payouts and verification go to the front of the queue. */
export function isUrgentCategory(category: string) {
  return /payouts|payments|Verification|Commissions/.test(category);
}
