import { createFileRoute } from "@tanstack/react-router";

import { PublicStorefront } from "@/components/storefront/PublicStorefront";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SAMPLE_CREATOR, SAMPLE_HANDLE, SITE_ORIGIN } from "@/lib/creator/sampleStore";

type StoreSearch = { item?: string | undefined; preview?: boolean | undefined };

export const Route = createFileRoute("/store/$handle")({
  validateSearch: (s: Record<string, unknown>): StoreSearch => ({
    item: typeof s["item"] === "string" && s["item"] ? s["item"] : undefined,
    preview: s["preview"] === true || s["preview"] === "1" || s["preview"] === 1 ? true : undefined,
  }),
  head: ({ params }) => {
    const sample = params.handle.toLowerCase() === SAMPLE_HANDLE;
    const name = sample ? SAMPLE_CREATOR.name : params.handle;
    const description = sample ? SAMPLE_CREATOR.about : "Follow this creator and explore their courses, digital downloads, coaching and live sessions on Enski.";
    const image = sample ? `${SITE_ORIGIN}${SAMPLE_CREATOR.banner}` : null;
    return {
      meta: [
        { title: `${name} — Creator page on Enski` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} on Enski` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
    };
  },
  component: StorePage,
});

function StorePage() {
  const { handle } = Route.useParams();
  const { item, preview } = Route.useSearch();
  return (
    <>
      <SiteHeader solid />
      <main id="main" className="bg-background">
        <PublicStorefront handle={handle} itemId={item} preview={Boolean(preview)} />
      </main>
    </>
  );
}
