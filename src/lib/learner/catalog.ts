import { dayKeyIn, EVENT_TZ } from "./timezone";
import { products, type Category } from "@/lib/affiliate/products";
import workshop from "@/assets/dashboard/events/workshop.webp";
import webinar from "@/assets/dashboard/events/webinar.webp";
import meetup from "@/assets/dashboard/events/meetup.webp";
import sprint from "@/assets/dashboard/events/design-sprint.webp";
import aiWorkshop from "@/assets/dashboard/events/ai-workshop.webp";
import aiWorkshopThumb from "@/assets/dashboard/events/ai-workshop-640.webp";
import careerFair from "@/assets/dashboard/events/career-fair.webp";
import careerFairThumb from "@/assets/dashboard/events/career-fair-640.webp";
import masterclass from "@/assets/dashboard/events/masterclass.webp";
import masterclassThumb from "@/assets/dashboard/events/masterclass-640.webp";
import designJam from "@/assets/dashboard/events/design-jam.webp";
import designJamThumb from "@/assets/dashboard/events/design-jam-640.webp";
import fireside from "@/assets/dashboard/events/fireside.webp";
import firesideThumb from "@/assets/dashboard/events/fireside-640.webp";
import roundtable from "@/assets/dashboard/events/roundtable.webp";
import roundtableThumb from "@/assets/dashboard/events/roundtable-640.webp";
import podcast from "@/assets/dashboard/products/podcast.webp";
import planner from "@/assets/dashboard/learner/content-planner.webp";
import cvCoaching from "@/assets/dashboard/learner/cv-coaching.webp";
import proposalKit from "@/assets/dashboard/learner/proposal-kit.webp";
import portfolioReview from "@/assets/dashboard/learner/portfolio-review.webp";
import pitchDeck from "@/assets/dashboard/learner/pitch-deck.webp";
import promptLibrary from "@/assets/dashboard/learner/prompt-library.webp";
import speaking from "@/assets/dashboard/learner/speaking-coaching.webp";

/** Demo catalogue shown to learners. It is browseable sample content, not account activity. */
export type ResourceUnit = {
  id: string;
  title: string;
  minutes: number;
  /** Exact running time from the course page, when the creator shared one. */
  seconds?: number | undefined;
  /** The creator's own summary of the lesson. */
  description?: string | undefined;
  /** Module (section) this lesson sits in. */
  module?: string | undefined;
  /** Open to watch before buying. */
  preview?: boolean | undefined;
  /** What the lesson is: video, reading, a file or a step. */
  kind?: "video" | "text" | "download" | "quiz" | undefined;
  /** Creator-uploaded video kept on this device. */
  mediaId?: string | undefined;
  /** Days after purchase when it opens (creator's drip schedule). */
  unlockDay?: number | undefined;
};
/** The creator's final quiz. `required` = pass it to complete the course and earn the certificate. */
export type ResourceQuiz = { passMark: number; required: boolean; questions: { id: string; prompt: string; options: string[]; answer: number }[] };
export type ResourceType = "Course" | "Ebook" | "Template" | "Coaching";
export type LearnerResource = {
  id: string;
  title: string;
  creator: string;
  description: string;
  type: ResourceType;
  category: Category;
  price: number;
  /** Demo list price before a promotion; shown struck through. */
  originalPrice?: number;
  /** Demo catalogue rating, shown only where provided. */
  rating?: number;
  reviews?: number;
  tag?: "Bestseller" | "New" | "Limited offer";
  image: string;
  imageAlt: string;
  units: ResourceUnit[];
  /** Completing it counts towards learning badges. */
  eligible: boolean;
  /** The Creator issues a completion certificate (courses only). */
  certificate: boolean;
  downloadable: boolean;
  /** Final quiz the creator set, when there is one. */
  quiz?: ResourceQuiz | undefined;
  /** Bought through the sitewide checkout: where its public page lives, for reviews. */
  publicRoute?: { kind: "course" | "dreamverse" | "store"; slug: string; item?: string | undefined } | undefined;
};

