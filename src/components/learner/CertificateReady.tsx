import { Link } from "@tanstack/react-router";
import { Eye, LayoutDashboard, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CertificateArt } from "@/components/shared/certificate/CertificateArt";
import { CertificateDownloadMenu, useCertificateExport } from "@/components/shared/certificate/CertificateViewer";
import { OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { accountPerson } from "@/lib/dashboard/account";
import { courseCertificateDesign } from "@/lib/learner/certificateStyles";
import { printedName } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { readyDesign } from "@/lib/learner/readyDesign";
import { useCredentials } from "@/lib/shared/credentials";
import { certContent, issuedContent } from "./Achievements";
import { LearnerNotFound, shortDate } from "./shared";

/** "Congratulations! Your certificate is ready." — shown after the learner downloads a certificate. */
export function CertificateReady({ id }: { id: string }) {
  const { state } = useLearner();
  const creds = useCredentials();
  const [saved] = useState(() => (typeof window === "undefined" ? null : readyDesign(id)));
  const own = state.certificates.find((c) => c.id === id);
  const emails = [state.profile.email, accountPerson().email].map((e) => e.trim().toLowerCase()).filter(Boolean);
  const issued = own ? undefined : creds.certificates.find((x) => x.code === id && x.status === "active" && emails.includes(x.recipientEmail));
  const content = own ? certContent(own, printedName(own, state.profile)) : issued ? issuedContent(issued) : null;
  const design = saved ?? (own ? courseCertificateDesign(own.resourceId) : issued?.design);
  const svg = useRef<SVGSVGElement>(null);
  const filename = `enski-certificate-${own ? own.resourceId : id}.png`;
  const exp = useCertificateExport({ filename, content: content ?? { learnerName: "", courseTitle: "", title: "", issuedAt: "", code: "", creatorName: "", signer: "" }, design: design ?? courseCertificateDesign("") });
  if (!content || !design) return <LearnerNotFound what="certificate" />;

  const verifyUrl = typeof window === "undefined" ? "" : `${window.location.origin}/verify?id=${encodeURIComponent(content.code)}`;
  const share = async () => {
    const text = `I earned my ${content.title.toLowerCase()} for ${content.courseTitle} on Enski.`;
    if (navigator.share) {
      try { await navigator.share({ title: content.courseTitle, text, url: verifyUrl }); return; } catch (e) { if ((e as DOMException).name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(verifyUrl); toast.success("Certificate link copied"); } catch { toast.error("Couldn't copy the link", { description: `Copy it by hand: ${verifyUrl}` }); }
  };

  return (
    <div className="py-4 sm:py-8">
      <OutcomeScreen
        tone="success"
        eyebrow="Certificate"
        title="Congratulations! Your certificate is ready."
        message={<>Well done, {content.learnerName.split(" ")[0] || "you"}. You finished <b className="text-ink">{content.courseTitle}</b>, and your certificate has downloaded.</>}
        details={[
          { label: "Course", value: content.courseTitle },
          { label: "Name on certificate", value: content.learnerName },
          { label: "Certificate ID", value: content.code, copy: content.code, mono: true },
          { label: "Issued by", value: content.creatorName },
          { label: "Issued", value: shortDate(content.issuedAt) },
        ]}
        actions={
          <>
            <CertificateDownloadMenu busy={exp.busy} portrait={design.template === "portrait"} onPrint={() => void exp.print(svg.current)} onPick={(f) => exp.run(svg.current, f)} className="min-h-12 w-full rounded-full px-6 text-[15px] font-extrabold sm:w-auto" />
            <button type="button" onClick={() => void share()} className={outcomeButton.secondary}><Share2 aria-hidden="true" />Share</button>
          </>
        }
        moreActions={<>
          <Link to="/learner/certificates/$certificateId" params={{ certificateId: id }} className={outcomeButton.quiet}><Eye aria-hidden="true" />View certificate</Link>
          <Link to="/learner/dashboard" className={outcomeButton.quiet}><LayoutDashboard aria-hidden="true" />Return to dashboard</Link>
        </>}
        footer={<>Anyone can check it at <Link to="/verify" search={{ id: content.code }} className="font-bold text-brand underline-offset-4 hover:underline">the verification page</Link>.</>}
      >
        <div className="cert-stage mt-6 rounded-[20px] p-2.5 sm:p-4">
          <div className="cert-paper overflow-hidden rounded-md cert-ready-in">
            <CertificateArt content={content} design={design} svgRef={svg} decorative className="block h-auto w-full" />
          </div>
        </div>
      </OutcomeScreen>
      {exp.sheet}
    </div>
  );
}
