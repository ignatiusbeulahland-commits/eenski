import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Newsletter } from "@/components/site/Newsletter";
import { AboutHero } from "@/components/about/AboutHero";
import { Ticker } from "@/components/about/Ticker";
import { Mission } from "@/components/about/Mission";
import { Vision } from "@/components/about/Vision";
import { Story } from "@/components/about/Story";
import { Team } from "@/components/about/Team";
import { AboutCta } from "@/components/about/AboutCta";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Enski — Empowering Africa's creators & builders" },
      {
        name: "description",
        content:
          "Enski builds the infrastructure that lets African creators, experts and organisations sell their knowledge globally, without borders.",
      },
      { property: "og:title", content: "About Enski — Empowering Africa's creators & builders" },
      {
        property: "og:description",
        content:
          "Our mission, our 2030 vision, our story and the team building the operating system for Africa's creator economy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <AboutHero />
        <Ticker />
        <Mission />
        <Vision />
        <Story />
        <Team />
        <AboutCta />
        <Newsletter source="about" />
      </main>
      <SiteFooter />
    </div>
  );
}
