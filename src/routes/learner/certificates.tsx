import { createFileRoute } from "@tanstack/react-router";
import { CertificatesPage, type AchievementTab } from "@/components/learner/Achievements";
import { learnerMeta } from "@/lib/learner/nav";
const tabs: AchievementTab[] = ["certificates", "badges", "history"];
export const Route = createFileRoute("/learner/certificates")({
  validateSearch: (s: Record<string, unknown>): { tab?: AchievementTab } =>
    tabs.includes(s["tab"] as AchievementTab) && s["tab"] !== "certificates" ? { tab: s["tab"] as AchievementTab } : {},
  head: () => learnerMeta("Certificates & badges", "Your Enski certificates of completion and learning badges."),
  component: Page,
});
function Page() {
  const { tab } = Route.useSearch();
  return <CertificatesPage tab={tab ?? "certificates"} />;
}
