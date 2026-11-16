/**
 * Rules for the three-step course builder (Basic information → More information → Pricing).
 * Everything is plain data so drafts save on the creator item and the rules are testable.
 */
import { z } from "zod";
import { CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";

export const SUMMARY_MAX = 240;
export const MAX_SKILLS = 5;
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg"] as const;
export const RESOURCE_MAX_BYTES = 100 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const COMMUNITY_PLATFORMS = ["whatsapp", "telegram", "discord", "other"] as const;
export const COMMUNITY_LABEL: Record<(typeof COMMUNITY_PLATFORMS)[number], string> = { whatsapp: "WhatsApp", telegram: "Telegram", discord: "Discord", other: "Other" };
export const DEFAULT_DISCLOSURE = "I may earn a commission if you purchase through my affiliate link.";
export const RESOURCE_KINDS = ["video", "pdf", "presentation", "worksheet", "download", "other"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];
export const RESOURCE_LABEL: Record<ResourceKind, string> = { video: "Video", pdf: "PDF document", presentation: "Presentation", worksheet: "Worksheet", download: "Downloadable resource", other: "Learning material" };

export const LEVEL_KEYS = ["free", "foundational", "regular", "premium", "elite"] as const;
export type LevelKey = (typeof LEVEL_KEYS)[number];
/** The five Enski levels. Ranges are suggestions only and are never inserted as prices. */
export const LEVELS: Record<LevelKey, { name: string; suggested: string; example: string }> = {
  free: { name: "Free", suggested: "₦0", example: "Introductory lessons" },
  foundational: { name: "Foundational", suggested: "₦1 – ₦10,000", example: "Selected introductory modules" },
  regular: { name: "Regular", suggested: "₦10,001 – ₦30,000", example: "Additional course modules" },
  premium: { name: "Premium", suggested: "₦30,001 – ₦75,000", example: "More advanced content and resources" },
  elite: { name: "Elite", suggested: "₦75,001 and above", example: "Complete course access and additional benefits" },
};

const currency = z.enum(CURRENCY_CODES);
const num = z.number().nullable().default(null);
export const resourceSchema = z.object({ id: z.string(), name: z.string(), size: z.number().nonnegative(), mime: z.string(), kind: z.enum(RESOURCE_KINDS).default("other") });
export type Resource = z.infer<typeof resourceSchema>;
export const lessonSchema = z.object({
  id: z.string(), title: z.string().default(""), description: z.string().default(""),
  videoUrl: z.string().default(""), resources: z.array(resourceSchema).default([]),
});
export type BuilderLesson = z.infer<typeof lessonSchema>;
export const moduleSchema = z.object({ id: z.string(), title: z.string().default(""), description: z.string().default(""), lessons: z.array(lessonSchema).default([]) });
export type BuilderModule = z.infer<typeof moduleSchema>;
export const priceSchema = z.object({ currency, amount: num, original: num });
export type CurrencyPrice = z.infer<typeof priceSchema>;
export const levelSchema = z.object({
  key: z.enum(LEVEL_KEYS), active: z.boolean().default(false),
  prices: z.record(z.string(), z.number().nullable()).default({}),
  unlocks: z.string().default(""), lessonIds: z.array(z.string()).default([]),
});
export type Level = z.infer<typeof levelSchema>;

export const builderSchema = z.object({
  programme: z.string().default(""),
  skills: z.array(z.string()).default([]),
  prelaunch: z.boolean().default(false),
  audience: z.array(z.string()).default([]),
  descriptionHtml: z.string().default(""),
  outcomes: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  community: z.object({ platform: z.enum(["", ...COMMUNITY_PLATFORMS]).default(""), url: z.string().default(""), description: z.string().default("") }).default({}),
  hosting: z.enum(["enski", "external"]).default("enski"),
  external: z.object({ courseUrl: z.string().default(""), checkoutUrl: z.string().default(""), disclosure: z.string().default(DEFAULT_DISCLOSURE) }).default({}),
  modules: z.array(moduleSchema).default([]),
  pricing: z.object({ free: z.boolean().default(false), strike: z.boolean().default(false), prices: z.array(priceSchema).default([{ currency: "NGN", amount: null, original: null }]) }).default({}),
  payg: z.object({
    enabled: z.boolean().default(false),
    /** When on, each level also unlocks everything in the lower active levels. Off by default. */
    cumulative: z.boolean().default(false),
    levels: z.array(levelSchema).default(LEVEL_KEYS.map((key) => ({ key, active: false, prices: {}, unlocks: "", lessonIds: [] }))),
  }).default({}),
});
export type Builder = z.infer<typeof builderSchema>;
export const emptyBuilder = (): Builder => builderSchema.parse({});

export const isUrl = (v: string) => { try { const u = new URL(v.trim()); return u.protocol === "https:" || u.protocol === "http:"; } catch { return false; } };
/** Video links we can play: YouTube, Vimeo or a direct video file. */
export const isVideoLink = (v: string) => isUrl(v) && (/(youtube\.com|youtu\.be|vimeo\.com)/i.test(v) || /\.(mp4|webm|mov)(\?|$)/i.test(v));
export function resourceKindOf(file: { name: string; type: string }): ResourceKind {
  const n = file.name.toLowerCase();
  if (file.type.startsWith("video/")) return "video";
  if (n.endsWith(".pdf")) return /worksheet|workbook/.test(n) ? "worksheet" : "pdf";
  if (/\.(ppt|pptx|key|odp)$/.test(n)) return "presentation";
  if (/\.(doc|docx|xls|xlsx|csv)$/.test(n)) return "worksheet";
  if (/\.(zip|rar|7z)$/.test(n)) return "download";
  return "other";
}
export function resourceProblem(file: { name: string; size: number; type: string }): string | null {
  if (!file.size) return `${file.name} is empty.`;
  const max = file.type.startsWith("video/") ? VIDEO_MAX_BYTES : RESOURCE_MAX_BYTES;
  if (file.size > max) return `${file.name} is larger than ${max / 1024 / 1024} MB.`;
  return null;
}
export function imageProblem(file: { type: string; size: number }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "Choose a PNG or JPG image.";
  if (file.size > IMAGE_MAX_BYTES) return "Choose an image of 10 MB or less.";
  if (!file.size) return "That file is empty. Choose another image.";
  return null;
}

export function addSkill(skills: string[], skill: string): string[] {
  const s = skill.trim();
  if (!s || skills.length >= MAX_SKILLS || skills.some((x) => x.toLowerCase() === s.toLowerCase())) return skills;
  return [...skills, s];
}

/** Adds a currency to the course price list and to every level, keeping existing prices untouched (never converted). */
export function addCurrency(b: Builder, code: CurrencyCode): Builder {
  if (b.pricing.prices.some((p) => p.currency === code)) return b;
  return {
    ...b,
    pricing: { ...b.pricing, prices: [...b.pricing.prices, { currency: code, amount: null, original: null }] },
    payg: { ...b.payg, levels: b.payg.levels.map((l) => ({ ...l, prices: { ...l.prices, [code]: l.key === "free" ? 0 : l.prices[code] ?? null } })) },
  };
}
export function removeCurrency(b: Builder, code: CurrencyCode): Builder {
  if (b.pricing.prices.length <= 1) return b;
  return {
    ...b,
    pricing: { ...b.pricing, prices: b.pricing.prices.filter((p) => p.currency !== code) },
    payg: { ...b.payg, levels: b.payg.levels.map((l) => { const { [code]: _, ...rest } = l.prices; return { ...l, prices: rest }; }) },
  };
}
export const currenciesOf = (b: Builder) => b.pricing.prices.map((p) => p.currency);
/** A level's price in a currency: Free is always 0. */
export const levelPrice = (l: Level, code: CurrencyCode) => (l.key === "free" ? 0 : l.prices[code] ?? null);
export const activeLevels = (b: Builder) => (b.payg.enabled ? b.payg.levels.filter((l) => l.active) : []);
/** Lessons a level opens, including lower active levels only when the creator chose that. */
export function levelLessons(b: Builder, key: LevelKey): string[] {
  const act = activeLevels(b);
  const idx = act.findIndex((l) => l.key === key);
  if (idx < 0) return [];
  const from = b.payg.cumulative ? act.slice(0, idx + 1) : [act[idx]!];
  return [...new Set(from.flatMap((l) => l.lessonIds))];
}
export const allLessons = (b: Builder) => b.modules.flatMap((m) => m.lessons);

export type Issue = { step: 1 | 2 | 3; field: string; message: string };
const ok = (n: number | null): n is number => n !== null && Number.isFinite(n);

export function step1Issues(f: { title: string; description: string; image: string }): Issue[] {
  const out: Issue[] = [];
  if (!f.title.trim()) out.push({ step: 1, field: "cb-title", message: "Enter your course title." });
  if (!f.description.trim()) out.push({ step: 1, field: "cb-summary", message: "Write a short summary of the course." });
  else if (f.description.trim().length > SUMMARY_MAX) out.push({ step: 1, field: "cb-summary", message: `Keep the summary to ${SUMMARY_MAX} characters.` });
  if (!f.image) out.push({ step: 1, field: "cb-image", message: "Add a primary course image." });
  return out;
}
export function step2Issues(b: Builder): Issue[] {
  const out: Issue[] = [];
  const c = b.community;
  if (c.url.trim() && !isUrl(c.url)) out.push({ step: 2, field: "cb-community-url", message: "Enter a full invitation link starting with https://." });
  if (c.url.trim() && !c.platform) out.push({ step: 2, field: "cb-community-platform", message: "Choose the community platform." });
  if (b.hosting === "external") {
    if (!isUrl(b.external.courseUrl)) out.push({ step: 2, field: "cb-ext-url", message: "Enter the external course link." });
    if (b.external.checkoutUrl.trim() && !isUrl(b.external.checkoutUrl)) out.push({ step: 2, field: "cb-ext-checkout", message: "Enter a full checkout link starting with https://." });
    if (!b.external.disclosure.trim()) out.push({ step: 2, field: "cb-ext-disclosure", message: "Add an affiliate disclosure so learners know you may earn a commission." });
    return out;
  }
  if (!allLessons(b).some((l) => l.title.trim())) out.push({ step: 2, field: "cb-content", message: "Add at least one module with a titled lesson." });
  for (const l of allLessons(b)) if (l.videoUrl.trim() && !isVideoLink(l.videoUrl)) { out.push({ step: 2, field: `cb-video-${l.id}`, message: "Use a YouTube, Vimeo or direct video link." }); break; }
  return out;
}
export function step3Issues(b: Builder): Issue[] {
  const out: Issue[] = [];
  if (!b.pricing.free) {
    for (const p of b.pricing.prices) {
      if (!ok(p.amount) || p.amount <= 0) { out.push({ step: 3, field: `cb-price-${p.currency}`, message: `Enter a ${p.currency} price above 0.` }); continue; }
      if (b.pricing.strike) {
        if (!ok(p.original) || p.original <= 0) out.push({ step: 3, field: `cb-original-${p.currency}`, message: `Enter the original ${p.currency} price.` });
        else if (p.amount >= p.original) out.push({ step: 3, field: `cb-price-${p.currency}`, message: `The discounted ${p.currency} price must be lower than the original price.` });
      }
    }
  }
  if (b.payg.enabled && b.hosting === "enski") {
    const act = activeLevels(b);
    if (!act.length) out.push({ step: 3, field: "cb-levels", message: "Activate at least one level, or turn off Pay-As-You-Go." });
    for (const l of act) {
      if (l.key === "free") continue;
      for (const code of currenciesOf(b)) {
        const v = levelPrice(l, code);
        if (!ok(v) || v <= 0) { out.push({ step: 3, field: `cb-level-${l.key}-${code}`, message: `Enter a ${code} price for ${LEVELS[l.key].name}.` }); break; }
      }
    }
  }
  return out;
}
export const allIssues = (f: { title: string; description: string; image: string }, b: Builder) => [...step1Issues(f), ...step2Issues(b), ...step3Issues(b)];

/** Primary price used by older screens (item.price): the discounted primary price, 0 when free. */
export const primaryPrice = (b: Builder) => (b.pricing.free ? 0 : b.pricing.prices[0]?.amount ?? 0);

/** Very small allow-list sanitiser for the description editor (browser/jsdom only). */
const ALLOWED = new Set(["H2", "H3", "P", "B", "STRONG", "I", "EM", "UL", "OL", "LI", "A", "BR", "DIV"]);
export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]*>/g, "");
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const walk = (el: Element) => {
    for (const child of [...el.children]) {
      if (!ALLOWED.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; }
      for (const a of [...child.attributes]) if (!(child.tagName === "A" && a.name === "href")) child.removeAttribute(a.name);
      if (child.tagName === "A") {
        const href = child.getAttribute("href") ?? "";
        if (!isUrl(href)) child.removeAttribute("href"); else { child.setAttribute("target", "_blank"); child.setAttribute("rel", "noopener noreferrer"); }
      }
      walk(child);
    }
  };
  const root = doc.body.firstElementChild!;
  // Repeat until no disallowed tags remain (unwrapping can expose nested ones).
  for (let i = 0; i < 5; i++) walk(root);
  return root.innerHTML;
}
export const htmlText = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
