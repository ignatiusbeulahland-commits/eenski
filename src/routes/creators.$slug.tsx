import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, Info, MapPin, Plus, Star } from "lucide-react";
import { toast } from "sonner";

import { CreatorAvatar } from "@/components/dreamverse/CreatorAvatar";
import { CreatorStatusTag } from "@/components/dreamverse/CreatorCard";
import { fromDreamverse } from "@/components/shop/adapters";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { PageSkeleton } from "@/components/site/PageSkeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/dreamverse/button";
import { dreamverseQueryOptions } from "@/lib/dreamverse/data";
import { creatorRating } from "@/lib/dreamverse/catalog";
import { DEMO_PRODUCTS, creatorResources, findCreator, type CreatorProfile } from "@/lib/dreamverse/creators";
import type { Product, ResourceType } from "@/lib/dreamverse/types";
import { useFollowing } from "@/lib/follows";

export const Route = createFileRoute("/creators/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(dreamverseQueryOptions());
    const creator = findCreator(params.slug, data.products);
    if (!creator) throw notFound();
    return { name: creator.name, headline: creator.headline };
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.name ?? "Creator";
    const description = loaderData?.headline ?? `${name}'s profile and learning resources on Dreamverse by Enski.`;
    return {
      meta: [
        { title: `${name} — creator profile | Dreamverse by Enski` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} on Dreamverse` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [{ property: "og:url", content: `https://ensk.lovable.app/creators/${params.slug}` }] : [{ name: "robots", content: "noindex" }]),
      ],
      links: loaderData ? [{ rel: "canonical", href: `https://ensk.lovable.app/creators/${params.slug}` }] : [],
    };
  },
  pendingComponent: () => <PageSkeleton variant="profile" />,
  component: CreatorPage,
  notFoundComponent: CreatorNotFound,
});

// Same order as the marketplace tabs; digital products sit with eBooks as downloads.
const GROUPS: { title: string; types: ResourceType[] }[] = [
  { title: "Courses", types: ["course"] },
  { title: "eBooks", types: ["ebook", "digital_product"] },
  { title: "Workshops and live sessions", types: ["live_training"] },
  { title: "Coaching", types: ["coaching"] },
  { title: "Professional services", types: ["gig"] },
];

const STATUS_NOTE: Record<CreatorProfile["status"], string> = {
  demo: "This is a preview of how a creator storefront looks. It isn't a confirmed partnership, and its listings aren't on sale yet.",
  not_joined:
    "This educator hasn't joined Dreamverse. This placeholder only shows their public headline and links to their own work; nothing here is sold on their behalf.",
  enski: "This creator sells on Enski. Buying, booking and checkout happen on their Enski product pages.",
};

function CreatorPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(dreamverseQueryOptions());
  const all = [...data.products, ...DEMO_PRODUCTS];
  const creator = findCreator(slug, data.products)!;
  const resources = creatorResources(slug, all);

  return (
    <>
      <SiteHeader solid />
      <main id="main" data-skin="dreamverse">
        <ProfileHeader creator={creator} count={resources.length} rating={creatorRating(resources)} />
        <div className="container-page py-12 lg:py-16">
          {resources.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-cobalt-100 bg-soft px-6 py-12 text-center">
              <p className="text-lg font-extrabold text-ink">No listings on Dreamverse yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                {creator.status === "not_joined"
                  ? `${creator.name} hasn't joined Dreamverse, so there's nothing to buy or book here.`
                  : "Courses, eBooks, workshops, coaching and services will appear here once they're published."}
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/dreamverse" hash="marketplace">
                  Browse the marketplace
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {GROUPS.map((g) => (
                <ResourceGroup key={g.title} title={g.title} items={resources.filter((r) => g.types.includes(r.type))} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ResourceGroup({ title, items }: { title: string; items: Product[] }) {
  if (items.length === 0) return null;
  const unpublished = items.filter((i) => i.status !== "published").length;
  return (
    <section aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">
          {title} <span className="text-base font-bold text-muted-foreground">{items.length}</span>
        </h2>
        {unpublished > 0 && (
          <p className="text-[13px] font-semibold text-muted-foreground">
            {unpublished === items.length ? "None published yet" : `${unpublished} not published yet`}
          </p>
        )}
      </div>
      <div className="mt-5">
        <ShopGrid items={items.map((p) => fromDreamverse(p))} />
      </div>
    </section>
  );
}

function ProfileHeader({ creator, count, rating }: { creator: CreatorProfile; count: number; rating: { average: number; count: number } | null }) {
  const { following, toggle, ready } = useFollowing(creator.slug);
  const place = creator.country ?? (creator.region === "international" ? "International" : null);

  return (
    <section className="bg-soft pt-8 pb-10 lg:pt-10 lg:pb-14">
      <div className="container-page">
        <Link
          to="/dreamverse"
          hash={creator.status === "enski" ? "marketplace" : "nigerian-creators"}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-brand underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to Dreamverse
        </Link>
        <div className="mt-4 flex flex-col gap-6 rounded-[28px] border border-line bg-card p-6 shadow-card sm:p-8 lg:flex-row lg:items-start">
          <CreatorAvatar name={creator.name} src={creator.avatar} size="lg" className="size-24 text-3xl ring-4 ring-ice" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="dv-h2 text-ink">{creator.name}</h1>
              <CreatorStatusTag status={creator.status} />
            </div>
            {creator.headline && <p className="mt-2 text-lg font-bold text-brand">{creator.headline}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground">
              {place && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden /> {place}
                </span>
              )}
              {creator.affiliation && <span>{creator.affiliation}</span>}
              <span>
                {count} {count === 1 ? "listing" : "listings"}
              </span>
              {rating && (
                <span className="inline-flex items-center gap-1 text-ink">
                  <Star className="size-4 fill-sky text-sky" aria-hidden /> {rating.average.toFixed(1)}
                  <span className="text-muted-foreground">
                    from {rating.count} verified {rating.count === 1 ? "rating" : "ratings"}
                  </span>
                </span>
              )}
            </div>
            {creator.bio && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink sm:text-base">{creator.bio}</p>}
            {creator.expertise.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Areas of expertise">
                {creator.expertise.map((e) => (
                  <li key={e} className="rounded-full bg-ice px-3 py-1.5 text-[13px] font-extrabold text-brand">
                    {e}
                  </li>
                ))}
              </ul>
            )}
            {creator.links.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Website and social links">
                {creator.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line px-4 text-sm font-extrabold text-brand hover:bg-ice"
                    >
                      {l.label} <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-5 flex max-w-2xl gap-2 rounded-[16px] bg-soft p-3 text-[13px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {STATUS_NOTE[creator.status]}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-1.5 lg:items-end">
            <Button
              variant={following ? "outline" : "default"}
              disabled={!ready}
              aria-pressed={following}
              onClick={() => {
                const now = toggle();
                toast(now ? `Following ${creator.name}` : `Unfollowed ${creator.name}`, {
                  description: "Saved in this browser only.",
                });
              }}
            >
              {following ? <Check /> : <Plus />}
              {following ? "Following" : "Follow creator"}
            </Button>
            <span className="text-xs font-semibold text-muted-foreground">Saved in this browser only</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CreatorNotFound() {
  return (
    <>
      <SiteHeader solid />
      <main id="main" data-skin="dreamverse" className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <h1 className="dv-h2 text-ink">We couldn't find that creator</h1>
          <p className="mt-2 text-muted-foreground">The link may be out of date.</p>
          <Button asChild className="mt-6">
            <Link to="/dreamverse" hash="nigerian-creators">
              See all creators
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
