import { Link, useNavigate } from "@tanstack/react-router";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { ArrowRight, Check, Compass, ShoppingCart, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { unitWord, type LearnerResource, type ResourceType } from "@/lib/learner/catalog";
import { addToCart, discountPct, recommendResources, type RecommendationReason } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { WishlistButton, price } from "./shared";

const filters: { id: "all" | ResourceType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Course", label: "Courses" },
  { id: "Ebook", label: "Ebooks" },
  { id: "Template", label: "Templates" },
  { id: "Coaching", label: "Coaching" },
];
const PAGE = 8;
const tagTone = { Bestseller: "bg-midnight text-on-dark", New: "bg-sky text-midnight", "Limited offer": "bg-cobalt text-primary-foreground" } as const;

/** Compact, image-led product card for the two-column discovery grid. */
export function DiscoveryCard({ r, reason }: { r: LearnerResource; reason: RecommendationReason }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const inCart = state.cart.some((c) => c.kind === "resource" && c.id === r.id);
  const off = discountPct(r);
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-soft transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-lift active:translate-y-0 active:scale-[0.985] has-[a:focus-visible]:shadow-[var(--focus-ring)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ice">
        <img src={r.image} alt={r.imageAlt} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        {r.tag && <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-extrabold shadow-soft", tagTone[r.tag])}>{r.tag}</span>}
        <WishlistButton item={{ kind: "resource", id: r.id }} className="absolute right-2 top-2 z-10 h-9 w-9 rounded-full border-0 bg-card/95 shadow-soft backdrop-blur" />
        {reason !== "starter" && <span className="absolute bottom-2 left-2 rounded-full bg-card/95 px-2 py-0.5 text-xs font-extrabold text-cobalt shadow-soft">For you</span>}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <p className="truncate text-xs font-bold text-cobalt">{r.type} · {r.category}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-snug text-midnight sm:text-sm">
          <Link to="/learner/resources/$resourceId" params={{ resourceId: r.id }} className="after:absolute after:inset-0 focus-visible:outline-none">
            {r.title}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.creator}</p>
        {r.rating !== undefined && (
          <p role="img" className="mt-1 flex items-center gap-1 text-xs" aria-label={`Rated ${r.rating} out of 5 from ${r.reviews ?? 0} reviews`}>
            <Star className="h-3.5 w-3.5 fill-lime text-lime-text" aria-hidden="true" />
            <span className="font-bold text-ink" aria-hidden="true">{r.rating.toFixed(1)}</span>
            {r.reviews !== undefined && <span className="text-muted-foreground" aria-hidden="true">({r.reviews})</span>}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-1.5 pt-2.5">
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold leading-none tabular-nums text-midnight sm:text-base">{price(r.price)}</p>
            {off > 0 && (
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
                <span className="text-muted-foreground line-through tabular-nums">{price(r.originalPrice!)}</span>
                <span className="font-extrabold text-success">-{off}%</span>
              </p>
            )}
            {off === 0 && <p className="mt-1 text-xs text-muted-foreground">{r.units.length} {unitWord(r.type, r.units.length !== 1)}</p>}
          </div>
          <Button
            type="button"
            size="icon"
            variant={inCart ? "soft" : "default"}
            className="relative z-10 h-9 w-9 shrink-0"
            aria-label={inCart ? `${r.title} is in your cart. View cart` : `Add ${r.title} to cart`}
            onClick={() => {
              if (inCart) {
                navigate({ to: "/learner/cart" });
                return;
              }
              update((s) => addToCart(s, { kind: "resource", id: r.id }));
              toast.success("Added to cart", { description: r.title, action: { label: "View cart", onClick: () => navigate({ to: "/learner/cart" }) } });
            }}
          >
            {inCart ? <Check /> : <ShoppingCart />}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function RecommendedForYou() {
  const { state } = useLearner();
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [shown, setShown] = useState(PAGE);
  const all = useMemo(() => recommendResources(state), [state]);
  const list = filter === "all" ? all : all.filter((x) => x.resource.type === filter);
  const personal = all.some((x) => x.reason !== "starter");
  const visible = list.slice(0, shown);
  return (
    <section aria-labelledby="recommended-title" className="mb-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-ice px-2.5 py-1 text-xs font-extrabold text-cobalt">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {personal ? "Picked for you" : "Starter picks"}
          </p>
          <h2 id="recommended-title" className="mt-2 text-lg font-extrabold sm:text-xl">Recommended for you</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {personal ? "Based on what you've saved, added to cart and bought." : "A mix of courses, templates and coaching while we learn what you like. Save items to personalise this."}
          </p>
        </div>
        <Link to="/learner/resources" search={{ view: "discover" }} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-cobalt hover:underline">
          Browse all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <SectionDropdown
        heading="Show"
        value={filter}
        onChange={(v) => {
          setFilter(v as typeof filter);
          setShown(PAGE);
        }}
        options={filters.map((f) => ({ value: f.id, label: f.label, count: f.id === "all" ? all.length : all.filter((x) => x.resource.type === f.id).length }))}
        className="mb-4 md:hidden"
      />
      <div className="mb-4 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Filter recommendations">
        {filters.map((f) => {
          const count = f.id === "all" ? all.length : all.filter((x) => x.resource.type === f.id).length;
          if (!count) return null;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f.id);
                setShown(PAGE);
              }}
              className={cn(
                "lime-pip inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-sm font-bold transition-colors",
                active ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card text-slate hover:border-cobalt-100 hover:text-cobalt",
              )}
            >
              {f.label}
              <span className={cn("text-xs tabular-nums", active ? "text-lime" : "text-muted-foreground")}>{count}</span>
            </button>
          );
        })}
      </div>
      {visible.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((x) => <DiscoveryCard key={x.resource.id} r={x.resource} reason={x.reason} />)}
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-success" /> You own everything here. Browse the full catalogue for more.
        </p>
      )}
      <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        {list.length > shown ? (
          <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>Show more ({list.length - shown})</Button>
        ) : (
          <Button asChild variant="outline"><Link to="/learner/resources" search={{ view: "discover" }}>Browse the catalogue</Link></Button>
        )}
      </div>
    </section>
  );
}