const unitTitles: Record<string, string[]> = {
  "linkedin-visibility": ["Audit your profile in 20 minutes", "Headlines recruiters notice", "Posting without burning out", "Turning views into conversations"],
  "get-gigs": ["Pick a clear offer", "Find clients who already need you", "Outreach scripts that get replies", "Follow-ups that close"],
  "vibe-coding": ["Shape your app idea", "Build screens with AI tools", "Connect the pieces", "Launch and share your app"],
  "creator-economy": ["What people will pay for", "Package your first product", "Grow an audience that buys", "Price with confidence"],
  "canva-design": ["Canva basics that matter", "Build a brand kit", "Posts that stop the scroll", "Design a simple sales page"],
  "storytelling-hired": ["Why stories get you hired", "Rewrite your CV as a story", "Interview answers that land"],
  "react-patterns": ["Composition over configuration", "State that scales", "Performance patterns", "Architecture for growing apps"],
  "figma-design": ["Figma from zero", "Layouts and auto layout", "Your first app screen", "Prepare a portfolio case study"],
  podcast: ["Plan a show people finish", "Affordable recording setup", "Edit in an afternoon", "Launch your first episodes"],
  freelancing: ["Set your rates", "Build a simple offer", "Win your first five clients"],
};

/** Demo ratings and promotions for the sample catalogue (not account data). */
const demoMeta: Record<string, Pick<LearnerResource, "rating" | "reviews" | "originalPrice" | "tag">> = {
  "linkedin-visibility": { rating: 4.8, reviews: 214, tag: "Bestseller" },
  "get-gigs": { rating: 4.7, reviews: 168, originalPrice: 40000 },
  "vibe-coding": { rating: 4.9, reviews: 302, tag: "Bestseller" },
  "creator-economy": { rating: 4.6, reviews: 97 },
  "canva-design": { rating: 4.7, reviews: 143, originalPrice: 28000, tag: "Limited offer" },
  "storytelling-hired": { rating: 4.5, reviews: 61 },
  "react-patterns": { rating: 4.8, reviews: 88 },
  "figma-design": { rating: 4.6, reviews: 112, tag: "New" },
  podcast: { rating: 4.4, reviews: 39 },
  freelancing: { rating: 4.6, reviews: 74, originalPrice: 10000 },
};

export const unitWord = (type: ResourceType, plural = false) => {
  const w = { Course: "lesson", Ebook: "chapter", Template: "file", Coaching: "step" }[type];
  return plural ? `${w}s` : w;
};

const fromProducts: LearnerResource[] = products.map((p) => ({
  id: p.id,
  title: p.title,
  creator: p.creator,
  description: p.promise,
  type: p.type,
  category: p.category,
  price: p.price,
  image: p.image,
  imageAlt: p.imageAlt,
  units: (unitTitles[p.id] ?? ["Introduction", "Core lessons", "Putting it into practice"]).map((title, i) => ({
    id: `${p.id}-${i + 1}`,
    title,
    minutes: p.type === "Course" ? 12 + i * 4 : 8 + i * 3,
  })),
  eligible: true,
  certificate: p.type === "Course",
  downloadable: p.type === "Ebook",
  ...demoMeta[p.id],
}));

