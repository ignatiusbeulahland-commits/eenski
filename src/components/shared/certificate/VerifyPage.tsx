import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Building2, CalendarCheck2, ClipboardPaste, Copy, Hash, Loader2, RotateCcw, SearchX, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/dashboard-ui/accordion";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { readCreatorCertificateRecords } from "@/lib/creator/verification";
import { readLearnerCertificateRecords } from "@/lib/learner/verification";
import { certDate, defaultCertificateDesign } from "@/lib/shared/certificate";
import { looksLikeBadgeId, normalizeBadgeId, normalizeCertificateId, verifyBadge, verifyCertificate, type BadgeVerifyResult, type VerifiableBadge, type VerifiableCertificate, type VerifyResult } from "@/lib/shared/certificateVerify";
import { credentialsUnreadable, registryBadgeRecords, registryCertificateRecords } from "@/lib/shared/credentials";
import { readLearnerBadgeRecords } from "@/lib/learner/verification";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { categoryInfo } from "@/lib/shared/badges";
import { AlertTriangle, Award, Ban, ListChecks } from "lucide-react";
import { CertificateArt } from "./CertificateArt";
import { PublicShell } from "./PublicShell";

/** Public page: anyone can enter a certificate ID and see whether Enski issued it. */
export function VerifyPage({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [value, setValue] = useState(id ?? "");
  const [records, setRecords] = useState<VerifiableCertificate[] | null>(null);
  const [badges, setBadges] = useState<VerifiableBadge[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [canPaste, setCanPaste] = useState(false);
  useEffect(() => { setCanPaste(typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function"); }, []);
  const paste = async () => {
    try {
      const t = (await navigator.clipboard.readText()).trim().slice(0, 40);
      if (t) setValue(t);
      document.getElementById(inputId)?.focus();
    } catch {
      toast.error("Couldn't read your clipboard. Paste the ID into the box instead.");
    }
  };

  useEffect(() => {
    let blocked = false;
    try { window.localStorage.getItem("enski:probe"); } catch { blocked = true; }
    setUnavailable(blocked || credentialsUnreadable());
    setBadges([...registryBadgeRecords(), ...readLearnerBadgeRecords()]);
    setRecords([...registryCertificateRecords(), ...readLearnerCertificateRecords(), ...readCreatorCertificateRecords()]);
  }, []);
  useEffect(() => { setValue(id ?? ""); }, [id]);

  const isBadge = !!id && looksLikeBadgeId(id);
  const badgeResult: BadgeVerifyResult | null = id && records && isBadge ? verifyBadge(id, badges, unavailable) : null;
  const certResult: VerifyResult | null = id && records && !isBadge ? verifyCertificate(id, records, unavailable) : null;
  // One shape for the form: invalid input, or a looked-up result.
  const result: { status: string; message?: string } | null = badgeResult ?? certResult;
  const invalid = result?.status === "invalid";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = normalizeCertificateId(value) ?? normalizeBadgeId(value) ?? value.trim();
    void navigate({ to: "/verify", search: next ? { id: next } : {}, replace: false });
  };

  useEffect(() => {
    if (!result || result.status === "invalid" || result.status === "empty") return;
    document.getElementById("verify-result")?.focus({ preventScroll: false });
  }, [result?.status, id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PublicShell
      eyebrow="Certificate verification"
      title={<>Check that an Enski certificate or badge is <span className="text-lime">genuine</span></>}
      text="Enter the certificate ID (ENS-…) or badge ID (ENB-…). Anyone can check it, no account needed. Only the holder's name and the credential details are shown."
      skipTo="verify-form"
      highlights={["No account needed", "Free to check", "Instant result"]}
      aside={<HeroArt />}
      skipLabel="Skip to verification"
    >
        <form id="verify-form" onSubmit={submit} noValidate className="rounded-[28px] border border-line bg-card p-4 shadow-lift sm:p-7" role="search" aria-label="Verify a certificate">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={inputId} className="flex items-center gap-2.5 text-[15px] font-extrabold text-foreground"><span className="lime-tick" aria-hidden="true" />Certificate or badge ID</Label>
            <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">Format <span className="font-mono font-bold tracking-wider text-foreground">ENS- or ENB-XXXX-XXXX</span></span>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cobalt" aria-hidden="true" />
              <Input
                id={inputId}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="ENS-7F3K-92QD"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={40}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : `${inputId}-hint`}
                className={`h-14 rounded-[16px] pl-12 font-mono text-base tracking-[0.12em] uppercase placeholder:normal-case placeholder:tracking-[0.08em] sm:text-lg ${canPaste ? "pr-24" : ""}`}
              />
              {canPaste && (
                <button type="button" onClick={paste} className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 text-[13px] font-extrabold text-cobalt hover:bg-ice">
                  <ClipboardPaste className="h-4 w-4" aria-hidden="true" /> Paste
                </button>
              )}
            </div>
            <Button type="submit" size="lg" className="h-14 sm:px-9"><ShieldCheck aria-hidden="true" /> Verify</Button>
          </div>
          {invalid ? (
            <p id={errorId} role="alert" className="mt-2.5 text-sm font-semibold text-destructive">{result?.message}</p>
          ) : (
            <p id={`${inputId}-hint`} className="mt-2.5 text-[13px] text-muted-foreground">Capital letters, dashes and spaces don't matter.</p>
          )}
          {!result || result.status === "invalid" || result.status === "empty" ? <IdAnatomy /> : null}
        </form>

        <div className="mt-6" aria-live="polite">
          {id && !records && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking Enski records…</p>
          )}
          {certResult?.status === "verified" && <Verified code={certResult.code} c={certResult.certificate} />}
          {certResult?.status === "revoked" && <Revoked code={certResult.code} c={certResult.certificate} />}
          {certResult?.status === "preview" && <PreviewOnly code={certResult.code} c={certResult.certificate} />}
          {certResult?.status === "not_found" && <NotFound code={certResult.code} />}
          {(certResult?.status === "unavailable" || badgeResult?.status === "unavailable") && <Unavailable code={certResult?.status === "unavailable" ? certResult.code : badgeResult?.status === "unavailable" ? badgeResult.id : ""} />}
          {(badgeResult?.status === "valid" || badgeResult?.status === "revoked") && <BadgeResult id={badgeResult.id} b={badgeResult.badge} revoked={badgeResult.status === "revoked"} />}
          {badgeResult?.status === "not_found" && <NotFound code={badgeResult.id} badge />}
        </div>

        {!result || result.status === "invalid" || result.status === "empty" ? (
          <>
            <HowItWorks />
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <WhereToFind />
              <Questions />
            </div>
          </>
        ) : null}
    </PublicShell>
  );
}

function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] py-4">
      <div className="absolute inset-x-6 inset-y-2 rotate-6 rounded-[24px] border border-on-dark/15 bg-on-dark/5" />
      <div className="relative rounded-[24px] border border-on-dark/20 bg-on-dark/10 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <BrandIcon src={brandArtwork.shield} className="h-14 w-14 drop-shadow-xl" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-on-dark-muted">Certificate record</p>
            <p className="mt-0.5 font-mono text-sm font-bold tracking-wider">ENS-····-····</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {["w-4/5", "w-3/5", "w-2/3"].map((w, i) => (
            <div key={i}>
              <div className="h-2 w-16 rounded-full bg-on-dark/20" />
              <div className={`mt-1.5 h-3 rounded-full bg-on-dark/35 ${w}`} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-on-dark/15 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-midnight"><ShieldCheck className="h-3.5 w-3.5" />Genuine</span>
          <BrandIcon src={brandArtwork.graduate} className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}

function IdAnatomy() {
  const parts = [["ENS", "Enski prefix"], ["7F3K", "4 characters"], ["92QD", "4 characters"]] as const;
  return (
    <div className="mt-5 rounded-[18px] bg-soft/70 p-3 sm:p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">How an ID looks</p>
      <ol className="mt-2.5 flex flex-wrap items-start gap-2 sm:gap-3">
        {parts.map(([code, label], i) => (
          <li key={code} className="flex items-start gap-2 sm:gap-3">
            <span className="flex flex-col items-center gap-1">
              <span className={`rounded-[10px] px-2.5 py-1 font-mono text-sm font-bold tracking-[0.14em] ring-1 ${i === 0 ? "bg-cobalt text-primary-foreground ring-cobalt" : "bg-card text-foreground ring-line"}`}>{code}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </span>
            {i < parts.length - 1 && <span className="pt-1 font-mono text-sm font-bold text-muted-foreground" aria-hidden="true">–</span>}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">Letters and the numbers 2 to 9.</p>
    </div>
  );
}

function ResultCard({ tone, art, icon: Icon, badge, title, text, children }: {
  tone: "success" | "info" | "warning"; art?: string | undefined; icon?: LucideIcon | undefined; badge: string; title: string; text: string; children?: ReactNode;
}) {
  const band = tone === "success" ? "bg-success" : tone === "info" ? "bg-cobalt" : "bg-warning";
  const pill = tone === "success" ? "bg-success-soft text-success" : tone === "info" ? "bg-ice text-cobalt" : "bg-warning-soft text-warning";
  return (
    <section id="verify-result" tabIndex={-1} aria-labelledby="verify-result-title" className="relative overflow-hidden rounded-[28px] border border-line bg-card p-5 outline-none sm:p-8">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${band}`} />
      <div className="flex items-start gap-4 sm:items-center sm:gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-ice/70 ring-1 ring-line sm:h-20 sm:w-20 sm:rounded-[22px]">
          {art ? <BrandIcon src={art} className="h-10 w-10 sm:h-14 sm:w-14" /> : Icon ? <Icon className="h-6 w-6 text-warning sm:h-8 sm:w-8" aria-hidden="true" /> : null}
        </span>
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${pill}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{badge}</span>
          <h2 id="verify-result-title" className="mt-2 text-xl font-extrabold text-foreground sm:text-2xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{text}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Detail({ icon: Icon, label, value, mono }: { icon: LucideIcon; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[18px] bg-soft/80 px-4 py-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-card text-cobalt ring-1 ring-line" aria-hidden="true"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
        <dd className={`mt-0.5 break-words font-bold text-foreground ${mono ? "font-mono tracking-wider" : ""}`}>{value}</dd>
      </div>
    </div>
  );
}

const focusInput = () => {
  const input = document.getElementById("verify-form")?.querySelector("input");
  input?.focus();
  input?.select();
};

function Verified({ code, c }: { code: string; c: VerifiableCertificate }) {
  const [checkedOn, setCheckedOn] = useState("");
  useEffect(() => { setCheckedOn(certDate(new Date().toISOString())); }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/verify?id=${code}`);
      toast.success("Verification link copied");
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar instead.");
    }
  };
  return (
    <ResultCard tone="success" art={brandArtwork.success} badge="Record found" title="This ID matches an Enski certificate record" text="Enski's issue record for this ID names the person, course and date below.">
      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          <Detail icon={UserRound} label="Awarded to" value={c.holder || "Enski learner"} />
          <Detail icon={BookOpen} label="Course" value={c.title} />
          <Detail icon={Building2} label="Issued by" value={c.issuer} />
          <Detail icon={CalendarCheck2} label="Issued on" value={certDate(c.issuedAt)} />
          <div className="sm:col-span-2 lg:col-span-1"><Detail icon={Hash} label="Certificate ID" value={code} mono /></div>
        </dl>
        <div>
          <div className="cert-stage rounded-[22px] p-3 sm:p-4">
            <div className="cert-paper overflow-hidden rounded-md">
              <CertificateArt
                decorative
                design={c.design ?? defaultCertificateDesign}
                className="block h-auto w-full"
                content={{ learnerName: c.holder || "Enski learner", courseTitle: c.title, title: "Certificate of completion", issuedAt: c.issuedAt, code, creatorName: c.issuer, signer: c.issuer }}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {checkedOn ? <p className="mr-auto whitespace-nowrap text-[13px] text-muted-foreground">Checked on {checkedOn}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="quiet" onClick={focusInput}><RotateCcw aria-hidden="true" /> Check another</Button>
              <Button onClick={copy}><Copy aria-hidden="true" /> Copy verification link</Button>
            </div>
          </div>
        </div>
      </div>
    </ResultCard>
  );
}

function PreviewOnly({ code, c }: { code: string; c: VerifiableCertificate }) {
  return (
    <ResultCard tone="info" art={brandArtwork.views} badge="Preview only" title="Preview certificate — not issued" text={`${code} belongs to the style preview learners see for “${c.title}” before they finish. It was never awarded to anyone, so it isn't proof of completion.`}>
      <div className="mt-6 flex flex-wrap gap-2"><Button variant="quiet" onClick={focusInput}><RotateCcw aria-hidden="true" /> Check another ID</Button></div>
    </ResultCard>
  );
}

function NotFound({ code, badge }: { code: string; badge?: boolean }) {
  const what = badge ? "badge" : "certificate";
  return (
    <ResultCard tone="warning" icon={SearchX} badge="Not found" title={`No ${what} found`} text={`No Enski ${what} matches ${code}. Check each character, or ask the holder to share their verification link.`}>
      <div className="mt-6 flex flex-wrap gap-2"><Button variant="quiet" onClick={focusInput}><RotateCcw aria-hidden="true" /> Try another ID</Button></div>
    </ResultCard>
  );
}

function Revoked({ code, c }: { code: string; c: VerifiableCertificate }) {
  return (
    <ResultCard tone="warning" icon={Ban} badge="Revoked" title="This certificate was revoked" text={`${c.issuer} revoked it${c.revoked?.at ? ` on ${certDate(c.revoked.at)}` : ""}. It is no longer valid proof of completion.`}>
      <dl className="mt-6 grid gap-2.5 sm:grid-cols-2">
        <Detail icon={UserRound} label="Issued to" value={c.holder || "Enski learner"} />
        <Detail icon={BookOpen} label="Course" value={c.title} />
        <Detail icon={Building2} label="Issued by" value={c.issuer} />
        <Detail icon={Hash} label="Certificate ID" value={code} mono />
        {c.revoked?.reason ? <div className="sm:col-span-2"><Detail icon={AlertTriangle} label="Reason given" value={c.revoked.reason} /></div> : null}
      </dl>
      <div className="mt-6 flex flex-wrap gap-2"><Button variant="quiet" onClick={focusInput}><RotateCcw aria-hidden="true" /> Check another ID</Button></div>
    </ResultCard>
  );
}

function Unavailable({ code }: { code: string }) {
  return (
    <ResultCard tone="info" icon={AlertTriangle} badge="Unavailable" title="We can't check this right now" text={`The records needed to check ${code} couldn't be read in this browser (storage may be blocked or damaged). This doesn't mean it's fake. Try again, or in another browser.`}>
      <div className="mt-6 flex flex-wrap gap-2"><Button variant="quiet" onClick={() => window.location.reload()}><RotateCcw aria-hidden="true" /> Try again</Button></div>
    </ResultCard>
  );
}

function BadgeResult({ id, b, revoked }: { id: string; b: VerifiableBadge; revoked: boolean }) {
  return (
    <ResultCard tone={revoked ? "warning" : "success"} art={revoked ? undefined : brandArtwork.success} icon={revoked ? Ban : undefined} badge={revoked ? "Revoked" : "Record found"} title={revoked ? "This badge was revoked" : "This ID matches an Enski badge record"} text={revoked ? `${b.issuer} revoked it${b.revoked?.at ? ` on ${certDate(b.revoked.at)}` : ""}.` : `Enski's award record for this ID names the person, issuer and date below.`}>
      <div className="mt-7 grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="mx-auto"><BadgeEmblem badge={b.badge} size={150} locked={revoked} label={`${b.name} badge`} /></div>
        <dl className="grid gap-2.5 sm:grid-cols-2">
          <Detail icon={Award} label="Badge" value={`${b.name} · ${categoryInfo[b.badge.category].label}`} />
          <Detail icon={UserRound} label="Awarded to" value={b.holder} />
          <Detail icon={Building2} label="Issued by" value={b.issuer} />
          <Detail icon={CalendarCheck2} label="Issued on" value={certDate(b.issuedAt)} />
          {b.courseTitle ? <Detail icon={BookOpen} label="Course" value={b.courseTitle} /> : null}
          <Detail icon={Hash} label="Badge ID" value={id} mono />
          <div className="sm:col-span-2"><Detail icon={ListChecks} label="Criteria" value={b.criteria} /></div>
          {revoked && b.revoked?.reason ? <div className="sm:col-span-2"><Detail icon={AlertTriangle} label="Reason given" value={b.revoked.reason} /></div> : null}
        </dl>
      </div>
      <div className="mt-6 flex flex-wrap gap-2"><Button variant="quiet" onClick={focusInput}><RotateCcw aria-hidden="true" /> Check another ID</Button></div>
    </ResultCard>
  );
}

function HowItWorks() {
  const steps = [
    { art: brandArtwork.graduate, title: "Find the ID", text: "It's printed at the bottom of every Enski certificate and starts with ENS." },
    { art: brandArtwork.shield, title: "Enter it above", text: "We look it up in Enski's issue records." },
    { art: brandArtwork.success, title: "See the record", text: "A matching record shows who earned it, the course and the issue date. No match means no record, not a verdict." },
  ];
  return (
    <section aria-labelledby="how-title" className="mt-10">
      <h2 id="how-title" className="flex items-center gap-2.5 text-lg font-extrabold text-foreground sm:text-xl"><span className="lime-tick" aria-hidden="true" />How verification works</h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map((s, i) => (
          <li key={s.title} className="surface relative flex items-start gap-4 p-4 sm:block sm:p-5">
            <BrandIcon src={s.art} className="h-12 w-12 sm:h-14 sm:w-14" />
            <div className="min-w-0 sm:mt-4">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt">Step {i + 1}</span>
              <h3 className="mt-1 font-extrabold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
            <span className="absolute right-4 top-4 font-mono text-3xl font-extrabold text-cobalt-100 sm:text-4xl" aria-hidden="true">0{i + 1}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WhereToFind() {
  return (
    <section aria-labelledby="where-title" className="surface p-5 sm:p-6">
      <h2 id="where-title" className="flex items-center gap-2.5 text-[15px] font-extrabold text-foreground"><span className="lime-tick" aria-hidden="true" />Where to find the ID</h2>
      <p className="mt-1 text-sm text-muted-foreground">Look along the bottom edge of the certificate, next to the issue date.</p>
      <div className="cert-stage mt-4 rounded-[20px] p-4" aria-hidden="true">
        <div className="cert-paper rounded-md bg-card p-4 sm:p-5">
          <div className="mx-auto h-2 w-24 rounded-full bg-cobalt-100" />
          <div className="mx-auto mt-3 h-3.5 w-40 max-w-full rounded-full bg-cobalt/80" />
          <div className="mx-auto mt-2.5 h-2 w-52 max-w-full rounded-full bg-line" />
          <div className="mx-auto mt-1.5 h-2 w-36 max-w-full rounded-full bg-line" />
          <div className="mt-6 flex items-end justify-between gap-3">
            <div className="space-y-1.5"><div className="h-2 w-16 rounded-full bg-line" /><div className="h-2 w-12 rounded-full bg-line" /></div>
            <span className="relative rounded-[8px] bg-ice px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-cobalt ring-2 ring-lime">
              ENS-7F3K-92QD
              <span className="absolute -top-6 right-0 whitespace-nowrap rounded-full bg-midnight px-2 py-0.5 font-sans text-[11px] font-extrabold tracking-normal text-on-dark">Certificate ID</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Questions() {
  const faqs = [
    ["What does “preview certificate” mean?", "Learners can try certificate styles before they finish a course. Those previews carry an ID, but they're never awarded, so they don't prove completion."],
    ["Why can't a certificate be found?", "The ID may have a typing mistake, or the certificate hasn't been issued yet. Ask the holder to send their shareable certificate link."],
    ["Do I need an Enski account?", "No. Anyone with the certificate ID can check it here."],
  ] as const;
  return (
    <section aria-labelledby="faq-title" className="surface p-5 sm:p-6">
      <h2 id="faq-title" className="flex items-center gap-2.5 text-[15px] font-extrabold text-foreground"><span className="lime-tick" aria-hidden="true" />Common questions</h2>
      <Accordion type="single" collapsible className="mt-2">
        {faqs.map(([q, a]) => (
          <AccordionItem key={q} value={q} className="border-line last:border-b-0">
            <AccordionTrigger className="text-left text-sm font-bold text-foreground hover:no-underline">{q}</AccordionTrigger>
            <AccordionContent className="text-[13px] text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
