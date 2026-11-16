import { z } from "zod";
import { demoId, readLocal, simulateDelay, writeLocal } from "@/lib/demo/local";
import { categories } from "@/content/blog";

/** Rules for the public "Write an article" form. Submissions wait for editorial review. */
export const ARTICLE_MIN_CHARS = 300;
export const ARTICLE_MAX_CHARS = 60000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "txt", "md"] as const;

export const SOCIAL_FIELDS = [
  { key: "twitter", label: "Twitter", placeholder: "twitter.com/yourname" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/yourname" },
  { key: "tiktok", label: "TikTok", placeholder: "tiktok.com/@yourname" },
  { key: "website", label: "Website or other", placeholder: "yourwebsite.com" },
] as const;

export type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"];

export type SubmissionInput = {
  fullName: string;
  email: string;
  bio: string;
  linkedin: string;
  socials: Partial<Record<SocialKey, string>>;
  title: string;
  category: string;
  body: string;
  hasDocument: boolean;
  hasCover: boolean;
  agreed: boolean;
};

export type SubmissionField =
  | "fullName"
  | "email"
  | "bio"
  | "linkedin"
  | "socials"
  | "title"
  | "category"
  | "body"
  | "cover"
  | "agreed";

export type SubmissionData = {
  full_name: string;
  email: string;
  bio: string | null;
  linkedin_url: string | null;
  social_links: { label: string; url: string }[];
  title: string;
  category: string;
  body: string | null;
};

/** Adds https:// when someone types "linkedin.com/in/ada"; returns null for anything that isn't a web link. */
export function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v.replace(/^http:\/\//i, "https://") : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname.includes(".") || withScheme.length > 300) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function isLinkedInUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

const email = z.string().trim().toLowerCase().min(1, "Enter your email address.").max(254, "That email is too long.").email("Enter a valid email address.");

export function validateSubmission(
  input: SubmissionInput,
): { ok: true; data: SubmissionData } | { ok: false; errors: Partial<Record<SubmissionField, string>> } {
  const errors: Partial<Record<SubmissionField, string>> = {};
  const clean = (s: string) => s.trim().replace(/[ \t]+/g, " ");

  const fullName = clean(input.fullName);
  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  else if (fullName.length > 100) errors.fullName = "Keep your name under 100 characters.";

  const mail = email.safeParse(input.email);
  if (!mail.success) errors.email = mail.error.issues[0]?.message ?? "Enter a valid email address.";

  const bio = input.bio.trim();
  if (bio.length > 600) errors.bio = "Keep your bio under 600 characters.";

  let linkedin: string | null = null;
  if (input.linkedin.trim()) {
    linkedin = normalizeUrl(input.linkedin);
    if (!linkedin || !isLinkedInUrl(linkedin)) errors.linkedin = "Paste your LinkedIn profile link, like linkedin.com/in/yourname.";
  }

  const social_links: { label: string; url: string }[] = [];
  for (const f of SOCIAL_FIELDS) {
    const raw = input.socials[f.key] ?? "";
    if (!raw.trim()) continue;
    const url = normalizeUrl(raw);
    if (!url) {
      errors.socials = `Check your ${f.label} link.`;
      continue;
    }
    social_links.push({ label: f.label, url });
  }

  const title = clean(input.title);
  if (title.length < 5) errors.title = "Give your article a title (at least 5 characters).";
  else if (title.length > 160) errors.title = "Keep the title under 160 characters.";

  if (!(categories as string[]).includes(input.category)) errors.category = "Choose a topic.";

  const body = input.body.trim();
  if (body.length > ARTICLE_MAX_CHARS) errors.body = "Your article is too long to paste here. Upload it as a document instead.";
  else if (!input.hasDocument && body.length < ARTICLE_MIN_CHARS)
    errors.body = `Write at least ${ARTICLE_MIN_CHARS} characters, or upload your article as a document.`;

  if (!input.hasCover) errors.cover = "Add a cover image for your article.";
  if (!input.agreed) errors.agreed = "Please confirm this is your own original work.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      full_name: fullName,
      email: mail.success ? mail.data : "",
      bio: bio || null,
      linkedin_url: linkedin,
      social_links,
      title,
      category: input.category,
      body: body || null,
    },
  };
}

export function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

/** Returns an error message, or null when the file is acceptable. */
export function checkFile(file: { name: string; size: number }, kind: "image" | "document"): string | null {
  const ext = fileExtension(file.name);
  if (kind === "image") {
    if (!(IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return "Use a JPG, PNG or WebP image.";
    if (file.size > MAX_IMAGE_BYTES) return "Images must be 5 MB or smaller.";
  } else {
    if (!(DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) return "Upload a PDF, Word, text or Markdown file.";
    if (file.size > MAX_FILE_BYTES) return "Documents must be 10 MB or smaller.";
  }
  if (file.size === 0) return "That file is empty.";
  return null;
}

export type SubmitResult = { status: "sent" } | { status: "error"; message: string };

const KEY = "enski:demo:blog-submissions";

/**
 * Demo submission: the answers and file names are saved on this device so the
 * flow can be tried end to end. Files themselves are never uploaded anywhere.
 */
export async function submitArticle(
  data: SubmissionData,
  files: { cover: File; photo?: File | null; document?: File | null },
): Promise<SubmitResult> {
  await simulateDelay(900);
  const list = readLocal<unknown[]>(KEY, []);
  const saved = writeLocal(KEY, [
    ...list,
    {
      id: demoId(),
      ...data,
      cover: files.cover.name,
      photo: files.photo?.name ?? null,
      document: files.document?.name ?? null,
      at: new Date().toISOString(),
    },
  ]);
  return saved ? { status: "sent" } : { status: "error", message: "Your browser blocked saving this submission. Your answers are still here." };
}
