import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import heroPerson from "@/assets/help/faq-hero-person.webp";
import { FaqBrowser } from "@/components/faq/FaqBrowser";
import { FaqCta } from "@/components/faq/FaqCta";
import { FaqHero } from "@/components/faq/FaqHero";
import { FAQS } from "@/components/faq/faqs";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { FaqFilter } from "@/lib/faq-search";

const TITLE = "Help centre and FAQs | Enski";
const DESCRIPTION =
  "Answers to common questions about learning, creating, payments, payouts, affiliates and account security on Enski.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "preload", as: "image", href: heroPerson, fetchPriority: "high", type: "image/webp" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqFilter>("all");

  const scrollToAnswers = () => {
    requestAnimationFrame(() =>
      document.getElementById("answers")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {/* data-skin="help" keeps the Help Center's solid white text on blue */}
      <main id="main" data-skin="help">
        <FaqHero
          query={query}
          onQueryChange={setQuery}
          onSubmit={scrollToAnswers}
          totalAnswers={FAQS.length}
        />
        <FaqBrowser
          category={category}
          onCategoryChange={(c) => {
            setCategory(c);
            if (window.innerWidth >= 1024) scrollToAnswers();
          }}
          query={query}
          onQueryChange={setQuery}
        />
        <FaqCta />
      </main>
      <Newsletter source="faq" />
      <SiteFooter />
    </div>
  );
}
