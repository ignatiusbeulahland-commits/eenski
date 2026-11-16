import { Link } from "@tanstack/react-router";
import { BadgeCheck, Check, IdCard, Loader2, PenLine, Smile } from "lucide-react";
import { useEffect, useId, useState, type ComponentType, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { CertificateArt, type CertificateContent } from "@/components/shared/certificate/CertificateArt";
import { defaultCertificateDesign } from "@/lib/shared/certificate";
import { partOfDay } from "@/lib/shared/greeting";
import { checkNameChange, saveIdentity, useIdentity, type Identity } from "@/lib/shared/identity";
import { cn } from "@/lib/utils";

type Field = keyof Identity;

const PREVIEW: Omit<CertificateContent, "learnerName"> = {
  courseTitle: "Your course title",
  title: "Certificate of completion",
  issuedAt: "2026-01-15T09:00:00.000Z",
  code: "ENS-PREVIEW",
  creatorName: "Enski",
  signer: "Enski Academy",
};

/**
 * The three names, each in its own card with Edit / Save / Cancel.
 * They live inside settings forms, so cards use buttons (never a nested <form>); Enter saves the open card.
 * Saving writes the shared identity first, then `onSaved` lets the role update its own profile.
 */
export function NameSettings({ onSaved, certificatesLink }: { onSaved?: ((names: Identity) => void) | undefined; certificatesLink?: "/learner/certificates" | undefined }) {
  const me = useIdentity();
  const [open, setOpen] = useState<Field | null>(null);
  const [saved, setSaved] = useState<Field | null>(null);
  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(null), 4000);
    return () => window.clearTimeout(t);
  }, [saved]);
  if (!me) return <div className="dash-shimmer h-60 rounded-2xl" />;
  const names: Identity = { fullName: me.fullName, displayName: me.displayName, certificateName: me.certificateName };
  const save = (field: Field, value: string): string | null => {
    if (!saveIdentity(me.email, { [field]: value })) return "Your name wasn't saved because your browser is out of space. Free up some space, then try again.";
    onSaved?.({ ...names, [field]: value });
    setOpen(null);
    setSaved(field);
    return null;
  };
  const card = (field: Field) => ({ editing: open === field, justSaved: saved === field, onEdit: () => { setOpen(field); setSaved(null); }, onCancel: () => setOpen(null), onSave: (v: string) => save(field, v) });

  return (
    <div id="name-personalisation" className="grid gap-4">
      <NameCard
        {...card("fullName")}
        field="fullName"
        icon={IdCard}
        title="Account name"
        what="Your full name, as one entry. It appears on your account and receipts."
        value={names.fullName}
        placeholder="e.g. Beulahland Ignatius"
        hint="Use your full name, as you'd write it on an official form."
        savedText="Account name updated"
      />
      <NameCard
        {...card("displayName")}
        field="displayName"
        icon={Smile}
        title="Display name"
        what="What we call you in greetings and around Enski. It can be a nickname."
        value={names.displayName}
        empty={`Not set. We'll use "${me.greet}".`}
        placeholder={me.greet || "e.g. Beulah"}
        hint="2 to 40 characters."
        max={40}
        savedText={`Done. We'll greet you as ${me.displayName || me.greet}.`}
        preview={(v) => <p className="rounded-[14px] bg-soft px-4 py-3 text-sm text-muted-foreground">Preview: <b className="text-ink">Good {partOfDay()}, {v.trim() || me.greet}!</b></p>}
      />
      <NameCard
        {...card("certificateName")}
        field="certificateName"
        icon={BadgeCheck}
        title="Certificate name"
        what="Printed on new certificates you earn. Leave it empty to use your account name."
        value={names.certificateName}
        empty={`Same as your account name (${names.fullName || "not set"}).`}
        placeholder={names.fullName || "e.g. Beulahland I. Ignatius"}
        hint="Certificates you already have keep the name they were issued with."
        editLabel="Edit name"
        savedText="Certificate name saved. New certificates will use it."
        alwaysPreview
        preview={(v) => (
          <div role="figure" className="w-full max-w-md overflow-hidden rounded-[14px] border border-line shadow-sm" aria-label={`Certificate preview with the name ${v.trim() || names.fullName}`}>
            <CertificateArt content={{ ...PREVIEW, learnerName: v.trim() || names.fullName || "Your name" }} design={defaultCertificateDesign} decorative className="block h-auto w-full" />
          </div>
        )}
        footer={certificatesLink && (
          <p className="text-xs text-muted-foreground">
            Need to fix a certificate you already have? Open it in{" "}
            <Link to={certificatesLink} className="font-bold text-cobalt underline-offset-4 hover:underline">My certificates</Link> and choose Edit name to request a correction. Its ID stays the same.
          </p>
        )}
      />
    </div>
  );
}

