import coverPrompt from "@/assets/courses/beulahland/prompt-engineering.webp";
import coverUiux from "@/assets/courses/beulahland/uiux-pm.webp";
import coverFigma from "@/assets/courses/beulahland/figma-pm.webp";
import coverVibe from "@/assets/courses/beulahland/vibe-coding-course.webp";
import coverAiTools from "@/assets/courses/beulahland/ai-tools-pm.webp";
import coverFirstProduct from "@/assets/courses/beulahland/first-digital-product.webp";
import coverPm from "@/assets/courses/beulahland/pm-idea-execution.webp";
import coverChatgpt from "@/assets/courses/beulahland/chatgpt-money.webp";
import coverEbookPmBeginners from "@/assets/courses/beulahland/ebook-pm-beginners.webp";
import coverEbookPmToolkit from "@/assets/courses/beulahland/ebook-pm-toolkit.webp";
import coverEbookPm from "@/assets/courses/beulahland/ebook-pm-idea-execution.webp";
import coverEbookChatgptPm from "@/assets/courses/beulahland/ebook-chatgpt-pm.webp";
import coverEbookVibe from "@/assets/courses/beulahland/ebook-vibe-coding-nigeria.webp";
import coverEbookSoup from "@/assets/courses/beulahland/ebook-soup-cookbook.webp";
import coverCoachCareer from "@/assets/courses/beulahland/coaching-pm-career.webp";
import coverCoachAi from "@/assets/courses/beulahland/coaching-ai-product.webp";
import coverCoachPortfolio from "@/assets/courses/beulahland/coaching-portfolio-review.webp";
import beulahlandPhoto from "@/assets/creators/beulahland-ignatius.webp";
import beulahlandCutout from "@/assets/about/team-beulahland-ignatius.webp";
import { slugify } from "./normalize";
import type { Coach, CreatorRegion, Money, Product, PublicationStatus, ResourceType } from "./types";

/**
 * Creator profiles and the demonstration catalogue.
 *
 * Enski lists none of these creators yet. At the client's request they appear as clearly
 * tagged placeholders: Nigerian creators are demo profiles, international educators are real
 * people shown with their public headline only ("Not on Dreamverse yet") and no products.
 * Never add details, photos, prices or listings the client hasn't supplied.
 */

/** demo: sample profile · not_joined: real educator who hasn't joined · enski: sells on Enski today. */
export type CreatorStatus = "demo" | "not_joined" | "enski";

export interface CreatorProfile {
  slug: string;
  name: string;
  headline: string | null;
  bio: string | null;
  region: CreatorRegion | null;
  /** Shown as-is; null when the creator hasn't said. */
  country: string | null;
  expertise: string[];
  avatar: string | null;
  /** Learning community or platform the educator is known for. */
  affiliation: string | null;
  links: { label: string; href: string }[];
  status: CreatorStatus;
}

export const CREATOR_STATUS_LABEL: Record<CreatorStatus, string> = {
  demo: "Preview profile",
  not_joined: "Not on Dreamverse yet",
  enski: "On Enski",
};

const nigerian = (name: string, extra: Partial<CreatorProfile> = {}): CreatorProfile => ({
  slug: slugify(name),
  name,
  headline: null,
  bio: null,
  region: "nigeria",
  country: "Nigeria",
  expertise: [],
  avatar: null,
  affiliation: null,
  links: [],
  status: "demo",
  ...extra,
});

export const BEULAHLAND_SLUG = "beulahland-ignatius";

/** In the client's order. Beulahland sits among the others, not apart. */
export const NIGERIAN_CREATORS: CreatorProfile[] = [
  nigerian("Blossom Affia"),
  nigerian("Dan Otudonkpo"),
  nigerian("Chikamdinaka Ibeh"),
  nigerian("Jennifer Orji"),
  nigerian("Beulahland Ignatius", {
    // Her own photo, supplied by her.
    avatar: beulahlandPhoto,
    headline: "UI/UX Product Manager | AI Product Builder | Digital Product Educator.",
    bio: "I make AI and building digital products ridiculously simple. I teach practical skills that help people work smarter, build digital products, turn ideas into reality and create new opportunities.",
    expertise: [
      "Prompt Engineering",
      "AI for Product Management",
      "UI/UX Design",
      "Product Management",
      "Figma",
      "Vibe Coding",
      "Rapid Prototyping",
      "Digital Product Building",
    ],
  }),
  nigerian("Doris Solomon"),
  nigerian("Tomide Williams"),
  nigerian("Kolapo Imam"),
  nigerian("Precious Obo"),
  nigerian("Fortune Nwosu"),
  nigerian("Inneh Joseph"),
  nigerian("Dr. Vivian Magnus"),
  nigerian("Haoma Worgwu"),
  nigerian("Chioma Amadi"),
];

