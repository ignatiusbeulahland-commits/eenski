import { createFileRoute } from "@tanstack/react-router";
import { WelcomeJourney } from "@/components/site/auth/Welcome";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Enski" },
      { name: "description", content: "Your Enski account is ready. Start learning, creating or promoting from your dashboard." },
      { property: "og:title", content: "Welcome to Enski" },
      { property: "og:description", content: "Your Enski account is ready. Pick your first step and open your dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WelcomeJourney,
});
