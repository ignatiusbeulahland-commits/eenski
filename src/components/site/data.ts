import beulahVibeCover from "@/assets/courses/beulahland/vibe-coding-course.webp";
import beulahPmCover from "@/assets/courses/beulahland/pm-idea-execution.webp";
import courseLinkedin from "@/assets/courses/linkedin-visibility.webp";
import courseGigs from "@/assets/courses/get-gigs.webp";
import courseCreator from "@/assets/courses/creator-economy.webp";
import courseCanva from "@/assets/courses/canva-design.webp";
import courseHired from "@/assets/courses/personal-brand-jobs.webp";
import coursePodcast from "@/assets/courses/podcast.webp";
import courseDesign from "@/assets/courses/product-design.webp";
import courseFreelance from "@/assets/courses/freelancing.webp";
import courseReact from "@/assets/courses/react.webp";
import courseMarketing from "@/assets/courses/digital-marketing.webp";
import courseData from "@/assets/courses/data-analysis.webp";
import courseSupport from "@/assets/courses/remote-team.webp";
import courseBrand from "@/assets/courses/brand-storytelling.webp";
import blogCohort from "@/assets/resources/cohort-learning.webp";
import blogHabit from "@/assets/resources/learning-habit.webp";
import blogFirst from "@/assets/resources/first-course.webp";
import blogEbooks from "@/assets/resources/ebooks-vs-courses.webp";
import beulahlandPhoto from "@/assets/creators/beulahland-ignatius.webp";
import avatar1 from "@/assets/photos/avatar-1.webp";
import avatar2 from "@/assets/photos/avatar-2.webp";
import avatar3 from "@/assets/photos/avatar-3.webp";
import avatar4 from "@/assets/photos/avatar-4.webp";
import avatar5 from "@/assets/photos/avatar-5.webp";
import learner1 from "@/assets/community/learner-1.webp";
import learner2 from "@/assets/community/learner-2.webp";
import learner3 from "@/assets/community/learner-3.webp";
import learner4 from "@/assets/community/learner-4.webp";
import learner5 from "@/assets/community/learner-5.webp";

/**
 * Faces in the "5,000+ dreamers" strip — separate from the Stories avatars.
 * Real, unedited photos under the Unsplash License (free commercial use), cropped only:
 * images.unsplash.com/photo-1507152832244-10d45c7eda57, photo-1522529599102-193c0d76b5b6,
 * photo-1756588534346-e8899364757b, photo-1492462543947-040389c4a66c,
 * photo-1611432579402-7037e3e2c1e4. Swap for consented learner photos when available.
 */
export const communityLearners = [learner1, learner2, learner3, learner4, learner5];

export const APP_URL = "https://staging.tryenski.com";

export const links = {
  home: "/",
  dreamverse: "/dreamverse",
  register: "/auth?s=register",
  login: "/auth",
  community: "/dreamers-trybe",
  communityInfo: "/community",
  catalog: `${APP_URL}/catalog`,
  ambassador: "/become-an-ambassador",
  campusAmbassador: "/become-an-ambassador/campus",
  nyscInitiative: "/become-an-ambassador/nysc",
  /** Where people actually apply to be a campus ambassador (live Enski site). */
  apply: `${APP_URL}/campus-ambassadors`,
  features: "/features",
  pricing: "/pricing",
  about: "/about",
  blog: "/blog",
  dreamersTribe: "/dreamers-trybe",
  dreamersDiary: "/#dreamers-diary",
  privacy: "/privacy-policy",
  terms: "/terms",
  faq: "/faq",
  cookies: "/cookies-settings",
  copyright: "/copyright-policy",
  kyc: "/kyc-policy",
};

export type NavChild = { label: string; href: string; description: string };
export type NavItem = { label: string; href?: string; path?: string; children?: NavChild[] };

/** Main menu copied from the Enski Blog project; `path` marks the item shown as the current page here (children match by href). */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/", path: "/" },
  { label: "Dreamverse", href: "/dreamverse", path: "/dreamverse" },
  { label: "Courses", href: "/courses", path: "/courses" },
  {
    label: "For Creators",
    children: [
      { label: "Features", href: links.features, description: "Everything you need to teach and sell" },
      { label: "Pricing", href: links.pricing, description: "Simple plans for every creator" },
    ],
  },
  { label: "Dreamers Diary", href: "/#dreamers-diary" },
  {
    label: "Resources",
    children: [
      { label: "Community", href: links.communityInfo, description: "Meet and grow with fellow dreamers" },
      { label: "Blog", href: links.blog, description: "Insights, guides and stories" },
      { label: "About Us", href: links.about, description: "Our story and mission" },
      { label: "FAQ", href: links.faq, description: "Answers to common questions" },
      { label: "Verify a Certificate", href: "/verify", description: "Check an Enski certificate or badge ID" },
    ],
  },
  { label: "Become An Ambassador", href: links.ambassador, path: "/become-an-ambassador" },
];

