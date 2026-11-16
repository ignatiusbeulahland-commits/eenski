import { DashboardFrame } from "@/components/shared/DashboardFrame";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/affiliate/AppShell";
import { AffiliateStoreProvider } from "@/lib/affiliate/store";

export const Route = createFileRoute("/affiliate")({
  component: AffiliateLayout,
});

function AffiliateLayout() {
  return (
    <DashboardFrame role="affiliate">
      <AffiliateStoreProvider>
        <AppShell />
      </AffiliateStoreProvider>
    </DashboardFrame>
  );
}
