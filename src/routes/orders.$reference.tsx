import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "@/components/checkout/Receipt";

export const Route = createFileRoute("/orders/$reference")({
  head: () => ({
    meta: [
      { title: "Order receipt | Enski" },
      { name: "description", content: "Your Enski order receipt: items, amount paid, payment method, reference and timeline." },
      { property: "og:title", content: "Order receipt | Enski" },
      { property: "og:description", content: "Your Enski order receipt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceiptRoute,
});

function ReceiptRoute() {
  const { reference } = Route.useParams();
  return <Receipt reference={reference} />;
}
