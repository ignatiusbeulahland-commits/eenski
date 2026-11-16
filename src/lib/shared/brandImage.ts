/**
 * Reads logos, seals, artwork and signatures for certificates entirely in the browser.
 * PNG/WebP/SVG keep transparency (saved as PNG); JPG stays JPG. SVGs are drawn to a
 * canvas first, so no SVG code is ever stored or inserted into the page.
 */

export const BRAND_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const BRAND_IMAGE_ACCEPT = BRAND_IMAGE_TYPES.join(",");
export const BRAND_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const BRAND_SVG_MAX_BYTES = 1024 * 1024;

/** Why a file can't be used, or null. */
export function brandFileProblem(file: { type: string; size: number }): string | null {
  if (!(BRAND_IMAGE_TYPES as readonly string[]).includes(file.type)) return "Use a PNG, JPG, WebP or SVG image";
  if (file.size === 0) return "That file is empty";
  if (file.type === "image/svg+xml" && file.size > BRAND_SVG_MAX_BYTES) return "SVG files must be under 1 MB";
  if (file.size > BRAND_IMAGE_MAX_BYTES) return "Choose an image under 4 MB";
  return null;
}

/**
 * Bounding box of the visible ink: pixels that aren't transparent and (optionally) aren't near-white.
 * Returns null when the image is blank.
 */
export function inkBox(data: Uint8ClampedArray, w: number, h: number, ignoreWhite: boolean): { x: number; y: number; w: number; h: number } | null {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3]!;
      if (a < 16) continue;
      if (ignoreWhite && data[i]! > 235 && data[i + 1]! > 235 && data[i + 2]! > 235) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Makes near-white paper transparent with a soft edge, for signatures scanned or photographed on paper. */
export function knockOutWhite(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114);
    if (lum > 225) data[i + 3] = 0;
    else if (lum > 170) data[i + 3] = Math.round(data[i + 3]! * ((225 - lum) / 55));
  }
}

export type BrandImageOptions = { max?: number; trim?: boolean; removeWhite?: boolean };

/** Loads, optionally cleans and trims, and downsizes an image. Resolves a data URL that keeps its proportions. */
export async function readBrandImage(file: File, { max = 900, trim = true, removeWhite = false }: BrandImageOptions = {}): Promise<string> {
  const problem = brandFileProblem(file);
  if (problem) throw new Error(problem);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("We couldn't read that image. Try another file."));
      i.src = url;
    });
    let w = img.naturalWidth || 600;
    let h = img.naturalHeight || 600;
    // SVGs without a size: draw them big enough to stay crisp.
    if (file.type === "image/svg+xml" && Math.max(w, h) < max) { const k = max / Math.max(w, h); w *= k; h *= k; }
    const k = Math.min(1, (max * 1.5) / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * k));
    const ch = Math.max(1, Math.round(h * k));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Image editing isn't available in this browser");
    ctx.drawImage(img, 0, 0, cw, ch);
    const keepsAlpha = file.type !== "image/jpeg" || removeWhite;
    const pixels = ctx.getImageData(0, 0, cw, ch);
    if (removeWhite) { knockOutWhite(pixels.data); ctx.putImageData(pixels, 0, 0); }
    const box = trim ? inkBox(pixels.data, cw, ch, !keepsAlpha) : null;
    if (trim && !box) throw new Error("That image looks blank. Try another file.");
    const src = box ?? { x: 0, y: 0, w: cw, h: ch };
    const pad = Math.round(Math.max(src.w, src.h) * 0.03);
    const sx = Math.max(0, src.x - pad), sy = Math.max(0, src.y - pad);
    const sw = Math.min(cw - sx, src.w + pad * 2), sh = Math.min(ch - sy, src.h + pad * 2);
    const f = Math.min(1, max / Math.max(sw, sh));
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.round(sw * f));
    out.height = Math.max(1, Math.round(sh * f));
    const octx = out.getContext("2d");
    if (!octx) throw new Error("Image editing isn't available in this browser");
    octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return keepsAlpha ? out.toDataURL("image/png") : out.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}
