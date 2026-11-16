import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/learner/settings/")({
  beforeLoad: () => {
    throw redirect({ to: "/learner/settings/profile" });
  },
});
