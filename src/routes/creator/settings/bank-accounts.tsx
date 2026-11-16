import { createFileRoute } from "@tanstack/react-router";
import { CreatorBank } from "@/components/creator/Settings";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/bank-accounts")({
  head: () => creatorMeta("Bank Account Details", "Where your Enski payouts are sent."),
  component: () => <CreatorBank />,
});
