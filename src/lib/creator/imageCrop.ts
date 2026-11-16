/** Rules for storefront photos and banners: minimum size and the crop a creator picks. */
export const MIN_IMAGE_SIDE = 1080;

/** Why an image is too small, or null when both sides are at least 1080 px. */
export function imageSizeProblem(width: number, height: number, min = MIN_IMAGE_SIDE): string | null {
  if (width >= min && height >= min) return null;
  return `This image is ${width} × ${height} px. Choose one at least ${min} × ${min} px so it stays sharp on every screen.`;
}

export type Crop = { zoom: number; x: number; y: number };
export const CROP_START: Crop = { zoom: 1, x: 0.5, y: 0.5 };

/**
 * The part of the source image to keep for a frame with the given aspect (width / height).
 * zoom ≥ 1 narrows the area; x / y (0–1) say where its centre sits within the free range.
 */
export function cropRect(srcW: number, srcH: number, aspect: number, crop: Crop) {
  const zoom = Math.max(1, Math.min(4, crop.zoom));
  let w = srcW;
  let h = srcW / aspect;
  if (h > srcH) { h = srcH; w = srcH * aspect; }
  w /= zoom;
  h /= zoom;
  const cx = Math.max(0, Math.min(1, crop.x));
  const cy = Math.max(0, Math.min(1, crop.y));
  return { sx: Math.round((srcW - w) * cx), sy: Math.round((srcH - h) * cy), sw: Math.round(w), sh: Math.round(h) };
}

/** Browser only: decodes an image file. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("decode"));
    el.src = src;
  });
}

/** Browser only: draws the chosen crop at the output size and returns a compact data URL. */
export function renderCrop(img: HTMLImageElement, aspect: number, crop: Crop, outW: number): string {
  const r = cropRect(img.naturalWidth, img.naturalHeight, aspect, crop);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = Math.round(outW / aspect);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.88);
}
