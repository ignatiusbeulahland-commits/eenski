import { createFileRoute } from "@tanstack/react-router";
import { OnboardingJourney } from "@/components/onboarding/Onboarding";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): { step?: number } => {
    const n = Number(search["step"]);
    return Number.isInteger(n) && n >= 0 && n <= 10 ? { step: n } : {};
  },
  head: () => ({
    meta: [
      { title: "Set up your Enski space" },
      { name: "description", content: "A few quick steps to set up your Enski space as a learner, creator or affiliate." },
      { property: "og:title", content: "Set up your Enski space" },
      { property: "og:description", content: "Quick, role-specific setup for your new Enski account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { step } = Route.useSearch();
  return <OnboardingJourney step={step} />;
}
