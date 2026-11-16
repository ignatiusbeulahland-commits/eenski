import { createFileRoute, redirect } from "@tanstack/react-router";
// Legacy address kept so old links open the matching page.
export const Route = createFileRoute("/creator/analytics")({
  beforeLoad: () => {
    throw redirect({ to: "/creator/performance", replace: true });
  },
});
