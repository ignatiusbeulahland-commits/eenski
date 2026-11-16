import type { Product } from "./types";

/**
 * Stand-in cover photos for listings whose creator hasn't uploaded artwork.
 * Each is a real Unsplash-licensed photo for a subject (credits in
 * assets/courses/CREDITS.md) with a light brand colour grade; real
 * creator artwork always takes precedence over these.
 */
export type CoverId =
  | "ai"
  | "code"
  | "data"
  | "mobile"
  | "devops"
  | "product"
  | "design"
  | "marketing"
  | "finance"
  | "business"
  | "creative"
  | "growth"
  | "lifestyle"
  | "education"
  | "general";

/** How many photos exist per subject; busy subjects get more so rails don't repeat. */
export const COVER_VARIANTS: Record<CoverId, number> = {
  ai: 2,
  code: 2,
  data: 1,
  mobile: 1,
  devops: 1,
  product: 1,
  design: 1,
  marketing: 1,
  finance: 1,
  business: 1,
  creative: 1,
  growth: 1,
  lifestyle: 1,
  education: 1,
  general: 1,
};

// First match wins, so narrower subjects come before broad ones.
const RULES: [CoverId, RegExp][] = [
  ["devops", /\b(docker|kubernetes|devops|ci\/cd|containers?|cloud)\b/],
  ["data", /\b(postgres\w*|sql|databases?|data|mlops|machine learning|analytics)\b/],
  ["mobile", /\b(ios|swift\w*|android|mobile|flutter)\b/],
  ["ai", /\b(ai|prompts?|prompt engineering|chatgpt|gpt|llms?|artificial intelligence)\b/],
  ["code", /\b(code|coding|react|typescript|javascript|apis?|web\w*|software|programming|developers?)\b/],
  ["product", /\b(product manage\w*|digital products?|roadmaps?)\b/],
  ["design", /\b(ui|ux|figma|design\w*|typography|illustration|branding)\b/],
  ["marketing", /\b(marketing|social media|seo|content|copywriting|advert\w*|audience)\b/],
  ["finance", /\b(financ\w*|invest\w*|money|budget\w*|accounting|tax\w*|wealth)\b/],
  ["business", /\b(business\w*|startups?|entrepreneur\w*|teams?|remote|leadership|management|sales|strategy)\b/],
  ["creative", /\b(creative|art|music|film|video|photography|drawing|fashion)\b/],
  ["growth", /\b(careers?|interviews?|mentor\w*|coaching|productivity|writing|growth|habits?)\b/],
  ["lifestyle", /\b(lifestyle|cooking|food|wellness|fitness|health|beauty|travel)\b/],
  ["education", /\b(teach\w*|tutor\w*|exams?|study|students?|education|curriculum)\b/],
];

function subjectOf(text: string): CoverId | null {
  const t = text.toLowerCase();
  for (const [id, re] of RULES) if (re.test(t)) return id;
  return null;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** The title decides first; the summary and skills only when the title says nothing. */
export function coverFor(p: Pick<Product, "id" | "title" | "summary" | "skills">): {
  id: CoverId;
  variant: number;
} {
  const id =
    subjectOf(p.title) ?? subjectOf(`${p.summary ?? ""} ${p.skills.join(" ")}`) ?? "general";
  return { id, variant: hash(p.id) % COVER_VARIANTS[id] };
}
