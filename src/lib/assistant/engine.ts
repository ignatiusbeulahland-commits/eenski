/**
 * Charm's "brain": a small, fully local rules engine. No AI service is called —
 * it matches questions to the help articles, asks for clarification once, then
 * offers a person. Pure functions so the rules can be tested.
 */
import type { Audience, HandoverReason, KbArticle, Pose, QuickAction, Thread } from "./types";
import { AUDIENCE_LABEL } from "./routing";

export type { HandoverReason };

export type Reply = {
  text: string;
  pose: Pose;
  actions?: QuickAction[] | undefined;
  offerHuman?: boolean | undefined;
  articleId?: string | undefined;
  reason?: HandoverReason | undefined;
};

export type ReplyResult = { reply: Reply; misses: number; lastArticleId?: string | undefined };

export const HUMAN_OFFER_TEXT =
  "I'm sorry I haven't been able to resolve this. Let me connect you with someone from our support team.";
export const UNAVAILABLE_TEXT =
  "Our support team is currently unavailable, but don't worry. You can leave us a message and we'll help you as soon as possible.";

const ASSISTANT_TITLE: Record<Audience, string> = {
  public: "the Enski Assistant",
  learner: "your Learning Companion",
  creator: "your Creator Growth Assistant",
  affiliate: "your Affiliate Success Assistant",
};

export function assistantTitle(audience: Audience) {
  return ASSISTANT_TITLE[audience];
}

/** Which help Charm gives depends on where the person is. */
export function audienceForPath(pathname: string): Audience {
  if (pathname.startsWith("/learner")) return "learner";
  if (pathname.startsWith("/creator") && !pathname.startsWith("/creators")) return "creator";
  if (pathname.startsWith("/affiliate")) return "affiliate";
  return "public";
}

type PageHelp = { test: (p: string) => boolean; label: string; suggestions: string[] };

const PAGE_HELP: Record<Audience, PageHelp[]> = {
  public: [
    { test: (p) => p === "/", label: "Home", suggestions: ["What does Enski do?", "Which profile is right for me?", "How much does it cost?"] },
    {
      test: (p) => /^\/(courses|dreamverse|course|ebooks|coaching|creators|wishlist)/.test(p),
      label: "Shopping",
      suggestions: ["How do I buy a course?", "Where do I find what I bought?", "Do I get a certificate?"],
    },
    { test: (p) => p.startsWith("/pricing"), label: "Pricing", suggestions: ["How much does Enski cost?", "How do creators get paid?", "Which profile is right for me?"] },
    { test: (p) => p.startsWith("/features"), label: "For creators", suggestions: ["How do I sell my knowledge?", "How much does it cost?", "How do affiliates work?"] },
    { test: (p) => p.startsWith("/auth"), label: "Log in", suggestions: ["How do I create an account?", "I forgot my password", "Which profile should I choose?"] },
    { test: (p) => p.startsWith("/become-an-ambassador"), label: "Ambassadors", suggestions: ["What are the ambassador programmes?", "How do I become an affiliate?", "What does Enski do?"] },
    { test: (p) => /^\/(dreamers-trybe|community)/.test(p), label: "Community", suggestions: ["How do I join Dreamers Trybe?", "What does Enski do?", "How do I get started?"] },
    { test: (p) => p.startsWith("/blog"), label: "Blog", suggestions: ["How do I write for Enski?", "What does Enski do?", "How do I get started?"] },
    { test: (p) => p.startsWith("/faq"), label: "Help Center", suggestions: ["How do I contact support?", "I can't log in", "A payment went wrong"] },
  ],
  learner: [
    { test: (p) => /^\/learner\/(resources|purchases)/.test(p), label: "Resources", suggestions: ["How do I open something I bought?", "My purchased course still won't open", "How do I track my progress?"] },
    { test: (p) => p.startsWith("/learner/events"), label: "Events", suggestions: ["Where are my events?", "How do I join an event?", "Talk to a human"] },
    { test: (p) => p.startsWith("/learner/certificates"), label: "Certificates", suggestions: ["How do I get my certificate?", "How do I share a certificate?", "How do I verify a certificate?"] },
    { test: (p) => p.startsWith("/learner/settings"), label: "Settings", suggestions: ["How do I change my profile?", "How do I change my password?", "Dark mode"] },
  ],
  creator: [
    { test: (p) => /^\/creator\/(products|courses|ebooks|coaching|services|live-trainings|events)/.test(p), label: "Products", suggestions: ["How do I create a product?", "How do I publish my product?", "How do coupons work?"] },
    { test: (p) => /^\/creator\/(wallet|payouts|earnings)/.test(p), label: "Wallet", suggestions: ["How do payouts work?", "My payout hasn't arrived", "How do I add a bank account?"] },
    { test: (p) => /^\/creator\/(orders|customers|sales|analytics|performance)/.test(p), label: "Sales", suggestions: ["Where do I see my orders?", "How are my sales doing?", "How do I get more sales?"] },
    { test: (p) => p.startsWith("/creator/settings"), label: "Settings", suggestions: ["How do I verify my identity?", "How do I change my profile?", "How do payouts work?"] },
  ],
  affiliate: [
    { test: (p) => p.startsWith("/affiliate/market"), label: "Market", suggestions: ["Which products can I promote?", "How do commissions work?", "Where is my referral link?"] },
    { test: (p) => /^\/affiliate\/(affiliations|my-affiliations|referrals)/.test(p), label: "Affiliations", suggestions: ["Where is my referral link?", "What's the best way to share my link?", "How do I track my commissions?"] },
    { test: (p) => /^\/affiliate\/(performance|transactions|wallet|payouts)/.test(p), label: "Earnings", suggestions: ["How do I track my commissions?", "How do payouts work?", "My payout hasn't arrived"] },
    { test: (p) => p.startsWith("/affiliate/settings"), label: "Settings", suggestions: ["How do I add a bank account?", "How do I change my profile?", "How do I verify my identity?"] },
  ],
};

