import { createFileRoute } from "@tanstack/react-router";
import { WalletPage } from "@/components/creator/Finance";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/wallet")({
  head: () => creatorMeta("Wallet / Payouts", "Your Enski earnings, balance and payouts."),
  component: () => <WalletPage />,
});
