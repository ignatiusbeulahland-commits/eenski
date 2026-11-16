import { createFileRoute } from "@tanstack/react-router";
import { AdminSupport } from "@/components/admin/Inbox";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support requests — Enski admin" },
      { name: "description", content: "Support tickets opened by learners, creators and affiliates." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Support requests — Enski admin" },
      { property: "og:description", content: "Support tickets opened by learners, creators and affiliates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSupport,
});
