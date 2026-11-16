import type { CreatorRegion, Money, Product, ResourceType } from "./types";

export const TYPE_LABELS: Record<ResourceType, { label: string; plural: string; cta: string }> = {
  course: { label: "Course", plural: "Courses", cta: "View course" },
  ebook: { label: "eBook", plural: "eBooks", cta: "Buy eBook" },
  digital_product: { label: "Digital product", plural: "Digital products", cta: "Get this resource" },
  live_training: { label: "Live session", plural: "Live sessions", cta: "Register now" },
  coaching: { label: "Coaching", plural: "Coaching", cta: "Book a session" },
  gig: { label: "Service", plural: "Services", cta: "View service" },
};

/** The marketplace's category tabs, in the client's order (after "All"). */
export const CATEGORY_TABS: ResourceType[] = ["course", "ebook", "live_training", "coaching", "gig"];

export const isFree = (p: Product) => p.prices.length > 0 && p.prices.every((m) => m.current === 0);
export const isPaid = (p: Product) => p.prices.some((m) => m.current > 0);

/** Card call to action. Unpublished listings can't be bought, so they only open their details. */
export function ctaFor(p: Product): string {
  if (p.status !== "published") return "View details";
  if (p.type === "ebook" && isFree(p)) return "Read more";
  return TYPE_LABELS[p.type].cta;
}

/** Buy button on a resource's details page. */
export const BUY_LABELS: Record<ResourceType, string> = {
  course: "Buy course",
  ebook: "Buy eBook",
  digital_product: "Get this resource",
  live_training: "Register now",
  coaching: "Book a session",
  gig: "Hire this creator",
};

export function buyLabel(p: Pick<Product, "type" | "prices">): string {
  if (p.prices.length > 0 && p.prices.every((m) => m.current === 0)) {
    return p.type === "ebook" ? "Get eBook free" : "Get it free";
  }
  return BUY_LABELS[p.type];
}

const KEY_PREFIX: Record<ResourceType, string> = {
  course: "",
  ebook: "ebook-",
  digital_product: "resource-",
  live_training: "live-",
  coaching: "coaching-",
  gig: "service-",
};

/**
 * The URL key of a resource's details page (`/dreamverse/<key>`). Non-course types get a
 * prefix so a course and an eBook with the same title still get separate pages.
 */
export const productKey = (p: { id: string; type: ResourceType; slug?: string | undefined }) =>
  p.slug ? `${KEY_PREFIX[p.type]}${p.slug}` : p.id;

/** Live Enski courses have their public page in the course marketplace (`/courses/<slug>`), not under Dreamverse. */
export const isMarketCourse = (p: Pick<Product, "type" | "demo">) => p.type === "course" && !p.demo;

/** A creator's overall rating: every verified rating across their listings, weighted by count. */
export function creatorRating(items: Pick<Product, "rating">[]): { average: number; count: number } | null {
  let count = 0;
  let total = 0;
  for (const i of items) {
    if (!i.rating || i.rating.count <= 0) continue;
    count += i.rating.count;
    total += i.rating.average * i.rating.count;
  }
  return count > 0 ? { average: Math.round((total / count) * 10) / 10, count } : null;
}

/** Finds a resource by its details-page key; bare slugs and ids still resolve for older links. */
export function findProduct<T extends Pick<Product, "id" | "slug" | "type">>(key: string, list: T[]): T | null {
  return list.find((p) => productKey(p) === key) ?? list.find((p) => p.slug === key) ?? list.find((p) => p.id === key) ?? null;
}

export type FormatId = "self-paced" | "live";

/** How a resource is taken, from its type: services have no learning format. */
export function formatOf(type: ResourceType): FormatId | null {
  if (type === "live_training" || type === "coaching") return "live";
  if (type === "gig") return null;
  return "self-paced";
}

export const FORMATS: { id: FormatId; label: string }[] = [
  { id: "self-paced", label: "Self-paced" },
  { id: "live", label: "Live" },
];

export const REGIONS: { id: CreatorRegion; label: string }[] = [
  { id: "nigeria", label: "Nigeria" },
  { id: "international", label: "International" },
];

export const ACCESS = [
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
] as const;
export type AccessId = (typeof ACCESS)[number]["id"];

export const TYPE_ORDER: ResourceType[] = [
  "course",
  "ebook",
  "digital_product",
  "live_training",
  "coaching",
  "gig",
];

/**
 * Topics are keyword searches over a resource's title and summary.
 * Enski does not expose a topic field on listings, so a topic only matches
 * resources whose own words mention it.
 */
