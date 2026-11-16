import { createFileRoute } from "@tanstack/react-router";
import { AdminAccountDetails } from "@/components/admin/Accounts";

export const Route = createFileRoute("/admin/accounts_/$email")({
  head: () => ({
    meta: [
      { title: "Account details — Enski admin" },
      { name: "description", content: "One Enski account: roles, money, credentials and status." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Account details — Enski admin" },
      { property: "og:description", content: "One Enski account: roles, money, credentials and status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { email } = Route.useParams();
  return <AdminAccountDetails email={email} />;
}