const DEFAULT_SUGGESTIONS: Record<Audience, string[]> = {
  public: ["What does Enski do?", "Which profile is right for me?", "How do I get started?"],
  learner: ["How do I open something I bought?", "Where are my events?", "How do I get my certificate?"],
  creator: ["How do I create a product?", "How do I publish my product?", "How do payouts work?"],
  affiliate: ["Which products can I promote?", "Where is my referral link?", "How do I track my commissions?"],
};

export function pageHelp(pathname: string, audience = audienceForPath(pathname)) {
  const hit = PAGE_HELP[audience].find((h) => h.test(pathname));
  return { label: hit?.label ?? AUDIENCE_LABEL[audience], suggestions: hit?.suggestions ?? DEFAULT_SUGGESTIONS[audience] };
}

function firstName(name?: string | null) {
  const n = name?.trim().split(/\s+/)[0];
  return n ? n : null;
}

export function greetingFor(audience: Audience, opts: { name?: string | null | undefined; returning?: boolean | undefined } = {}): Reply {
  const first = firstName(opts.name);
  const hi = first ? `, ${first}` : "";
  if (audience === "public") {
    return opts.returning
      ? {
          text: `Hi again${hi}! What can I help you with today?`,
          pose: "wave",
          actions: [
            { label: "What does Enski do?", prompt: "What does Enski do?" },
            { label: "Browse courses", href: "/courses" },
          ],
        }
      : {
          text: "Hey there! Welcome to Enski. I'm Charm, the Enski Assistant. Are you here to learn, create or earn by promoting digital products? I can help you get started.",
          pose: "wave",
          actions: [
            { label: "I want to learn", prompt: "I want to learn on Enski" },
            { label: "I want to create", prompt: "I want to sell my knowledge" },
            { label: "I want to earn", prompt: "How do I become an affiliate?" },
          ],
        };
  }
  const intro = `I'm Charm, ${ASSISTANT_TITLE[audience]}.`;
  if (audience === "learner") {
    return {
      text: opts.returning
        ? `Hi again${hi}! Want to see your events, or pick up where you left off?`
        : `Hi${hi}! ${intro} I can help you find your resources, events, purchases and certificates.`,
      pose: "wave",
      actions: [
        { label: "My events", href: "/learner/events" },
        { label: "My resources", href: "/learner/resources" },
      ],
    };
  }
  if (audience === "creator") {
    return {
      text: opts.returning
        ? `Hi again${hi}! Working on a product? I can walk you through what it needs before you publish.`
        : `Hi${hi}! ${intro} I can help you create and publish products, follow your sales and get paid.`,
      pose: "wave",
      actions: [
        { label: "Publishing checklist", prompt: "How do I publish my product?" },
        { label: "Create a product", href: "/creator/products" },
      ],
    };
  }
  return {
    text: opts.returning
      ? `Hi again${hi}! Your referral links are in My Affiliations. Want some tips on sharing them?`
      : `Hi${hi}! ${intro} I can help you find products to promote, share your referral links and track your commissions.`,
    pose: "wave",
    actions: [
      { label: "Best ways to share", prompt: "What's the best way to share my link?" },
      { label: "Find products", href: "/affiliate/market" },
    ],
  };
}

