import { createFileRoute } from "@tanstack/react-router";

import { PublicStorefront } from "@/components/storefront/PublicStorefront";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/store/$handle")({
  validateSearch: (s: Record<string, unknown>): { item?: string | undefined } => ({ item: typeof s["item"] === "string" && s["item"] ? s["item"] : undefined }),
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} — Creator store on Enski` },
      { name: "description", content: "Courses, eBooks, live sessions, coaching and services from an Enski creator." },
      { property: "og:title", content: `@${params.handle} on Enski` },
      { property: "og:description", content: "Browse and buy this creator's courses, eBooks, sessions and services on Enski." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { handle } = Route.useParams();
  const { item } = Route.useSearch();
  return (
    <>
      <SiteHeader solid />
      <main id="main" className="bg-background">
        <PublicStorefront handle={handle} itemId={item} />
      </main>
      <SiteFooter />
    </>
  );
}
