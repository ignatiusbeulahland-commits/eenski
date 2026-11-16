import { Clock3, PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { CertificateArt, type CertificateContent } from "@/components/shared/certificate/CertificateArt";
import type { CertificateDesign } from "@/lib/shared/certificate";
import { certificateNameOf, cleanFullName, fullNameProblem } from "@/lib/shared/names";
import { pendingCorrection } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { pendingRegistryCorrection, requestCorrection, useCredentials, withdrawCorrection } from "@/lib/shared/credentials";
import { shortDate } from "./shared";

/**
 * The small "Edit name" line under a certificate preview.
 * - Not issued yet (preview): edits the certificate display name used on future certificates.
 * - Already issued: the printed name stays as issued; the learner can request a correction from the issuer.
 */
type Issued = { certificateId: string; issuer: string; registry?: boolean };

export function CertificateNameLine({ content, design, issued }: { content: CertificateContent; design: CertificateDesign; issued?: Issued }) {
  const { state, update } = useLearner();
  const creds = useCredentials();
  const [open, setOpen] = useState(false);
  const pending = issued ? (issued.registry ? pendingRegistryCorrection(creds, issued.certificateId) : pendingCorrection(state, issued.certificateId)) : undefined;
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground sm:mt-3">
      <span>Name on certificate:</span>
      <span className="min-w-0 max-w-full truncate font-bold text-foreground">{content.learnerName}</span>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-8 items-center gap-1 rounded-full px-1.5 font-bold text-cobalt underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <PenLine className="h-3 w-3" aria-hidden="true" />
        {issued ? (pending ? "Correction requested" : "Edit name") : "Edit name"}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {issued ? (
            <CorrectionForm content={content} design={design} issued={issued} onDone={() => setOpen(false)} />
          ) : (
            <NameForm
              initial={certificateNameOf(state.profile)}
              fullName={state.profile.fullName}
              content={content}
              design={design}
              onCancel={() => setOpen(false)}
              onSave={(name) => {
                update((s) => ({ profile: { ...s.profile, certificateName: name === cleanFullName(s.profile.fullName) ? "" : name } }));
                toast.success("Certificate name saved", { description: "New certificates will use this name. Your account name hasn't changed." });
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LivePreview({ content, design, name }: { content: CertificateContent; design: CertificateDesign; name: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-line shadow-sm" aria-label={`Preview: ${name || "your name"} on the certificate`}>
      <CertificateArt content={{ ...content, learnerName: name }} design={design} decorative className="block h-auto w-full" />
    </div>
  );
}

function NameForm({ initial, fullName, content, design, onCancel, onSave }: { initial: string; fullName: string; content: CertificateContent; design: CertificateDesign; onCancel: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const clean = cleanFullName(name);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = fullNameProblem(clean);
    if (problem) { setError(problem); return; }
    onSave(clean);
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Name on your certificates</DialogTitle>
        <DialogDescription>Choose how your name is printed, for example with initials or a preferred spelling. Your account name ({fullName || "not set"}) stays the same.</DialogDescription>
      </DialogHeader>
      <LivePreview content={content} design={design} name={clean} />
      <div className="grid gap-1.5">
        <Label htmlFor="cert-name">Certificate display name</Label>
        <Input id="cert-name" value={name} maxLength={80} autoFocus onChange={(e) => { setName(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby="cert-name-msg" />
        <p id="cert-name-msg" className={error ? "text-xs font-semibold text-destructive" : "text-xs text-muted-foreground"}>{error ?? "Certificates already issued keep the name they were issued with."}</p>
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

function CorrectionForm({ content, design, issued, onDone }: { content: CertificateContent; design: CertificateDesign; issued: Issued; onDone: () => void }) {
  const { state, update } = useLearner();
  const creds = useCredentials();
  const pending = issued.registry ? pendingRegistryCorrection(creds, issued.certificateId) : pendingCorrection(state, issued.certificateId);
  const [name, setName] = useState(pending?.requestedName ?? certificateNameOf(state.profile));
  const [reason, setReason] = useState("");
  const [future, setFuture] = useState(true);
  const [errors, setErrors] = useState<{ name?: string | undefined; reason?: string | undefined }>({});
  const clean = cleanFullName(name);

  if (pending) {
    return (
      <div className="grid gap-4">
        <DialogHeader>
          <DialogTitle>Name correction requested</DialogTitle>
          <DialogDescription>Sent {shortDate(pending.at)} to {issued.issuer}. Until they review it, this certificate and its ID stay exactly as issued.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-2 rounded-xl border border-line bg-soft p-3 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Issued as</dt><dd className="min-w-0 truncate font-bold">{pending.currentName}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Requested</dt><dd className="min-w-0 truncate font-bold">{pending.requestedName}</dd></div>
        </dl>
        <p className="flex items-start gap-2 text-xs text-muted-foreground"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{issued.registry ? "The issuer reviews it under Badges & certificates." : "The issuer reviews your request and approves or declines it."}</p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => { if (issued.registry) withdrawCorrection(pending.id); else update((s) => ({ corrections: s.corrections.map((c) => (c.id === pending.id ? { ...c, status: "withdrawn" as const } : c)) })); toast("Correction request withdrawn"); onDone(); }}>Withdraw request</Button>
          <Button type="button" onClick={onDone}>Close</Button>
        </DialogFooter>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const problem = fullNameProblem(clean);
    if (problem) next.name = problem;
    else if (clean === content.learnerName) next.name = "That's already the name on this certificate";
    if (reason.trim().length < 4) next.reason = "Tell the issuer briefly what's wrong";
    setErrors(next);
    if (next.name || next.reason) return;
    const at = new Date().toISOString();
    if (issued.registry) {
      requestCorrection({ code: issued.certificateId, requesterEmail: state.profile.email, currentName: content.learnerName, requestedName: clean, reason: reason.trim().slice(0, 300) });
      if (future) update((s) => ({ profile: { ...s.profile, certificateName: clean === cleanFullName(s.profile.fullName) ? "" : clean } }));
      toast.success("Correction request sent", { description: `${issued.issuer} will review it. Your certificate and its ID stay the same until then.` });
      onDone();
      return;
    }
    update((s) => ({
      corrections: [{ id: `corr-${Date.now().toString(36)}`, certificateId: issued.certificateId, currentName: content.learnerName, requestedName: clean, reason: reason.trim().slice(0, 300), at, status: "pending" as const }, ...s.corrections],
      ...(future ? { profile: { ...s.profile, certificateName: clean === cleanFullName(s.profile.fullName) ? "" : clean } } : {}),
    }));
    toast.success("Correction request saved", { description: `${issued.issuer} will review it. Your certificate and its ID stay the same until then.` });
    onDone();
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Request a name correction</DialogTitle>
        <DialogDescription>This certificate was issued as "{content.learnerName}". Issued certificates aren't changed directly: {issued.issuer} reviews the request, and the credential ID stays the same.</DialogDescription>
      </DialogHeader>
      <LivePreview content={content} design={design} name={clean} />
      <div className="grid gap-1.5">
        <Label htmlFor="corr-name">Correct name</Label>
        <Input id="corr-name" value={name} maxLength={80} autoFocus onChange={(e) => { setName(e.target.value); setErrors((v) => ({ ...v, name: undefined })); }} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-xs font-semibold text-destructive">{errors.name}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="corr-reason">What needs correcting?</Label>
        <Textarea id="corr-reason" rows={2} maxLength={300} value={reason} onChange={(e) => { setReason(e.target.value); setErrors((v) => ({ ...v, reason: undefined })); }} placeholder="e.g. My middle initial is missing" aria-invalid={!!errors.reason} />
        {errors.reason && <p className="text-xs font-semibold text-destructive">{errors.reason}</p>}
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <Checkbox checked={future} onCheckedChange={(v) => setFuture(v === true)} className="mt-0.5" />
        <span>Also use this name on my future certificates</span>
      </label>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit">Send request</Button>
      </DialogFooter>
    </form>
  );
}
