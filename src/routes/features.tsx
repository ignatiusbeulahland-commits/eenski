import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/features/Hero";
import { SectionNav } from "@/components/features/SectionNav";
import { Ticker } from "@/components/features/Ticker";
import { CreateSection } from "@/components/features/CreateSection";
import { SellSection } from "@/components/features/SellSection";
import { DiscoverSection } from "@/components/features/DiscoverSection";
import { TeachSection } from "@/components/features/TeachSection";
import { GrowSection } from "@/components/features/GrowSection";
import { DreamersDiary } from "@/components/features/DreamersDiary";
import { StoreSection } from "@/components/features/StoreSection";
import { AllInOne } from "@/components/features/AllInOne";
import { FinalCta } from "@/components/features/FinalCta";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features for creators | Enski" },
      {
        name: "description",
        content:
          "Build, sell and teach on Enski: course builder, digital downloads, split payments, affiliates, analytics and a branded store for African creators.",
      },
      { property: "og:title", content: "Features for creators | Enski" },
      {
        property: "og:description",
        content:
          "Everything African creators need to turn knowledge into income, influence and impact, in one platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <a
        href="#main"
        className="sr-only z-(--z-skip) rounded-full bg-cobalt px-5 py-3 font-extrabold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" data-skin="features">
        <Hero />
        <Ticker />
        <SectionNav />
        <CreateSection />
        <SellSection />
        <DiscoverSection />
        <TeachSection />
        <GrowSection />
        <DreamersDiary />
        <StoreSection />
        <AllInOne />
        <FinalCta />
        <Newsletter source="features" />
      </main>
      <SiteFooter />
    </div>
  );
}
