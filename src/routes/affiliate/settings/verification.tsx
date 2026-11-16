import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Field } from "@/components/affiliate/Field";
import { DocumentDrop, SettingsCard, SettingsGrid, SettingsPage, SettingsTip, StatusPill, validateDocument } from "@/components/shared/SettingsKit";
import { CaptureTips, DocumentTypePicker, VerificationPerks, VerificationProgress, VerificationStatusCard } from "@/components/shared/VerificationKit";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { useAffiliate } from "@/lib/affiliate/store";
import { settingsTabs } from "@/lib/affiliate/nav";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/settings/verification")({
  head: () => meta("Verification", "Verify your identity to unlock affiliate payouts."),
  component: Verification,
});

function Verification() {
  const { state, update } = useAffiliate();
  const [docType, setDocType] = useState("");
  const [num, setNum] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const submitted = state.verification === "submitted";
  const named = Boolean(state.profile.firstName.trim() && state.profile.lastName.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!docType) er["doc"] = "Choose a document type";
    if (num.trim().length < 6) er["num"] = "Enter the document number";
    const fe = validateDocument(file);
    if (fe) er["file"] = fe;
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); setFile(null); setNum(""); update({ verification: "submitted" }); toast.success("Documents submitted", { description: "We'll let you know once they're reviewed." }); }, 1200);
  };

  return (
    <SettingsPage icon={ShieldCheck} title="Verification" description="Verifying your identity keeps payouts safe and is required before your first withdrawal." tabs={settingsTabs} status={submitted ? <StatusPill tone="pending">In review</StatusPill> : <StatusPill tone="neutral">Not verified</StatusPill>}>
      <div className="mb-6">
        <VerificationProgress steps={[
          { label: "Your details", detail: named ? `${state.profile.firstName} ${state.profile.lastName}` : "Add your name in Manage Profile", state: named ? "done" : "current" },
          { label: "Identity document", detail: submitted ? "Submitted" : "A valid government ID", state: submitted ? "done" : named ? "current" : "upcoming" },
          { label: "Review", detail: submitted ? "In review" : "Usually within 2 working days", state: submitted ? "current" : "upcoming" },
        ]} />
      </div>
      <SettingsGrid
        main={
          submitted ? (
            <VerificationStatusCard tone="review" title="Documents received" description="Your verification is under review. We'll notify you once it's complete.">
              <Button variant="outline" onClick={() => update({ verification: "not_started" })}>Start over</Button>
            </VerificationStatusCard>
          ) : (
            <form onSubmit={submit} noValidate>
              <SettingsCard icon={ShieldCheck} title="Identity document" description="Use a valid ID that shows your full name and photo." footer={<Button type="submit" disabled={busy}>{busy ? <><Loader2 className="animate-spin" /> Submitting…</> : "Submit for verification"}</Button>}>
                <div className="grid gap-5">
                  <DocumentTypePicker name="aff-doc" value={docType} onChange={setDocType} error={err["doc"]} />
                  <Field id="dn" label="Document number" error={err["num"]} hint="Exactly as printed on your document"><Input id="dn" value={num} autoComplete="off" onChange={(e) => setNum(e.target.value)} aria-invalid={!!err["num"] || undefined} /></Field>
                  <div><p className="mb-1.5 text-[13px] font-bold">Upload document</p><DocumentDrop id="up" file={file} onFile={setFile} error={err["file"]} /><div className="mt-3"><CaptureTips /></div></div>
                </div>
              </SettingsCard>
            </form>
          )
        }
        side={
          <>
            <VerificationPerks items={[
              { art: brandArtwork.wallet, title: "Withdrawals", text: "Required before your first withdrawal." },
              { art: brandArtwork.bank, title: "Payouts to your bank", text: "Your account name must match your ID." },
            ]} />
            <SettingsTip title="What you'll need" items={["A valid government ID.", "An account name that matches your ID.", "A clear, uncropped photo or scan."]} />
          </>
        }
      />
    </SettingsPage>
  );
}