function NameCard({
  field, icon: Icon, title, what, value, empty, placeholder, hint, max = 80, editing, justSaved, savedText, editLabel = "Edit", preview, alwaysPreview, footer, onEdit, onCancel, onSave,
}: {
  field: Field; icon: ComponentType<{ className?: string }>; title: string; what: string; value: string; empty?: string; placeholder: string; hint: string; max?: number;
  editing: boolean; justSaved: boolean; savedText: string; editLabel?: string; preview?: (v: string) => ReactNode; alwaysPreview?: boolean; footer?: ReactNode;
  onEdit: () => void; onCancel: () => void; onSave: (v: string) => string | null;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (editing) { setDraft(value); setError(null); } }, [editing, value]);
  const submit = () => {
    const r = checkNameChange(field, draft);
    if ("error" in r) { setError(r.error); document.getElementById(`${id}-input`)?.focus(); return; }
    if (r.value === value) { onCancel(); return; }
    setBusy(true);
    window.setTimeout(() => {
      const problem = onSave(r.value);
      setBusy(false);
      if (problem) setError(problem);
    }, 450);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  };
  return (
    <section aria-labelledby={`${id}-title`} className={cn("rounded-[20px] border-[1.5px] p-4 transition-colors sm:p-5", editing ? "border-cobalt bg-ice/40" : "border-line")}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt" aria-hidden="true"><Icon className="size-5" /></span>
        <h4 id={`${id}-title`} className="min-w-0 flex-1 text-[15px] font-extrabold">{title}</h4>
        {!editing && (
          <Button type="button" size="sm" variant="outline" onClick={onEdit} aria-label={`${editLabel}: ${title}`} className="shrink-0">
            <PenLine aria-hidden="true" />{editLabel}
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground sm:pl-[52px]">{what}</p>

      {editing ? (
        <div className="mt-4 grid gap-3 animate-rise">
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-input`}>{title}</Label>
            <Input
              id={`${id}-input`}
              autoFocus
              value={draft}
              maxLength={max}
              placeholder={placeholder}
              onChange={(e) => { setDraft(e.target.value); setError(null); }}
              onKeyDown={onKey}
              aria-invalid={!!error || undefined}
              aria-describedby={`${id}-msg`}
            />
            <p id={`${id}-msg`} className={cn("text-xs", error ? "font-semibold text-destructive" : "text-muted-foreground")}>{error ?? hint}</p>
          </div>
          {preview?.(draft)}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
            <Button type="button" onClick={submit} disabled={busy}>{busy ? <><Loader2 className="animate-spin" aria-hidden="true" />Saving…</> : "Save"}</Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:pl-[52px]">
          <p className={cn("break-words text-[15px]", value ? "font-extrabold text-ink" : "text-muted-foreground")}>{value || empty}</p>
          {alwaysPreview && preview?.(value)}
          <p role="status" aria-live="polite" className={cn("flex items-center gap-1.5 text-xs font-bold text-success transition-opacity", justSaved ? "opacity-100" : "sr-only opacity-0")}>
            {justSaved && <><Check className="size-3.5" aria-hidden="true" />{savedText}</>}
          </p>
        </div>
      )}
      {footer && <div className="mt-3 sm:pl-[52px]">{footer}</div>}
    </section>
  );
}
