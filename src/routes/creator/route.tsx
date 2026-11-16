import { DashboardFrame } from "@/components/shared/DashboardFrame";
import { createFileRoute } from "@tanstack/react-router";
import { CreatorProvider } from "@/lib/creator/store";
import { CreatorShell } from "@/components/creator/Shell";
import { CreatorError, CreatorNotFound } from "@/components/creator/shared";
export const Route = createFileRoute("/creator")({
  component: () => (
    <DashboardFrame role="creator">
      <CreatorProvider>
        <CreatorShell />
      </CreatorProvider>
    </DashboardFrame>
  ),
  errorComponent: CreatorError,
  notFoundComponent: () => <CreatorNotFound />,
});
