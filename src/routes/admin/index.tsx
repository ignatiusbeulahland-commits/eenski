import { createFileRoute } from "@tanstack/react-router";
import { AdminOverview } from "@/components/admin/Accounts";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Overview — Enski admin" },
      { name: "description", content: "Sign-ups, payments, payouts and support across Enski at a glance." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Overview — Enski admin" },
      { property: "og:description", content: "Sign-ups, payments, payouts and support across Enski at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminOverview,
});
