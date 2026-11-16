import { createFileRoute } from "@tanstack/react-router";

import { PublicStorefront } from "@/components/storefront/PublicStorefront";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/store/$handle")({
  validateSearch: (s: Record<string, unknown>): { item?: string | undefined } => ({ item: typeof s["item"] === "string" && s["item"] ? s["item"] : undefined }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle} — Creator page on Enski` },
      { name: "description", content: "One link for everything this creator does: courses, eBooks, coaching, live sessions and more on Enski." },
      { property: "og:title", content: `${params.handle} on Enski` },
      { property: "og:description", content: "Follow this creator and explore their courses, eBooks, coaching and live sessions on Enski." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
    </>
  );
}