// ——— Matching ———

export function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set(["the", "a", "an", "i", "my", "to", "do", "how", "is", "it", "of", "in", "on", "for", "and", "can", "me", "what", "where", "you", "your", "be", "with", "this", "that", "are"]);

export function scoreArticle(text: string, article: KbArticle, audience: Audience): number {
  const t = normalise(text);
  const tokens = t.split(" ").filter((w) => w && !STOP.has(w));
  let score = 0;
  for (const raw of article.keywords) {
    const k = normalise(raw);
    if (!k) continue;
    if (k.includes(" ")) {
      if (` ${t} `.includes(` ${k} `)) score += 2 + k.split(" ").length;
    } else if (!STOP.has(k) && tokens.some((w) => w === k || (k.length >= 5 && (w.startsWith(k) || k.startsWith(w) && w.length >= 5)))) {
      score += 1.5;
    }
  }
  const weight = article.audience === audience ? 1.3 : article.audience === "all" ? 1 : 0.6;
  return score * weight;
}

export const MATCH_THRESHOLD = 1.5;

export function bestArticle(text: string, articles: KbArticle[], audience: Audience) {
  let best: { article: KbArticle; score: number } | null = null;
  for (const a of articles) {
    if (!a.published) continue;
    const score = scoreArticle(text, a, audience);
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { article: a, score };
  }
  return best;
}

const HUMAN_RE = /\b(human|real person|a person|someone real|live agent|an agent|agent|support team|customer (care|service)|speak to (someone|somebody)|talk to (someone|somebody)|call me)\b/;
const FRUSTRATED_RE = /(useless|not helpful|unhelpful|frustrat|annoy|angry|ridiculous|waste of (my )?time|rubbish|nonsense|terrible|stupid|fed up|!!!|\?\?\?)/;
const SENSITIVE_RE = /\b(refund|charged|debited|double charge|charged twice|payment failed|payout|withdraw\w*|bank|verification|verify my|kyc|hacked|stolen|fraud|scam|suspended|banned|locked)\b/;
const UNHELPFUL_RE = /^(no|nope|not really|that (didnt|did not|doesnt|does not) help|didnt help|still (not|doesnt|wont)|thats not (it|what i (asked|meant)))\b/;
const GREETING_RE = /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|howdy|yo)\b/;
const THANKS_RE = /\b(thanks|thank you|thank u|thx|cheers|great|perfect|awesome|that helped|it worked)\b/;

export function isHumanRequest(text: string) {
  return HUMAN_RE.test(normalise(text));
}

/** Decide Charm's next reply. `thread` is the conversation so far (before this message). */
export function respond(text: string, ctx: { audience: Audience; articles: KbArticle[]; thread: Pick<Thread, "misses" | "lastArticleId"> }): ReplyResult {
  const t = normalise(text);
  const { audience, articles, thread } = ctx;

  if (!t) {
    return { reply: { text: "I didn't catch that. What would you like help with?", pose: "think" }, misses: thread.misses, lastArticleId: thread.lastArticleId };
  }

  if (HUMAN_RE.test(t) && !/^(what|how) (is|are|do) (an? )?(agent|affiliate)/.test(t)) {
    return {
      reply: {
        text: "Of course. I can connect you with someone from our support team. I'll pass on a short summary so you don't have to repeat yourself.",
        pose: "point",
        offerHuman: true,
        reason: "requested",
      },
      misses: 0,
      lastArticleId: thread.lastArticleId,
    };
  }

  if (FRUSTRATED_RE.test(t) || FRUSTRATED_RE.test(text)) {
    return {
      reply: {
        text: "I'm really sorry this has been frustrating. A person from our support team can sort it out with you directly.",
        pose: "concerned",
        offerHuman: true,
        reason: "frustrated",
      },
      misses: 0,
      lastArticleId: thread.lastArticleId,
    };
  }

  const words = t.split(" ").length;
  if (GREETING_RE.test(t) && words <= 4) {
    return {
      reply: { text: "Hi! I'm here to help. Ask me anything about Enski, or pick one of the suggestions below.", pose: "wave" },
      misses: thread.misses,
      lastArticleId: thread.lastArticleId,
    };
  }
  if (THANKS_RE.test(t) && words <= 6) {
    return {
      reply: { text: "You're welcome! Dare to dream. I'm here whenever you need me.", pose: "wink" },
      misses: 0,
      lastArticleId: thread.lastArticleId,
    };
  }

  if (UNHELPFUL_RE.test(t) && words <= 8) {
    return unresolved(thread.misses + 1, thread.lastArticleId, audience, "unhelpful");
  }

  const sensitive = SENSITIVE_RE.test(t);
  const hit = bestArticle(text, articles, audience);

  if (hit) {
    const a = hit.article;
    if (a.id === thread.lastArticleId) {
      return {
        reply: {
          text: `Looks like that didn't fully solve it. Here it is once more, and a person from our support team can help if it's still not working:\n${a.answer}`,
          pose: "concerned",
          actions: a.actions.filter((x) => x.action !== "human"),
          articleId: a.id,
          offerHuman: true,
          reason: "repeated",
        },
        misses: 0,
        lastArticleId: a.id,
      };
    }
    return {
      reply: {
        text: sensitive && !a.actions.some((x) => x.action === "human")
          ? `${a.answer}\nBecause this involves your account or money, a person from our support team can check it safely with you.`
          : a.answer,
        pose: "point",
        actions: a.actions,
        articleId: a.id,
        offerHuman: sensitive || undefined,
        reason: sensitive ? "sensitive" : undefined,
      },
      misses: 0,
      lastArticleId: a.id,
    };
  }

  if (sensitive) {
    return {
      reply: {
        text: "This sounds like something about your account or money, so it's best handled by a person from our support team. They can check it safely with you.",
        pose: "concerned",
        offerHuman: true,
        reason: "sensitive",
      },
      misses: 0,
      lastArticleId: thread.lastArticleId,
    };
  }

  return unresolved(thread.misses + 1, thread.lastArticleId, audience, "unresolved");
}

