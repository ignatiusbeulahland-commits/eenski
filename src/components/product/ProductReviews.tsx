import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MessageSquareHeart, Star } from "lucide-react";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchReviews,
  parseReview,
  reviewsQueryKey,
  submitReview,
  summarizeReviews,
  type ProductReview,
  type ReviewErrors,
} from "@/lib/reviews/reviews";
import { cn } from "@/lib/utils";

/** Shared by the reviews tab and the rating in the page header, so both read the same data. */
export function useProductReviews(key: string | null | undefined) {
  return useQuery({
    queryKey: reviewsQueryKey(key ?? ""),
    queryFn: () => fetchReviews(key!),
    enabled: !!key,
    staleTime: 60_000,
  });
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("flex gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-4", n <= Math.round(value) ? "fill-sky text-sky" : "text-line")} aria-hidden />
      ))}
    </span>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * Ratings and reviews for one listing: the summary (Enski's verified rating when it has one,
 * otherwise the average of reviews left here), the written reviews, and a form to add one.
 */
export function ProductReviews({
  reviewKey,
  verified,
  verifiedBreakdown,
  noun,
  canReview,
  closedNote,
}: {
  reviewKey: string;
  /** The rating Enski already shows for this listing, if any. */
  verified?: { average: number; count: number | null } | null | undefined;
  verifiedBreakdown?: number[] | null | undefined;
  /** "Course", "eBook"… */
  noun: string;
  canReview: boolean;
  /** Shown instead of the form when the listing isn't open yet. */
  closedNote?: string;
}) {
  const { data: reviews = [], isLoading, isError, refetch } = useProductReviews(reviewKey);
  const local = summarizeReviews(reviews);
  const lower = noun.toLowerCase();

  const summary = verified
    ? {
        average: verified.average,
        label: verified.count !== null ? `${verified.count} verified ${verified.count === 1 ? "rating" : "ratings"} on Enski` : `${noun} rating`,
        breakdown: verified.count ? (verifiedBreakdown ?? null) : null,
        count: verified.count ?? 0,
      }
    : local
      ? { average: local.average, label: `${local.count} ${local.count === 1 ? "review" : "reviews"}`, breakdown: local.breakdown, count: local.count }
      : null;

  return (
    <div className="space-y-8">
      {summary ? (
        <div className="flex flex-col gap-8 rounded-card border border-line p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="text-center sm:w-44">
            <p className="text-5xl font-extrabold text-ink">{summary.average.toFixed(1)}</p>
            <Stars value={summary.average} className="mt-2 justify-center" />
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{summary.label}</p>
          </div>
          {summary.breakdown && summary.count > 0 ? (
            <ul className="flex-1 space-y-2">
              {summary.breakdown.map((n, i) => {
                const pct = Math.round((n / summary.count) * 100);
                return (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                    <span className="w-12 shrink-0">{5 - i} star</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ice">
                      <span className="block h-full rounded-full bg-sky" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-10 shrink-0 text-right">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              Read what people say about this {lower}, then add your own rating below.
            </p>
          )}
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-card border border-dashed border-line bg-soft p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-ice text-brand">
              <MessageSquareHeart className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-ink">No reviews yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {canReview ? `Be the first to rate this ${lower}.` : (closedNote ?? `Reviews open once this ${lower} is available.`)}
            </p>
          </div>
        )
      )}

      <section aria-label="Written reviews">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Loading reviews…
          </p>
        ) : isError ? (
          <p className="text-sm font-semibold text-muted-foreground">
            We couldn't load reviews just now.{" "}
            <button type="button" onClick={() => refetch()} className="font-extrabold text-brand underline underline-offset-4">
              Try again
            </button>
          </p>
        ) : (
          reviews.length > 0 && (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </ul>
          )
        )}
      </section>

      {canReview ? (
        <ReviewForm reviewKey={reviewKey} noun={lower} />
      ) : (
        reviews.length > 0 && <p className="text-sm font-semibold text-muted-foreground">{closedNote ?? `Reviews open once this ${lower} is available.`}</p>
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  const initials = review.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <li className="rounded-card border border-line p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-ice text-sm font-extrabold text-brand">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-ink">{review.name}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            <time dateTime={review.createdAt}>{dateFmt.format(new Date(review.createdAt))}</time>
          </p>
        </div>
        <Stars value={review.rating} />
      </div>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{review.body}</p>
    </li>
  );
}

const ratingWords = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function StarPicker({ value, onChange, error, labelId }: { value: number; onChange: (n: number) => void; error?: string | undefined; labelId: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, (value || 2) - 1));
    }
  };
  return (
    <div>
      <div role="radiogroup" aria-labelledby={labelId} aria-invalid={!!error} onKeyDown={onKey} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${ratingWords[n]}`}
            tabIndex={value === n || (!value && n === 1) ? 0 : -1}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            className="grid size-11 place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star className={cn("size-7", n <= shown ? "fill-sky text-sky" : "text-line")} aria-hidden />
          </button>
        ))}
        <span className="ml-2 text-sm font-extrabold text-ink" aria-hidden>
          {shown ? ratingWords[shown] : ""}
        </span>
      </div>
      {error && <p className="mt-1 text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}

function ReviewForm({ reviewKey, noun }: { reviewKey: string; noun: string }) {
  const id = useId();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [state, setState] = useState<{ kind: "idle" | "sending" | "done" | "already" } | { kind: "error"; message: string }>({ kind: "idle" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseReview({ rating, name, email, body });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setState({ kind: "sending" });
    const res = await submitReview(reviewKey, parsed.data);
    if (res.status === "posted") {
      setState({ kind: "done" });
      await qc.invalidateQueries({ queryKey: reviewsQueryKey(reviewKey) });
      await qc.invalidateQueries({ queryKey: ["review-summaries"] });
    } else if (res.status === "already") {
      setState({ kind: "already" });
    } else {
      setState({ kind: "error", message: res.message });
    }
  };

  if (state.kind === "done") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-card bg-ice p-5">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
        <p className="font-semibold text-ink">Thanks! Your review is now live on this {noun}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-card border border-line bg-soft p-5 sm:p-7">
      <h3 className="text-xl font-extrabold text-ink">Rate this {noun}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Share an honest review to help other dreamers decide. Your email is never shown.</p>

      <div className="mt-5 space-y-5">
        <div>
          <p id={`${id}-rating`} className="mb-1.5 text-sm font-extrabold text-ink">Your rating</p>
          <StarPicker value={rating} onChange={setRating} error={errors.rating} labelId={`${id}-rating`} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${id}-name`} className="font-extrabold text-ink">Your name</Label>
            <Input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={!!errors.name} className="mt-1.5 h-12 bg-background" />
            {errors.name && <p className="mt-1 text-sm font-semibold text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}-email`} className="font-extrabold text-ink">Email <span className="font-semibold text-muted-foreground">(not shown)</span></Label>
            <Input id={`${id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" aria-invalid={!!errors.email} className="mt-1.5 h-12 bg-background" />
            {errors.email && <p className="mt-1 text-sm font-semibold text-destructive">{errors.email}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor={`${id}-body`} className="font-extrabold text-ink">Your review</Label>
          <Textarea
            id={`${id}-body`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={1500}
            placeholder={`What did you like? What could be better?`}
            aria-invalid={!!errors.body}
            className="mt-1.5 bg-background"
          />
          <div className="mt-1 flex justify-between gap-3 text-sm">
            <span className="font-semibold text-destructive">{errors.body}</span>
            <span className="shrink-0 text-muted-foreground">{body.trim().length}/1500</span>
          </div>
        </div>
      </div>

      {state.kind === "already" && (
        <p role="alert" className="mt-4 text-sm font-semibold text-ink">You've already reviewed this {noun} with that email. Thank you!</p>
      )}
      {state.kind === "error" && (
        <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Posting…</> : "Post review"}
      </Button>
    </form>
  );
}
