import { createFileRoute, useRouter } from "@tanstack/react-router";

import { CoursesShop, type CoursesSearch } from "@/components/courses/CoursesShop";
import { Newsletter } from "@/components/site/Newsletter";
import { PageSkeleton } from "@/components/site/PageSkeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { CURRENCIES, PRICE_TIER_IDS, type CurrencyCode, type PriceRangeId } from "@/lib/dreamverse/catalog";
import { marketplaceQueryOptions } from "@/lib/marketplace/data";
import { COURSE_SORTS, type CourseSortId } from "@/lib/marketplace/filter";

const SITE = "https://ensk.lovable.app";

const text = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export const Route = createFileRoute("/courses")({
  validateSearch: (search: Record<string, unknown>): CoursesSearch => {
    const out: CoursesSearch = {};
    const q = text(search["q"]);
    const category = text(search["category"]);
    const level = text(search["level"]);
    if (q) out.q = q;
    if (search["kind"] === "course" || search["kind"] === "ebook") out.kind = search["kind"];
    if (category && category !== "All") out.category = category;
    if (level) out.level = level;
    if ((PRICE_TIER_IDS as readonly unknown[]).includes(search["price"])) out.price = search["price"] as PriceRangeId;
    if (CURRENCIES.some((c) => c.code === search["currency"])) out.currency = search["currency"] as CurrencyCode;
    if (COURSE_SORTS.some((s) => s.id === search["order"])) out.order = search["order"] as CourseSortId;
    return out;
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(marketplaceQueryOptions()),
  head: () => {
    const title = "Enski marketplace — shop courses and eBooks from African creators";
    const description =
      "Browse courses and eBooks on Enski two at a time. Search by name or creator, filter by category and price, save favourites, add to your cart and preview anything before you buy.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE}/courses` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE}/courses` }],
    };
  },
  pendingComponent: () => <PageSkeleton />,
  errorComponent: MarketplaceError,
  notFoundComponent: MarketplaceError,
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <CoursesShop />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}

function MarketplaceError() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader solid />
      <main className="mx-auto grid min-h-[60vh] max-w-[1200px] place-items-center px-5 py-28 text-center">
        <div>
          <h1 className="text-h2 text-ink">The marketplace didn't load</h1>
          <p className="mt-2 text-muted-foreground">Check your connection, then try again.</p>
          <Button className="mt-6" onClick={() => void router.invalidate()}>
            Try again
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
