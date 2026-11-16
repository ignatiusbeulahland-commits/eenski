import { createFileRoute } from "@tanstack/react-router";
import { AdminSettingsPage } from "@/components/admin/Inbox";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Enski admin" },
      { name: "description", content: "Platform-wide Enski settings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings — Enski admin" },
      { property: "og:description", content: "Platform-wide Enski settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettingsPage,
});
