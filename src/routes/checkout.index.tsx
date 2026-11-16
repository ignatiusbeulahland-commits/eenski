import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import type { PayMethod } from "@/lib/checkout/card";

const METHODS: PayMethod[] = ["card", "bank", "ussd", "paypal", "stripe"];

export const Route = createFileRoute("/checkout/")({
  validateSearch: (s: Record<string, unknown>): { step?: "review" | "pay" | "summary"; method?: PayMethod } => ({
    step: s["step"] === "pay" || s["step"] === "summary" ? s["step"] : "review",
    method: METHODS.includes(s["method"] as PayMethod) ? (s["method"] as PayMethod) : "card",
  }),
  head: () => ({
    meta: [
      { title: "Checkout | Enski" },
      { name: "description", content: "Review your Enski order and pay securely by card, bank transfer, USSD, PayPal or Stripe." },
      { property: "og:title", content: "Checkout | Enski" },
      { property: "og:description", content: "Review your Enski order and pay securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutRoute,
});

function CheckoutRoute() {
  const { step, method } = Route.useSearch();
  return <CheckoutPage step={step ?? "review"} method={method ?? "card"} />;
}
