/** Certificate design: templates, customisation and pure text rules shared by Creator and Learner. */
import { z } from "zod";

export const CERT_TEMPLATES = ["classic", "midnight", "horizon", "minimal", "portrait"] as const;
export const CERT_ACCENTS = ["lime", "sky", "cobalt"] as const;
export const ISSUER_TYPES = ["creator", "school", "institution"] as const;
export const CERT_FONTS = ["modern", "formal"] as const;
export const CERT_BORDERS = ["template", "fine", "double", "ornate"] as const;
export const CERT_BACKGROUNDS = ["template", "guilloche", "artwork"] as const;
/** What sits in the seal spot: the Enski seal, the issuer's own uploaded seal, or an achievement badge. */
export const CERT_EMBLEMS = ["enski", "custom", "badge"] as const;
export type CertFont = (typeof CERT_FONTS)[number];
export type CertBorder = (typeof CERT_BORDERS)[number];
export type CertTemplate = (typeof CERT_TEMPLATES)[number];
export type CertAccent = (typeof CERT_ACCENTS)[number];
export type IssuerType = (typeof ISSUER_TYPES)[number];

export const certificateDesignSchema = z.object({
  template: z.enum(CERT_TEMPLATES).default("classic"),
  accent: z.enum(CERT_ACCENTS).default("lime"),
  issuerType: z.enum(ISSUER_TYPES).default("creator"),
  /** Creator, school or institution name. Empty falls back to the creator's name. */
  issuerName: z.string().max(80).default(""),
  /** Optional logo as a resized data URL. */
  issuerLogo: z.string().default(""),
  signerRole: z.string().max(60).default(""),
  showSignature: z.boolean().default(true),
  showSeal: z.boolean().default(true),
  showId: z.boolean().default(true),
  /** The creator's design is what learners see first; when false, learners can't switch it. */
  learnerCanChange: z.boolean().default(true),

  /* ---- Branding & identity (all optional; the defaults keep each template's original look) ---- */
  /** Overrides the accent with an exact brand colour (#RRGGBB). Empty uses `accent`. */
  accentHex: z.string().regex(/^$|^#[0-9a-fA-F]{6}$/).default(""),
  font: z.enum(CERT_FONTS).default("modern"),
  border: z.enum(CERT_BORDERS).default("template"),
  background: z.enum(CERT_BACKGROUNDS).default("template"),
  /** Optional supporting artwork, drawn faintly behind the text when background = "artwork". */
  artwork: z.string().default(""),
  artworkOpacity: z.number().min(0.04).max(0.4).default(0.12),
  /** Organisation logo size, 70–140 % of its slot. */
  logoScale: z.number().min(0.7).max(1.4).default(1),
  /** Personal/creator logo and a secondary organisation logo, shown in the header strip. */
  creatorLogo: z.string().default(""),
  secondaryLogo: z.string().default(""),
  /** Uploaded handwritten signature for the main signer (transparent PNG). Empty draws the signer's name in script. */
  signatureImage: z.string().default(""),
  signatureScale: z.number().min(0.6).max(1.5).default(1),
  /** Horizontal nudge of the signature over its line, −1 (left) to 1 (right). */
  signatureOffset: z.number().min(-1).max(1).default(0),
  /** Optional second authorised signatory. Empty name = none. */
  cosignName: z.string().max(60).default(""),
  cosignTitle: z.string().max(60).default(""),
  cosignOrg: z.string().max(60).default(""),
  cosignImage: z.string().default(""),
  cosignScale: z.number().min(0.6).max(1.5).default(1),
  cosignOffset: z.number().min(-1).max(1).default(0),
  emblem: z.enum(CERT_EMBLEMS).default("enski"),
  /** Uploaded official seal, used when emblem = "custom". */
  sealImage: z.string().default(""),
  /** Achievement badge shown when emblem = "badge". */
  badgeId: z.string().default(""),
  /** Prints a QR code that opens the public verification page. */
  showQr: z.boolean().default(false),
});
export type CertificateDesign = z.infer<typeof certificateDesignSchema>;
export const defaultCertificateDesign: CertificateDesign = certificateDesignSchema.parse({});

export const templateInfo: Record<CertTemplate, { label: string; description: string }> = {
  classic: { label: "Classic", description: "White page with a cobalt course band and seal" },
  midnight: { label: "Midnight", description: "Deep navy with a fine accent frame" },
  horizon: { label: "Horizon", description: "Blue header over a clean white card" },
  minimal: { label: "Minimal", description: "Quiet double frame, centred layout" },
  portrait: { label: "Formal portrait", description: "A4 portrait, formal academic layout" },
};
export const fontInfo: Record<CertFont, { label: string; family: string }> = {
  modern: { label: "Modern sans", family: "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif" },
  formal: { label: "Formal serif", family: "Georgia, 'Times New Roman', Times, serif" },
};
export const borderInfo: Record<CertBorder, string> = { template: "Template frame", fine: "Fine line", double: "Double rule", ornate: "Ornate corners" };
export const backgroundInfo: Record<(typeof CERT_BACKGROUNDS)[number], string> = { template: "Template", guilloche: "Security pattern", artwork: "Your artwork" };

/** Artwork size: A4 landscape 1414 × 1000, or A4 portrait 1000 × 1414 for the portrait template. */
export const certSize = (d: Pick<CertificateDesign, "template">) => (d.template === "portrait" ? { w: 1000, h: 1414 } : { w: 1414, h: 1000 });
export const isPortrait = (d: Pick<CertificateDesign, "template">) => d.template === "portrait";

/** Page orientation. Portrait is its own formal template; every other template is landscape. */
export const CERT_LAYOUTS = ["landscape", "portrait"] as const;
export type CertLayout = (typeof CERT_LAYOUTS)[number];
export const layoutInfo: Record<CertLayout, { label: string; hint: string }> = {
  landscape: { label: "Landscape", hint: "A4 landscape, 297 × 210 mm" },
  portrait: { label: "Portrait", hint: "A4 portrait, 210 × 297 mm" },
};
export const layoutOf = (d: Pick<CertificateDesign, "template">): CertLayout => (isPortrait(d) ? "portrait" : "landscape");
export const templatesFor = (l: CertLayout): CertTemplate[] => CERT_TEMPLATES.filter((t) => (t === "portrait") === (l === "portrait"));
/** The template to use after switching layout: unchanged if already in it, else `back` (the last landscape template) or the first one. */
export function templateForLayout(current: CertTemplate, l: CertLayout, back?: CertTemplate): CertTemplate {
  const options = templatesFor(l);
  if (options.includes(current)) return current;
  return back && options.includes(back) ? back : options[0]!;
}
export const accentInfo: Record<CertAccent, string> = { lime: "Lime", sky: "Sky", cobalt: "Cobalt" };
export const issuerInfo: Record<IssuerType, { label: string; nameLabel: string; role: string }> = {
  creator: { label: "Creator", nameLabel: "Creator or brand name", role: "Course creator" },
  school: { label: "School", nameLabel: "School name", role: "Head of school" },
  institution: { label: "Institution", nameLabel: "Institution name", role: "Programme director" },
};

/**
 * Brand guide hex values. The certificate is exported as a standalone image that
 * cannot read app styles, so the locked palette is mirrored here once.
 */
export const CERT_COLORS = {
  cobalt: "#1A42A6", cobaltPress: "#112D74", cobaltGlow: "#2656C4", cobalt50: "#EAF0FC", cobalt100: "#CCDAF7", cobalt300: "#6A90E3",
  midnight: "#0A1F55", sky: "#3D8EF0", skyLight: "#7CC2F7", ice: "#E6F0FE", lime: "#C2F24A", soft: "#F4F7FC", line: "#DCE6F8",
  muted: "#5B6B99", onDarkMuted: "#C9D5F2", white: "#FFFFFF",
} as const;
export const accentHex = (a: CertAccent, onDark = false) =>
  a === "lime" ? CERT_COLORS.lime : a === "sky" ? (onDark ? CERT_COLORS.skyLight : CERT_COLORS.sky) : onDark ? CERT_COLORS.cobalt300 : CERT_COLORS.cobalt;

/** The accent as hex: the creator's exact brand colour when set, else the chosen brand accent. */
export const accentFor = (d: Pick<CertificateDesign, "accent" | "accentHex">, onDark = false) => d.accentHex || accentHex(d.accent, onDark);

/**
 * Fits a recipient name inside `maxWidth`: one line when it can stay at least `min` px,
 * otherwise two balanced lines at a smaller size, so long names never run into other elements.
 */
export function fitName(name: string, base: number, maxWidth: number, min = 40): { lines: string[]; size: number } {
  const one = fitFontSize(name, base, maxWidth, 12);
  if (one >= min || !name.trim().includes(" ")) return { lines: [name], size: Math.max(one, 18) };
  const lines = wrapLines(name, Math.ceil(name.length / 2) + 4, 2);
  const longest = lines.reduce((a, l) => Math.max(a, l.length), 0);
  return { lines, size: Math.max(18, Math.min(Math.round(base * 0.62), fitFontSize("x".repeat(longest), base, maxWidth, 18))) };
}

/** Who issued it: the chosen school/institution/brand, else the creator's own name. */
export const issuerDisplay = (d: Pick<CertificateDesign, "issuerName">, creatorName: string) => d.issuerName.trim() || creatorName.trim() || "Enski creator";
export const signerRoleDisplay = (d: Pick<CertificateDesign, "signerRole" | "issuerType">) => d.signerRole.trim() || issuerInfo[d.issuerType].role;

/** The sentence under the course title, worded for who is issuing it. */
export function completionLine(type: IssuerType, issuer: string) {
  return type === "creator"
    ? `an online course created by ${issuer} and offered through Enski`
    : `an online course authorised by ${issuer} and offered through Enski`;
}

/** Splits text into at most `maxLines` lines of about `maxChars`, ending with an ellipsis if cut. */
export function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const greedy = wrapGreedy(text, maxChars, maxLines);
  if (greedy.length < 2 || greedy[greedy.length - 1]!.endsWith("…")) return greedy;
  // Balance the lines so the last one isn't a lone word.
  const n = greedy.length;
  for (let w = Math.ceil(text.length / n); w < maxChars; w++) {
    const lines = wrapGreedy(text, w, maxLines);
    if (lines.length === n && !lines[n - 1]!.endsWith("…")) return lines;
  }
  return greedy;
}

function wrapGreedy(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars || !cur) cur = next;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines.map((l) => (l.length > maxChars ? `${l.slice(0, maxChars - 1)}…` : l));
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1]!;
  kept[maxLines - 1] = `${last.length >= maxChars ? last.slice(0, maxChars - 1) : last}…`;
  return kept;
}

/** Font size that keeps a single line of `text` within about `maxWidth` px. */
export function fitFontSize(text: string, base: number, maxWidth: number, min = 28) {
  const est = (size: number) => text.length * size * 0.56;
  let size = base;
  while (size > min && est(size) > maxWidth) size -= 2;
  return size;
}

/** Stable, readable certificate number for a seed, e.g. "ENS-7F3K-92QD". */
export function certificateCode(seed: string) {
  const abc = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let out = "";
  for (let i = 0; i < 8; i++) { h = Math.imul(h ^ (h >>> 13), 0x5bd1e995); out += abc[(h >>> 0) % abc.length]; }
  return `ENS-${out.slice(0, 4)}-${out.slice(4)}`;
}

export const initials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "E";
export const certDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
