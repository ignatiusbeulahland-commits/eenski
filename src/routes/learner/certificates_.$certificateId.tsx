import { createFileRoute } from "@tanstack/react-router";
import { CertificateDetails } from "@/components/learner/Achievements";
import { LearnerError, LearnerNotFound } from "@/components/learner/shared";
import { learnerMeta } from "@/lib/learner/nav";
export const Route = createFileRoute("/learner/certificates_/$certificateId")({
  head: () => learnerMeta("Certificate", "Preview and download your Enski certificate."),
  component: Page,
  errorComponent: LearnerError,
  notFoundComponent: () => <LearnerNotFound what="certificate" />,
});
function Page() {
  const { certificateId } = Route.useParams();
  return <CertificateDetails id={certificateId} />;
}
