import { z } from "zod";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { beneficiaryLabel, beneficiarySchema, financePrefsSchema, maskedLast4 } from "@/lib/shared/finance/beneficiaries";
import { METHOD_LABEL, PROVIDERS } from "@/lib/shared/finance/coverage";
import { refFrom, type TxRow } from "@/lib/shared/finance/history";
import { balancesByCurrency, type Ledger } from "@/lib/shared/finance/wallet";
import { universeSchema, initialUniverse } from "./universe/rules";
import {
  coachingConfigSchema,
  courseConfigSchema,
  downloadConfigSchema,
  fulfilmentSchema,
  liveConfigSchema,
  serviceConfigSchema,
} from "./products";
export const KINDS = ["course", "ebook", "live", "service", "coaching"] as const;
export const itemSchema = z.object({
  id: z.string(),
  kind: z.enum(KINDS),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number().finite().nonnegative(),
  status: z.enum(["draft", "published", "archived"]),
  image: z.string(),
  lessons: z.array(z.string()),
  date: z.string(),
  capacity: z.number().int().nonnegative(),
  /** Coaching: session length in minutes. Service: delivery time in days. */
  duration: z.number().nonnegative().default(0),
  createdAt: z.string(),
  /** Set when the product is moved to the Bin; `binnedFrom` is its status before that. */
  binnedAt: z.string().optional(),
  binnedFrom: z.enum(["draft", "published", "archived"]).optional(),
  /** Only the config matching `kind` is used. */
  course: courseConfigSchema.optional(),
  download: downloadConfigSchema.optional(),
  live: liveConfigSchema.optional(),
  service: serviceConfigSchema.optional(),
  coaching: coachingConfigSchema.optional(),
});
export type CreatorItem = z.infer<typeof itemSchema>;
export type ItemKind = CreatorItem["kind"];
const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  source: z.enum(["purchase", "manual"]).default("purchase"),
  date: z.string().default(""),
});
export type Customer = z.infer<typeof customerSchema>;
const orderSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemTitle: z.string(),
  customerId: z.string(),
  amount: z.number().finite().nonnegative(),
  date: z.string(),
  status: z.enum(["paid", "refunded"]),
  /** When the creator refunded the sale (older refunds have none). */
  refundedAt: z.string().optional(),
  /** Currency the buyer paid in. Products are priced in NGN today. */
  currency: z.enum(CURRENCY_CODES).default("NGN"),
  promotionId: z.string().optional(),
  ...fulfilmentSchema,
});
export type Order = z.infer<typeof orderSchema>;
const promotionSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  itemId: z.string(),
  discount: z.number().finite().min(1).max(100),
  start: z.string(),
  end: z.string(),
  status: z.enum(["draft", "active", "paused"]),
});
export type Promotion = z.infer<typeof promotionSchema>;
const reviewSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemTitle: z.string(),
  customerName: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  date: z.string(),
  hidden: z.boolean(),
  reported: z.boolean(),
});
export type Review = z.infer<typeof reviewSchema>;
const mediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["image", "video", "audio", "document"]),
  mime: z.string(),
  size: z.number().nonnegative(),
  date: z.string(),
  preview: z.string(),
  /** Seconds, for video and audio. */
  duration: z.number().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** True when the file's bytes are kept on this device, so it can be played and downloaded. */
  stored: z.boolean().optional(),
});
export type MediaFile = z.infer<typeof mediaSchema>;
const affiliateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(["invited", "active"]),
  date: z.string(),
});
export type Affiliate = z.infer<typeof affiliateSchema>;
const ruleSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number().finite().min(1).max(90),
  isDefault: z.boolean(),
});
export type CommissionRule = z.infer<typeof ruleSchema>;
const programSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  ruleId: z.string(),
  status: z.enum(["active", "paused"]),
  date: z.string(),
});
export type Program = z.infer<typeof programSchema>;
export const LANDING_TEMPLATES = ["spotlight", "split", "minimal"] as const;
export const LANDING_MAX_SECTIONS = 4;
const landingSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  itemId: z.string(),
  headline: z.string(),
  body: z.string(),
  cta: z.string(),
  status: z.enum(["draft", "published"]),
  date: z.string(),
  /** Visual layout of the page. */
  template: z.enum(LANDING_TEMPLATES).default("spotlight"),
  /** Uploaded cover image (resized data URL) or empty. */
  cover: z.string().default(""),
  /** Extra content blocks, each with an optional image. */
  sections: z.array(z.object({ id: z.string(), title: z.string(), text: z.string(), image: z.string() })).max(LANDING_MAX_SECTIONS).default([]),
});
export type LandingPage = z.infer<typeof landingSchema>;
export type LandingSection = LandingPage["sections"][number];
const leadSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  name: z.string(),
  email: z.string().email(),
  date: z.string(),
});
export type Lead = z.infer<typeof leadSchema>;
const daySchema = z.object({ enabled: z.boolean(), start: z.string(), end: z.string() });
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const stateSchema = z.object({
  universe: universeSchema.default(initialUniverse),
  items: z.array(itemSchema),
  customers: z.array(customerSchema),
  orders: z.array(orderSchema),
  promotions: z.array(promotionSchema),
  reviews: z.array(reviewSchema).default([]),
  media: z.array(mediaSchema).default([]),
  affiliates: z.array(affiliateSchema).default([]),
  rules: z.array(ruleSchema).default([]),
  programs: z.array(programSchema).default([]),
  landingPages: z.array(landingSchema).default([]),
  leads: z.array(leadSchema).default([]),
  payouts: z.array(
    z.object({
      id: z.string(),
      amount: z.number().finite().positive(),
      date: z.string(),
      /** "simulated" = requested before withdrawal tracking (shown as pending). */
      status: z.enum(["simulated", "processing", "successful", "failed"]),
      last4: z.string(),
      /** Balance currency the amount was taken from. */
      currency: z.enum(CURRENCY_CODES).default("NGN"),
      beneficiaryId: z.string().optional(),
      payoutCurrency: z.enum(CURRENCY_CODES).optional(),
      provider: z.enum(["paystack", "flutterwave", "wise", "paypal", "stripe"]).optional(),
      /** Indicative rate shown at confirmation, when the payout converts. */
      rate: z.number().positive().optional(),
      recipient: z.string().optional(),
      fee: z.number().nonnegative().optional(),
      reference: z.string().optional(),
      method: z.enum(["bank", "mobile_money", "card", "paypal", "stripe"]).optional(),
      /** When processing ends (ms) and what the transfer answers then. */
      resolveAt: z.number().optional(),
      plan: z.enum(["successful", "daily_limit", "bank_unavailable", "pin_locked"]).optional(),
      reason: z.enum(["daily_limit", "bank_unavailable", "pin_locked"]).optional(),
      settledAt: z.string().optional(),
    }),
  ),
  beneficiaries: z.array(beneficiarySchema).default([]),
  finance: financePrefsSchema.default({}),
  /** SHA-256 of the 4-digit withdrawal PIN ("" until it's set). The PIN itself is never stored. */
  payoutPin: z.string().default(""),
  activity: z.array(z.object({ id: z.string(), text: z.string(), date: z.string() })),
  /** Activity ids the creator has read in the notification centre. */
  notificationsRead: z.array(z.string()).default([]),
  /** Activity ids the creator cleared from the notification centre (the activity itself is kept). */
  notificationsDismissed: z.array(z.string()).default([]),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    bio: z.string(),
    photo: z.string(),
  }),
  storefront: z
    .object({
      name: z.string(),
      handle: z.string(),
      tagline: z.string(),
      about: z.string(),
      published: z.boolean(),
      banner: z.string().default(""),
      bannerSource: z.enum(["none", "upload", "designed"]).default("none"),
      bannerWords: z
        .object({ headline: z.string(), subline: z.string(), style: z.enum(["cobalt", "midnight", "ice"]) })
        .default({ headline: "", subline: "", style: "cobalt" }),
    })
    .default({ name: "", handle: "", tagline: "", about: "", published: false, banner: "", bannerSource: "none", bannerWords: { headline: "", subline: "", style: "cobalt" } }),
  availability: z
    .object({
      timezone: z.string(),
      buffer: z.number().int().nonnegative(),
      days: z.array(daySchema).length(7),
    })
    .default({
      timezone: "Africa/Lagos",
      buffer: 15,
      days: DAYS.map(() => ({ enabled: false, start: "09:00", end: "17:00" })),
    }),
  bank: z
    .object({ holder: z.string(), bank: z.string(), last4: z.string().regex(/^\d{4}$/) })
    .nullable(),
  verification: z.enum(["not_started", "submitted"]),
  notifications: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    sales: z.boolean(),
    events: z.boolean(),
    news: z.boolean(),
  }),
  security: z.object({ reminder: z.boolean() }),
  integrations: z.array(z.string()),
  collapsed: z.boolean(),
  support: z.array(
    z.object({ id: z.string(), subject: z.string(), message: z.string(), date: z.string() }),
  ),
});
export type CreatorState = z.infer<typeof stateSchema>;
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
/** A unique, URL-safe slug; appends -2, -3… when taken. */
export function uniqueSlug(title: string, taken: string[]) {
  const base = slugify(title) || "untitled";
  let slug = base;
  for (let n = 2; taken.includes(slug); n++) slug = `${base}-${n}`;
  return slug;
}
export const totalEarnings = (s: Pick<CreatorState, "orders">) =>
  s.orders.filter((o) => o.status === "paid").reduce((n, o) => n + o.amount, 0);
