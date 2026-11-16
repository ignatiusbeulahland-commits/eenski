import { createFileRoute } from "@tanstack/react-router";
import { AdminCertificates } from "@/components/admin/Records";

export const Route = createFileRoute("/admin/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates — Enski admin" },
      { name: "description", content: "Check and revoke certificates creators issued." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Certificates — Enski admin" },
      { property: "og:description", content: "Check and revoke certificates creators issued." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCertificates,
});
