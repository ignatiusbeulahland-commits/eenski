import { createFileRoute, redirect } from "@tanstack/react-router";
// Legacy address kept so old links open the matching page.
export const Route = createFileRoute("/creator/customers")({
  beforeLoad: () => {
    throw redirect({ to: "/creator/subscribers", replace: true });
  },
});
