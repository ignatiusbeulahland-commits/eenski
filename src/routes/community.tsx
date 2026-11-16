import { createFileRoute } from "@tanstack/react-router";
import heroGroup from "@/assets/community/community-selfie.webp";
import { Benefits } from "@/components/community/Benefits";
import { CommunityHero } from "@/components/community/CommunityHero";
import { CreatorCta } from "@/components/community/CreatorCta";
import { HowItWorks } from "@/components/community/HowItWorks";
import { InsideTrybe } from "@/components/community/InsideTrybe";
import { MemberStories } from "@/components/community/MemberStories";
import { TopicsMarquee } from "@/components/community/TopicsMarquee";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community | Enski, Africa's platform for dreamers" },
      {
        name: "description",
        content:
          "Join the Enski community: learn together, share your journey and connect with thousands of creators and builders across Africa.",
      },
      { property: "og:title", content: "Join the Enski community" },
      {
        property: "og:description",
        content:
          "Peer learning, expert creators, networking and members-only resources. Join the Dreamers Trybe in a few minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "preload", as: "image", href: heroGroup, fetchPriority: "high", type: "image/webp" }],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">
        <CommunityHero />
        <TopicsMarquee />
        <Benefits />
        <InsideTrybe />
        <HowItWorks />
        <MemberStories />
        <CreatorCta />
        <Newsletter source="community" />
      </main>
      <SiteFooter />
    </div>
  );
}