const educator = (
  name: string,
  headline: string,
  affiliation: string,
  expertise: string[],
  link: { label: string; href: string },
): CreatorProfile => ({
  slug: slugify(name),
  name,
  headline,
  bio: null,
  region: "international",
  country: null,
  expertise,
  avatar: null,
  affiliation,
  links: [link],
  status: "not_joined",
});

/** Real educators, public headline only. None of them has joined Dreamverse. Links checked to resolve. */
export const INTERNATIONAL_EDUCATORS: CreatorProfile[] = [
  educator("Carlos González de Villaumbrosia", "Founder and CEO of Product School", "Product School", ["Product management", "Product leadership"], { label: "productschool.com", href: "https://productschool.com" }),
  educator("Shreyas Doshi", "Product leader, formerly at Stripe, Twitter, Google and Yahoo", "Maven", ["Product management", "Product strategy"], { label: "Maven", href: "https://maven.com/shreyas-doshi" }),
  educator("Andrew Ng", "Founder of DeepLearning.AI and co-founder of Coursera", "Coursera", ["Machine learning", "AI"], { label: "andrewng.org", href: "https://www.andrewng.org" }),
  educator("Michael Wong", "Founder of Designership", "Designership · Figma education", ["UI/UX design", "Figma"], { label: "designership.com", href: "https://designership.com" }),
  educator("Brian Balfour", "Founder and CEO of Reforge", "Reforge", ["Growth", "Product management"], { label: "reforge.com", href: "https://www.reforge.com" }),
  educator("Andrej Karpathy", "AI researcher and educator, founder of Eureka Labs", "Independent AI educator", ["AI", "Neural networks"], { label: "karpathy.ai", href: "https://karpathy.ai" }),
  educator("Riley Brown", "Co-founder of Vibecode and vibe coding educator", "Vibe coding educator", ["Vibe coding", "AI app building"], { label: "vibecodeapp.com", href: "https://www.vibecodeapp.com" }),
  educator("Jakob Nielsen", "Usability pioneer and co-founder of Nielsen Norman Group", "Product design and UX educator", ["Usability", "UX research"], { label: "nngroup.com", href: "https://www.nngroup.com" }),
  educator("Steve Blank", "Lean startup pioneer and Stanford adjunct professor", "Business and entrepreneurship educator", ["Entrepreneurship", "Customer development"], { label: "steveblank.com", href: "https://steveblank.com" }),
];

const DEMO_PROFILES = [...NIGERIAN_CREATORS, ...INTERNATIONAL_EDUCATORS];

const beulah = NIGERIAN_CREATORS.find((c) => c.slug === BEULAHLAND_SLUG)!;
const naira = (amount: number): Money => ({ currency: "NGN", sign: "₦", amount, current: amount, onSale: false });
const FREE = naira(0);
const COURSE_PRICE = naira(10000);
const EBOOK_PRICE = naira(3000);

/** Beulahland's own topic covers (faceless scenes for each subject), keyed by `<type>-<n>`. */
const BEULAHLAND_COVERS: Record<string, string> = {
  "course-1": coverPrompt,
  "course-2": coverUiux,
  "course-3": coverFigma,
  "course-4": coverVibe,
  "course-5": coverAiTools,
  "course-6": coverFirstProduct,
  "course-7": coverPm,
  "course-8": coverChatgpt,
  "ebook-1": coverEbookPmBeginners,
  "ebook-2": coverEbookPmToolkit,
  "ebook-3": coverEbookPm,
  "ebook-4": coverEbookChatgptPm,
  "ebook-5": coverEbookVibe,
  "ebook-6": coverEbookSoup,
  "coaching-1": coverCoachCareer,
  "coaching-2": coverCoachAi,
  "coaching-3": coverCoachPortfolio,
};

