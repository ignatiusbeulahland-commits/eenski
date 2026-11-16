import type { Audience, KbArticle, QuickAction } from "@/lib/assistant/types";
import { helpArticles as learnerArticles } from "@/lib/learner/help";
import { creatorArticles } from "@/lib/creator/data";
import { faqs as affiliateFaqs } from "@/lib/affiliate/help";

/**
 * Support centre content for the three signed-in workspaces. One list per role,
 * built from that role's own help answers, the shared knowledge base Charm and
 * the support team use, and a few support-centre guides. Pure: no storage.
 */
export type HelpRole = "learner" | "creator" | "affiliate";
export type TopicId = "account" | "learning" | "payments" | "services" | "marketplace" | "certificates" | "technical" | "general";

export type HelpTopic = {
  id: TopicId;
  label: string;
  blurb: string;
  /** Request category per role (always one of that role's support categories). */
  requestCategory: Record<HelpRole, string>;
  /** Questions Charm can answer straight away (per role when they differ). */
  ask: string[] | Record<HelpRole, string[]>;
};

export const TOPICS: HelpTopic[] = [
  { id: "account", label: "Account and profile", blurb: "Sign-in, names, passwords and switching profiles", requestCategory: { learner: "Account issues", creator: "Account issues", affiliate: "Account issues" }, ask: ["How do I change my password?", "How do I switch profiles?"] },
  { id: "learning", label: "Courses and learning", blurb: "Opening courses, progress, events and downloads", requestCategory: { learner: "Course and resource access", creator: "Product setup and publishing", affiliate: "Affiliations" }, ask: ["Where do I find something I bought?", "How do I register for an event?"] },
  { id: "payments", label: "Payments and withdrawals", blurb: "Checkout, receipts, earnings, payouts and bank details", requestCategory: { learner: "Purchases and payments", creator: "Wallet and payouts", affiliate: "Wallet and payouts" }, ask: { learner: ["Which payment methods can I use?", "My payment failed"], creator: ["How do I withdraw my earnings?", "When do payouts arrive?"], affiliate: ["How do I withdraw my commission?", "Why is my commission pending?"] } },
  { id: "services", label: "Creator services", blurb: "Coaching, live training, services and bookings", requestCategory: { learner: "Events", creator: "Product setup and publishing", affiliate: "Affiliations" }, ask: { learner: ["How do I book a coaching session?", "Where are my live sessions?"], creator: ["How do I set up coaching?", "How do bookings work?"], affiliate: ["Can I promote coaching?", "How do I promote a live training?"] } },
  { id: "marketplace", label: "Marketplace and purchases", blurb: "Buying, orders, storefronts and referrals", requestCategory: { learner: "Purchases and payments", creator: "Sales and orders", affiliate: "Referral tracking" }, ask: { learner: ["Why is my order pending?", "Where do I find something I bought?"], creator: ["How do I see my orders?", "How do I set up my storefront?"], affiliate: ["When is a referral recorded?", "How do I get my referral link?"] } },
  { id: "certificates", label: "Certificates and badges", blurb: "Earning, sharing, verifying and name corrections", requestCategory: { learner: "Certificates", creator: "Certificates", affiliate: "General enquiries" }, ask: ["How do I get my certificate?", "How do I fix the name on my certificate?"] },
  { id: "technical", label: "Technical issues", blurb: "Pages not loading, videos, uploads and slow connections", requestCategory: { learner: "Technical issues", creator: "Technical issues", affiliate: "Technical issues" }, ask: ["A page won't load", "My video won't play"] },
  { id: "general", label: "General enquiries", blurb: "About Enski, getting started and anything else", requestCategory: { learner: "General enquiries", creator: "General enquiries", affiliate: "General enquiries" }, ask: ["What is Enski?", "How do I get started?"] },
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
export const askFor = (topic: HelpTopic, role: HelpRole) => (Array.isArray(topic.ask) ? topic.ask : topic.ask[role]);

export type HelpArticle = {
  id: string;
  title: string;
  /** **bold**, line breaks, "- " bullets and "1. " steps. */
  body: string;
  topic: TopicId;
  keywords: string[];
  actions: QuickAction[];
  /** Shown in the frequently asked list. */
  faq: boolean;
};

const KB_TOPIC: Record<string, TopicId> = {
  "Account issues": "account",
  Registration: "account",
  Verification: "account",
  "Course and resource access": "learning",
  Events: "learning",
  "Purchases and payments": "payments",
  "Wallet and payouts": "payments",
  Commissions: "payments",
  "Product setup and publishing": "services",
  "Sales and orders": "marketplace",
  Affiliations: "marketplace",
  "Referral tracking": "marketplace",
  Certificates: "certificates",
  "Technical issues": "technical",
};

/** Which topic a help answer belongs to, from its category and wording. */
export function topicFor(category: string, text = ""): TopicId {
  const known = KB_TOPIC[category];
  if (known) return known;
  const t = `${category} ${text}`.toLowerCase();
  if (/certificat|badge/.test(t)) return "certificates";
  if (/coach|service|live session|booking/.test(t)) return "services";
  if (/payout|wallet|withdraw|finance|earning|commission|payment|refund/.test(t)) return "payments";
  if (/sale|order|referral|market|storefront|coupon|affiliat|review/.test(t)) return "marketplace";
  if (/course|product|publish|lesson|resource|event/.test(t)) return "learning";
  if (/account|profile|password|security|setting/.test(t)) return "account";
  return "general";
}

const LEARNER_TOPIC = { account: "account", purchases: "payments", resources: "learning", events: "learning" } as const;
const AFFILIATE_TOPIC: Record<string, TopicId> = { start: "general", referrals: "marketplace", commissions: "payments", payouts: "payments", account: "account" };

/** Support-centre guides for topics the other sources cover lightly. */
export const SUPPORT_GUIDES: (HelpArticle & { roles: HelpRole[] })[] = [
  {
    id: "page-wont-load",
    roles: ["learner", "creator", "affiliate"],
    title: "A page won't load or looks broken",
    topic: "technical",
    faq: true,
    keywords: ["page", "load", "blank", "broken", "error", "stuck"],
    body: "Most loading problems clear up in a few seconds.\n1. Check the connection banner at the top of the screen. If you're offline, Enski retries for you as soon as you're back.\n2. Use **Try again** on the page, or refresh the browser tab.\n3. Still stuck? Send us a request with the page you were on and what you expected to see.",
    actions: [{ label: "Report a problem", action: "ticket" }],
  },
  {
    id: "video-wont-play",
    roles: ["learner", "creator"],
    title: "A video or lesson won't play",
    topic: "technical",
    faq: false,
    keywords: ["video", "lesson", "play", "buffer", "sound"],
    body: "Videos need a steady connection.\n- Pause for a moment so the video can load, then press play again.\n- Turn off data saver or low-data mode for this site.\n- Try another browser if the player stays blank.\nIf a lesson is missing altogether, tell us the course name and we'll check it with the creator.",
    actions: [{ label: "Ask a person", action: "human" }],
  },
  {
    id: "slow-connection",
    roles: ["learner", "creator", "affiliate"],
    title: "Using Enski on a slow or patchy connection",
    topic: "technical",
    faq: false,
    keywords: ["slow", "offline", "data", "connection", "network"],
    body: "Enski is built to keep working when your signal drops.\n- Pages you've opened recently still show while you're offline.\n- Anything that didn't load reloads by itself when you're back online, with no need to refresh.\n- On low data, photos load only when you scroll to them.",
    actions: [],
  },
  {
    id: "upload-fails",
    roles: ["creator"],
    title: "An upload didn't finish",
    topic: "technical",
    faq: false,
    keywords: ["upload", "file", "video", "image", "media"],
    body: "Uploads save in your **Media Library**.\n- Check the file type and size shown under the upload box.\n- Keep the tab open until the progress bar finishes.\n- If a large video keeps failing, try a smaller export (720p works well for lessons).",
    actions: [{ label: "Open Media Library", href: "/creator/media-library" }],
  },
  {
    id: "set-up-coaching",
    roles: ["creator"],
    title: "Setting up coaching, live training or a service",
    topic: "services",
    faq: true,
    keywords: ["coaching", "service", "live", "training", "facilitator", "session"],
    body: "Facilitating on Enski works through your Creator studio.\n1. Choose **Create product**, then Coaching, Live Session or Service.\n2. Add your session length or delivery time, price and what clients should tell you first.\n3. Publish it. New bookings and orders show in **Bookings & sessions**, ready to confirm, reschedule or deliver.",
    actions: [{ label: "Open Bookings & sessions", href: "/creator/bookings" }],
  },
  {
    id: "manage-bookings",
    roles: ["creator"],
    title: "Managing bookings and upcoming sessions",
    topic: "services",
    faq: false,
    keywords: ["booking", "reschedule", "cancel", "no-show", "session", "calendar"],
    body: "Every coaching booking, live session and service order is gathered in **Bookings & sessions**.\n- Mark a session done or record a no-show after it ends.\n- Cancelling inside your refund window refunds the client automatically.\n- Service orders move from Awaiting requirements to In progress, Delivered and Completed.",
    actions: [{ label: "See my bookings", href: "/creator/bookings" }],
  },
  {
    id: "book-a-session",
    roles: ["learner"],
    title: "Booking a coaching session or live training",
    topic: "services",
    faq: false,
    keywords: ["coaching", "book", "session", "live", "training"],
    body: "Open any coaching or live training listing and choose your time or ticket at checkout.\n- Your joining details appear in **Events** and in your purchase receipt.\n- Need to change a time? Message the creator from the booking, or ask us and we'll help.",
    actions: [{ label: "Browse events", href: "/learner/events" }],
  },
  {
    id: "certificate-name",
    roles: ["learner"],
    title: "Fixing the name on a certificate",
    topic: "certificates",
    faq: true,
    keywords: ["certificate", "name", "wrong", "spelling", "correction"],
    body: "Your **certificate name** is separate from your account and display names, so you can set it exactly as you want it printed.\n- Change it in Settings before your next certificate is issued.\n- Certificates you already have never change silently. Open one and choose **Request a correction**; it keeps the same certificate ID once updated.",
    actions: [{ label: "My certificates", href: "/learner/certificates" }],
  },
  {
    id: "badges",
    roles: ["learner", "creator"],
    title: "How badges are earned and shared",
    topic: "certificates",
    faq: false,
    keywords: ["badge", "achievement", "award", "share", "verify"],
    body: "Badges come from real progress: finishing lessons, completing courses, attending events or being awarded one by a creator.\n- Each badge has its own page with a verification ID.\n- Share the link, or anyone can check it on the Verify page.",
    actions: [{ label: "Verify a credential", href: "/verify" }],
  },
  {
    id: "issue-certificates",
    roles: ["creator"],
    title: "Issuing certificates and awarding badges",
    topic: "certificates",
    faq: false,
    keywords: ["issue", "certificate", "award", "badge", "branding"],
    body: "Certificates issue automatically when a learner completes your course.\n- Design them once with your logo, seal and signatures in **Certificate branding**.\n- Award a badge by hand from **Badges & Certificates**. Learners are told straight away.",
    actions: [{ label: "Badges & Certificates", href: "/creator/badges" }],
  },
];

function fromKb(a: KbArticle): HelpArticle {
  return { id: a.id, title: a.title, body: a.answer, topic: topicFor(a.category, a.title), keywords: a.keywords, actions: a.actions, faq: false };
}

function legacy(role: HelpRole): HelpArticle[] {
  if (role === "learner")
    return learnerArticles.map((a) => ({ id: a.id, title: a.title, body: a.body.join("\n"), topic: LEARNER_TOPIC[a.category], keywords: [], actions: [], faq: Boolean(a.faq) }));
  if (role === "affiliate")
    return affiliateFaqs.map((f, i) => ({ id: f.id, title: f.q, body: f.a, topic: AFFILIATE_TOPIC[f.c] ?? "general", keywords: [], actions: [], faq: i < 6 }));
  return creatorArticles.map((a, i) => ({ id: a.id, title: a.title, body: a.answer, topic: topicFor(a.category, a.title), keywords: [], actions: [], faq: i < 5 }));
}

/** Every help answer for this role: its own answers first, then guides, then the shared knowledge base. */
export function articlesFor(role: HelpRole, kb: KbArticle[]): HelpArticle[] {
  const seen = new Set<string>();
  const out: HelpArticle[] = [];
  const add = (a: HelpArticle) => {
    if (seen.has(a.id)) return;
    seen.add(a.id);
    out.push(a);
  };
  legacy(role).forEach(add);
  SUPPORT_GUIDES.filter((g) => g.roles.includes(role)).forEach(({ roles: _roles, ...g }) => add(g));
  kb.filter((a) => a.published && (a.audience === role || a.audience === "all")).map(fromKb).forEach(add);
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Articles matching every word of the query, best title matches first. */
export function searchArticles(list: HelpArticle[], query: string): HelpArticle[] {
  const words = norm(query).split(" ").filter((w) => w.length > 1);
  if (!words.length) return [];
  return list
    .map((a) => {
      const title = norm(a.title);
      const hay = `${title} ${norm(a.keywords.join(" "))} ${norm(a.body)}`;
      if (!words.every((w) => hay.includes(w))) return null;
      return { a, score: words.filter((w) => title.includes(w)).length };
    })
    .filter((x): x is { a: HelpArticle; score: number } => x !== null)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
}

export const audienceOf = (role: HelpRole): Audience => role;
