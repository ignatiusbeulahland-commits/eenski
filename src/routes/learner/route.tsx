import { DashboardFrame } from "@/components/shared/DashboardFrame";
import { createFileRoute } from "@tanstack/react-router";
import { LearnerProvider } from "@/lib/learner/store";
import { LearnerShell } from "@/components/learner/Shell";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
export const Route = createFileRoute("/learner")({
  component: () => (
    <DashboardFrame role="learner">
      <LearnerProvider>
        <LearnerShell />
      </LearnerProvider>
    </DashboardFrame>
  ),
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound />,
});