function planned(
  n: number,
  type: ResourceType,
  title: string,
  summary: string,
  status: PublicationStatus,
  skills: string[],
  price: Money | null = null,
): Product {
  const id = `demo-${BEULAHLAND_SLUG}-${type}-${n}`;
  return {
    id,
    slug: slugify(title),
    title,
    summary,
    type,
    url: `/creators/${BEULAHLAND_SLUG}#${id}`,
    thumbnail: BEULAHLAND_COVERS[`${type}-${n}`] ?? null,
    creator: { name: beulah.name, avatar: beulah.avatar, slug: beulah.slug, region: beulah.region },
    skills,
    status,
    demo: true,
    price,
    prices: price ? [price] : [],
    rating: null,
    canAddToCart: false,
  };
}

/** Beulahland's courses: most are on sale now; the last two stay Coming soon until they're recorded. */
export const BEULAHLAND_COURSES: Product[] = [
  planned(1, "course", "Prompt Engineering for Everyday Work and Digital Product Building", "Learn how to communicate effectively with AI tools, write better prompts and use AI to accomplish practical tasks.", "published", ["Prompt Engineering", "AI"], COURSE_PRICE),
  planned(2, "course", "UI/UX for Product Managers", "Understand user experience, user research, wireframing, usability, design decisions and how product managers collaborate with designers.", "published", ["UI/UX Design", "Product Management"], COURSE_PRICE),
  planned(3, "course", "Figma for Product Managers: From Wireframes to Interactive Prototypes", "Learn how to use Figma to understand designs, create wireframes, communicate product ideas and build interactive prototypes.", "published", ["Figma", "Rapid Prototyping", "Product Management"], COURSE_PRICE),
  planned(4, "course", "Vibe Coding for Beginners: Turn Ideas into Working Products", "Learn how to use AI-powered development tools to transform ideas into functional digital products.", "published", ["Vibe Coding", "AI", "Digital Product Building"], COURSE_PRICE),
  planned(5, "course", "AI Tools for Product Managers", "Explore ChatGPT, Claude and practical AI workflows for product research, documentation, planning and execution.", "published", ["AI for Product Management", "Product Management"], COURSE_PRICE),
  planned(6, "course", "Build Your First Digital Product with AI", "Go from an idea to a working digital product using AI-assisted research, design, prototyping and development.", "coming_soon", ["Digital Product Building", "AI", "Rapid Prototyping"]),
  planned(7, "course", "Product Management: From Idea to Execution", "Understand the product lifecycle, problem discovery, product requirements, prioritisation, execution and product delivery.", "coming_soon", ["Product Management"]),
];

/** Beulahland's eBooks: the first four are on sale (the beginner's guide is free); the last two are Coming soon. */
export const BEULAHLAND_EBOOKS: Product[] = [
  planned(1, "ebook", "The Beginner's Guide to Product Management", "A plain-language starter on what product managers do, how they think and how to land your first PM role.", "published", ["Product Management"], FREE),
  planned(2, "ebook", "The Product Manager's Practical Toolkit", "Ready-to-use templates, checklists and frameworks for discovery, roadmaps, PRDs and launches.", "published", ["Product Management"], EBOOK_PRICE),
  planned(3, "ebook", "Product Management From Idea to Execution", "A step-by-step guide from spotting a problem worth solving to shipping and measuring the solution.", "published", ["Product Management"], EBOOK_PRICE),
  planned(4, "ebook", "How to Use ChatGPT as a Product Manager", "Prompts and workflows for research, user stories, specs and stakeholder updates, ready to copy.", "published", ["AI for Product Management", "Product Management"], EBOOK_PRICE),
  planned(5, "ebook", "Vibe Coding and AI Website Building: A Practical Guide for Nigerians", "", "coming_soon", ["Vibe Coding", "AI"]),
  planned(6, "ebook", "Nigerian Soup Cookbook", "", "coming_soon", ["Cooking"]),
];

const NGN_5000 = naira(5000);

/** Beulahland's ChatGPT course: priced at ₦5,000 and pinned first in "Trending this week". */
export const BEULAHLAND_CHATGPT: Product = {
  ...planned(
    8,
    "course",
    "How to make money using ChatGPT",
    "Turn ChatGPT into your side income. Step-by-step ways to package your skills, find paying clients and earn from AI — no tech background needed.",
    "published",
    ["ChatGPT", "AI", "Side income"],
  ),
  price: NGN_5000,
  prices: [NGN_5000],
};

/**
 * Beulahland's 1:1 coaching programmes, added at her request. Titles follow her stated expertise;
 * the prices are placeholders until she confirms them.
 */
