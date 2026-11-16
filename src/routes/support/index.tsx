import { createFileRoute, redirect } from "@tanstack/react-router";
import { supportMeta } from "@/components/support/shared";
export const Route = createFileRoute("/support/")({
  head: () => supportMeta("Support desk", "Open your support overview."),
  beforeLoad: () => {
    throw redirect({ to: "/support/dashboard" });
  },
});
