import { createFileRoute } from "@tanstack/react-router";
import { AdminBadges } from "@/components/admin/Records";

export const Route = createFileRoute("/admin/badges")({
  head: () => ({
    meta: [
      { title: "Badges — Enski admin" },
      { name: "description", content: "Check and revoke badges creators awarded." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Badges — Enski admin" },
      { property: "og:description", content: "Check and revoke badges creators awarded." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminBadges,
});
