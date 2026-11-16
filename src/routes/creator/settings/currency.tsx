import { createFileRoute } from "@tanstack/react-router";
import { CreatorCurrency } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/currency")({
  head: () => creatorMeta("Country & Currency", "Your country, selling, earnings and payout currencies."),
  component: () => <CreatorCurrency />,
});
