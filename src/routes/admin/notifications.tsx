import { createFileRoute } from "@tanstack/react-router";
import { AdminNotifications } from "@/components/admin/Inbox";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Enski admin" },
      { name: "description", content: "Latest Enski activity that needs an admin's eye." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Notifications — Enski admin" },
      { property: "og:description", content: "Latest Enski activity that needs an admin's eye." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminNotifications,
});
