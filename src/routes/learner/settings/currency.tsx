import { createFileRoute } from "@tanstack/react-router";
import { CurrencyPreferences } from "@/components/learner/Settings";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/settings/currency")({
  head: () => learnerMeta("Country & Currency", "Your country of residence and display currency on Enski."),
  component: CurrencyPreferences,
});
