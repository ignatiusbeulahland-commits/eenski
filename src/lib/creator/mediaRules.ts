/** Rules for files a Creator keeps in the Media Library. */
export type MediaKind = "image" | "video" | "audio" | "document";
export const MEDIA_KINDS: MediaKind[] = ["image", "video", "audio", "document"];
const MB = 1024 * 1024;
/** Largest file accepted for each kind. Videos are bigger, so they get more room. */
export const MEDIA_LIMITS: Record<MediaKind, number> = { image: 25 * MB, video: 500 * MB, audio: 100 * MB, document: 100 * MB };
export const MEDIA_FORMATS: Record<MediaKind, string[]> = {
  image: ["JPG", "PNG", "WEBP", "GIF", "SVG"],
  video: ["MP4", "MOV", "WEBM"],
  audio: ["MP3", "WAV", "M4A", "OGG"],
  document: ["PDF"],
};
const EXT: Record<string, MediaKind> = {
  jpg: "image", jpeg: "image", png: "image", webp: "image", gif: "image", svg: "image", avif: "image",
  mp4: "video", mov: "video", webm: "video", m4v: "video",
  mp3: "audio", wav: "audio", m4a: "audio", ogg: "audio", aac: "audio",
  pdf: "document",
};
export const extOf = (name: string) => (name.includes(".") ? (name.split(".").pop() ?? "").toLowerCase() : "");

export function mediaKindOf(file: { type: string; name: string }): MediaKind | null {
  const t = file.type;
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("audio/")) return "audio";
  if (t === "application/pdf") return "document";
  return EXT[extOf(file.name)] ?? null;
}

const one = (v: number) => v.toFixed(1).replace(/\.0$/, "");
export const fileSize = (n: number) =>
  n >= 1024 * MB ? `${one(n / (1024 * MB))} GB` : n >= MB ? `${one(n / MB)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

/** Why a file can't be added, or null when it's fine. */
export function mediaProblem(file: { type: string; name: string; size: number }): string | null {
  const kind = mediaKindOf(file);
  if (!kind) return `${file.name} isn't an image, video, audio file or PDF.`;
  if (!file.size) return `${file.name} is empty.`;
  if (file.size > MEDIA_LIMITS[kind]) return `${file.name} is larger than ${fileSize(MEDIA_LIMITS[kind])}.`;
  return null;
}

/** 75 → "1:15", 3725 → "1:02:05". */
export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** Course lessons that use a Media Library file. */
export function mediaUsage(
  items: { id: string; title: string; kind: string; course?: { modules: { lessons: { id: string; title: string; mediaId: string }[] }[] } | undefined }[],
  mediaId: string,
) {
  return items.flatMap((i) =>
    (i.course?.modules ?? []).flatMap((m) => m.lessons.filter((l) => l.mediaId === mediaId).map((l) => ({ itemId: i.id, itemTitle: i.title, lessonId: l.id, lessonTitle: l.title }))),
  );
}
