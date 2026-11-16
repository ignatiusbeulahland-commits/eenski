import { createFileRoute } from "@tanstack/react-router";
import { CertificateReady } from "@/components/learner/CertificateReady";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/certificates_/$certificateId_/ready")({
  head: () => learnerMeta("Your certificate is ready", "Download, share or view your Enski certificate."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="certificate" />,
});
function Page() {
  const { certificateId } = Route.useParams();
  return <CertificateReady id={certificateId} />;
}