export const socials = [
  { label: "Facebook", href: "https://facebook.com/enskiacademy" },
  { label: "Instagram", href: "https://instagram.com/enskiacademy" },
  { label: "Twitter", href: "https://twitter.com/enskiacademy" },
  { label: "LinkedIn", href: "https://linkedin.com/company/enskiacademy" },
  { label: "YouTube", href: "https://youtube.com/@enskiacademy" },
] as const;

export type Category = "Tech" | "Business" | "Career" | "Design" | "Creativity";

export type Product = {
  title: string;
  creator: string;
  /** Short credential shown under the creator's name */
  creatorRole?: string;
  /** The creator's own photo; only set when they supplied it. */
  creatorPhoto?: string;
  /** The outcome the course promises, one sentence */
  promise: string;
  type: "Course" | "Ebook";
  category: Category;
  price: number;
  rating: number;
  badge?: "Trending" | "New" | "Bestseller";
  /** Shown in the homepage marketplace preview */
  featured?: boolean;
  image: string;
  imageAlt: string;
};

export const products: Product[] = [
  {
    title: "LinkedIn visibility: get seen, get chosen, get paid",
    creator: "Blossom Affia",
    creatorRole: "LinkedIn visibility strategist",
    promise:
      "Turn your profile and posts into a magnet for recruiters, clients and paid opportunities, without posting every day.",
    type: "Course",
    category: "Career",
    price: 30000,
    rating: 4.9,
    badge: "Trending",
    featured: true,
    image: courseLinkedin,
    imageAlt: "Phone showing the LinkedIn logo on a desk",
  },
  {
    title: "How to get gigs: the Sales Doctor's client playbook",
    creator: "Dr Dann Odotukpono",
    creatorRole: "The Sales Doctor",
    promise:
      "Find, pitch and close paying clients for your skill with proven outreach scripts and follow-ups that turn chats into contracts.",
    type: "Course",
    category: "Business",
    price: 32000,
    rating: 4.8,
    badge: "Bestseller",
    featured: true,
    image: courseGigs,
    imageAlt: "Two people shaking hands to close a deal",
  },
  {
    title: "Vibe coding: ship a real app in 7 days, no code needed",
    creator: "Beulahland Ignatius",
    creatorRole: "UI/UX product manager & AI builder",
    creatorPhoto: beulahlandPhoto,
    promise:
      "Go from idea to a live app you can show employers, clients or customers, in one week, building with AI tools like Lovable.",
    type: "Course",
    category: "Tech",
    price: 35000,
    rating: 4.9,
    badge: "Bestseller",
    featured: true,
    image: beulahVibeCover,
    imageAlt: "Laptop showing code beside a lime plant pot and a blue mug",
  },
  {
    title: "The creator economy: turn what you know into income",
    creator: "Salem King",
    creatorRole: "The creator's creator",
    promise:
      "Package your knowledge into products people pay for, and build the audience that keeps buying.",
    type: "Course",
    category: "Creativity",
    price: 35000,
    rating: 4.8,
    badge: "Trending",
    featured: true,
    image: courseCreator,
    imageAlt: "Camera, monitor and microphone set up on a desk for filming",
  },
  {
    title: "Canva design that sells",
    creator: "Jasmine Gathoga",
    creatorRole: "The Canva Girl",
    promise: "Design scroll-stopping posts, brand kits and sales pages in Canva, even if you've never designed before.",
    type: "Course",
    category: "Design",
    price: 20000,
    rating: 4.8,
    badge: "New",
    image: courseCanva,
    imageAlt: "Tablet and stylus ready for design work",
  },
  {
    title: "Storytelling that gets you hired",
    creator: "Precious Obo",
    creatorRole: "Storytelling & personal brand coach",
    promise: "Rewrite your CV, profile and interview answers as stories that make employers say yes.",
    type: "Ebook",
    category: "Career",
    price: 8000,
    rating: 4.7,
    image: courseHired,
    imageAlt: "Clipboard with a résumé checklist beside a laptop",
  },
  {
    title: "Product management: land your first PM role",
    creator: "Beulahland Ignatius",
    creatorRole: "UI/UX product manager & AI builder",
    creatorPhoto: beulahlandPhoto,
    promise:
      "Learn the frameworks hiring managers test for, build a portfolio case study and walk into PM interviews ready.",
    type: "Course",
    category: "Career",
    price: 40000,
    rating: 4.9,
    badge: "New",
    featured: true,
    image: beulahPmCover,
    imageAlt: "Whiteboard product roadmap from first quarter to MVP launch",
  },
  {
    title: "Advanced React patterns & architecture",
    creator: "Tunde Bakare",
    promise: "Write React apps that stay fast and clean as they grow, the way senior engineers do.",
    type: "Course",
    category: "Tech",
    price: 45000,
    rating: 4.8,
    featured: true,
    image: courseReact,
    imageAlt: "Laptop screen full of code in a dark blue room",
  },
  {
    title: "Product design with Figma, from zero",
    creator: "Ada Nwosu",
    promise: "Design your first three portfolio-ready app screens and learn the workflow studios hire for.",
    type: "Course",
    category: "Design",
    price: 38000,
    rating: 4.9,
    featured: true,
    image: courseDesign,
    imageAlt: "Hands typing on a blue laptop at a round table",
  },
  {
    title: "Start a podcast people actually finish",
    creator: "Seun Akande",
    promise: "Plan, record and launch a show listeners stay for, with gear you can afford.",
    type: "Course",
    category: "Creativity",
    price: 25000,
    rating: 4.7,
    featured: true,
    image: coursePodcast,
    imageAlt: "Podcaster smiling at his microphone in a home studio",
  },
  {
    title: "Freelancing: land your first five clients",
    creator: "Zainab Musa",
    promise: "Set your rates, build a simple offer and win your first five paying clients.",
    type: "Ebook",
    category: "Business",
    price: 7500,
    rating: 4.8,
    image: courseFreelance,
    imageAlt: "Young woman working on her laptop at a desk",
  },
  {
    title: "Data analysis with Excel and SQL",
    creator: "Kemi Adeyemi",
    promise: "Clean, query and chart real business data, and present findings managers act on.",
    type: "Course",
    category: "Tech",
    price: 30000,
    rating: 4.6,
    image: courseData,
    imageAlt: "Analyst working on a laptop full of charts",
  },
  {
    title: "Digital marketing that converts",
    creator: "Efua Mensah",
    promise: "Run ads and content that bring real sales, not just likes.",
    type: "Course",
    category: "Business",
    price: 28000,
    rating: 4.7,
    image: courseMarketing,
    imageAlt: "Juice shop owner checking her phone in her shop",
  },
  {
    title: "Brand storytelling for creators",
    creator: "Nkechi Obi",
    promise: "Find your story and tell it in a way that makes people follow, trust and buy.",
    type: "Ebook",
    category: "Design",
    price: 5000,
    rating: 4.9,
    image: courseBrand,
    imageAlt: "Young woman in a blue jacket writing in her notebook outdoors",
  },
  {
    title: "The remote team handbook",
    creator: "Amaka Eze",
    promise: "Get hired by, and thrive in, remote teams anywhere in the world.",
    type: "Ebook",
    category: "Business",
    price: 4000,
    rating: 4.5,
    image: courseSupport,
    imageAlt: "Woman smiling and waving on a video call",
  },
];

