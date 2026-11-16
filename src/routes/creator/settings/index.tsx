import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/creator/settings/")({
  beforeLoad: () => {
    throw redirect({ to: "/creator/settings/manage-profile", replace: true });
  },
});
