import { createFileRoute } from "@tanstack/react-router";

import { trybeHeroPreload } from "@/components/dreamers-trybe/data";
import { JoinDreamersModal } from "@/components/dreamers-trybe/JoinTrybe";
import {
  TrybeAbout,
  TrybeFaq,
  TrybeGoal,
  TrybeHero,
  TrybeJoin,
  TrybeJourney,
  TrybeTicker,
} from "@/components/dreamers-trybe/TrybeSections";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "The Dreamers Trybe | Built for dreamers. By dreamers.";
const DESC = "Your dream is possible. You just don't have to build it alone. Join the Dreamers Trybe, powered by Enski. It's free.";

export const Route = createFileRoute("/dreamers-trybe")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: trybeHeroPreload.href,
        imageSrcSet: trybeHeroPreload.imageSrcSet,
        imageSizes: trybeHeroPreload.imageSizes,
        fetchPriority: "high",
        type: "image/webp",
      },
    ],
  }),
  component: DreamersTrybePage,
});

function DreamersTrybePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-ink">
      <SiteHeader />
      <main id="main">
        <TrybeHero />
        <TrybeTicker />
        <TrybeJoin />
        <TrybeGoal />
        <TrybeFaq />
        <TrybeAbout />
        <TrybeJourney />
      </main>
      <Newsletter source="dreamers-trybe" />
      <SiteFooter />
      <JoinDreamersModal />
    </div>
  );
}