export const availableBalance = (s: Pick<CreatorState, "orders" | "payouts">) =>
  totalEarnings(s) - s.payouts.filter((o) => o.status !== "failed").reduce((n, o) => n + o.amount, 0);
export function validateItem(item: CreatorItem) {
  if (!item.title.trim() || !item.description.trim()) return "Add a title and description.";
  if (!Number.isFinite(item.price) || item.price < 0) return "Enter a price of 0 or more.";
  if (item.kind === "course" && !item.lessons.some((l) => l.trim()))
    return "Add at least one lesson in Curriculum.";
  if (
    item.kind === "live" &&
    (!item.date ||
      !Number.isFinite(Date.parse(item.date)) ||
      !Number.isInteger(item.capacity) ||
      item.capacity < 1)
  )
    return "Pick a session date and how many people can join (at least 1).";
  if (item.kind === "coaching" && (!Number.isInteger(item.duration) || item.duration < 15))
    return "Set a session length of at least 15 minutes.";
  if (item.kind === "service" && (!Number.isInteger(item.duration) || item.duration < 1))
    return "Set a delivery time of at least 1 day.";
  return "";
}
export function validatePromotion(p: Promotion, state: Pick<CreatorState, "items" | "promotions">) {
  if (!p.name.trim() || !/^[A-Z0-9_-]+$/.test(p.code))
    return "Add a name and a code using letters, numbers, hyphens or underscores.";
  if (!Number.isFinite(p.discount) || p.discount < 1 || p.discount > 100)
    return "Discount must be between 1% and 100%.";
  if (
    !p.start ||
    !p.end ||
    !Number.isFinite(Date.parse(p.start)) ||
    !Number.isFinite(Date.parse(p.end)) ||
    p.end < p.start
  )
    return "Choose a valid start and end date.";
  if (!state.items.some((i) => i.id === p.itemId && i.status !== "archived"))
    return "Choose an available product.";
  if (state.promotions.some((i) => i.id !== p.id && i.code.toUpperCase() === p.code.toUpperCase()))
    return "This coupon code is already in use.";
  return "";
}
export function validateRule(r: CommissionRule, rules: CommissionRule[]) {
  if (!r.name.trim()) return "Give this rule a name.";
  if (!Number.isFinite(r.rate) || r.rate < 1 || r.rate > 90)
    return "Commission must be between 1% and 90%.";
  if (rules.some((x) => x.id !== r.id && x.name.trim().toLowerCase() === r.name.trim().toLowerCase()))
    return "A rule with this name already exists.";
  return "";
}
/** Saving a default rule clears the default flag on every other rule. */
export function saveRule(rules: CommissionRule[], rule: CommissionRule) {
  const exists = rules.some((r) => r.id === rule.id);
  const next = exists ? rules.map((r) => (r.id === rule.id ? rule : r)) : [...rules, rule];
  return rule.isDefault ? next.map((r) => ({ ...r, isDefault: r.id === rule.id })) : next;
}
export function validateLanding(p: LandingPage, pages: LandingPage[]) {
  if (!p.title.trim() || !p.headline.trim()) return "Add a page title and headline.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))
    return "Use lowercase letters, numbers and single hyphens for the page address.";
  if (pages.some((x) => x.id !== p.id && x.slug === p.slug))
    return "Another landing page already uses this address.";
  if (!p.cta.trim()) return "Add a button label.";
  if (p.sections.some((x) => !x.title.trim())) return "Give every section a title, or remove it.";
  return "";
}
export function validateAvailability(days: CreatorState["availability"]["days"]) {
  return days.some((d) => d.enabled && (!d.start || !d.end || d.end <= d.start))
    ? "Each available day needs an end time after its start time."
    : "";
}
export function orderAmount(item: CreatorItem, promotion: Promotion | undefined, date: string) {
  const valid =
    promotion?.status === "active" &&
    promotion.itemId === item.id &&
    date.slice(0, 10) >= promotion.start &&
    date.slice(0, 10) <= promotion.end;
  return (
    Math.round(item.price * (valid && promotion ? 1 - promotion.discount / 100 : 1) * 100) / 100
  );
}
/** Per-currency balances: paid orders earn, requested payouts are upcoming until the provider settles them. */
export function creatorBalances(s: Pick<CreatorState, "orders" | "payouts" | "finance">) {
  const ledger: Ledger[] = [
    ...s.orders.filter((o) => o.status === "paid").map((o) => ({ currency: o.currency, amount: o.amount, kind: "earning" as const })),
    ...s.payouts.filter((p) => p.status !== "failed").map((p) => ({ currency: p.currency, amount: p.amount, kind: p.status === "successful" ? ("payout" as const) : ("payout_pending" as const) })),
  ];
  return balancesByCurrency(ledger, ["NGN", ...s.finance.walletCurrencies.filter((c) => c !== "NGN")]);
}
export function currencyPayoutError(state: CreatorState, amount: number, currency: CurrencyCode) {
  if (!state.beneficiaries.length) return "Add a payout account first.";
  const available = creatorBalances(state).find((b) => b.currency === currency)?.available ?? 0;
  if (!Number.isFinite(amount) || amount <= 0 || amount > available) return "Enter an amount within your available balance.";
  return currency === "NGN" ? payoutError(state, amount) : "";
}
export function payoutError(state: CreatorState, amount: number) {
  if (!state.bank) return "Add bank account details first.";
  if (!Number.isFinite(amount) || amount <= 0 || amount > availableBalance(state))
    return "Enter an amount within your available balance.";
  return "";
}
export const averageRating = (reviews: Pick<Review, "rating">[]) =>
  reviews.length ? Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10 : 0;

