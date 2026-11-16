import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Dreamverse } from "@/components/site/Dreamverse";
import { ForCreators } from "@/components/site/ForCreators";
import { WhyEnski } from "@/components/site/WhyEnski";
import { Testimonials } from "@/components/site/Testimonials";
import { Community } from "@/components/site/Community";
import { Insights } from "@/components/site/Insights";
import { FinalCta } from "@/components/site/FinalCta";
import { DreamersDiary } from "@/components/site/DreamersDiary";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { firstHeroSlide } from "@/components/site/hero-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enski — Your future is a skill away" },
      {
        name: "description",
        content:
          "Learn the skills that shape your future and teach the knowledge that shapes someone else's. Courses, ebooks and live sessions from African creators.",
      },
      { property: "og:title", content: "Enski — Your future is a skill away" },
      {
        property: "og:description",
        content:
          "Africa's platform for dreamers: learn practical skills, sell your knowledge and join the Dreamers Trybe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    // Start the first hero photo download straight away; it's the biggest thing on screen.
    // The size list matches the photo itself, so phones preload the smaller copy they will show.
    links: [{
      rel: "preload", as: "image", href: firstHeroSlide.src, imageSrcSet: firstHeroSlide.srcSet,
      imageSizes: firstHeroSlide.sizes, fetchPriority: "high", type: "image/webp",
    }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <Dreamverse />
        <ForCreators />
        <WhyEnski />
        <Testimonials />
        <Community />
        <DreamersDiary />
        <Insights />
        <FinalCta />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
