import { createFileRoute } from "@tanstack/react-router";
import { CertificateBrandingPage } from "@/components/creator/certificates/CertificateBranding";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/settings/certificate-branding")({
  head: () => creatorMeta("Certificate branding & identity", "Upload logos, seals and authorised signatures for the certificates you issue."),
  component: () => <CertificateBrandingPage />,
});
