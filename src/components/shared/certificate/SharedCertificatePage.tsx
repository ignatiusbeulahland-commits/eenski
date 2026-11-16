import { Link } from "@tanstack/react-router";
import { BadgeCheck, SearchX, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { resolveSharedCertificate, type SharedCertificate } from "@/lib/learner/certificateShare";
import { readLearnerCertificateRecords } from "@/lib/learner/verification";
import { certDate } from "@/lib/shared/certificate";
import { CertificatePreview } from "./CertificateStudio";
import { PublicShell } from "./PublicShell";

/** Public page a learner sends to employers. Course, creator and ID come from Enski, not the link. */
export function SharedCertificatePage({ token }: { token: string }) {
  const [cert, setCert] = useState<SharedCertificate | null>(() => resolveSharedCertificate(token));
  // After hydration, upgrade to "verified" when this device holds the matching issued record.
  useEffect(() => { setCert(resolveSharedCertificate(token, readLearnerCertificateRecords())); }, [token]);

  if (!cert) {
    return (
      <PublicShell eyebrow="Shared certificate" title="This certificate link isn't valid" text="The link may be incomplete or changed. Ask the learner to send it again, or check the certificate ID instead." skipTo="shared-cert" skipLabel="Skip to details">
        <section id="shared-cert" className="rounded-[24px] border border-line bg-card p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-warning-soft text-warning"><SearchX className="h-6 w-6" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">No certificate found for this link</h2>
              <p className="mt-1 text-sm text-muted-foreground">Copy the whole link from the message you received, including everything after /certificate/.</p>
              <Button asChild className="mt-4"><Link to="/verify"><ShieldCheck aria-hidden="true" /> Verify by certificate ID</Link></Button>
            </div>
          </div>
        </section>
      </PublicShell>
    );
  }

  const verified = cert.status === "verified";
  const design = cert.design;
  return (
    <PublicShell
      eyebrow="Shared certificate"
      title={<>{cert.holder} <span className="text-lime">completed</span> {cert.title}</>}
      text={`Certificate of completion from ${cert.issuer}, offered through Enski.`}
      skipTo="shared-cert"
      skipLabel="Skip to certificate"
    >
      <div id="shared-cert" className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <CertificatePreview
          className="bg-card border border-line"
          design={design}
          filename={`enski-certificate-${cert.code}.png`}
          content={{ learnerName: cert.holder, courseTitle: cert.title, title: "Certificate of completion", issuedAt: cert.issuedAt, code: cert.code, creatorName: cert.issuer, signer: cert.issuer }}
        />
        <section aria-labelledby="shared-status" className="rounded-[24px] border border-line bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${verified ? "bg-success-soft text-success" : "bg-ice text-cobalt"}`}>
              {verified ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : <BadgeCheck className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <h2 id="shared-status" className="text-lg font-extrabold text-foreground">{verified ? "Verified certificate" : "Certificate ID confirmed"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {verified
                  ? "Enski issued this certificate to the person named here."
                  : `${cert.code} is the Enski certificate ID for this course by ${cert.issuer}. The name and date are as shared by ${cert.holder}.`}
              </p>
            </div>
          </div>
          <dl className="mt-5 grid gap-3">
            {[
              ["Awarded to", cert.holder],
              ["Course", cert.title],
              ["Issued by", `${cert.issuer} · ${cert.category}`],
              ["Issued on", certDate(cert.issuedAt)],
              ["Certificate ID", cert.code],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0 rounded-2xl bg-soft px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{k}</dt>
                <dd className={`mt-1 break-words font-bold text-foreground ${k === "Certificate ID" ? "font-mono tracking-wider" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link to="/verify" search={{ id: cert.code }}><ShieldCheck aria-hidden="true" /> Check this ID on the verification page</Link>
          </Button>
        </section>
      </div>
    </PublicShell>
  );
}