export const featuredProducts = products.filter((p) => p.featured);

export const categories: Array<"All" | Category> = ["All", "Tech", "Business", "Career", "Design", "Creativity"];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "The UX bootcamp gave me a portfolio piece that landed me three interviews in a month.",
    name: "Olumide Adeyinka",
    role: "Product designer",
    avatar: avatar3,
  },
  {
    quote:
      "I paid in small bits and still finished the whole course. Two months later I'm building websites for paying clients.",
    name: "Amara Okafor",
    role: "Frontend developer",
    avatar: avatar1,
  },
  {
    quote:
      "I uploaded my first ebook on a Sunday and made my first sale before Monday. Enski just works.",
    name: "Aisha Bello",
    role: "Entrepreneur",
    avatar: avatar2,
  },
  {
    quote:
      "My students join live, get reminders and pay without me chasing anyone. I finally just teach.",
    name: "Kwame Asante",
    role: "Business coach",
    avatar: avatar4,
  },
  {
    quote:
      "Lessons load fast even on my data plan. I learned cloud basics on the bus to work.",
    name: "Femi Oladele",
    role: "Cloud engineer",
    avatar: avatar5,
  },
];

export const posts = [
  {
    title: "How to build a learning habit that sticks",
    slug: "how-to-build-a-learning-habit-that-sticks",
    tag: "Learning",
    read: "5 min read",
    image: blogHabit,
    imageAlt: "Study desk with a habit-tracker app, ticked planner and a cobalt coffee mug",
  },
  {
    title: "Choosing your first online course",
    slug: "choosing-your-first-online-course",
    tag: "Guides",
    read: "4 min read",
    image: blogFirst,
    imageAlt: "Laptop showing a grid of online courses beside headphones and a notebook",
  },
  {
    title: "Ebooks vs courses: which should you sell first?",
    slug: "ebooks-vs-courses-which-should-you-sell-first",
    tag: "Creators",
    read: "6 min read",
    image: blogEbooks,
    imageAlt: "Tablet with an ebook next to a phone playing a video lesson",
  },
  {
    title: "Why cohort-based learning works",
    slug: "why-cohort-based-learning-works",
    tag: "Community",
    read: "5 min read",
    image: blogCohort,
    imageAlt: "Round table set up for a group study session with laptops and sticky notes",
  },
];

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** URL key of a course or ebook's details page (`/courses/<slug>`), from its title. */
export const productSlug = (p: Pick<Product, "title">) =>
  p.title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const findProductBySlug = (slug: string) => products.find((p) => productSlug(p) === slug) ?? null;