type Extra = Omit<LearnerResource, "units" | "eligible" | "certificate" | "downloadable"> & { unitTitles: string[] };
const extras: Extra[] = [
  { id: "content-planner", title: "90-day content planner for creators", creator: "Salem King", description: "A ready-to-use Notion and Sheets planner to map posts, launches and product drops for the next three months.", type: "Template", category: "Creativity", price: 6500, originalPrice: 9000, rating: 4.8, reviews: 126, tag: "Limited offer", image: planner, imageAlt: "Laptop on a desk showing a colourful content calendar", unitTitles: ["Planner template", "Launch checklist", "Weekly review sheet"] },
  { id: "cv-linkedin-review", title: "1:1 CV & LinkedIn review (45 min)", creator: "Blossom Affia", description: "Send your CV and profile, then meet for a focused review and leave with a written action plan.", type: "Coaching", category: "Career", price: 25000, rating: 4.9, reviews: 58, tag: "New", image: cvCoaching, imageAlt: "Career coach smiling on a video call while reading a CV", unitTitles: ["Share your CV and goals", "45-minute review call", "Your written action plan"] },
  { id: "proposal-invoice-kit", title: "Freelance proposal & invoice kit", creator: "Zainab Musa", description: "Editable proposal, contract and invoice templates that make you look established from your first client.", type: "Template", category: "Business", price: 5000, rating: 4.7, reviews: 203, tag: "Bestseller", image: proposalKit, imageAlt: "Proposal and invoice documents beside a calculator and phone", unitTitles: ["Proposal template", "Simple contract", "Invoice template", "Pricing worksheet"] },
  { id: "portfolio-review", title: "Design portfolio review with a senior designer", creator: "Ada Nwosu", description: "A live walkthrough of your case studies with honest feedback on story, visuals and what hiring teams look for.", type: "Coaching", category: "Design", price: 30000, originalPrice: 35000, rating: 4.8, reviews: 41, image: portfolioReview, imageAlt: "Senior designer pointing at app screens while mentoring a junior designer", unitTitles: ["Share your portfolio link", "60-minute review session", "Prioritised feedback notes"] },
  { id: "pitch-deck-pack", title: "Pitch deck template pack", creator: "Dr Dann Odotukpono", description: "Twelve investor- and client-ready slide layouts with guidance on what to say on each one.", type: "Template", category: "Business", price: 8500, rating: 4.6, reviews: 89, image: pitchDeck, imageAlt: "Tablet showing pitch deck slides with blue charts", unitTitles: ["Deck template", "Slide-by-slide guide", "Example deck"] },
  { id: "ai-prompt-library", title: "AI prompt library for builders", creator: "Beulahland Ignatius", description: "Tested prompts for planning, designing and shipping apps with AI tools, organised by stage.", type: "Template", category: "Tech", price: 4500, originalPrice: 7000, rating: 4.9, reviews: 176, tag: "Bestseller", image: promptLibrary, imageAlt: "Hands typing on a laptop showing an AI chat on screen", unitTitles: ["Planning prompts", "Design prompts", "Build and debug prompts", "Launch prompts"] },
  { id: "speaking-coaching", title: "Public speaking confidence coaching", creator: "Precious Obo", description: "Two guided practice sessions to help you present, pitch and interview with calm confidence.", type: "Coaching", category: "Career", price: 20000, rating: 4.7, reviews: 33, image: speaking, imageAlt: "Woman speaking confidently to a small audience while a coach gives a thumbs up", unitTitles: ["Goal-setting call", "Practice session one", "Practice session two"] },
];

export const resources: LearnerResource[] = [
  ...fromProducts,
  ...extras.map(({ unitTitles: titles, ...r }) => ({
    ...r,
    units: titles.map((title, i) => ({ id: `${r.id}-${i + 1}`, title, minutes: r.type === "Coaching" ? 45 : 5 + i * 2 })),
    eligible: true,
    certificate: false,
    downloadable: r.type === "Template",
  })),
];

export type LearnerEvent = {
  id: string;
  title: string;
  host: string;
  /** One line about the host, as they describe themselves. */
  hostRole: string;
  /** Short hook shown on cards and the featured banner. */
  tagline: string;
  description: string;
  agenda: string[];
  /** What attendees leave with. */
  outcomes: string[];
  /** Who it's for. */
  audience: string;
  level: "Beginner" | "All levels" | "Intermediate";
  category: Category;
  mode: "Online" | "In person";
  venue: string;
  start: string;
  durationMinutes: number;
  price: number;
  /** Seats the host opened for registration. */
  capacity: number;
  /** Card thumbnail (about 640px wide). */
  image: string;
  /** Wide banner for the featured slot and the event page. */
  banner: string;
  imageAlt: string;
  featured: boolean;
  /** Attending counts towards participation badges. */
  eligible: boolean;
  /** What happened, for events that have ended. */
  recap?: string | undefined;
};

/** Events are scheduled in WAT (UTC+1, no daylight saving): `hour` o'clock Lagos time, `days` from today in Lagos. */
const at = (days: number, hour: number) => {
  const [y, m, d] = dayKeyIn(new Date(), EVENT_TZ).split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days, hour - 1)).toISOString();
};

const ONLINE = "Live online session · link shared after registration";

