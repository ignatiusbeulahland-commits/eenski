import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { CreatorAvatar } from "@/components/dreamverse/CreatorAvatar";
import { Button } from "@/components/ui/button";
import { summarizeReviews } from "@/lib/reviews/reviews";
import { cn } from "@/lib/utils";

import { useProductReviews } from "./ProductReviews";

export interface ProductTab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface ProductCreator {
  name: string;
  avatar?: string | null | undefined;
  /** Profile key on `/creators/$slug`, when they have a public profile. */
  slug?: string | null | undefined;
  role?: string | null | undefined;
}

interface Props {
  /** "Course", "eBook", "Coaching"… shown as the lime chip. */
  kindLabel: string;
  /** Breadcrumb items, links or plain text. The title is added last. */
  crumbs: ReactNode[];
  /** Extra chips after the kind chip (status, demo). */
  chips?: ReactNode;
  title: string;
  summary?: string | null | undefined;
  creator?: ProductCreator | null | undefined;
  rating?: { average: number; count: number | null } | null | undefined;
  /** Reviews left on this site; their average shows in the header when Enski has no rating. */
  reviewKey?: string | undefined;
  /** Extra items in the band's meta row (students, format). */
  meta?: ReactNode;
  tags?: string[] | undefined;
  cover: ReactNode;
  /** Rendered once: under the cover on phones, sticky beside the tabs on laptops. */
  buyCard: ReactNode;
  tabs: ProductTab[];
  /** Related rails and anything else before the creator call to action. */
  after?: ReactNode;
}

/**
 * The shared course / eBook / coaching page, from the Creator Product Showcase project:
 * cobalt band, cover overlapping it, sticky buy card, tabs, then a creator call to action.
 */
export function ProductLayout({ kindLabel, crumbs, chips, title, summary, creator, rating: verified, reviewKey, meta, tags, cover, buyCard, tabs, after }: Props) {
  const { data: reviews } = useProductReviews(verified ? null : reviewKey);
  const local = reviews ? summarizeReviews(reviews) : null;
  const rating = verified ?? (local ? { average: local.average, count: local.count } : null);
  const [tab, setTab] = useState(tabs[0]?.id ?? "");
  const tabsRef = useRef<HTMLDivElement>(null);
  const base = useId();
  const hasReviews = tabs.some((t) => t.id === "reviews");

  const showReviews = () => {
    setTab("reviews");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === tab);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const id = tabs[next]!.id;
    setTab(id);
    document.getElementById(`${base}-tab-${id}`)?.focus();
  };

  return (
    <>
      <section className="relative overflow-hidden bg-cobalt text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 bg-cobalt-light" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-28 pt-28 lg:pb-36 lg:pt-36">
          <nav aria-label="Breadcrumb" className="text-sm font-semibold text-on-blue">
            <ol className="flex flex-wrap items-center gap-1.5">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c}
                  <span aria-hidden>/</span>
                </li>
              ))}
              <li aria-current="page" className="max-w-full truncate font-bold text-primary-foreground">{title}</li>
            </ol>
          </nav>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-lime px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-midnight">
              {kindLabel}
            </span>
            {chips}
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-balance animate-rise lg:text-6xl">
            {title}
          </h1>
          {summary && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-blue">{summary}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold">
            {creator && <CreatorLine creator={creator} />}
            {rating &&
              (hasReviews ? (
                <button type="button" onClick={showReviews} className="flex min-h-11 items-center gap-1.5 hover:text-lime">
                  <RatingText rating={rating} />
                </button>
              ) : (
                <span className="flex items-center gap-1.5"><RatingText rating={rating} /></span>
              ))}
            {meta}
          </div>
          {tags && tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics">
              {tags.map((t) => (
                <li key={t} className="rounded-tag bg-primary-foreground/12 px-2.5 py-1 text-xs font-bold">#{t}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="relative mx-auto -mt-20 grid max-w-[1200px] gap-8 px-5 pb-16 lg:-mt-28 lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:pb-20">
        <div className="relative aspect-[16/9] min-w-0 overflow-hidden rounded-card bg-ice shadow-float">{cover}</div>

        <aside aria-label="Buy" className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-28">{buyCard}</div>
        </aside>

        <div ref={tabsRef} className="min-w-0 scroll-mt-28">
          <div role="tablist" aria-label={`About this ${kindLabel.toLowerCase()}`} onKeyDown={onKey} className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-soft p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`${base}-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`${base}-panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-h-11 flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-extrabold transition-colors",
                  tab === t.id ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-brand",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* Every panel stays in the page (hidden, not removed) so links and search engines still find it. */}
          {tabs.map((t) => (
            <div
              key={t.id}
              id={`${base}-panel-${t.id}`}
              role="tabpanel"
              aria-labelledby={`${base}-tab-${t.id}`}
              hidden={tab !== t.id}
              tabIndex={0}
              className="mt-8 space-y-10 focus-visible:outline-none"
            >
              {t.content}
            </div>
          ))}
        </div>
      </div>

      {after}
      <CreatorCta />
    </>
  );
}

function RatingText({ rating }: { rating: { average: number; count: number | null } }) {
  return (
    <>
      <Star className="size-4 fill-lime text-lime" aria-hidden />
      {rating.average.toFixed(1)}
      {rating.count !== null && (
        <span className="font-semibold text-on-blue">({rating.count} {rating.count === 1 ? "review" : "reviews"})</span>
      )}
    </>
  );
}

function CreatorLine({ creator }: { creator: ProductCreator }) {
  const body = (
    <>
      <CreatorAvatar name={creator.name} src={creator.avatar ?? null} size="md" className="size-11 ring-2 ring-lime" />
      <span>
        <span className="block text-[13px] font-semibold text-on-blue">Created by</span>
        {creator.name}
      </span>
    </>
  );
  return creator.slug ? (
    <Link to="/creators/$slug" params={{ slug: creator.slug }} className="flex min-h-11 items-center gap-3 hover:text-lime">
      {body}
    </Link>
  ) : (
    <span className="flex items-center gap-3">{body}</span>
  );
}

function CreatorCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-16" aria-labelledby="creator-cta-title">
      <div className="relative overflow-hidden rounded-card bg-midnight px-6 py-14 text-center text-primary-foreground sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60" aria-hidden />
        <h2 id="creator-cta-title" className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-balance lg:text-5xl">
          Your knowledge can change lives… <span className="text-lime">and your income.</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-on-blue">
          Build courses, eBooks or live sessions and let Enski handle everything else.
        </p>
        <Button variant="lime" size="lg" className="relative mt-8" asChild>
          <Link to="/auth" search={{ s: "register", as: "creator" }}>Get started free</Link>
        </Button>
      </div>
    </section>
  );
}
