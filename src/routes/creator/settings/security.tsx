import { createFileRoute, redirect } from "@tanstack/react-router";
// Legacy address kept so old links open the matching page.
export const Route = createFileRoute("/creator/settings/security")({
  beforeLoad: () => {
    throw redirect({ to: "/creator/settings/password-security", replace: true });
  },
});