export const TOPICS = [
  {
    id: "technology",
    name: "Technology",
    blurb: "Code, data, cloud and the tools behind modern products.",
    keywords: ["code", "coding", "api", "typescript", "react", "ios", "swift", "docker", "kubernetes", "postgres", "database", "data", "algorithm", "devops", "ci/cd", "machine learning", "mlops", "web", "software", "system design", "engineer", "automation", "open source", "cto"],
  },
  {
    id: "business",
    name: "Business",
    blurb: "Start, run and grow ventures that last.",
    keywords: ["business", "startup", "entrepreneur", "management", "team", "advisory", "consultation", "strategy", "sales", "leadership"],
  },
  {
    id: "design",
    name: "Design",
    blurb: "Interfaces, brands and the craft of making things beautiful.",
    keywords: ["ui", "ux", "figma", "graphic design", "product design", "web design", "brand", "branding", "typography", "illustration"],
  },
  {
    id: "marketing",
    name: "Marketing",
    blurb: "Find your audience and tell stories that sell.",
    keywords: ["marketing", "social media", "seo", "content", "audience", "advert", "copywriting"],
  },
  {
    id: "finance",
    name: "Finance",
    blurb: "Money skills for creators, founders and families.",
    keywords: ["finance", "financial", "invest", "investment", "money", "budget", "accounting", "tax"],
  },
  {
    id: "creative-arts",
    name: "Creative arts",
    blurb: "Music, film, art and creative code.",
    keywords: ["creative", "art", "music", "film", "video", "photography", "p5", "drawing", "fashion"],
  },
  {
    id: "personal-development",
    name: "Personal development",
    blurb: "Careers, confidence and the habits that compound.",
    keywords: ["career", "interview", "mentorship", "mentor", "coaching", "productivity", "writing", "remote", "growth", "acceleration"],
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    blurb: "Food, wellness, beauty and everyday living.",
    keywords: ["lifestyle", "cooking", "food", "wellness", "fitness", "health", "beauty", "travel"],
  },
  {
    id: "education",
    name: "Education",
    blurb: "Teaching, study skills and exam preparation.",
    keywords: ["teach", "teaching", "tutor", "exam", "study", "student", "education", "curriculum"],
  },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

/** Currencies Enski sells in. Prices are never converted between them. */
export const CURRENCIES = [
  { code: "USD", label: "USD", name: "US dollars", symbol: "$" },
  { code: "NGN", label: "NGN", name: "Nigerian naira", symbol: "₦" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const PRICE_TIER_IDS = ["free", "tier-1", "tier-2", "tier-3", "tier-4"] as const;
export type PriceRangeId = (typeof PRICE_TIER_IDS)[number];

interface PriceRange {
  id: PriceRangeId;
  label: string;
  min: number;
  max: number;
}

/** Price bands per currency, each in that currency's own amounts. */
export const PRICE_RANGES: Record<CurrencyCode, PriceRange[]> = {
  USD: [
    { id: "free", label: "Free", min: 0, max: 0 },
    { id: "tier-1", label: "Under $50", min: 0.01, max: 49.99 },
    { id: "tier-2", label: "$50 – $250", min: 50, max: 250 },
    { id: "tier-3", label: "$250 – $500", min: 250.01, max: 500 },
    { id: "tier-4", label: "Over $500", min: 500.01, max: Number.POSITIVE_INFINITY },
  ],
  NGN: [
    { id: "free", label: "Free", min: 0, max: 0 },
    { id: "tier-1", label: "Under ₦20,000", min: 0.01, max: 19_999.99 },
    { id: "tier-2", label: "₦20,000 – ₦100,000", min: 20_000, max: 100_000 },
    { id: "tier-3", label: "₦100,000 – ₦500,000", min: 100_000.01, max: 500_000 },
    { id: "tier-4", label: "Over ₦500,000", min: 500_000.01, max: Number.POSITIVE_INFINITY },
  ],
};

/**
 * The resource's price in one currency, exactly as the creator set it.
 * Free resources are free in every currency; anything else without an entry
 * in that currency has no price there (null), rather than a converted guess.
 */
export function priceIn(p: Product, currency: CurrencyCode): Money | null {
  const exact = p.prices.find((m) => m.currency === currency);
  if (exact) return exact;
  const free = p.prices.length > 0 && p.prices.every((m) => m.current === 0);
  return free ? { currency, sign: "", amount: 0, current: 0, onSale: false } : null;
}

/** Price to show on a card: the chosen currency when one is picked, otherwise the default. */
export function displayPrice(p: Product, currency: CurrencyCode | undefined): Money | null {
  return currency ? priceIn(p, currency) : p.price;
}

export function availableCurrencies(products: Product[]): CurrencyCode[] {
  return CURRENCIES.map((c) => c.code).filter((c) => products.some((p) => priceIn(p, c)));
}

// "Newest" is left out: Enski shares no release dates, so it couldn't be sorted truthfully.
export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "title", label: "A to Z" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export interface CatalogFilters {
  q?: string | undefined;
  type?: ResourceType | undefined;
  topic?: TopicId | undefined;
  currency?: CurrencyCode | undefined;
  /** Only meaningful together with `currency`; bands are per currency. */
  price?: PriceRangeId | undefined;
  creator?: string | undefined;
  access?: AccessId | undefined;
  format?: FormatId | undefined;
  /** Creator's country; creators who haven't said are left out when this is set. */
  region?: CreatorRegion | undefined;
  sort?: SortId | undefined;
}

const haystack = (p: Product) =>
  `${p.title} ${p.summary} ${p.creator?.name ?? ""} ${p.skills.join(" ")} ${TYPE_LABELS[p.type].label} ${TYPE_LABELS[p.type].plural}`.toLowerCase();

function wordMatch(text: string, keyword: string) {
  const k = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${k}`, "i").test(text);
}

export function matchesTopic(p: Product, topic: TopicId): boolean {
  const t = TOPICS.find((x) => x.id === topic);
  if (!t) return true;
  const text = haystack(p);
  return t.keywords.some((k) => wordMatch(text, k));
}

export function matchesQuery(p: Product, q: string): boolean {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack(p);
  return terms.every((term) => text.includes(term));
}

/**
 * `popularIds` is Enski's trending list, most popular first; "Most popular" ranks those
 * first, then listings with the most verified reviews, then the rest in Enski's order.
 */
export function filterCatalog(products: Product[], f: CatalogFilters, popularIds: string[] = []): Product[] {
  const cur = f.currency;
  const range = cur && f.price ? PRICE_RANGES[cur].find((r) => r.id === f.price) : undefined;
  const list = products.filter((p) => {
    if (f.type && p.type !== f.type) return false;
    if (f.creator && p.creator?.name !== f.creator) return false;
    if (f.topic && !matchesTopic(p, f.topic)) return false;
    if (f.q && !matchesQuery(p, f.q)) return false;
    if (f.access === "free" && !isFree(p)) return false;
    if (f.access === "paid" && !isPaid(p)) return false;
    if (f.format && formatOf(p.type) !== f.format) return false;
    if (f.region && p.creator?.region !== f.region) return false;
    if (cur) {
      const price = priceIn(p, cur);
      if (!price) return false;
      if (range && (price.current < range.min || price.current > range.max)) return false;
    }
    return true;
  });

  // With a currency picked, every result has a price in it, so sort directly.
  // Otherwise prices can't be compared across currencies: sort within each
  // currency (USD first) and keep unpriced items last.
  const priceOf = (p: Product) => (cur ? priceIn(p, cur) : p.price);
  const currencyRank = (p: Product) => (!p.price ? 2 : p.price.currency === "USD" ? 0 : 1);
  const byPrice = (dir: 1 | -1) => (a: Product, b: Product) =>
    (cur ? 0 : currencyRank(a) - currencyRank(b) || (a.price?.currency ?? "").localeCompare(b.price?.currency ?? "")) ||
    dir * ((priceOf(a)?.current ?? 0) - (priceOf(b)?.current ?? 0));
  switch (f.sort) {
    case "price-asc":
      return [...list].sort(byPrice(1));
    case "price-desc":
      return [...list].sort(byPrice(-1));
    case "title":
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    case "popular": {
      const rank = (p: Product) => {
        const i = popularIds.indexOf(p.id);
        return i === -1 ? popularIds.length : i;
      };
      return [...list].sort((a, b) => rank(a) - rank(b) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    }
    default:
      return list;
  }
}

export function availableTypes(products: Product[]): ResourceType[] {
  const present = new Set(products.map((p) => p.type));
  return TYPE_ORDER.filter((t) => present.has(t));
}

/**
 * Skill collections on the page, matched on whole words in a listing's title, summary and
 * skills (Enski has no collection field). Short terms like "AI" need word boundaries both sides.
 */
export const COLLECTIONS = [
  { id: "ai", name: "Learn AI and build with AI", keywords: ["ai", "artificial intelligence", "chatgpt", "claude", "prompt", "prompt engineering", "llm", "gpt", "machine learning", "vibe coding", "automation"] },
  { id: "product-design", name: "Product management and design", keywords: ["product management", "product manager", "product managers", "ui", "ux", "ui/ux", "figma", "product design", "wireframe", "wireframes", "prototype", "prototypes", "prototyping", "design"] },
  { id: "business", name: "Business and entrepreneurship", keywords: ["business", "startup", "entrepreneur", "entrepreneurship", "founder", "founders", "sales", "strategy", "venture"] },
  { id: "career", name: "Career growth and professional development", keywords: ["career", "interview", "mentorship", "mentor", "professional", "productivity", "leadership", "acceleration", "growth"] },
] as const;

export type CollectionId = (typeof COLLECTIONS)[number]["id"];

export function inCollection(p: Product, id: CollectionId): boolean {
  const c = COLLECTIONS.find((x) => x.id === id);
  if (!c) return false;
  const text = haystack(p);
  return c.keywords.some((k) => {
    const esc = k.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${esc}($|[^a-z0-9])`, "i").test(text);
  });
}

export function availableCreators(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.creator?.name).filter((n): n is string => !!n))].sort();
}

/** Search suggestions: matching titles first, then matching topics. */
export function suggest(products: Product[], q: string, limit = 6) {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const titles = products
    .filter((p) => p.title.toLowerCase().includes(query))
    .slice(0, limit)
    .map((p) => ({ kind: "product" as const, label: p.title, sub: TYPE_LABELS[p.type].label, product: p }));
  const topics = TOPICS.filter((t) => t.name.toLowerCase().includes(query))
    .slice(0, 2)
    .map((t) => ({ kind: "topic" as const, label: t.name, sub: "Topic", topic: t.id as TopicId }));
  return [...titles, ...topics].slice(0, limit);
}
