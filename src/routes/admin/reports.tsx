import { createFileRoute } from "@tanstack/react-router";
import { AdminReports } from "@/components/admin/Reports";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Page reports — Enski admin" },
      { name: "description", content: "Reports visitors sent about creator storefront pages." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page reports — Enski admin" },
      { property: "og:description", content: "Reports visitors sent about creator storefront pages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminReports,
});
