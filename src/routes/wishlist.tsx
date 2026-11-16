import { createFileRoute } from "@tanstack/react-router";

import { WishlistPage } from "@/components/shop/WishlistPage";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your wishlist — Enski" },
      { name: "description", content: "Courses, eBooks, live sessions and resources you saved on Enski, ready when you are." },
      { property: "og:title", content: "Your Enski wishlist" },
      { property: "og:description", content: "Everything you saved while browsing Enski, in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <SiteHeader solid />
      <main id="main" className="bg-background">
        <WishlistPage />
      </main>
      <SiteFooter />
    </>
  ),
});
