import { createFileRoute } from "@tanstack/react-router";
import { AdminTransactions } from "@/components/admin/Records";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Enski admin" },
      { name: "description", content: "Every payment, sale and checkout on Enski." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Transactions — Enski admin" },
      { property: "og:description", content: "Every payment, sale and checkout on Enski." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminTransactions,
});
