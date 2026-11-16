import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PricingHero } from "@/components/pricing/PricingHero";
import { FreePlan } from "@/components/pricing/FreePlan";
import { Commissions } from "@/components/pricing/Commissions";
import { Ultra } from "@/components/pricing/Ultra";
import { Faqs } from "@/components/pricing/Faqs";
import { FinalCta } from "@/components/pricing/FinalCta";
import { Newsletter } from "@/components/site/Newsletter";
import { heroImage } from "@/components/pricing/creatorImages";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | Enski Skills Academy" },
      {
        name: "description",
        content: "Start for free on Enski and keep creating. See how pricing works for creators.",
      },
      { property: "og:title", content: "Pricing | Enski Skills Academy" },
      {
        property: "og:description",
        content: "Start for free on Enski and keep creating. See how pricing works for creators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    // Start the hero photo download before the page script runs.
    links: [
      {
        rel: "preload",
        as: "image",
        href: heroImage.src,
        imageSrcSet: heroImage.srcSet,
        imageSizes: heroImage.sizes,
        fetchPriority: "high",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <a
        href="#main"
        className="sr-only z-(--z-skip) rounded-full bg-cobalt px-5 py-3 font-extrabold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <PricingHero />
        <FreePlan />
        <Commissions />
        <Ultra />
        <Faqs />
        <FinalCta />
        <Newsletter source="pricing" />
      </main>
      <SiteFooter />
    </div>
  );
}
