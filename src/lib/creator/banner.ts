/** Storefront banner rules: tidy a creator's banner words and draw a brand-styled banner from them. */
export const BANNER_STYLES = [
  { id: "cobalt", label: "Cobalt glow", hint: "Signature blue" },
  { id: "midnight", label: "Midnight", hint: "Deep and bold" },
  { id: "ice", label: "Ice", hint: "Light and clean" },
] as const;
export type BannerStyle = (typeof BANNER_STYLES)[number]["id"];

export const HEADLINE_MAX = 60;
export const SUBLINE_MAX = 100;
/** Banner images are 16:5 so they fill the storefront header on every screen. */
export const BANNER_SIZE = { width: 1600, height: 500 } as const;

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const sentenceStart = (s: string) => (s ? s[0]!.toLocaleUpperCase() + s.slice(1) : s);

/**
 * Tidies banner words: trims and collapses spaces, turns all-caps shouting into
 * sentence case, capitalises the first letter, drops trailing full stops and
 * repeated punctuation from the headline, and keeps both lines within limits.
 */
export function tidyBannerWords(headline: string, subline: string) {
  const fix = (raw: string, max: number, isHeadline: boolean) => {
    let s = clean(raw);
    const letters = s.replace(/[^A-Za-z]/g, "");
    if (letters.length > 3 && letters === letters.toUpperCase()) s = s.toLowerCase();
    s = s.replace(/([!?.,])\1+/g, "$1").replace(/\s+([!?.,:;])/g, "$1").replace(/([,;:])(?=[A-Za-z])/g, "$1 ");
    if (isHeadline) s = s.replace(/[.,;:]+$/, "");
    s = sentenceStart(s);
    if (s.length > max) s = s.slice(0, max).replace(/\s+\S*$/, "").trim() || s.slice(0, max);
    return s;
  };
  return { headline: fix(headline, HEADLINE_MAX, true), subline: fix(subline, SUBLINE_MAX, false) };
}

/** Splits text into at most `maxLines` lines that fit `width`, using the given measure function. */
export function wrapLines(text: string, width: number, measure: (s: string) => number, maxLines: number) {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (measure(next) <= width || !line) line = next;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return { lines: lines.slice(0, maxLines), overflow: lines.length > maxLines };
}

const C = {
  cobalt: "#1A42A6", cobaltPress: "#112D74", cobaltGlow: "#2656C4", cobalt100: "#CCDAF7",
  midnight: "#0A1F55", sky: "#3D8EF0", skyLight: "#7CC2F7", ice: "#E6F0FE", lime: "#C2F24A", white: "#FFFFFF", muted: "#5B6B99",
};
const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif';

/** Browser only: draws the banner and returns it as a compact image data URL. */
export async function renderBanner(o: { headline: string; subline: string; style: BannerStyle; storeName: string }) {
  const { width: W, height: H } = BANNER_SIZE;
  try { await Promise.all([document.fonts.load(`800 80px ${FONT}`), document.fonts.load(`600 34px ${FONT}`)]); } catch { /* fall back to system font */ }
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const dark = o.style !== "ice";

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (o.style === "cobalt") { bg.addColorStop(0, C.cobaltPress); bg.addColorStop(0.55, C.cobalt); bg.addColorStop(1, C.cobaltPress); }
  else if (o.style === "midnight") { bg.addColorStop(0, C.midnight); bg.addColorStop(1, C.cobaltPress); }
  else { bg.addColorStop(0, C.white); bg.addColorStop(1, C.ice); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.78, H * 0.45, 0, W * 0.78, H * 0.45, W * 0.42);
  const glowColor = o.style === "cobalt" ? "rgba(61,142,240,0.55)" : o.style === "midnight" ? "rgba(38,86,196,0.45)" : "rgba(124,194,247,0.35)";
  glow.addColorStop(0, glowColor); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Rings and dots on the right
  ctx.lineWidth = 2;
  for (const [r, a] of [[150, 0.35], [230, 0.22], [320, 0.12]] as const) {
    ctx.strokeStyle = dark ? `rgba(255,255,255,${a})` : `rgba(26,66,166,${a})`;
    ctx.beginPath(); ctx.arc(W * 0.8, H * 0.5, r, 0, Math.PI * 2); ctx.stroke();
  }
  let seed = o.headline.length * 31 + o.style.length * 7 + 11;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 46; i++) {
    const x = W * (0.55 + rnd() * 0.45), y = rnd() * H, r = 1.2 + rnd() * 2.4;
    ctx.fillStyle = i % 5 === 0 ? C.lime : dark ? `rgba(255,255,255,${0.25 + rnd() * 0.5})` : `rgba(26,66,166,${0.2 + rnd() * 0.35})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = dark ? C.lime : C.cobalt;
  ctx.beginPath(); ctx.arc(W * 0.8, H * 0.5 - 150, 7, 0, Math.PI * 2); ctx.fill();

  // Words, kept in the upper left so the profile photo never covers them
  const left = 96, maxW = W * 0.56;
  ctx.textBaseline = "alphabetic";
  let y = 84;
  if (o.storeName.trim()) {
    ctx.font = `700 26px ${FONT}`;
    ctx.fillStyle = dark ? C.lime : C.cobalt;
    ctx.beginPath(); ctx.arc(left + 6, y - 9, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dark ? "rgba(255,255,255,0.85)" : C.muted;
    ctx.fillText(o.storeName.trim().slice(0, 48), left + 24, y);
    y += 30;
  }
  let size = 80, wrapped = { lines: [] as string[], overflow: false };
  for (; size >= 52; size -= 4) {
    ctx.font = `800 ${size}px ${FONT}`;
    wrapped = wrapLines(o.headline, maxW, (s) => ctx.measureText(s).width, 2);
    if (!wrapped.overflow) break;
  }
  ctx.fillStyle = dark ? C.white : C.midnight;
  for (const line of wrapped.lines) { y += size * 1.08; ctx.fillText(line, left, y); }
  ctx.fillStyle = C.lime;
  ctx.beginPath(); ctx.roundRect(left, y + 30, 96, 8, 4); ctx.fill();
  y += 40;
  if (o.subline) {
    // One line only, so it stays clear of the profile photo at the bottom left
    let sub = 32;
    for (; sub > 22; sub -= 2) { ctx.font = `600 ${sub}px ${FONT}`; if (ctx.measureText(o.subline).width <= maxW) break; }
    ctx.fillStyle = dark ? "rgba(230,240,254,0.88)" : C.muted;
    let line = o.subline;
    while (line.length > 1 && ctx.measureText(line).width > maxW) line = line.slice(0, -2).trimEnd() + "…";
    ctx.fillText(line, left, y + sub + 14);
  }
  const webp = canvas.toDataURL("image/webp", 0.88);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.88);
}
