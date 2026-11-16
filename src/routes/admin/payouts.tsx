import { createFileRoute } from "@tanstack/react-router";
import { AdminPayouts } from "@/components/admin/Records";

export const Route = createFileRoute("/admin/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — Enski admin" },
      { name: "description", content: "Creator withdrawals and where the money went." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Payouts — Enski admin" },
      { property: "og:description", content: "Creator withdrawals and where the money went." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPayouts,
});
