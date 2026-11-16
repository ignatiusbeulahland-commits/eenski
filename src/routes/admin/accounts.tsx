import { createFileRoute } from "@tanstack/react-router";
import { AdminAccounts } from "@/components/admin/Accounts";

export const Route = createFileRoute("/admin/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Enski admin" },
      { name: "description", content: "Every Enski learner, creator and affiliate account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Accounts — Enski admin" },
      { property: "og:description", content: "Every Enski learner, creator and affiliate account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAccounts,
});