export const events: LearnerEvent[] = [
  {
    id: "ai-app-workshop", title: "Build your first AI app: live workshop", host: "Beulahland Ignatius", hostRole: "Product manager and vibe-coding instructor",
    tagline: "Go from idea to a working app in one evening, with AI tools doing the heavy lifting.",
    description: "Follow along as we shape an idea into a working app with AI tools, then share it with the group before the session ends. No coding background needed. Bring a laptop and one idea you'd love to see on a screen.",
    agenda: ["Pick an idea worth building", "Build your screens together", "Connect the pieces", "Share your app with the group"],
    outcomes: ["A working first version of your app", "A repeatable way to prompt AI tools", "A simple plan for what to build next"],
    audience: "Curious beginners, founders and creators who want to build without waiting for a developer.",
    level: "Beginner", category: "Tech", mode: "Online", venue: ONLINE, start: at(5, 17), durationMinutes: 90, price: 0, capacity: 150,
    image: aiWorkshopThumb, banner: aiWorkshop, imageAlt: "Learners building app screens on laptops while a host presents a prototype", featured: true, eligible: true,
  },
  {
    id: "lagos-creators-meetup", title: "Lagos creators meetup", host: "Salem King", hostRole: "Creator and content strategist",
    tagline: "An evening of real stories, new collaborators and good conversation.",
    description: "An evening for creators and learners to swap ideas, meet collaborators and hear how others turned what they know into products people pay for. Light refreshments are served.",
    agenda: ["Welcome and introductions", "Three short creator stories", "Open networking"],
    outcomes: ["New collaborators and friends in the creator space", "Ideas you can test on your own audience", "Honest answers from creators who've done it"],
    audience: "Creators, aspiring creators and anyone building an audience in Lagos.",
    level: "All levels", category: "Creativity", mode: "In person", venue: "Yaba, Lagos", start: at(12, 18), durationMinutes: 150, price: 5000, capacity: 80,
    image: meetup, banner: meetup, imageAlt: "Creators chatting at a rooftop meetup at sunset", featured: true, eligible: true,
  },
  {
    id: "career-fair-abuja", title: "Abuja career day & CV clinic", host: "Chiamaka Okafor", hostRole: "Recruiter and career coach",
    tagline: "Meet hiring teams, get your CV reviewed and practise your pitch, all in one day.",
    description: "A day for job seekers and early-career professionals. Bring printed copies of your CV, join a quick review with a recruiter and practise introducing yourself to hiring teams.",
    agenda: ["Opening talk: what hiring teams look for", "CV clinic in small groups", "Practice pitches", "Open floor with recruiters"],
    outcomes: ["Clear notes on how to improve your CV", "A confident 30-second introduction", "Contacts in the teams you'd like to join"],
    audience: "Graduates, NYSC members and anyone looking for their next role.",
    level: "All levels", category: "Career", mode: "In person", venue: "Central Business District, Abuja", start: at(16, 10), durationMinutes: 300, price: 0, capacity: 200,
    image: careerFairThumb, banner: careerFair, imageAlt: "Graduates holding CVs talking with recruiters at career fair booths", featured: true, eligible: true,
  },
  {
    id: "creator-money-masterclass", title: "Creator money masterclass", host: "Dr Dann Odotukpono", hostRole: "Business coach and author",
    tagline: "Price, package and sell what you know with confidence.",
    description: "A focused masterclass on turning your skills into income: choosing an offer, pricing it, and having sales conversations that don't feel awkward. Expect worked examples and plenty of time for questions.",
    agenda: ["Choosing an offer people pay for", "Pricing with confidence", "Simple sales conversations", "Questions from the room"],
    outcomes: ["A priced, packaged offer", "Words to use when someone asks your rates", "A one-page plan for your next launch"],
    audience: "Freelancers, coaches and creators ready to earn from their knowledge.",
    level: "Intermediate", category: "Business", mode: "In person", venue: "Victoria Island, Lagos", start: at(24, 11), durationMinutes: 240, price: 10000, capacity: 120,
    image: masterclassThumb, banner: masterclass, imageAlt: "Audience facing a stage lit in deep blue at a masterclass", featured: true, eligible: true,
  },
  {
    id: "design-sprint-day", title: "Design sprint in a day", host: "Ada Nwosu", hostRole: "Senior product designer",
    tagline: "Sketch, test and refine an app idea in small teams, guided start to finish.",
    description: "A hands-on day of sketching, testing and refining an app idea in small teams. You'll leave with a tested prototype and a clear sense of how product teams make decisions quickly.",
    agenda: ["Map the problem", "Sketch solutions", "Decide as a team", "Prototype and test"],
    outcomes: ["A tested prototype for your portfolio", "Hands-on sprint experience", "Feedback from a senior designer"],
    audience: "Designers, product people and builders who want hands-on team practice.",
    level: "Intermediate", category: "Design", mode: "In person", venue: "Victoria Island, Lagos", start: at(20, 10), durationMinutes: 360, price: 15000, capacity: 40,
    image: sprint, banner: sprint, imageAlt: "Hands arranging sticky notes and wireframes on a table", featured: true, eligible: true,
  },
  {
    id: "linkedin-clinic", title: "LinkedIn profile clinic", host: "Blossom Affia", hostRole: "Career and personal brand coach",
    tagline: "Leave with a clearer headline and a simple plan for posting.",
    description: "Bring your profile and leave with a clearer headline, a stronger about section and a simple posting plan you can keep up.",
    agenda: ["Live profile reviews", "Headline rewrites", "Your questions answered"],
    outcomes: ["A rewritten headline", "A stronger about section", "A posting plan for the next month"],
    audience: "Job seekers and professionals who want to be found.",
    level: "Beginner", category: "Career", mode: "Online", venue: ONLINE, start: at(3, 19), durationMinutes: 60, price: 0, capacity: 300,
    image: workshop, banner: workshop, imageAlt: "Learners with laptops listening to a speaker", featured: false, eligible: true,
  },
  {
    id: "canva-design-jam", title: "Canva design jam: posts that stop the scroll", host: "Tolu Adeyemi", hostRole: "Brand designer",
    tagline: "Design a week of social posts live, with feedback as you go.",
    description: "Open Canva, follow along and design a week of on-brand posts with a working designer. Share your screen for quick feedback, or just watch and build at your own pace.",
    agenda: ["Set up a simple brand kit", "Design three post styles", "Live feedback round"],
    outcomes: ["A week of ready-to-post designs", "A reusable brand kit", "Tips for layouts that read on phones"],
    audience: "Creators and small business owners who design their own posts.",
    level: "Beginner", category: "Design", mode: "Online", venue: ONLINE, start: at(8, 18), durationMinutes: 90, price: 2500, capacity: 100,
    image: designJamThumb, banner: designJam, imageAlt: "Designer using a stylus on a tablet during a live online session", featured: false, eligible: true,
  },
  {
    id: "pitch-clients-qa", title: "Pitch to win clients: live Q&A", host: "Dr Dann Odotukpono", hostRole: "Business coach and author",
    tagline: "Bring your questions about outreach, pricing and closing.",
    description: "Ask your questions about outreach, pricing conversations and closing your first clients, and hear how others handled theirs.",
    agenda: ["Short talk on pitching", "Your questions answered"],
    outcomes: ["Answers to your own pitching questions", "Outreach messages you can adapt"],
    audience: "Freelancers and service providers looking for their first clients.",
    level: "All levels", category: "Business", mode: "Online", venue: ONLINE, start: at(27, 18), durationMinutes: 75, price: 3000, capacity: 200,
    image: webinar, banner: webinar, imageAlt: "Laptop on a desk showing a video call", featured: false, eligible: true,
  },
  {
    id: "product-fireside", title: "Product thinking fireside chat", host: "Kelechi Eze", hostRole: "Product lead",
    tagline: "An honest conversation about building products people use.",
    description: "Two product leads talked through how they decide what to build, how they say no, and what they wish they'd known earlier.",
    agenda: ["Fireside conversation", "Audience questions", "Networking"],
    outcomes: ["A clearer way to prioritise ideas", "Stories from real product teams"],
    audience: "Aspiring product managers and builders.",
    level: "All levels", category: "Tech", mode: "In person", venue: "Ikoyi, Lagos", start: at(-6, 18), durationMinutes: 120, price: 0, capacity: 90,
    image: firesideThumb, banner: fireside, imageAlt: "Two speakers on armchairs talking on a small stage", featured: false, eligible: true,
    recap: "A full room heard how two product teams choose what to build. The big takeaway: write down the problem before you fall in love with a solution.",
  },
  {
    id: "podcast-basics", title: "Podcasting basics live session", host: "Seun Akande", hostRole: "Podcaster and audio producer",
    tagline: "Plan, record and publish your first episode.",
    description: "A friendly walkthrough of planning, recording and publishing your first episode on a budget.",
    agenda: ["Plan your show", "Record on a budget", "Publish"],
    outcomes: ["A show outline", "A simple recording setup"],
    audience: "Anyone thinking about starting a podcast.",
    level: "Beginner", category: "Creativity", mode: "Online", venue: "Live online session", start: at(-10, 18), durationMinutes: 60, price: 0, capacity: 250,
    image: podcast, banner: podcast, imageAlt: "Podcaster smiling at his microphone", featured: false, eligible: true,
    recap: "Attendees left with a show outline and a recording setup that costs less than a new phone.",
  },
  {
    id: "freelance-roundtable", title: "Freelance pricing roundtable", host: "Zainab Musa", hostRole: "Freelance consultant",
    tagline: "Freelancers compared notes on rates and packages.",
    description: "Freelancers compared notes on rates, packages and saying no to the wrong clients.",
    agenda: ["Pricing models", "Package your offer", "Open discussion"],
    outcomes: ["A pricing model that fits your work", "A packaged offer"],
    audience: "Working freelancers.",
    level: "Intermediate", category: "Business", mode: "In person", venue: "Wuse II, Abuja", start: at(-24, 16), durationMinutes: 120, price: 2000, capacity: 30,
    image: roundtableThumb, banner: roundtable, imageAlt: "Freelancers talking around a table in a co-working lounge", featured: false, eligible: true,
    recap: "A lively table of freelancers swapped real rate cards and agreed on one rule: package your work so clients compare outcomes, not hours.",
  },
];

