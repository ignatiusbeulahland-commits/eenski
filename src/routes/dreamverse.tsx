import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { CoachesSection } from "@/components/dreamverse/CoachesSection";
import { CollectionsSection, FreeSection } from "@/components/dreamverse/CollectionsSection";
import { CreatorDiscovery } from "@/components/dreamverse/CreatorDiscovery";
import { Hero } from "@/components/dreamverse/Hero";
import { Marketplace } from "@/components/dreamverse/Marketplace";
import { RecommendedSection } from "@/components/dreamverse/RecommendedSection";
import { EventsSection } from "@/components/dreamverse/EventsSection";
import { RecentlyViewed } from "@/components/shop/sections";
import { SearchDiscovery } from "@/components/dreamverse/SearchDiscovery";
import { PageSkeleton } from "@/components/site/PageSkeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TopicSection } from "@/components/dreamverse/TopicSection";
import { TrendingSection } from "@/components/dreamverse/TrendingSection";
import { TribeSection } from "@/components/dreamverse/TribeSection";
import { Button } from "@/components/dreamverse/button";
import { dreamverseQueryOptions } from "@/lib/dreamverse/data";
import { DEMO_PRODUCTS, PINNED_TRENDING, coachDirectory } from "@/lib/dreamverse/creators";
import { validateDreamverseSearch } from "@/lib/dreamverse/search";

export const Route = createFileRoute("/dreamverse")({
  validateSearch: validateDreamverseSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(dreamverseQueryOptions()),
  head: () => ({
    meta: [
      { title: "Dreamverse by Enski — courses, eBooks, coaching and live sessions" },
      {
        name: "description",
        content:
          "Discover courses, digital resources, expert coaching and live sessions from African creators. Learn new skills, grow your career and bring your dreams to life.",
      },
      { property: "og:title", content: "Dreamverse by Enski — your next big dream starts here" },
      {
        property: "og:description",
        content: "Courses, eBooks, coaching, live sessions and services from creators on Enski.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: () => <PageSkeleton variant="catalogue" />,
  component: DreamversePage,
  errorComponent: DreamverseError,
  notFoundComponent: () => <p className="p-10 text-center">This page doesn't exist.</p>,
});

function DreamversePage() {
  const { data } = useSuspenseQuery(dreamverseQueryOptions());
  const spotlight = data.trending[0] ?? data.products[0] ?? null;
  // Enski's real listings first, then the clearly tagged demo listings.
  const catalogue = [...data.products, ...DEMO_PRODUCTS];
  const popularIds = data.trending.map((p) => p.id);

  return (
    <>
      <SiteHeader />
      <main id="main" data-skin="dreamverse">
        <Hero products={data.products} spotlight={spotlight} />
        <SearchDiscovery products={catalogue} />
        {data.error ? (
          <CatalogueUnavailable message={data.error} />
        ) : (
          <>
            {/* Each section sits on its own band of colour so neighbours never blur together. */}
            <Band tone="bg-background">
              <TrendingSection products={[...PINNED_TRENDING, ...data.trending]} />
              <div className="container-page empty:hidden">
                <RecentlyViewed className="pt-14" />
              </div>
            </Band>
            <Band tone="border-y border-line bg-soft">
              <Marketplace products={catalogue} popularIds={popularIds} />
            </Band>
            <Band tone="bg-ice">
              <RecommendedSection picks={data.recommended} catalogue={catalogue} />
            </Band>
            <Band tone="bg-background">
              <EventsSection products={catalogue} />
            </Band>
            <CreatorDiscovery products={catalogue} />
            <Band tone="bg-ice">
              <TopicSection products={data.products} />
            </Band>
            <Band tone="bg-background">
              <CollectionsSection products={catalogue} />
            </Band>
            <Band tone="bg-soft">
              <FreeSection products={catalogue} />
            </Band>
            <Band tone="bg-ice">
              <CoachesSection coaches={coachDirectory(data.coaches)} products={catalogue} />
            </Band>
          </>
        )}
        <div className="bg-background">
          <TribeSection />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Full-width colour band; the section inside keeps its own top spacing, the band adds the bottom. */
function Band({ tone, children }: { tone: string; children: ReactNode }) {
  return <div className={`${tone} pb-16 empty:hidden lg:pb-24`}>{children}</div>;
}

function CatalogueUnavailable({ message }: { message: string }) {
  const router = useRouter();
  return (
    <section className="container-page py-16" aria-live="polite">
      <div className="flex flex-col items-center rounded-[24px] border border-line bg-soft px-6 py-14 text-center">
        <AlertTriangle className="size-8 text-brand" aria-hidden />
        <h2 className="mt-4 text-xl font-extrabold text-ink">{message}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Resources are still available on Enski. Try again in a moment.
        </p>
        <Button className="mt-6" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </div>
    </section>
  );
}

function DreamverseError() {
  const router = useRouter();
  return (
    <div className="grid min-h-screen place-items-center bg-cobalt-light px-6 text-center text-on-blue">
      <div>
        <h1 className="dv-h2">Dreamverse didn't load</h1>
        <p className="mt-2 text-on-blue-muted">This page didn't load properly. Try again in a moment.</p>
        <Button variant="lime" className="mt-6" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
