import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { useState } from "react";
import { MessageSquareText, Star, EyeOff, Eye, Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { PageHeader, Panel, EmptyState, FilterSelect, StatCard } from "@/components/affiliate/ui";
import { useCreator } from "@/lib/creator/store";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { averageRating, type Review } from "@/lib/creator/rules";
import { shortDate } from "./shared";
function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={n <= value ? "h-4 w-4 fill-lime text-lime-text" : "h-4 w-4 text-line"} aria-hidden="true" />
      ))}
    </span>
  );
}
export function ReviewsPage() {
  const { state, update } = useCreator();
  const [rating, setRating] = useState("all");
  const [product, setProduct] = useState("all");
  const [report, setReport] = useState<Review | null>(null);
  const list = state.reviews
    .filter((r) => (rating === "all" || r.rating === Number(rating)) && (product === "all" || r.itemId === product))
    .slice()
    .reverse();
  const reviewed = state.items.filter((i) => state.reviews.some((r) => r.itemId === i.id));
  return (
    <div>
      <PageHeader
        eyebrow="Your customers"
        title="Reviews"
        description="See what customers say about your products. You can hide a review from your storefront, or report it to the Enski team."
      />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={MessageSquareText} label="Total reviews" value={String(state.reviews.length)} />
        <StatCard
          icon={Star}
          art={brandArtwork.rating}
          label="Average rating"
          value={state.reviews.length ? `${averageRating(state.reviews)} / 5` : "—"}
          tone="lime"
        />
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <FilterSelect
          value={rating}
          onChange={setRating}
          options={[["all", "All ratings"], ...["5", "4", "3", "2", "1"].map((r) => [r, `${r} star${r === "1" ? "" : "s"}`] as [string, string])]}
        />
        <FilterSelect
          value={product}
          onChange={setProduct}
          options={[["all", "All products"], ...reviewed.map((i) => [i.id, i.title] as [string, string])]}
        />
      </div>
      <Panel title="Customer reviews">
        <div className="divide-y">
          {list.map((r) => (
            <article key={r.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{r.customerName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.itemTitle} · {shortDate(r.date)}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className={`mt-3 text-sm leading-6 ${r.hidden ? "text-muted-foreground line-through" : ""}`}>{r.comment}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    update((s) => ({ reviews: s.reviews.map((x) => (x.id === r.id ? { ...x, hidden: !x.hidden } : x)) }));
                    toast.success(r.hidden ? "Review visible on your storefront" : "Review hidden from your storefront");
                  }}
                >
                  {r.hidden ? <Eye /> : <EyeOff />}
                  {r.hidden ? "Show" : "Hide"}
                </Button>
                {r.reported ? (
                  <span className="text-xs font-semibold text-muted-foreground">Reported to Enski</span>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setReport(r)}>
                    <Flag />
                    Report
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
        {!list.length && (
          <EmptyState
            icon={MessageSquareText}
            title={state.reviews.length ? "No matching reviews" : "No reviews yet"}
            description={
              state.reviews.length
                ? "Try another rating or product."
                : "When customers review your products, you'll see their reviews here."
            }
            compact
          />
        )}
      </Panel>
      <ConfirmDialog
        open={!!report}
        onOpenChange={(v) => !v && setReport(null)}
        art={brandArtwork.rating}
        eyebrow="Reviews"
        title="Report this review?"
        description="Report reviews that are abusive, spam or unrelated to your product."
        confirmLabel="Report review"
        confirmIcon={<Flag />}
        onConfirm={() => {
          if (report) update((s) => ({ reviews: s.reviews.map((x) => (x.id === report.id ? { ...x, reported: true } : x)) }));
          setReport(null);
          toast.success("Review reported");
        }}
      />
    </div>
  );
}