/** Items bought through the sitewide checkout, registered from the learner's saved library. */
const purchasedExtras = new Map<string, LearnerResource>();
export function registerResources(list: readonly LearnerResource[]) {
  for (const r of list) purchasedExtras.set(r.id, r);
}
export const findResource = (id: string) => resources.find((r) => r.id === id) ?? purchasedExtras.get(id);
export const findEvent = (id: string) => events.find((e) => e.id === id);
/** Events are listed as live pages. Resources creators haven't published yet stay preview pages. */
export const publishedEvents: LearnerEvent[] = events;
export const publishedResources: LearnerResource[] = [];
export const isPreviewEvent = (e: Pick<LearnerEvent, "id">) => !publishedEvents.some((p) => p.id === e.id);
export const isPreviewResource = (r: Pick<LearnerResource, "id">) => !publishedResources.some((p) => p.id === r.id) && !purchasedExtras.has(r.id);
export const eventDay = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });
export const eventLength = (minutes: number) => (minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}` : `${minutes}m`);
export const isPast = (e: Pick<LearnerEvent, "start">, now = Date.now()) => new Date(e.start).getTime() < now;
export const eventDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" }) + " WAT";

/** Main buy button on a resource preview/details page, worded for what it is. */
export const RESOURCE_BUY_LABEL: Record<ResourceType, string> = { Course: "Buy course", Ebook: "Buy eBook", Template: "Buy template", Coaching: "Book session" };
export const resourceBuyLabel = (r: Pick<LearnerResource, "type" | "price">) => (r.price === 0 ? "Get it free" : RESOURCE_BUY_LABEL[r.type]);
/** Main action on an event page: free events register, paid ones sell a ticket. */
export const eventActionLabel = (e: Pick<LearnerEvent, "price">) => (e.price === 0 ? "Register for free" : "Buy ticket");
/** Featured events that haven't started yet, soonest first. */
export const featuredEvents = (now = Date.now()) => events.filter((e) => e.featured && !isPast(e, now)).sort((a, b) => a.start.localeCompare(b.start));

/** Short countdown for an event, counted in Lagos calendar days (events run on WAT). */
export function startsIn(e: Pick<LearnerEvent, "start" | "durationMinutes">, now = new Date()): string {
  const start = new Date(e.start).getTime();
  const t = now.getTime();
  if (t >= start + e.durationMinutes * 60000) return "Ended";
  if (t >= start) return "Happening now";
  const days = Math.round((Date.parse(dayKeyIn(e.start, EVENT_TZ)) - Date.parse(dayKeyIn(now, EVENT_TZ))) / 86400000);
  if (days <= 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  return `Starts in ${days} days`;
}
