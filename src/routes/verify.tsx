import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "@/components/shared/certificate/VerifyPage";

const title = "Verify an Enski certificate";
const description = "Enter a certificate ID to confirm whether an Enski certificate of completion is genuine.";

export const Route = createFileRoute("/verify")({
  validateSearch: (s: Record<string, unknown>): { id?: string } =>
    typeof s["id"] === "string" && s["id"].trim() ? { id: s["id"].slice(0, 40) } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  return <VerifyPage id={id} />;
}
