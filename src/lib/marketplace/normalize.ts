import { allPrices, pickPrice } from "@/lib/dreamverse/normalize";
import type { Product } from "@/lib/dreamverse/types";
import type { CourseDetail, CourseLesson, CourseModule, MarketCourse } from "./types";

type Raw = Record<string, unknown>;

const obj = (v: unknown): Raw | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : null);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(str).filter((s): s is string => !!s) : [];

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };

/**
 * Creators write descriptions in a rich-text editor, so Enski stores HTML. The page shows
 * plain paragraphs: block ends and <br> become line breaks, every other tag is dropped.
 */
export function plainText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6]|blockquote)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const code = e[1]?.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .split("\n")
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const text = (v: unknown): string | null => {
  const s = str(v);
  return s ? plainText(s) || null : null;
};

/**
 * Only courses the creator has published and Enski has approved for Dreamverse are public.
 * Suspended, hidden, draft or unreviewed courses are never listed or given a page.
 */
export function isPubliclyListed(raw: unknown): boolean {
  const r = obj(raw);
  if (!r) return false;
  return (
    r["status"] === "published" &&
    r["dreamverse_status"] === "approved" &&
    r["is_publicly_visible"] !== false &&
    !r["suspended_at"]
  );
}

/** The Enski path of a listing's product page (`/course/<handle>/<slug>`), or null. */
export function coursePath(listing: Pick<Product, "url">): string | null {
  try {
    const path = new URL(listing.url).pathname;
    return /^\/course\/[\w.-]+\/[\w.-]+\/?$/.test(path) ? path.replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

function lessonsOf(raw: unknown): CourseLesson[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(obj)
    .filter((v): v is Raw => !!v)
    .sort((a, b) => (num(a["sort_order"]) ?? 0) - (num(b["sort_order"]) ?? 0))
    .map((v) => ({
      // Only titles and outlines are shared; lesson videos and files stay on Enski behind purchase.
      title: str(v["title"]) ?? "Lesson",
      description: str(v["description"]),
      durationSeconds: num(v["duration_seconds"]),
      preview: v["is_locked"] === false,
    }));
}

export function modulesOf(raw: unknown): CourseModule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(obj)
    .filter((m): m is Raw => !!m)
    .map((m) => ({ title: str(m["title"]) ?? "Module", description: str(m["description"]), lessons: lessonsOf(m["videos"]) }));
}

function durationOf(breakdown: Raw | null, modules: CourseModule[]): number | null {
  const total = num(breakdown?.["total_duration_seconds"]);
  if (total && total > 0 && breakdown?.["has_unknown_duration"] !== true) return total;
  const lessons = modules.flatMap((m) => m.lessons);
  if (lessons.length === 0 || lessons.some((l) => !l.durationSeconds)) return null;
  return lessons.reduce((sum, l) => sum + (l.durationSeconds ?? 0), 0);
}

function ratingOf(raw: unknown): { rating: Product["rating"]; breakdown: number[] | null } {
  const r = obj(raw);
  const average = num(r?.["average"]);
  const count = num(r?.["count"]) ?? 0;
  if (average === null || count <= 0) return { rating: null, breakdown: null };
  const rates = Array.isArray(r?.["rates"]) ? (r!["rates"] as unknown[]).map((n) => num(n) ?? 0) : [];
  // Enski lists 1-star first; show 5 stars first.
  return { rating: { average, count }, breakdown: rates.length === 5 ? [...rates].reverse() : null };
}

/**
 * Builds a public course from its Dreamverse listing and Enski's course page data.
 * Returns null when the course isn't published and approved.
 * Without page data (Enski didn't answer) the listing alone is used: it only appears in
 * Enski's public Dreamverse list once approved.
 */
export function normalizeCourse(listing: Product, raw: unknown, trendingRank: number | null = null): CourseDetail | null {
  if (listing.type !== "course" || listing.demo || listing.status !== "published") return null;
  const r = obj(raw);
  if (r && !isPubliclyListed(r)) return null;

  const breakdown = obj(r?.["breakdown"]);
  const modules = modulesOf(r?.["modules"]);
  const { rating, breakdown: ratingBreakdown } = ratingOf(r?.["rating"]);
  const prices = r ? allPrices(r["price"]) : listing.prices;
  const price = r ? pickPrice(r["price"], str(r["default_currency"]) ?? "USD") : listing.price;
  const category = str(breakdown?.["skill_set"]) ?? str(breakdown?.["programme"]) ?? listing.skills[0] ?? null;
  const certificate = typeof r?.["has_certificate"] === "boolean" ? (r["has_certificate"] as boolean)
    : typeof r?.["certificate"] === "boolean" ? (r["certificate"] as boolean) : null;

  return {
    slug: listing.slug,
    listing: {
      ...listing,
      summary: str(r?.["summary"]) ?? listing.summary,
      skills: category ? [...new Set([category, ...listing.skills])] : listing.skills,
      // The course page has the latest prices and ratings.
      price: price ?? listing.price,
      prices: prices.length > 0 ? prices : listing.prices,
      rating: rating ?? listing.rating,
      canAddToCart: r ? r["can_add_to_cart"] !== false && r["is_owned"] !== true : listing.canAddToCart,
    },
    category,
    level: str(r?.["level"]) ?? str(r?.["difficulty"]) ?? str(r?.["difficulty_level"]),
    language: str(r?.["language"]),
    durationSeconds: durationOf(breakdown, modules),
    lessonCount: modules.reduce((n, m) => n + m.lessons.length, 0) || (num(breakdown?.["video_count"]) ?? 0),
    students: num(breakdown?.["student_count"]),
    publishedAt: str(r?.["published_date"]) ?? str(r?.["launch_date"]),
    tags: list(r?.["tags"]),
    trendingRank,
    description: text(r?.["full_description"]) ?? text(r?.["description"]) ?? listing.summary,
    outcomes: list(r?.["course_highlights"]),
    bonuses: list(r?.["course_bonuses"]),
    audience: list(r?.["audience"]),
    requirements: list(r?.["requirement"]),
    modules,
    certificate,
    ratingBreakdown,
  };
}

/** The card-sized part of a course (the marketplace never ships curricula). */
export function toMarketCourse(c: CourseDetail): MarketCourse {
  return {
    slug: c.slug,
    listing: c.listing,
    category: c.category,
    level: c.level,
    language: c.language,
    durationSeconds: c.durationSeconds,
    lessonCount: c.lessonCount,
    students: c.students,
    publishedAt: c.publishedAt,
    tags: c.tags,
    trendingRank: c.trendingRank,
  };
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${Math.max(m, 1)} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** "2h 30m" when Enski shares the running time, else "12 lessons". */
export function courseLength(c: Pick<MarketCourse, "durationSeconds" | "lessonCount">): string | null {
  return formatDuration(c.durationSeconds) ?? (c.lessonCount > 0 ? `${c.lessonCount} ${c.lessonCount === 1 ? "lesson" : "lessons"}` : null);
}
