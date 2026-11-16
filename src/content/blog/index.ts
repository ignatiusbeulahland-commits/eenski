import { careerSwitching } from "./careers";
import { ebooksVsCourses, expertiseToCourse, webinarLandingPages } from "./creators";
import { aiPrototyping, creativePortfolio, fittingUserResearch } from "./design-product";
import { fashionDesignIsProductManagement } from "./fashion-design-is-product-management";
import { cohortLearning, firstCourse, learningHabit } from "./learning";
import { categories, type Block, type Category, type Post, type PostSource } from "./types";

export { categories };
export type { Block, Category, Post };

const WORDS_PER_MINUTE = 220;

function blockText(b: Block): string {
  switch (b.type) {
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "pairs":
      return b.items.flat().join(" ");
    case "callout":
      return `${b.title} ${b.text}`;
    default:
      return b.text;
  }
}

export function readingMinutes(body: Block[]): number {
  const words = body.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const sources: PostSource[] = [
  fashionDesignIsProductManagement,
  fittingUserResearch,
  aiPrototyping,
  creativePortfolio,
  careerSwitching,
  ebooksVsCourses,
  webinarLandingPages,
  expertiseToCourse,
  cohortLearning,
  firstCourse,
  learningHabit,
];

/** Newest first. */
export const posts: Post[] = sources
  .map((p) => ({ ...p, readMinutes: readingMinutes(p.body) }))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function featuredPost(): Post {
  return posts.find((p) => p.featured) ?? posts[0]!;
}

/** Same category first, then the newest others. */
export function relatedPosts(post: Post, count = 3): Post[] {
  const others = posts.filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.category === post.category);
  const rest = others.filter((p) => p.category !== post.category);
  return [...same, ...rest].slice(0, count);
}

export function filterPosts(list: Post[], category?: Category, query?: string): Post[] {
  const q = query?.trim().toLowerCase();
  return list.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q)),
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