function unresolved(misses: number, lastArticleId: string | undefined, audience: Audience, reason: HandoverReason): ReplyResult {
  if (misses <= 1) {
    const s = DEFAULT_SUGGESTIONS[audience];
    return {
      reply: {
        text: "I'm not sure I've got that yet. Could you tell me a bit more, like which page you're on or what you were trying to do? Or pick one of these:",
        pose: "think",
        actions: s.map((q) => ({ label: q, prompt: q })),
      },
      misses,
      lastArticleId,
    };
  }
  return {
    reply: { text: HUMAN_OFFER_TEXT, pose: "concerned", offerHuman: true, reason },
    misses,
    lastArticleId,
  };
}

/** The person marked an answer as not helpful: troubleshooting failed, so offer a person. */
export function afterUnhelpful(): Reply {
  return {
    text: "Thanks for telling me. I'm sorry that didn't help. Would you like me to connect you with someone from our support team?",
    pose: "concerned",
    offerHuman: true,
    reason: "unhelpful",
  };
}

const REASON_LABEL: Record<HandoverReason, string> = {
  requested: "Asked for a person",
  unresolved: "Charm couldn't find an answer",
  frustrated: "Person seemed frustrated",
  sensitive: "Account or money issue",
  unhelpful: "Charm's answer didn't help",
  repeated: "Same question came up again",
};

export function reasonLabel(reason?: HandoverReason) {
  return reason ? REASON_LABEL[reason] : "Asked for a person";
}

/** A short handover note for the support team. */
export function summarise(
  thread: Pick<Thread, "messages" | "audience">,
  page: string,
  articles: KbArticle[] = [],
  reason?: HandoverReason,
): string {
  const asked = thread.messages
    .filter((m) => m.from === "user")
    .map((m) => m.text.trim())
    .filter(Boolean)
    .slice(-3)
    .map((q) => `“${q.length > 90 ? `${q.slice(0, 87)}…` : q}”`);
  const offered = [...new Set(thread.messages.filter((m) => m.from === "charm" && m.articleId).map((m) => m.articleId!))]
    .map((id) => articles.find((a) => a.id === id)?.title ?? id)
    .slice(-3);
  const lines = [
    `${AUDIENCE_LABEL[thread.audience]} on ${page}.`,
    asked.length ? `Asked: ${asked.join(", ")}.` : "Asked to talk to a person straight away.",
    offered.length ? `Charm suggested: ${offered.join("; ")}.` : "Charm hasn't suggested an article yet.",
  ];
  if (reason) lines.push(`Why: ${REASON_LABEL[reason].toLowerCase()}.`);
  return lines.join(" ");
}

export function threadTitle(text: string) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 42 ? `${t.slice(0, 40)}…` : t || "New conversation";
}

/** Messages in time order, Charm's and the agent's together. */
export function mergeByTime<T extends { at: number }>(...lists: T[][]): T[] {
  return lists.flat().sort((a, b) => a.at - b.at);
}

