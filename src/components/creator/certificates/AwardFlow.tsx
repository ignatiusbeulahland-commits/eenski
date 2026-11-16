import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Award, Eye, FileBadge2, ShieldCheck, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { CertificateArt } from "@/components/shared/certificate/CertificateArt";
import { FlowSteps, OutcomeScreen, ProcessingScreen, outcomeButton, useProcessing } from "@/components/shared/outcome";
import { useCreator } from "@/lib/creator/store";
import { learnerCertificateNameFor } from "@/lib/learner/verification";
import { awardedByLabel, categoryInfo } from "@/lib/shared/badges";
import { certDate } from "@/lib/shared/certificate";
import { awardBadge, awardProblem, readCredentials, useCredentials, validEmail, type AwardInput } from "@/lib/shared/credentials";
import { cleanFullName } from "@/lib/shared/names";
import { cn } from "@/lib/utils";
import { CreatorNotFound } from "../shared";
import { useAwardableBadges, verifyLink } from "./IssueDialogs";

export type AwardStart = { badge?: string | undefined; email?: string | undefined; name?: string | undefined; course?: string | undefined; cert?: string | undefined };

const STEPS = ["Learner", "Badge", "Criteria", "Evidence", "Review"];
const EVIDENCE_STARTERS = ["Completed every lesson and the final project.", "Scored above 90% on the final assessment.", "Helped other learners in the community every week.", "Submitted a capstone project that met the brief."];
const AWARD_STEPS = ["Checking the criteria", "Creating the badge ID", "Adding it to the learner's collection"];

