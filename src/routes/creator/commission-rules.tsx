import { createFileRoute } from "@tanstack/react-router";
import { CommissionRules } from "@/components/creator/Affiliates";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/commission-rules")({
  head: () => creatorMeta("Commission Rules", "Decide what affiliates earn on each sale."),
  component: () => <CommissionRules />,
});
