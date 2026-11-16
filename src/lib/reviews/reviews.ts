import { z } from "zod";
import { demoId, readLocal, simulateDelay, writeLocal } from "@/lib/demo/local";

const KEY = "enski:demo:reviews";

type StoredReview = ProductReview & { key: string; email: string };

const stored = () => readLocal<StoredReview[]>(KEY, []);

/** Which kind of page a review belongs to; the key is `<kind>:<slug>`. */
export type ReviewKind = "course" | "showcase" | "dreamverse";

export function reviewKey(kind: ReviewKind, slug: string): string {
  return `${kind}:${slug.toLowerCase()}`;
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  body: string;
  createdAt: string;
}

export const reviewInput = z.object({
  rating: z.number({ message: "Pick a star rating." }).int().min(1, "Pick a star rating.").max(5, "Pick a star rating."),
  name: z
    .string()
    .transform((s) => s.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(2, "Enter your name.").max(60, "Keep your name under 60 characters.")),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .max(254, "That email is too long.")
    .email("Enter a valid email address."),
  body: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(10, "Write at least 10 characters.").max(1500, "Keep your review under 1,500 characters.")),
});

export type ReviewInput = z.infer<typeof reviewInput>;

export type ReviewErrors = Partial<Record<keyof ReviewInput, string>>;

export function parseReview(raw: { rating: number; name: string; email: string; body: string }):
  | { ok: true; data: ReviewInput }
  | { ok: false; errors: ReviewErrors } {
  const r = reviewInput.safeParse(raw);
  if (r.success) return { ok: true, data: r.data };
  const errors: ReviewErrors = {};
  for (const issue of r.error.issues) {
    const k = issue.path[0] as keyof ReviewInput;
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false, errors };
}

/** Average to one decimal and a 5→1 star breakdown, or null when there are no reviews. */
export function summarizeReviews(reviews: Pick<ProductReview, "rating">[]):
  | { average: number; count: number; breakdown: number[] }
  | null {
  if (reviews.length === 0) return null;
  const breakdown = [0, 0, 0, 0, 0];
  let total = 0;
  for (const r of reviews) {
    total += r.rating;
    breakdown[5 - r.rating]! += 1;
  }
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length, breakdown };
}

export const reviewsQueryKey = (key: string) => ["product-reviews", key] as const;

/** Reviews left in this demo, on this device only. Emails are kept only to stop duplicates and never shown. */
export async function fetchReviews(key: string): Promise<ProductReview[]> {
  return stored()
    .filter((r) => r.key === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ id, name, rating, body, createdAt }) => ({ id, name, rating, body, createdAt }));
}

/** Rating summaries for many listings at once (cards). */
export function reviewSummaries(keys: string[]): Record<string, { average: number; count: number }> {
  const wanted = new Set(keys);
  const out: Record<string, { average: number; count: number }> = {};
  const all = stored().filter((r) => wanted.has(r.key));
  for (const key of wanted) {
    const s = summarizeReviews(all.filter((r) => r.key === key));
    if (s) out[key] = { average: s.average, count: s.count };
  }
  return out;
}

export type SubmitResult = { status: "posted" } | { status: "already" } | { status: "error"; message: string };

export async function submitReview(key: string, input: ReviewInput): Promise<SubmitResult> {
  await simulateDelay(500);
  const all = stored();
  if (all.some((r) => r.key === key && r.email === input.email)) return { status: "already" };
  const review: StoredReview = {
    id: demoId(),
    key,
    email: input.email,
    name: input.name,
    rating: input.rating,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  return writeLocal(KEY, [review, ...all])
    ? { status: "posted" }
    : { status: "error", message: "Your browser blocked saving this review. Please try again." };
}
