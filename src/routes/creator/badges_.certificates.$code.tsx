import { createFileRoute } from "@tanstack/react-router";
import { CertificateIssued } from "@/components/creator/certificates/AwardFlow";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/badges_/certificates/$code")({
  validateSearch: (s: Record<string, unknown>): { fresh?: true } => (s["fresh"] === true || s["fresh"] === "1" || s["fresh"] === 1 ? { fresh: true } : {}),
  head: () => creatorMeta("Certificate issued", "The certificate you issued, with its ID and verification link."),
  component: function CertificateIssuedRoute() {
    const { code } = Route.useParams();
    const { fresh } = Route.useSearch();
    return <CertificateIssued code={code} fresh={!!fresh} />;
  },
});
