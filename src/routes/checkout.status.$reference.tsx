import { createFileRoute } from "@tanstack/react-router";
import { PaymentStatus } from "@/components/checkout/PaymentStatus";

export const Route = createFileRoute("/checkout/status/$reference")({
  head: () => ({
    meta: [
      { title: "Payment status | Enski" },
      { name: "description", content: "See whether your Enski payment is processing, pending, successful, failed or cancelled, and what to do next." },
      { property: "og:title", content: "Payment status | Enski" },
      { property: "og:description", content: "Your Enski payment status and next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatusRoute,
});

function StatusRoute() {
  const { reference } = Route.useParams();
  return <PaymentStatus reference={reference} />;
}
