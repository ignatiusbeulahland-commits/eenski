import type { Attachment } from "./types";

export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

/** Screenshots are shrunk in the browser (max 1000px, JPEG) so they fit in device storage. */
export async function readImageAttachment(file: File): Promise<Attachment> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image, like a screenshot.");
  if (file.size > MAX_ATTACHMENT_BYTES) throw new Error("That image is over 8 MB. Please choose a smaller one.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("We couldn't read that image. Try another one."));
      el.src = url;
    });
    const scale = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("We couldn't read that image. Try another one.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { name: file.name || "screenshot.jpg", dataUrl: canvas.toDataURL("image/jpeg", 0.7) };
  } finally {
    URL.revokeObjectURL(url);
  }
}
