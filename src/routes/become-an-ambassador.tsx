import { createFileRoute } from "@tanstack/react-router";

import {
  AmbassadorFinalCta,
  AmbassadorHero,
  AmbassadorHowItWorks,
  AmbassadorMarquee,
  AmbassadorPerks,
  ProgrammeChooser,
  ambassadorHeroImg,
} from "@/components/ambassador/AmbassadorSections";
import { StickyApply } from "@/components/ambassador/StickyApply";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "Become an Enski ambassador: campus and NYSC programmes";
const DESCRIPTION =
  "Lead with Enski on your campus or during your NYSC year. Choose the Dreamers Campus Initiative or the Enski NYSC Initiative, earn and get certified.";

export const Route = createFileRoute("/become-an-ambassador")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      {
        property: "og:description",
        content: "Two ways to lead with Enski: on campus as a student, or in your state as an NYSC corps member.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "preload", as: "image", href: ambassadorHeroImg, fetchPriority: "high", type: "image/webp" }],
  }),
  component: AmbassadorPage,
});

function AmbassadorPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">
        <AmbassadorHero />
        <AmbassadorMarquee />
        <ProgrammeChooser />
        <AmbassadorPerks />
        <AmbassadorHowItWorks />
        <AmbassadorFinalCta />
      </main>
      <Newsletter source="ambassador" />
      <SiteFooter />
      <StickyApply heroId="hero-apply" ctaId="apply-cta" href="#programmes" label="Choose your programme" />
    </div>
  );
}
