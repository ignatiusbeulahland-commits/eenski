import { itemSchema, stateSchema, type CreatorItem, type CreatorState } from "./rules";

/**
 * Sample storefront content: one sample creator page that opens in any browser, and the
 * sample products a creator can switch on in their page preview. Never counted as sales.
 */
export const SAMPLE_HANDLE = "sample-creator";
export const SITE_ORIGIN = "https://eenski.lovable.app";
const img = (f: string) => `/demo/enski/${f}`;

const raw: Array<Partial<CreatorItem> & Pick<CreatorItem, "id" | "kind" | "title" | "price">> = [
  { id: "sample-course", kind: "course", title: "Brand Design Foundations", price: 25000, image: img("course-nf6stccmzl7j.webp"), category: "Design", description: "Learn to build a simple, confident brand from logo to colours, with real client briefs.", lessons: ["Welcome", "Finding the idea", "Logo sketching", "Colour and type", "Putting it together", "Your first client"] },
  { id: "sample-ebook", kind: "ebook", title: "The Freelancer's Pricing Playbook", price: 6500, image: img("ebook-czxfztwkgz9u.webp"), category: "Business", description: "A practical guide to pricing your work, with ready-to-use quote templates." },
  { id: "sample-live", kind: "live", title: "Portfolio Review Live Workshop", price: 10000, image: img("live-training-up3b33soqyac.webp"), category: "Workshop", description: "Bring your portfolio and get honest, live feedback in a small group.", capacity: 40, date: "" },
  { id: "sample-coaching", kind: "coaching", title: "1:1 Career Coaching", price: 20000, image: img("gig-lbscofrh2yvx.webp"), category: "Career", description: "A focused call to plan your next career move.", duration: 45 },
  { id: "sample-service", kind: "service", title: "Logo & Brand Kit Design", price: 45000, image: img("gig-us5kaahhw0e5.webp"), category: "Design", description: "A logo, colour palette and type pairing, delivered as a ready-to-use kit.", duration: 5 },
  { id: "sample-ebook-2", kind: "ebook", title: "Social Media Content Planner", price: 3500, image: img("ebook-jqiiizjvnobu.webp"), category: "Marketing", description: "A 90-day planner with prompts, calendars and caption ideas." },
];

/** Live sample dates are always in the future (Lagos time), worked out when called. */
function nextDate(now: Date, days: number) {
  const d = new Date(now.getTime() + days * 86_400_000);
  return `${d.toISOString().slice(0, 10)}T18:00`;
}

export function sampleItems(now = new Date()): CreatorItem[] {
  return raw.map((r) => itemSchema.parse({
    description: "", category: "", status: "published", image: "", lessons: [], date: r.kind === "live" ? nextDate(now, 12) : "", capacity: 0, createdAt: "2026-01-01T00:00:00.000Z",
    ...r,
    ...(r.kind === "live" ? { date: nextDate(now, 12) } : {}),
  }));
}

export const SAMPLE_PAGE: Pick<CreatorState["storePage"], "bio" | "achievements" | "testimonials"> = {
  bio: "I'm a brand designer who has helped small businesses across Lagos and beyond look as good as they are. I teach the same simple process I use with clients, so you can design with confidence.\n\nThis is a sample creator page that shows how an Enski storefront looks.",
  achievements: [
    { id: "s-a1", title: "2,500+ students trained", detail: "Across courses and workshops" },
    { id: "s-a2", title: "120 brands designed", detail: "For small businesses" },
    { id: "s-a3", title: "4.9 average rating", detail: "From sample reviews" },
  ],
  testimonials: [
    { id: "s-t1", name: "Sample learner", quote: "Clear, practical and easy to follow. I designed my first logo in a week.", itemId: "sample-course", rating: 5 },
    { id: "s-t2", name: "Sample client", quote: "The brand kit was delivered early and looked fantastic.", itemId: "sample-service", rating: 5 },
  ],
};

/** Fills only what the creator hasn't added yet, so a preview with sample data shows the whole page. */
export function withSamplePage(page: CreatorState["storePage"]): CreatorState["storePage"] {
  return {
    ...page,
    bio: page.bio.trim() ? page.bio : SAMPLE_PAGE.bio,
    achievements: page.achievements.some((a) => a.title.trim()) ? page.achievements : SAMPLE_PAGE.achievements,
    testimonials: page.testimonials.some((t) => t.quote.trim()) ? page.testimonials : SAMPLE_PAGE.testimonials,
    featuredId: page.featuredId || "sample-course",
  };
}

/** The sample creator's public page details (safe on the server: plain data). */
export const SAMPLE_CREATOR = {
  handle: SAMPLE_HANDLE,
  name: "Sample Creator Studio",
  owner: "Sample Creator",
  tagline: "Brand design courses, guides and coaching",
  about: "Helping small businesses look as good as they are. A sample page showing how Enski storefronts work.",
  photo: img("avatar-fw8okajxfpax.webp"),
  banner: img("course-qkodrpp685kz.webp"),
};

export function samplePage(): CreatorState["storePage"] {
  return withSamplePage({ ...stateSchema.shape.storePage.parse(undefined), accent: "cobalt", socials: { instagram: "", youtube: "", linkedin: "", tiktok: "", x: "" } });
}