/** Award a badge in five short screens: learner, badge, criteria, evidence, review — then a result screen. */
export function AwardBadgeFlow({ start }: { start: AwardStart }) {
  const { state } = useCreator();
  const navigate = useNavigate();
  const badges = useAwardableBadges();
  const lockedRecipient = !!start.cert;
  const [step, setStep] = useState(start.email && start.name ? (start.badge ? 2 : 1) : 0);
  const [email, setEmail] = useState(start.email ?? "");
  const [name, setName] = useState(start.name ?? "");
  const [badgeId, setBadgeId] = useState(start.badge ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"form" | "awarding" | "failed">("form");
  const [failReason, setFailReason] = useState("");
  const badge = badges.find((b) => b.id === badgeId);
  const issuer = `${state.profile.firstName} ${state.profile.lastName}`.trim() || "Enski creator";
  const chosen = validEmail(email) ? learnerCertificateNameFor(email) : "";
  const person = cleanFullName(name) || "this learner";
  const input = (): AwardInput | null => badge ? { badge, badgeId: badge.id, recipientName: cleanFullName(name), recipientEmail: email, issuer, issuerEmail: state.profile.email.toLowerCase(), evidence, criteriaConfirmed: confirmed, courseTitle: start.course ?? "", certificateCode: start.cert ?? "" } : null;

  const go = (n: number) => { setError(""); setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const next = () => {
    if (step === 0) {
      if (!validEmail(email)) return setError("Enter the learner's email address");
      if (!cleanFullName(name)) return setError("Enter the name to show on the badge");
    }
    if (step === 1 && !badge) return setError("Choose a badge to award");
    if (step === 2 && !confirmed) return setError(`Confirm ${person} meets the criteria`);
    if (step === 3 && evidence.trim().length < 10) return setError("Describe how the learner met the criteria (at least 10 characters)");
    go(step + 1);
  };
  const finish = () => {
    const i = input();
    if (!i) return;
    const r = awardBadge(i);
    if (!r.ok) { setFailReason(r.error); setPhase("failed"); return; }
    void navigate({ to: "/creator/badges/awards/$awardId", params: { awardId: r.award.id }, replace: true });
  };
  const submit = () => {
    const i = input();
    const problem = i ? awardProblem(readCredentials(), i) : "Choose a badge to award";
    if (problem) { setFailReason(problem); setPhase("failed"); return; }
    setPhase("awarding");
  };

  if (phase === "awarding") return <AwardingScreen onDone={finish} name={badge?.name ?? "badge"} />;
  if (phase === "failed") {
    return (
      <div className="py-2">
        <OutcomeScreen
          tone="failed"
          eyebrow="Badge not awarded"
          title="This badge couldn't be awarded"
          message={failReason}
          details={[{ label: "Badge", value: badge?.name ?? "—" }, { label: "Learner", value: `${cleanFullName(name)} · ${email.trim().toLowerCase()}` }]}
          actions={<>
            <button type="button" className={outcomeButton.primary} onClick={() => { setPhase("form"); go(4); }}><ArrowLeft aria-hidden="true" />Back to review</button>
            <button type="button" className={outcomeButton.secondary} onClick={() => { setPhase("form"); go(1); }}>Choose another badge</button>
          </>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-2">
      <FlowSteps steps={STEPS} current={step} className="mx-auto mb-6 max-w-2xl" />
      <section key={step} className="surface screen-in p-5 sm:p-8">
        <form noValidate onSubmit={(e) => { e.preventDefault(); if (step === 4) submit(); else next(); }} className="space-y-5">
          {step === 0 && (
            <>
              <StepHead title="Who earned this badge?" text="Pick a customer or type the learner's details. They'll find the badge when they sign in with this email." />
              {state.customers.length > 0 && !lockedRecipient && (
                <div className="grid gap-1.5">
                  <Label htmlFor="aw-pick">Your customers</Label>
                  <select id="aw-pick" className="h-12 rounded-xl border bg-card px-3 text-sm" value="" onChange={(e) => { const c = state.customers.find((x) => x.id === e.target.value); if (c) { setName(c.name); setEmail(c.email); setError(""); } }}>
                    <option value="">Choose a customer…</option>
                    {state.customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
                  </select>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label htmlFor="aw-email">Email</Label><Input id="aw-email" type="email" autoComplete="off" value={email} disabled={lockedRecipient} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="learner@example.com" /></div>
                <div className="grid gap-1.5"><Label htmlFor="aw-name">Name on the badge</Label><Input id="aw-name" value={name} maxLength={80} disabled={lockedRecipient} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="e.g. Ada Okafor" /></div>
              </div>
              {chosen && chosen !== cleanFullName(name) && !lockedRecipient && (
                <p className="rounded-xl bg-ice px-3 py-2 text-xs">This learner chose <b>{chosen}</b> as their certificate name. <button type="button" className="font-bold text-cobalt underline-offset-4 hover:underline" onClick={() => setName(chosen)}>Use it</button></p>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <StepHead title="Choose a badge" text="Enski badges you can award, plus the custom badges you created." />
              <div role="radiogroup" aria-label="Badge" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {badges.map((b) => (
                  <button key={b.id} type="button" role="radio" aria-checked={badgeId === b.id} onClick={() => { setBadgeId(b.id); setConfirmed(false); setError(""); }} className={cn("flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border-[1.5px] bg-card p-3 text-center transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.98]", badgeId === b.id ? "border-cobalt shadow-[0_0_0_3px_var(--ice)]" : "border-line hover:border-cobalt-300")}>
                    <BadgeEmblem badge={b} size={60} />
                    <span className="line-clamp-2 text-[13px] font-extrabold">{b.name}</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{categoryInfo[b.category].label}</span>
                  </button>
                ))}
              </div>
              {!badges.length && <p className="text-sm text-muted-foreground">You have no badges to award yet. <Link to="/creator/badges" className="font-bold text-cobalt">Create a custom badge</Link>.</p>}
            </>
          )}
          {step === 2 && badge && (
            <>
              <StepHead title="Confirm the criteria" text="Badges are only for achievements the learner has actually earned." />
              <div className="flex items-start gap-4 rounded-[20px] border bg-soft p-4">
                <BadgeEmblem badge={badge} size={76} />
                <div className="min-w-0">
                  <p className="text-lg font-extrabold">{badge.name}</p>
                  <p className="text-xs font-bold text-cobalt">{categoryInfo[badge.category].label} · {awardedByLabel[badge.awardedBy]}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
              <div className="rounded-[20px] border-[1.5px] border-line p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Criteria</p>
                <p className="mt-1.5 text-[15px] font-semibold">{badge.criteria}</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] border-line p-4 text-sm has-[:checked]:border-cobalt has-[:checked]:bg-ice">
                <Checkbox id="aw-confirm" checked={confirmed} onCheckedChange={(v) => { setConfirmed(v === true); setError(""); }} className="mt-0.5" />
                <span>I confirm <b>{person}</b> meets every part of the criteria above.</span>
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <StepHead title="Add evidence" text="A short note on how they met the criteria. It shows on the badge details and the verification page." />
              <div className="flex flex-wrap gap-2" aria-label="Quick starts">
                {EVIDENCE_STARTERS.map((t) => <button key={t} type="button" onClick={() => { setEvidence(t); setError(""); }} className="rounded-full border-[1.5px] border-line bg-card px-3 py-1.5 text-xs font-bold transition-colors hover:border-cobalt-300 hover:bg-ice">{t}</button>)}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="aw-evidence">Evidence</Label>
                <Textarea id="aw-evidence" rows={4} maxLength={400} value={evidence} onChange={(e) => { setEvidence(e.target.value); setError(""); }} placeholder="e.g. Scored 96% on the final assessment, the highest in the cohort." />
                <p className="text-right text-xs tabular-nums text-muted-foreground">{evidence.length} / 400</p>
              </div>
            </>
          )}
          {step === 4 && badge && (
            <>
              <StepHead title="Review and award" text="Check everything before you award. You can revoke later, but the record always stays." />
              <div className="flex flex-col items-center gap-2 rounded-[20px] bg-soft p-5 text-center">
                <BadgeEmblem badge={badge} size={104} />
                <p className="text-lg font-extrabold">{badge.name}</p>
                <p className="text-sm text-muted-foreground">for <b className="text-ink">{cleanFullName(name)}</b></p>
              </div>
              <dl className="divide-y divide-dashed divide-line rounded-[20px] border-[1.5px] border-line">
                {[["Learner", `${cleanFullName(name)}`], ["Email", email.trim().toLowerCase()], ["Category", categoryInfo[badge.category].label], ...(start.course ? [["Course", start.course]] : []), ["Evidence", evidence.trim()], ["Awarded by", issuer]].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-4 px-4 py-3"><dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">{k}</dt><dd className="min-w-0 break-words text-right text-sm font-extrabold">{v}</dd></div>
                ))}
              </dl>
            </>
          )}
          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-between">
            {step > (lockedRecipient ? 1 : 0) ? <Button type="button" variant="ghost" onClick={() => go(step - 1)}><ArrowLeft aria-hidden="true" />Back</Button> : <span />}
            <Button type="submit" size="lg">{step === 4 ? <><Award aria-hidden="true" />Award badge</> : <>Continue<ArrowRight aria-hidden="true" /></>}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function StepHead({ title, text }: { title: string; text: string }) {
  return <div><h1 className="text-2xl font-extrabold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>;
}

function AwardingScreen({ onDone, name }: { onDone: () => void; name: string }) {
  const p = useProcessing(AWARD_STEPS.length, onDone, 800);
  return <div className="py-2"><ProcessingScreen title={`Awarding ${name}`} message="This only takes a moment." steps={AWARD_STEPS} active={p.active} /></div>;
}

/** Result screen for one awarded badge: success, or revoked once the creator revokes it. */
export function BadgeAwardResult({ id }: { id: string }) {
  const { state } = useCreator();
  const creds = useCredentials();
  const a = creds.badgeAwards.find((x) => x.id === id && x.issuerEmail === state.profile.email.toLowerCase());
  if (!a) return <CreatorNotFound />;
  const revoked = a.status === "revoked";
  const base = [
    { label: "Badge", value: a.badge.name },
    { label: "Learner", value: a.recipientName },
    { label: "Email", value: a.recipientEmail },
    ...(a.courseTitle ? [{ label: "Course", value: a.courseTitle }] : []),
    { label: "Badge ID", value: a.id, copy: a.id, mono: true },
    { label: "Awarded", value: certDate(a.issuedAt) },
  ];
  return (
    <div className="py-2">
      <OutcomeScreen
        tone={revoked ? "cancelled" : "success"}
        eyebrow={revoked ? "Revoked" : "Badge awarded"}
        title={revoked ? "Badge revoked" : `${a.badge.name} awarded`}
        message={revoked
          ? <>It stays on record, and the verification page now shows it as revoked with your reason.</>
          : <>{a.recipientName} will see it in their badge collection when they sign in with {a.recipientEmail}.</>}
        emblem={<span className={cn("outcome-pop relative mx-auto grid place-items-center", !revoked && "outcome-emblem")}>{!revoked && <span className="outcome-burst" aria-hidden="true" />}<BadgeEmblem badge={a.badge} size={128} locked={revoked} label={`${a.badge.name} badge`} /></span>}
        details={revoked ? [...base, { label: "Revoked", value: a.revokedAt ? certDate(a.revokedAt) : "—" }, { label: "Reason", value: a.revokeReason ?? "—" }] : [...base, { label: "Verification link", value: "Copy to share", copy: verifyLink(a.id) }]}
        actions={<>
          <Link to="/creator/badges" search={{ tab: "badges" }} className={outcomeButton.primary}>{revoked ? "Back to badges" : <><Award aria-hidden="true" />Done</>}</Link>
          {revoked
            ? <Link to="/verify" search={{ id: a.id }} className={outcomeButton.secondary}><ShieldCheck aria-hidden="true" />Check verification page</Link>
            : <Link to="/creator/badges/award" search={{}} className={outcomeButton.secondary}>Award another badge</Link>}
        </>}
        footer={!revoked && <Link to="/verify" search={{ id: a.id }} className="font-bold text-brand underline-offset-4 hover:underline">Open the verification page</Link>}
      />
    </div>
  );
}

const ISSUE_STEPS = ["Applying your certificate branding", "Generating the certificate ID", "Adding it to the verification register"];

/** Issuance confirmation for a hand-issued certificate (with a short processing lead-in), or its revoked state. */
export function CertificateIssued({ code, fresh }: { code: string; fresh: boolean }) {
  const { state } = useCreator();
  const creds = useCredentials();
  const [working, setWorking] = useState(fresh);
  const p = useProcessing(ISSUE_STEPS.length, () => setWorking(false), 750);
  const c = creds.certificates.find((x) => x.code === code && x.issuerEmail === state.profile.email.toLowerCase());
  if (!c) return <CreatorNotFound />;
  if (working && c.status === "active") return <div className="py-2"><ProcessingScreen title="Issuing certificate" message={`For ${c.recipientName}`} steps={ISSUE_STEPS} active={p.active} /></div>;
  const revoked = c.status === "revoked";
  const content = { learnerName: c.recipientName, courseTitle: c.courseTitle, title: c.title, issuedAt: c.issuedAt, code: c.code, creatorName: c.issuer, signer: c.signer };
  const base = [
    { label: "Learner", value: c.recipientName },
    { label: "Email", value: c.recipientEmail },
    { label: "Course", value: c.courseTitle },
    { label: "Certificate ID", value: c.code, copy: c.code, mono: true },
    { label: "Issued", value: certDate(c.issuedAt) },
  ];
  return (
    <div className="py-2">
      <OutcomeScreen
        tone={revoked ? "cancelled" : "success"}
        eyebrow={revoked ? "Revoked" : "Certificate"}
        title={revoked ? "Certificate revoked" : "Certificate issued"}
        message={revoked
          ? <>It stays on record, and anyone checking ID {c.code} will see it was revoked.</>
          : <>{c.recipientName} can open it under Certificates when they sign in with {c.recipientEmail}. Anyone with the ID can check it.</>}
        details={revoked ? [...base, { label: "Revoked", value: c.revokedAt ? certDate(c.revokedAt) : "—" }, { label: "Reason", value: c.revokeReason ?? "—" }] : [...base, { label: "Verification link", value: "Copy to share", copy: verifyLink(c.code) }]}
        actions={revoked ? <>
          <Link to="/creator/badges" search={{ tab: "certificates" }} className={outcomeButton.primary}>Back to certificates</Link>
          <Link to="/verify" search={{ id: c.code }} className={outcomeButton.secondary}><ShieldCheck aria-hidden="true" />Check verification page</Link>
        </> : <>
          <Link to="/creator/badges" search={{ tab: "certificates" }} className={outcomeButton.primary}><FileBadge2 aria-hidden="true" />Done</Link>
          {!creds.badgeAwards.some((a) => a.certificateCode === c.code && a.status === "active") && <Link to="/creator/badges/award" search={{ badge: "course-completed", email: c.recipientEmail, name: c.recipientName, course: c.courseTitle, cert: c.code }} className={outcomeButton.secondary}><Award aria-hidden="true" />Award a badge too</Link>}
        </>}
        footer={<Link to="/verify" search={{ id: c.code }} className="inline-flex items-center gap-1 font-bold text-brand underline-offset-4 hover:underline">{revoked ? <Undo2 className="size-3" aria-hidden="true" /> : <Eye className="size-3" aria-hidden="true" />}Open the verification page</Link>}
      >
        <div className="cert-stage mt-6 rounded-[20px] p-2.5 sm:p-4">
          <div className={cn("cert-paper cert-ready-in overflow-hidden rounded-md", revoked && "opacity-60 grayscale")}>
            <CertificateArt content={content} design={c.design} decorative className="block h-auto w-full" />
          </div>
        </div>
      </OutcomeScreen>
    </div>
  );
}
