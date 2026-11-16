import { createFileRoute, redirect } from "@tanstack/react-router";
// Legacy address kept so old links open the matching page.
export const Route = createFileRoute("/creator/settings/bank-account")({
  beforeLoad: () => {
    throw redirect({ to: "/creator/settings/bank-accounts", replace: true });
  },
});
