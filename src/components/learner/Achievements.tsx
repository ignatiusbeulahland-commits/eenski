import { DialogActions } from "@/components/shared/DialogActions";
import { Link, useNavigate } from "@tanstack/react-router";
import { Award, Copy, Eye, History, Share2, ShieldCheck, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/affiliate/ui";
import { findResource, resources } from "@/lib/learner/catalog";
import { CertificateArt, type CertificateContent } from "@/components/shared/certificate/CertificateArt";
import { CertificatePreview, CertificateStyleControls } from "@/components/shared/certificate/CertificateStudio";
import { certificateCode, defaultCertificateDesign, type CertificateDesign } from "@/lib/shared/certificate";
import { printedName, type LearnerState } from "@/lib/learner/rules";
import { accountPerson } from "@/lib/dashboard/account";
import { useCredentials, type IssuedCertificate } from "@/lib/shared/credentials";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { BadgeCollection, BadgeDetails, useBadgeItems } from "./BadgeCollection";
import { toast } from "sonner";
import { certificateNameOf } from "@/lib/shared/names";
import { CertificateNameLine } from "./CertificateName";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { BadgeArt } from "./BadgeArt";
import { courseCertificateDesign } from "@/lib/learner/certificateStyles";
import { CertificateSharePanel } from "./CertificateShare";
import { CertificateCredential } from "./CertificateCredential";
import { rememberReadyDesign } from "@/lib/learner/readyDesign";
import { LearnerNotFound, shortDate } from "./shared";

export type AchievementTab = "certificates" | "badges" | "history";

export function CertificatesPage({ tab }: { tab: AchievementTab }) {
  const { state } = useLearner();
  const navigate = useNavigate();
  const creds = useCredentials();
  const emails = [state.profile.email, accountPerson().email].map((e) => e.trim().toLowerCase()).filter(Boolean);
  const issuedByCreators = creds.certificates.filter((c) => emails.includes(c.recipientEmail));
  const awards = creds.badgeAwards.filter((a) => emails.includes(a.recipientEmail));
  const items = useBadgeItems(state, awards);
  const earned = items.filter((i) => i.status === "earned");
  const history = [
    ...earned.map((b) => ({ id: b.key, date: b.earnedAt!, title: `Earned the ${b.name} badge`, kind: "Badge" })),
    ...state.certificates.map((c) => ({ id: c.id, date: c.issuedAt, title: `Certificate of completion: ${c.title}`, kind: "Certificate" })),
    ...issuedByCreators.map((c) => ({ id: c.code, date: c.issuedAt, title: `${c.title}: ${c.courseTitle}${c.status === "revoked" ? " (revoked)" : ""}`, kind: "Certificate" })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const certCount = state.certificates.length + issuedByCreators.filter((c) => c.status === "active").length;
  return (
    <div>
      <PageHeader eyebrow="Certificates / Badges" title="Your achievements" description="Certificates from creators and badges you earn by learning and taking part." />
      <div className="mb-6 grid grid-cols-3 gap-3">
        {([["Certificates", certCount, Award], ["Badges earned", `${earned.length}`, Trophy], ["Milestones", history.length, History]] as const).map(([l, v, Icon]) => (
          <div key={l} className="surface p-4"><Icon className="h-4 w-4 text-cobalt" /><p className="mt-2 text-xl font-extrabold tabular-nums sm:text-2xl">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <Tabs value={tab} onValueChange={(v) => navigate({ to: "/learner/certificates", search: v === "certificates" ? {} : { tab: v as AchievementTab }, replace: true })}>
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
          {state.certificates.length || issuedByCreators.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {state.certificates.map((c) => (
                <Link key={c.id} to="/learner/certificates/$certificateId" params={{ certificateId: c.id }} className="surface group flex gap-4 p-4 transition-shadow hover:shadow-lift">
                  <span className="w-28 shrink-0 overflow-hidden rounded-md border border-line shadow-sm sm:w-32"><CertificateArt content={certContent(c, printedName(c, state.profile))} design={courseCertificateDesign(c.resourceId)} decorative className="block h-auto w-full" /></span>
                  <span className="min-w-0"><span className="block text-xs font-semibold text-cobalt">Certificate of completion</span><span className="mt-0.5 line-clamp-2 block text-sm font-bold group-hover:text-cobalt">{c.title}</span><span className="mt-1 block text-xs text-muted-foreground">Issued by {c.issuer} · {shortDate(c.issuedAt)}</span></span>
                </Link>
              ))}
              {issuedByCreators.map((c) => (
                <Link key={c.code} to="/learner/certificates/$certificateId" params={{ certificateId: c.code }} className="surface group flex gap-4 p-4 transition-shadow hover:shadow-lift">
                  <span className="w-28 shrink-0 overflow-hidden rounded-md border border-line shadow-sm sm:w-32"><CertificateArt content={issuedContent(c)} design={c.design} decorative className="block h-auto w-full" /></span>
                  <span className="min-w-0"><span className="block text-xs font-semibold text-cobalt">{c.title}</span><span className="mt-0.5 line-clamp-2 block text-sm font-bold group-hover:text-cobalt">{c.courseTitle}</span><span className="mt-1 block text-xs text-muted-foreground">Issued by {c.issuer} · {shortDate(c.issuedAt)}</span>{c.status === "revoked" && <span className="mt-1.5 inline-block"><StatusBadge tone="pending">Revoked</StatusBadge></span>}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="surface"><EmptyState icon={Trophy} title="No certificates yet" description="Complete every lesson in a certificate-eligible course and its creator issues you a certificate of completion." action={<Button asChild><Link to="/learner/resources">Go to my library</Link></Button>} /></div>
              <CertificateSamplePreview name={certificateNameOf(state.profile)} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="badges">
          <BadgeCollection items={items} />
        </TabsContent>
        <TabsContent value="history">
          {history.length ? (
            <Panel bodyClassName="p-0"><ol className="divide-y">{history.map((h) => <li key={h.id} className="flex items-center gap-3 p-4"><span className="h-2 w-2 shrink-0 rounded-full bg-lime" /><span className="min-w-0 flex-1 text-sm font-semibold">{h.title}</span><span className="shrink-0 text-xs text-muted-foreground">{shortDate(h.date)}</span></li>)}</ol></Panel>
          ) : (
            <div className="surface"><EmptyState icon={History} title="No achievements yet" description="Every badge and certificate you earn is recorded here with its date." /></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function issuedContent(c: IssuedCertificate): CertificateContent {
  return { learnerName: c.recipientName, courseTitle: c.courseTitle, title: c.title, issuedAt: c.issuedAt, code: c.code, creatorName: c.issuer, signer: c.signer };
}

export function certContent(c: LearnerState["certificates"][number], learner: string): CertificateContent {
  return { learnerName: learner, courseTitle: c.title, title: "Certificate of completion", issuedAt: c.issuedAt, code: certificateCode(c.id), creatorName: c.issuer, signer: c.issuer };
}

/** Learners pick how their certificate looks: design and accent only; issuer details come from the creator. */
function StylePanel({ design, setDesign, content, base, creator, filename }: {
  design: CertificateDesign; setDesign: (d: CertificateDesign) => void; content: CertificateContent; base: CertificateDesign; creator: string; filename: string;
}) {
  if (!base.learnerCanChange) {
    return (
      <Panel title="Certificate style">
        <p className="text-sm text-muted-foreground">{creator} chose the style for every certificate in this course.</p>
      </Panel>
    );
  }
  const changed = design.template !== base.template || design.accent !== base.accent;
  return (
    <Panel
      title="Choose a style"
      description={`You're seeing ${creator}'s chosen style. Pick another to download and share.`}
      actions={changed ? <Button size="sm" variant="quiet" onClick={() => setDesign(base)}>Use creator's style</Button> : undefined}
    >
      <CertificateStyleControls design={design} onChange={(p) => setDesign({ ...design, ...p })} content={content} idPrefix="learner-cert" creatorPick={base} filename={filename} />
    </Panel>
  );
}

function CertificateSamplePreview({ name }: { name: string }) {
  const r = resources.find((x) => x.certificate);
  const [design, setDesign] = useState<CertificateDesign>(() => (r ? courseCertificateDesign(r.id) : defaultCertificateDesign));
  if (!r) return null;
  const content: CertificateContent = { learnerName: name, courseTitle: r.title, title: "Certificate of completion", issuedAt: new Date().toISOString(), code: certificateCode(`preview-${r.id}`), creatorName: r.creator, signer: r.creator };
  return (
    <section aria-labelledby="cert-preview-title">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="cert-preview-title" className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />What your certificate looks like</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-ice px-2.5 py-0.5 text-xs font-extrabold text-cobalt"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Preview</span>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <CertificatePreview content={content} design={design} filename="enski-certificate-preview.png" below={<CertificateNameLine content={content} design={design} />} />
        <StylePanel design={design} setDesign={setDesign} content={content} base={courseCertificateDesign(r.id)} creator={r.creator} filename="enski-certificate-preview.png" />
      </div>
    </section>
  );
}

export function CertificateDetails({ id }: { id: string }) {
  const { state } = useLearner();
  const navigate = useNavigate();
  const c = state.certificates.find((x) => x.id === id);
  const [design, setDesign] = useState<CertificateDesign>(() => (c ? courseCertificateDesign(c.resourceId) : defaultCertificateDesign));
  if (!c) return <IssuedCertificateDetails code={id} />;
  const r = findResource(c.resourceId);
  const content = certContent(c, printedName(c, state.profile));
  return (
    <div>
      <PageHeader
        eyebrow="Certificate"
        title={c.title}
        description={`Certificate of completion · Issued by ${c.issuer}${r ? ` · ${r.category}` : ""} · ${shortDate(c.issuedAt)}`}
        actions={<Button asChild variant="outline"><Link to="/verify" search={{ id: content.code }}><ShieldCheck aria-hidden="true" /> Verification page</Link></Button>}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-6">
          <CertificatePreview content={content} design={design} filename={`enski-certificate-${c.resourceId}.png`} onDownloaded={() => { rememberReadyDesign(c.id, design); void navigate({ to: "/learner/certificates/$certificateId/ready", params: { certificateId: c.id } }); }} below={<CertificateNameLine content={content} design={design} issued={{ certificateId: c.id, issuer: c.issuer }} />} />
          <CertificateCredential content={content} />
        </div>
        <div className="grid gap-6">
          <CertificateSharePanel resourceId={c.resourceId} holder={content.learnerName} title={c.title} issuer={c.issuer} issuedAt={c.issuedAt} code={content.code} design={design} />
          <StylePanel design={design} setDesign={setDesign} content={content} base={courseCertificateDesign(c.resourceId)} creator={c.issuer} filename={`enski-certificate-${c.resourceId}.png`} />
        </div>
      </div>
    </div>
  );
}

/** A certificate a creator issued by hand to this learner's email. */
function IssuedCertificateDetails({ code }: { code: string }) {
  const { state } = useLearner();
  const creds = useCredentials();
  const emails = [state.profile.email, accountPerson().email].map((e) => e.trim().toLowerCase()).filter(Boolean);
  const c = creds.certificates.find((x) => x.code === code && emails.includes(x.recipientEmail));
  const [pick, setPick] = useState<CertificateDesign | null>(null);
  const navigate = useNavigate();
  if (!c) return <LearnerNotFound what="certificate" />;
  const design = pick ?? c.design;
  const content = issuedContent(c);
  const award = creds.badgeAwards.find((a) => a.certificateCode === c.code && a.status === "active");
  return (
    <div>
      <PageHeader
        eyebrow="Certificate"
        title={c.courseTitle}
        description={`${c.title} · Issued by ${c.issuer} · ${shortDate(c.issuedAt)}`}
        actions={<Button asChild variant="outline"><Link to="/verify" search={{ id: c.code }}><ShieldCheck aria-hidden="true" /> Verification page</Link></Button>}
      />
      {c.status === "revoked" && <p role="status" className="mb-4 rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm"><b>This certificate was revoked</b> by {c.issuer}{c.revokedAt ? ` on ${shortDate(c.revokedAt)}` : ""}. {c.revokeReason}</p>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-6">
          <CertificatePreview content={content} design={design} filename={`enski-certificate-${c.code}.png`} onDownloaded={c.status === "active" ? () => { rememberReadyDesign(c.code, design); void navigate({ to: "/learner/certificates/$certificateId/ready", params: { certificateId: c.code } }); } : undefined} below={c.status === "active" ? <CertificateNameLine content={content} design={design} issued={{ certificateId: c.code, issuer: c.issuer, registry: true }} /> : undefined} />
          <CertificateCredential content={content} status={c.status === "revoked" ? "revoked" : "active"} revoked={c.status === "revoked" ? { at: c.revokedAt, reason: c.revokeReason, by: c.issuer } : undefined} />
        </div>
        <div className="grid gap-6">
          <Panel title="Share & verify" description="Anyone with the link can check this certificate on Enski's verification page.">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/verify?id=${c.code}`); toast.success("Verification link copied"); } catch { toast.error("Couldn't copy the link", { description: `Copy it by hand: ${window.location.origin}/verify?id=${c.code}` }); } }}><Copy aria-hidden="true" />Copy verification link</Button>
              {typeof navigator !== "undefined" && "share" in navigator && <Button variant="outline" onClick={() => void navigator.share({ title: c.courseTitle, text: `My ${c.title} from ${c.issuer} on Enski`, url: `${window.location.origin}/verify?id=${c.code}` }).catch(() => {})}><Share2 aria-hidden="true" />Share</Button>}
            </div>
          </Panel>
          {award && (
            <Panel title="Badge awarded with it">
              <div className="flex items-center gap-3"><BadgeEmblem badge={award.badge} size={64} /><div className="min-w-0"><p className="font-extrabold">{award.badge.name}</p><p className="text-xs text-muted-foreground">ID {award.id}</p></div></div>
            </Panel>
          )}
          {c.design.learnerCanChange ? (
            <StylePanel design={design} setDesign={setPick} content={content} base={c.design} creator={c.issuer} filename={`enski-certificate-${c.code}.png`} />
          ) : (
            <Panel title="Certificate style"><p className="text-sm text-muted-foreground">{c.issuer} chose the style for this certificate.</p></Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/** One badge's details page, for automatic badges, creator awards and badges not yet earned. */
export function LearnerBadgePage({ badgeKey }: { badgeKey: string }) {
  const { state } = useLearner();
  const creds = useCredentials();
  const emails = [state.profile.email, accountPerson().email].map((e) => e.trim().toLowerCase()).filter(Boolean);
  const items = useBadgeItems(state, creds.badgeAwards.filter((a) => emails.includes(a.recipientEmail)));
  const item = items.find((i) => i.key === badgeKey);
  if (!item) return <LearnerNotFound what="certificate" />;
  return <BadgeDetails item={item} />;
}