/* ---------- Log in / register page (/auth) ---------- */

export type AccountType = "learner" | "creator" | "affiliate";
/** Who someone joins as. Facilitators are creators (live training, coaching, certificates), not a role of their own. */
export type JoinRole = AccountType;
export const dashboardTypeOf = (role: JoinRole): AccountType => role;
/** Reads a saved or linked role; the old "facilitator" choice now means creator. */
export function joinRoleFrom(v: unknown): JoinRole | undefined {
  if (v === "facilitator") return "creator";
  return v === "learner" || v === "creator" || v === "affiliate" ? v : undefined;
}

type AuthChipIcon = "analytics" | "trophy" | "cart" | "profile" | "wallet" | "megaphone";

/** The three account types used across the site; picked on the /auth page. */
export const accountTypes: { id: AccountType; label: string; blurb: string }[] = [
  { id: "learner", label: "Learner", blurb: "Take courses" },
  { id: "creator", label: "Creator", blurb: "Sell what you know" },
  { id: "affiliate", label: "Affiliate", blurb: "Share and earn" },
];
/** The three ways to join, shown on /auth. Facilitators join as creators. */
export const joinRoles: { id: JoinRole; label: string; blurb: string }[] = [
  { id: "learner", label: "Learner", blurb: "Take courses" },
  { id: "creator", label: "Creator", blurb: "Sell, teach or coach" },
  { id: "affiliate", label: "Affiliate", blurb: "Share and earn" },
];
export const roleLabelOf = (role: JoinRole) => joinRoles.find((r) => r.id === role)?.label ?? "Learner";

/** Left-panel story on /auth for each account type. Chip figures are illustrative. */
export const authShowcase: Record<
  JoinRole,
  {
    eyebrow: string;
    headline: string;
    /** End of the headline, shown in lime. */
    highlight: string;
    body: string;
    chips: [
      { icon: AuthChipIcon; subtitle: string; title: string },
      { icon: AuthChipIcon; subtitle: string; title: string },
    ];
  }
> = {
  learner: {
    eyebrow: "For learners",
    headline: "Learn skills that",
    highlight: "move you forward",
    body: "Access courses, track your progress and grow with creators across Africa and the world.",
    chips: [
      { icon: "analytics", subtitle: "Course progress", title: "68% done" },
      { icon: "trophy", subtitle: "Just earned", title: "Certificate" },
    ],
  },
  creator: {
    eyebrow: "For creators",
    headline: "Turn what you know",
    highlight: "into income",
    body: "Sell courses and ebooks, run live training and coaching, and get paid fast, all from one place.",
    chips: [
      { icon: "cart", subtitle: "New sale", title: "₦45,000" },
      { icon: "profile", subtitle: "This week", title: "+24 learners" },
    ],
  },
  affiliate: {
    eyebrow: "For affiliates",
    headline: "Share Enski and",
    highlight: "earn as you grow",
    body: "Bring dreamers into the Trybe and earn rewards every time someone you invite joins.",
    chips: [
      { icon: "wallet", subtitle: "Referral reward", title: "₦10,000" },
      { icon: "megaphone", subtitle: "Friends joined", title: "12 this month" },
    ],
  },
};

export const phoneCodes = [
  { code: "+234", country: "Nigeria", iso: "NG" },
  { code: "+233", country: "Ghana", iso: "GH" },
  { code: "+254", country: "Kenya", iso: "KE" },
  { code: "+27", country: "South Africa", iso: "ZA" },
  { code: "+256", country: "Uganda", iso: "UG" },
  { code: "+250", country: "Rwanda", iso: "RW" },
  { code: "+44", country: "United Kingdom", iso: "GB" },
  { code: "+1", country: "United States", iso: "US" },
];