/** Creator money movements as history rows: sales in, refunded sales marked refunded, payout requests out (pending until the provider updates them). */
export function creatorTransactions(s: Pick<CreatorState, "orders" | "payouts" | "beneficiaries" | "customers">): TxRow[] {
  const sales: TxRow[] = s.orders.map((o) => ({
    id: `o-${o.id}`, description: o.itemTitle, detail: `Sale · ${s.customers.find((c) => c.id === o.customerId)?.name ?? "Buyer"}`,
    amount: o.amount, currency: o.currency, direction: "in", date: o.date, reference: refFrom("ORD", o.id), method: "Enski checkout",
    status: o.status === "refunded" ? "refunded" : "successful",
    href: { to: "/creator/wallet/transactions/$txId", params: { txId: `o-${o.id}` } },
  }));
  const payouts: TxRow[] = s.payouts.map((p) => {
    const b = s.beneficiaries.find((x) => x.id === p.beneficiaryId);
    return {
      id: `p-${p.id}`, description: `Withdrawal to ${b ? beneficiaryLabel(b) : p.recipient ?? "bank account"}`,
      detail: p.payoutCurrency && p.payoutCurrency !== p.currency ? `Converted to ${p.payoutCurrency}` : `Payout · ${b ? maskedLast4(b) : `•••• ${p.last4}`}`,
      amount: p.amount, currency: p.currency, direction: "out", date: p.date, reference: p.reference ?? refFrom("PAY", p.id),
      method: `${METHOD_LABEL[p.method ?? b?.method ?? "bank"]}${p.provider ? ` · ${PROVIDERS[p.provider].name}` : ""}`,
      status: p.status === "successful" ? "successful" : p.status === "failed" ? "failed" : p.status === "processing" ? "processing" : "pending",
      href: { to: "/creator/wallet/withdrawals/$withdrawalId", params: { withdrawalId: p.id } },
    };
  });
  return [...sales, ...payouts];
}