export const BEULAHLAND_COACHING: Product[] = [
  planned(1, "coaching", "1:1 Product Management Career Coaching", "A focused one-to-one session to map your way into product management: your story, CV, portfolio, interview prep and a clear next-step plan.", "published", ["Product Management", "Career growth"], naira(25000)),
  planned(2, "coaching", "AI Product Building Mentorship", "Bring an idea, leave with a plan. Hands-on mentorship using AI, Figma and vibe coding tools to shape, prototype and launch your digital product.", "published", ["AI for Product Management", "Vibe Coding", "Digital Product Building"], naira(50000)),
  planned(3, "coaching", "UI/UX Portfolio Review", "A live, honest walkthrough of your design or product portfolio, with practical fixes that help hiring managers say yes.", "published", ["UI/UX Design", "Figma"], naira(15000)),
];

/** Every demonstration listing, mixed into the marketplace after Enski's real ones. */
export const DEMO_PRODUCTS: Product[] = [
  BEULAHLAND_CHATGPT,
  ...BEULAHLAND_COURSES,
  ...BEULAHLAND_EBOOKS,
  ...BEULAHLAND_COACHING,
];

const firstProgramme = BEULAHLAND_COACHING[0]!;

/** Beulahland as a coach: featured first in "Coaches and mentors", booking through her programmes above. */
export const BEULAHLAND_COACH: Coach = {
  id: `demo-coach-${BEULAHLAND_SLUG}`,
  name: beulah.name,
  avatar: beulah.avatar,
  cutout: beulahlandCutout,
  headline: beulah.headline,
  bio: beulah.bio,
  slug: BEULAHLAND_SLUG,
  url: `/creators/${BEULAHLAND_SLUG}`,
  sessionCount: BEULAHLAND_COACHING.length,
  expertise: "Product & AI",
  topics: ["Product Management", "AI Product Building", "UI/UX Design", "Figma", "Vibe Coding"],
  featured: true,
  session: {
    title: firstProgramme.title,
    url: firstProgramme.url,
    price: firstProgramme.price,
    prices: firstProgramme.prices,
  },
};

/** Coaches as the section lists them: featured demo coaches first, then Enski's own (no duplicates by name). */
export function coachDirectory(coaches: Coach[]): Coach[] {
  const featured = [BEULAHLAND_COACH];
  const names = new Set(featured.map((c) => c.name.toLowerCase()));
  return [...featured, ...coaches.filter((c) => !names.has(c.name.toLowerCase()))];
}

/** Listings pinned ahead of Enski's own trending list, in order. */
export const PINNED_TRENDING: Product[] = [BEULAHLAND_CHATGPT];

export const STATUS_LABEL: Record<PublicationStatus, string> = {
  published: "Available",
  draft: "Draft",
  coming_soon: "Coming soon",
};

/** Creators who sell on Enski today, built from the live catalogue (name and photo only). */
export function enskiCreators(products: Product[]): CreatorProfile[] {
  const seen = new Map<string, CreatorProfile>();
  for (const p of products) {
    if (p.demo || !p.creator || seen.has(p.creator.slug)) continue;
    seen.set(p.creator.slug, {
      slug: p.creator.slug,
      name: p.creator.name,
      headline: null,
      bio: null,
      region: null,
      country: null,
      expertise: [...new Set(products.filter((x) => x.creator?.slug === p.creator!.slug).flatMap((x) => x.skills))],
      avatar: p.creator.avatar,
      affiliation: null,
      links: [],
      status: "enski",
    });
  }
  return [...seen.values()];
}

/** Live creators lead discovery; matching preview slugs never produce duplicate cards. */
export function creatorDirectory(products: Product[]): CreatorProfile[] {
  const live = enskiCreators(products);
  const liveSlugs = new Set(live.map((creator) => creator.slug));
  return [...live, ...NIGERIAN_CREATORS.filter((creator) => !liveSlugs.has(creator.slug))];
}

/** A creator's profile: demo/educator profiles first, then creators found in the live catalogue. */
export function findCreator(slug: string, products: Product[]): CreatorProfile | null {
  return enskiCreators(products).find((c) => c.slug === slug) ?? DEMO_PROFILES.find((c) => c.slug === slug) ?? null;
}

export function creatorResources(slug: string, products: Product[]): Product[] {
  return products.filter((p) => p.creator?.slug === slug);
}
