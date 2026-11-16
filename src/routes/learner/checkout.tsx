import { createFileRoute } from "@tanstack/react-router";
import { LearnerCheckout } from "@/components/learner/Checkout";
import type { PayMethod } from "@/lib/checkout/card";
import { learnerMeta } from "@/lib/learner/nav";

const METHODS: PayMethod[] = ["card", "bank", "ussd", "paypal", "stripe"];

export const Route = createFileRoute("/learner/checkout")({
  validateSearch: (s: Record<string, unknown>): { step?: "review" | "pay" | "summary"; method?: PayMethod } => ({
    step: s["step"] === "pay" || s["step"] === "summary" ? s["step"] : "review",
    method: METHODS.includes(s["method"] as PayMethod) ? (s["method"] as PayMethod) : "card",
  }),
  head: () => learnerMeta("Checkout", "Review your cart and pay securely on Enski."),
  component: Page,
});

function Page() {
  const { step, method } = Route.useSearch();
  return <LearnerCheckout step={step ?? "review"} method={method ?? "card"} />;
}
