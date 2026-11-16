import type { Icon3DName } from "@/components/site/Icon3D";

/**
 * All copy on the pricing page, kept word for word from the live Enski pricing page.
 * Only casing (brand guide: sentence case), stray spaces and one typo were tidied.
 */

export const launchTypes: { label: string; icon: Icon3DName }[] = [
  { label: "Courses", icon: "video" },
  { label: "eBooks", icon: "ebook" },
  { label: "Templates", icon: "categories" },
  { label: "Live classes", icon: "mic" },
  { label: "Private communities", icon: "chat" },
  { label: "Coaching", icon: "profile" },
];

export const whatYouGet: { label: string; comingSoon?: boolean }[] = [
  { label: "Direct Video Upload for Your Courses" },
  { label: "Unlimited digital products" },
  { label: "Unlimited learners" },
  { label: "List Product on Dreamverse Marketplace" },
  { label: "Multi-currency support" },
  { label: "Local & international payments" },
  { label: "Fast payouts" },
  { label: "Basic analytics" },
  { label: "Sales pages" },
  { label: "Custom checkout" },
  { label: "Sell with Affiliates" },
  { label: "Automated enrolment" },
  { label: "Automated Abandoned Cart Emails" },
  { label: "Custom branding" },
  { label: "Third-Party Integrations" },
  { label: "Custom Sub-domain eg, damilola.tryenski.com", comingSoon: true },
];

/** The fees creators pay. These figures are the business rules shown on the page. */
export const fees = {
  privateLocal: { rate: "3.5% + NGN100", label: "Local transactions (For Sales in NGN)" },
  privateInternational: { rate: "6.5%", label: "International transactions (For Sales in other Countries)" },
  marketplace: {
    rate: "40%",
    label: "commission.",
    note: "(We bring the traffic, visibility, and sales — you simply fulfil the product.)",
  },
};

export const noFees = ["No monthly fees.", "No hosting fees.", "No set-up fees.", "No surprises."];

/** Ultra features grouped under the three promises in the Ultra headline. */
export const ultraGroups: { title: string; features: string[] }[] = [
  {
    title: "More automation",
    features: ["WhatsApp Automations", "Automation workflows", "Email marketing inside Enski", "Creator referral program"],
  },
  {
    title: "Deeper insights",
    features: [
      "Deep analytics + learner insights",
      "Enhanced marketplace visibility",
      "Reduced Marketplace Commission",
      "Priority support",
    ],
  },
  {
    title: "Advanced control",
    features: [
      "Custom domain for your academy/brand (eg. understandingX.com)",
      "Advanced integrations",
      "Advanced payout tools",
      "More storage + higher limits",
    ],
  },
];

export const ultraFeatures = [
  "WhatsApp Automations",
  "Custom domain for your academy/brand (eg. understandingX.com)",
  "Deep analytics + learner insights",
  "Enhanced marketplace visibility",
  "Advanced integrations",
  "Priority support",
  "More storage + higher limits",
  "Email marketing inside Enski",
  "Automation workflows",
  "Creator referral program",
  "Advanced payout tools",
  "Reduced Marketplace Commission",
];

export const faqs: { q: string; a: string[] }[] = [
  {
    q: "Why are private sales fees so low?",
    a: [
      "Because Enski believes creators should keep as much of their earnings as possible, especially when the traffic and customers come from you. Our goal is to empower creators, not overcharge them.",
    ],
  },
  {
    q: "Why does the marketplace charge 40%?",
    a: [
      "Dreamverse handles the heavy lifting: discovery, ranking, promotions, traffic, and sales.",
      "You simply upload your course or product, and we help you reach new audiences you may never have reached on your own.",
    ],
  },
  {
    q: "How do payouts work?",
    a: [
      "When setting up your Enski account, you'll add your local bank account, which simply means an account in your country's default currency.",
      "Example: For a Nigerian creator, your local bank account is a Naira account.",
      "All revenue (both private and marketplace sales) is first sent to your Enski Wallet, and you can withdraw anytime to your local bank account.",
    ],
  },
  {
    q: "Do I need a subscription to start?",
    a: ["No.", "All essential features are free forever.", "You pay only when you earn."],
  },
  {
    q: "Can I upgrade to Pro later?",
    a: ["Yes. When the Pro plan launches, you'll be able to switch instantly."],
  },
  {
    q: "How fast are payouts?",
    a: [
      "Payouts typically take 1–5 working days, depending on the currency of the sale. Most local payouts are settled within the next business day.",
    ],
  },
  {
    q: "How does Enski process settlements?",
    a: [
      "Whenever you receive a payment on Enski, the funds are processed and sent to your Enski Wallet.",
      "From there, you can withdraw to your payout bank account whenever you choose.",
    ],
  },
  {
    q: "Does Enski charge a withdrawal fee?",
    a: [
      "Depending on your payout method, there may be a small withdrawal fee.",
      "The exact amount is always shown clearly on your withdrawal page, so no surprises.",
    ],
  },
];
