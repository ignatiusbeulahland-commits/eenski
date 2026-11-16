import type { Coach, Money, Product, ResourceType } from "./types";

export const ENSKI_ORIGIN = "https://staging.tryenski.com";

type Raw = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** URL-safe handle for a creator's name ("Dr. Vivian Magnus" → "dr-vivian-magnus"). */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function absoluteUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${ENSKI_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Placeholder covers carry no information; treat them as "no image". */
export function usableImage(path: string | null): string | null {
  if (!path || /placeholder\.(jpe?g|png|webp|svg)$/i.test(path) || path.startsWith("data:")) {
    return null;
  }
  return absoluteUrl(path);
}

function toMoney(entry: Raw, fallbackCurrency: string): Money | null {
  const amount = num(entry["amount"]);
  if (amount === null) return null;
  const discounted = num(entry["discounted_price"]);
  const current = discounted !== null && discounted >= 0 && discounted < amount ? discounted : amount;
  return {
    currency: str(entry["currency"]) ?? fallbackCurrency,
    sign: str(entry["sign"]) ?? "",
    amount,
    current,
    onSale: current < amount,
  };
}

const priceEntries = (raw: unknown): Raw[] =>
  Array.isArray(raw) ? raw.filter((p): p is Raw => !!p && typeof p === "object") : [];

/**
 * Pick the price the learner actually pays. Enski product pages charge the
 * discounted price when one exists, so the listing must show the same value.
 * Prefers the default currency, then USD, then the first entry.
 */
export function pickPrice(raw: unknown, preferred = "USD"): Money | null {
  const entries = priceEntries(raw);
  const chosen =
    entries.find((p) => p["is_default"] === true) ??
    entries.find((p) => p["currency"] === preferred) ??
    entries[0];
  return chosen ? toMoney(chosen, preferred) : null;
}

/** Every currency a resource is priced in, one entry per currency. */
export function allPrices(raw: unknown): Money[] {
  const out: Money[] = [];
  for (const e of priceEntries(raw)) {
    const m = toMoney(e, "USD");
    if (m && !out.some((x) => x.currency === m.currency)) out.push(m);
  }
  return out;
}

export function formatMoney(value: number, money: Pick<Money, "currency">): string {
  if (value === 0) return "Free";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currencyDisplay: "narrowSymbol",
      currency: money.currency,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${money.currency} ${value.toLocaleString("en-US")}`;
  }
}

const TYPES: ResourceType[] = ["course", "ebook", "live_training", "coaching", "gig", "digital_product"];

function normalizeRating(raw: unknown): Product["rating"] {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const average = num(r["average"]);
  const count = num(r["count"]) ?? 0;
  if (average === null || count <= 0) return null;
  return { average, count };
}

export function normalizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const id = str(r["id"]);
  const title = str(r["title"]);
  const path = str(r["public_path"]);
  const type = str(r["type"]) as ResourceType | null;
  if (!id || !title || !path || !type || !TYPES.includes(type)) return null;

  const fac = r["facilitator"] && typeof r["facilitator"] === "object" ? (r["facilitator"] as Raw) : null;
  const creatorName = fac ? str(fac["name"]) : null;

  return {
    id,
    slug: str(r["slug"]) ?? id,
    title,
    summary: str(r["summary"]) ?? "",
    type,
    url: absoluteUrl(path)!,
    // Enski's image host blocks embedding, so creator artwork goes through the photo relay.
    thumbnail: (usableImage(str(r["thumbnail"]))),
    creator: creatorName
      ? { name: creatorName, avatar: (usableImage(str(fac?.["avatar"]))), slug: slugify(creatorName), region: null }
      : null,
    skills: str(r["skill_set"]) ? [str(r["skill_set"])!] : [],
    status: "published",
    demo: false,
    price: pickPrice(r["price"]),
    prices: allPrices(r["price"]),
    rating: normalizeRating(r["rating"]),
    canAddToCart: r["can_add_to_cart"] !== false && r["is_owned"] !== true,
  };
}

/** Normalise a list and drop duplicates (same product id or same page URL). */
export function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const item of raw) {
    const p = normalizeProduct(item);
    if (!p || seen.has(p["id"]) || seen.has(p["url"])) continue;
    seen.add(p["id"]);
    seen.add(p["url"]);
    out.push(p);
  }
  return out;
}

export function normalizeCoaches(raw: unknown): Coach[] {
  if (!Array.isArray(raw)) return [];
  const out: Coach[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Raw;
    const id = str(r["id"]);
    const name = str(r["name"]);
    const handle = str(r["slug"]) ?? str(r["username"]);
    if (!id || !name || !handle) continue;
    const s = r["session"] && typeof r["session"] === "object" ? (r["session"] as Raw) : null;
    const sessionPath = s ? str(s["public_path"]) : null;
    out.push({
      id,
      name,
      avatar: (usableImage(str(r["avatar"]))),
      bio: str(r["bio"]),
      url: absoluteUrl(`/coach/${handle}`)!,
      sessionCount: num(r["coaching_count"]) ?? 0,
      expertise: str(r["category"]) ?? (s ? str(s["skill_set"]) : null),
      session:
        s && sessionPath
          ? { title: str(s["title"]) ?? "Coaching session", url: absoluteUrl(sessionPath)!, price: pickPrice(s["price"]), prices: allPrices(s["price"]) }
          : null,
    });
  }
  return out;
}
