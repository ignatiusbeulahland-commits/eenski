import { createFileRoute } from "@tanstack/react-router";
import { SharedCertificatePage } from "@/components/shared/certificate/SharedCertificatePage";
import { resolveSharedCertificate } from "@/lib/learner/certificateShare";

export const Route = createFileRoute("/certificate/$token")({
  head: ({ params }) => {
    const c = resolveSharedCertificate(params.token);
    const title = c ? `${c.holder} · ${c.title} certificate | Enski` : "Shared certificate | Enski";
    const description = c
      ? `${c.holder} earned a certificate of completion for “${c.title}” from ${c.issuer} on Enski. Certificate ID ${c.code}.`
      : "View and check an Enski certificate of completion.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Page,
});

function Page() {
  const { token } = Route.useParams();
  return <SharedCertificatePage token={token} />;
}
