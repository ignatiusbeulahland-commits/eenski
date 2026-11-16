import { products } from "@/lib/affiliate/products";
import { defaultFinancePrefs } from "@/lib/shared/finance/beneficiaries";
import { initialUniverse } from "./universe/rules";
import { DAYS, type CreatorState, type ItemKind } from "./rules";
/** Placeholder cover artwork a Creator can pick for a product. */
export const creatorCovers = products.map((p) => p.image);
export const STORAGE_KEY = "enski-creator-prototype-v2";
export const kindInfo: Record<ItemKind, { label: string; plural: string; noun: string; nouns: string }> = {
  course: { label: "Course", plural: "Courses", noun: "course", nouns: "courses" },
  ebook: {
    label: "Digital Download",
    plural: "Digital Downloads",
    noun: "digital download",
    nouns: "digital downloads",
  },
  live: { label: "Live Session", plural: "Live Sessions", noun: "live session", nouns: "live sessions" },
  service: { label: "Service", plural: "Services", noun: "service", nouns: "services" },
  coaching: { label: "Coaching", plural: "Coaching", noun: "coaching offer", nouns: "coaching offers" },
};
/** A brand-new Creator account: every list starts empty. */
export const initialCreatorState: CreatorState = {
  universe: initialUniverse,
  items: [],
  customers: [],
  orders: [],
  promotions: [],
  reviews: [],
  media: [],
  affiliates: [],
  rules: [],
  programs: [],
  landingPages: [],
  leads: [],
  payouts: [],
  activity: [],
  notificationsRead: [],
  notificationsDismissed: [],
  profile: { firstName: "", lastName: "", email: "", phone: "", bio: "", photo: "" },
  storefront: { name: "", handle: "", tagline: "", about: "", published: false, banner: "", bannerSource: "none", bannerWords: { headline: "", subline: "", style: "cobalt" } },
  storePage: { accent: "cobalt", bannerY: 50, bio: "", video: "", videoName: "", portfolio: "", socials: { instagram: "", youtube: "", linkedin: "", tiktok: "", x: "" }, achievements: [], featuredId: "", hiddenIds: [], order: [], testimonials: [] },
  availability: {
    timezone: "Africa/Lagos",
    buffer: 15,
    days: DAYS.map(() => ({ enabled: false, start: "09:00", end: "17:00" })),
  },
  bank: null,
  beneficiaries: [],
  payoutPin: "",
  finance: defaultFinancePrefs,
  verification: "not_started",
  notifications: { email: true, inApp: true, sales: true, events: true, news: false },
  security: { reminder: true },
  integrations: [],
  collapsed: false,
  support: [],
};
export const creatorGuides = [
  {
    id: "getting-started",
    title: "Your first Creator launch",
    category: "Getting started",
    summary: "Set up your storefront and publish your first product.",
    sections: [
      "Open Storefront, choose a store name and handle, then save. This is the address you share.",
      "Under Manage Products, pick a type — Course, Digital Download, Live Session, Service or Coaching — and save a draft.",
      "Review the details and publish when ready. Published products appear on your storefront.",
    ],
  },
  {
    id: "courses",
    title: "Build a clear course curriculum",
    category: "Courses",
    summary: "Organise the lessons you want to teach.",
    sections: [
      "Create a course and write one lesson title per line.",
      "Review the curriculum on the course page. Edit or archive your course at any time.",
      "Buyers appear under Dreamers / Subscribers once they purchase.",
    ],
  },
  {
    id: "coupons",
    title: "Plan your first coupon",
    category: "Coupons",
    summary: "Create a discount code for your audience.",
    sections: [
      "Open Coupons / Discounts and choose the product the code applies to.",
      "Set the discount and dates, then activate the coupon.",
      "Active coupons are applied automatically to eligible orders.",
    ],
  },
  {
    id: "affiliates",
    title: "Grow with affiliates",
    category: "Affiliates",
    summary: "Let affiliates promote your products for a commission you choose.",
    sections: [
      "Create a commission rule with the percentage you want to offer.",
      "Under Ongoing Promotions, add a published product and choose its rule.",
      "Invite affiliates. Their referred sales will appear under Ongoing Promotions.",
    ],
  },
  {
    id: "earnings",
    title: "Review your wallet and payouts",
    category: "Finance",
    summary: "Understand your balance and payouts.",
    sections: [
      "Your wallet balance is the total of paid orders, minus payouts.",
      "Add bank account details before requesting a payout. Only the last four digits are kept.",
      "Payouts are sent to the bank account you saved.",
    ],
  },
];
export const creatorArticles = [
  {
    id: "publish",
    category: "Products",
    title: "How do I publish a product?",
    answer:
      "Create and save a draft, open it, then select Publish. You can unpublish, edit or archive it later. Courses need a lesson, live sessions need a date and capacity, coaching needs a session length and services need a delivery time.",
  },
  {
    id: "orders",
    category: "Sales",
    title: "How do I record an order by hand?",
    answer:
      "Open a published product and choose Add an order. Enter the buyer and optionally an active coupon. The order updates your wallet, subscribers and performance.",
  },
  {
    id: "reviews",
    category: "Reviews",
    title: "Can I hide or report a review?",
    answer:
      "Yes. Under Reviews, hide a review to remove it from your storefront, or report it if it breaks the rules. Hidden reviews can be shown again.",
  },
  {
    id: "payments",
    category: "Finance",
    title: "Are payments and payouts real?",
    answer:
      "Payments are processed securely and your earnings appear in your wallet.",
  },
  {
    id: "account",
    category: "Account",
    title: "Where are my changes saved?",
    answer:
      "Your changes save automatically as you work.",
  },
];
