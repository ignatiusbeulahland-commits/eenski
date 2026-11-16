/** Rules and helpers for product cover images a Creator uploads. */
export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const COVER_MAX_BYTES = 5 * 1024 * 1024;
/** Uploaded covers are resized so the longest side is at most this many pixels. */
export const COVER_MAX_SIDE = 1200;

export function validateCoverFile(file: { type: string; size: number }): string | null {
  if (!(COVER_TYPES as readonly string[]).includes(file.type)) return "Choose a JPG, PNG or WebP image.";
  if (file.size > COVER_MAX_BYTES) return "Choose an image smaller than 5 MB.";
  if (file.size === 0) return "That file is empty. Choose another image.";
  return null;
}

/** Scales (w, h) down so neither side exceeds max, keeping the aspect ratio. */
export function fitWithin(w: number, h: number, max = COVER_MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** Browser only: decodes, resizes and re-encodes the image as a compact data URL. */
export async function readCoverFile(file: File, maxSide = COVER_MAX_SIDE): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, maxSide);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, width, height);
    const webp = canvas.toDataURL("image/webp", 0.82);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
