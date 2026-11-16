import { createFileRoute } from "@tanstack/react-router";

import { openApply } from "@/components/ambassador/kit";
import { StickyApply } from "@/components/ambassador/StickyApply";
import { nyscHeroSlides } from "@/components/nysc/data";
import { NyscApply } from "@/components/nysc/NyscApply";
import {
  NyscApplyCta,
  NyscBenefits,
  NyscCommunity,
  NyscFaqs,
  NyscHero,
  NyscIdea,
  NyscLeadership,
  NyscSteps,
  NyscWhoCanJoin,
} from "@/components/nysc/NyscSections";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "Enski NYSC Initiative: make your service year count";
const DESCRIPTION =
  "Turn your NYSC year into skills, certifications, internships, income and connections. Apply to be an Enski NYSC ambassador or join the executive team.";

export const Route = createFileRoute("/become-an-ambassador_/nysc")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: "Your service year. Your influence. Your next big opportunity, with Enski." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "preload", as: "image", href: nyscHeroSlides[0]!.src, fetchPriority: "high", type: "image/webp" }],
  }),
  component: NyscPage,
});

function NyscPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />
      <main id="main">
        <NyscHero />
        <NyscIdea />
        <NyscBenefits />
        <NyscCommunity />
        <NyscLeadership />
        <NyscSteps />
        <NyscWhoCanJoin />
        <NyscApplyCta />
        <NyscFaqs />
      </main>
      <Newsletter source="nysc-initiative" />
      <SiteFooter />
      <StickyApply heroId="hero-apply" ctaId="apply-cta" label="Apply now" onClick={() => openApply()} />
      <NyscApply />
    </div>
  );
}
