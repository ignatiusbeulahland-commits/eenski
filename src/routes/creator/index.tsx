import { createFileRoute, redirect } from "@tanstack/react-router";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/")({
  beforeLoad: () => {
    throw redirect({ to: "/creator/dashboard" });
  },
  head: () => creatorMeta("Creator workspace", "Manage your Enski Creator studio."),
});
