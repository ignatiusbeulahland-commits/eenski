import { createFileRoute } from "@tanstack/react-router";

import { openApply } from "@/components/ambassador/kit";
import { StickyApply } from "@/components/ambassador/StickyApply";
import { CampusApply } from "@/components/campus/CampusApply";
import {
  CampusApplyCta,
  CampusBenefits,
  CampusCommunity,
  CampusCrew,
  CampusFinale,
  CampusHero,
  CampusIntro,
  CampusMovement,
  CampusRoles,
  CampusSchools,
  CampusSteps,
} from "@/components/campus/CampusSections";
import { campusHeroPreload } from "@/components/campus/data";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "Dreamers Campus Initiative: become an Enski campus ambassador";
const DESCRIPTION =
  "Lead the Dreamers movement on your campus. Apply to be an Enski campus director, join the executive team or become a campus ambassador.";

export const Route = createFileRoute("/become-an-ambassador_/campus")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: "Four years on campus. Leave with more than a certificate. Lead, earn and build a name with Enski." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: campusHeroPreload.href,
        imageSrcSet: campusHeroPreload.imageSrcSet,
        imageSizes: campusHeroPreload.imageSizes,
        fetchPriority: "high",
        type: "image/webp",
      },
    ],
  }),
  component: CampusPage,
});

function CampusPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />
      <main id="main">
        <CampusHero />
        <CampusSchools />
        <CampusIntro />
        <CampusCrew />
        <CampusBenefits />
        <CampusCommunity />
        <CampusRoles />
        <CampusMovement />
        <CampusSteps />
        <CampusApplyCta />
        <CampusFinale />
      </main>
      <Newsletter source="campus-ambassador" />
      <SiteFooter />
      <StickyApply heroId="hero-apply" ctaId="apply-cta" label="Apply now" onClick={() => openApply()} />
      <CampusApply />
    </div>
  );
}
