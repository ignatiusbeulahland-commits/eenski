import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, phoneSheetClass } from "@/components/dashboard-ui/dialog";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { DialogActions } from "@/components/shared/DialogActions";
import { CertificateArt, type CertificateContent } from "@/components/shared/certificate/CertificateArt";
import { courseOf } from "@/lib/creator/products";
import { useCreator } from "@/lib/creator/store";
import { learnerCertificateNameFor } from "@/lib/learner/verification";
import { PLATFORM_BADGES, awardedByLabel, type BadgeDefinition } from "@/lib/shared/badges";
import { certificateCode } from "@/lib/shared/certificate";
import { customBadgeDefinition, issueCertificate, useCredentials, validEmail } from "@/lib/shared/credentials";
import { cleanFullName } from "@/lib/shared/names";
import { cn } from "@/lib/utils";

export const verifyLink = (id: string) => `${typeof window === "undefined" ? "" : window.location.origin}/verify?id=${encodeURIComponent(id)}`;
export async function copyVerifyLink(id: string) {
  try { await navigator.clipboard.writeText(verifyLink(id)); toast.success("Verification link copied"); } catch { toast.error("Couldn't copy the link", { description: `Copy it by hand: ${verifyLink(id)}` }); }
}

/** Badges a creator may award: platform "issuer" badges plus their own custom badges. */
export function useAwardableBadges(): BadgeDefinition[] {
  const { state } = useCreator();
  const creds = useCredentials();
  return useMemo(() => [
    ...PLATFORM_BADGES.filter((b) => b.awardedBy === "issuer"),
    ...creds.customBadges.filter((b) => !b.archived && b.owner === state.profile.email.toLowerCase()).map(customBadgeDefinition),
  ], [creds.customBadges, state.profile.email]);
}

function RecipientFields({ name, email, setName, setEmail, errors }: { name: string; email: string; setName: (v: string) => void; setEmail: (v: string) => void; errors: { name?: string | undefined; email?: string | undefined } }) {
  const { state } = useCreator();
  const chosen = validEmail(email) ? learnerCertificateNameFor(email) : "";
  return (
    <div className="grid gap-3">
      {state.customers.length > 0 && (
        <div className="grid gap-1.5">
          <Label htmlFor="rec-pick">Pick a customer <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <select id="rec-pick" className="h-11 rounded-xl border bg-card px-3 text-sm" defaultValue="" onChange={(e) => { const c = state.customers.find((x) => x.id === e.target.value); if (c) { setName(c.name); setEmail(c.email); } }}>
            <option value="">Type their details below…</option>
            {state.customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
          </select>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5"><Label htmlFor="rec-email">Email</Label><Input id="rec-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="learner@example.com" aria-invalid={!!errors.email} />{errors.email && <p className="text-xs font-semibold text-destructive">{errors.email}</p>}</div>
        <div className="grid gap-1.5"><Label htmlFor="rec-name">Name on the credential</Label><Input id="rec-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs font-semibold text-destructive">{errors.name}</p>}</div>
      </div>
      {chosen && chosen !== cleanFullName(name) && (
        <p className="rounded-xl bg-ice px-3 py-2 text-xs">This learner chose <b>{chosen}</b> as their certificate name. <button type="button" className="font-bold text-cobalt underline-offset-4 hover:underline" onClick={() => setName(chosen)}>Use it</button></p>
      )}
    </div>
  );
}

/** Issue a certificate for one course to a named student, in the course's saved design. */
export function IssueCertificateDialog({ open, onOpenChange, itemId }: { open: boolean; onOpenChange: (v: boolean) => void; itemId?: string }) {
  const { state } = useCreator();
  const courses = state.items.filter((i) => i.kind === "course" && !i.binnedAt);
  const [pick, setPick] = useState(itemId ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string | undefined; email?: string | undefined; course?: string | undefined; form?: string | undefined }>({});
  const navigate = useNavigate();
  const item = courses.find((c) => c.id === (itemId ?? pick));
  const creatorName = `${state.profile.firstName} ${state.profile.lastName}`.trim();
  const cert = item ? courseOf(item).certificate : null;
  useEffect(() => {
    if (!open) return;
    setPick(itemId ?? ""); setName(""); setEmail(""); setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const reset = (v: boolean) => onOpenChange(v);
  const content: CertificateContent | null = item && cert ? {
    learnerName: cleanFullName(name) || "Student name", courseTitle: item.title, title: cert.title || "Certificate of completion",
    issuedAt: new Date().toISOString(), code: certificateCode(`${item.id}-issue-preview`), creatorName, signer: cert.signer || creatorName,
  } : null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !cert) { setErrors({ course: "Choose a course" }); return; }
    const next = { name: cleanFullName(name) ? undefined : "Enter the student's name", email: validEmail(email) ? undefined : "Enter the student's email address" };
    setErrors(next);
    if (next.name || next.email) return;
    const r = issueCertificate({ itemId: item.id, recipientName: cleanFullName(name), recipientEmail: email, courseTitle: item.title, title: cert.title || "Certificate of completion", issuer: cert.design.issuerName.trim() || creatorName || "Enski creator", issuerEmail: state.profile.email.toLowerCase(), signer: cert.signer || creatorName, design: cert.design });
    if (!r.ok) { setErrors({ form: r.error }); return; }
    onOpenChange(false);
    void navigate({ to: "/creator/badges/certificates/$code", params: { code: r.record.code }, search: { fresh: true } });
  };
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className={cn("max-h-[92dvh] overflow-y-auto sm:max-w-xl", phoneSheetClass)}>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Issue a certificate</DialogTitle>
              <DialogDescription>Only issue it to someone who completed the course. It uses the course's certificate design and gets its own ID.</DialogDescription>
            </DialogHeader>
            {!itemId && (
              <div className="grid gap-1.5">
                <Label htmlFor="issue-course">Course</Label>
                <select id="issue-course" value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 rounded-xl border bg-card px-3 text-sm" aria-invalid={!!errors.course}>
                  <option value="">Choose a course…</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {errors.course && <p className="text-xs font-semibold text-destructive">{errors.course}</p>}
                {!courses.length && <p className="text-xs text-muted-foreground">Create a course first.</p>}
              </div>
            )}
            {item && cert && !cert.enabled && <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs font-semibold">Certificates are switched off for this course. Turn them on in its Certificate tab first.</p>}
            <RecipientFields name={name} email={email} setName={setName} setEmail={setEmail} errors={errors} />
            {content && cert && <div className="overflow-hidden rounded-md border shadow-sm"><CertificateArt content={content} design={cert.design} decorative className="block h-auto w-full" /></div>}
            {errors.form && <p role="alert" className="text-sm font-semibold text-destructive">{errors.form}</p>}
            <DialogActions><Button type="submit" disabled={!!item && !!cert && !cert.enabled}>Issue certificate</Button></DialogActions>
          </form>
      </DialogContent>
    </Dialog>
  );
}

export { awardedByLabel };
