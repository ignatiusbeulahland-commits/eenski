import { Link } from "@tanstack/react-router";
import { ImagePlus, Loader2, PenLine, Plus, RefreshCw, ShieldAlert, Signature as SignatureIcon, Stamp, Trash2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, phoneSheetClass } from "@/components/dashboard-ui/dialog";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { DialogActions } from "@/components/shared/DialogActions";
import { ConfirmDialog } from "@/components/shared/BrandDialog";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { SettingsCard, SettingsGrid, SettingsPage, SettingsTip, StatusPill } from "@/components/shared/SettingsKit";
import { CertificateArt, type CertificateContent } from "@/components/shared/certificate/CertificateArt";
import { brandAssetInfo, kitDesignPatch, updateBrandKit, useBrandKit, type BrandAsset, type Signatory } from "@/lib/creator/brandKit";
import { creatorSettings } from "@/lib/creator/nav";
import { useCreator } from "@/lib/creator/store";
import { BRAND_IMAGE_ACCEPT, brandFileProblem, readBrandImage } from "@/lib/shared/brandImage";
import { certificateCode, certificateDesignSchema } from "@/lib/shared/certificate";
import { cn } from "@/lib/utils";

const tabs = creatorSettings.filter((t) => t.to !== "/creator/settings/character");
const ASSETS: BrandAsset[] = ["orgLogo", "creatorLogo", "secondaryLogo", "seal", "artwork"];

/** Upload, preview, replace and remove one image. Validation and trimming happen before anything is saved. */
export function UploadTile({ label, hint, value, onPick, onRemove, busy, error, wide, accept = BRAND_IMAGE_ACCEPT, id }: {
  label: string; hint: string; value: string; onPick: (f: File) => void; onRemove: () => void; busy?: boolean; error?: string | null; wide?: boolean; accept?: string; id: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={cn("rounded-2xl border bg-card p-3", error && "border-destructive")}>
      <div className={cn("checker grid place-items-center overflow-hidden rounded-xl border", wide ? "aspect-[16/7]" : "aspect-[16/9]")}>
        {busy ? <Loader2 className="h-6 w-6 animate-spin text-cobalt" aria-hidden="true" /> : value ? (
          <img src={value} alt={`${label} preview`} className="max-h-full max-w-full object-contain p-3" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs font-semibold text-muted-foreground"><ImagePlus className="h-5 w-5" aria-hidden="true" />No image yet</span>
        )}
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-sm font-extrabold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {error && <p role="alert" className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
      </div>
      <input ref={ref} id={id} type="file" accept={accept} aria-label={`Upload ${label.toLowerCase()}`} tabIndex={-1} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={value ? "outline" : "default"} onClick={() => ref.current?.click()} disabled={busy}>
          {value ? <RefreshCw aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}{value ? "Replace" : "Upload"}
        </Button>
        {value && <Button type="button" size="sm" variant="ghost" onClick={onRemove} disabled={busy}><Trash2 aria-hidden="true" />Remove</Button>}
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: BrandAsset }) {
  const kit = useBrandKit();
  const info = brandAssetInfo[asset];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pick = async (file: File) => {
    const problem = brandFileProblem(file);
    if (problem) { setError(problem); return; }
    setError(null);
    setBusy(true);
    try {
      const data = await readBrandImage(file, { max: info.max, trim: info.trim });
      if (!updateBrandKit((k) => ({ ...k, [asset]: data }))) { setError("This device is out of space for images. Remove another image or use a smaller file."); return; }
      toast.success(`${info.label} ${kit[asset] ? "replaced" : "added"}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't read that image. Try another file.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <UploadTile id={`kit-${asset}`} label={info.label} hint={info.hint} value={kit[asset]} busy={busy} error={error} wide={asset === "artwork"}
      onPick={pick}
      onRemove={() => { const prev = kit[asset]; updateBrandKit((k) => ({ ...k, [asset]: "" })); toast(`${info.label} removed`, { action: { label: "Undo", onClick: () => updateBrandKit((k) => ({ ...k, [asset]: prev })) } }); }}
    />
  );
}

type Draft = { id?: string; name: string; title: string; org: string; image: string; scale: number; confirmed: boolean };
const blank: Draft = { name: "", title: "", org: "", image: "", scale: 1, confirmed: false };

/** Add or edit an authorised signatory: name, title, organisation and a handwritten signature image. */
export function SignatoryDialog({ open, onOpenChange, initial, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; initial?: Signatory | undefined; onSaved?: (s: Signatory) => void }) {
  const [d, setD] = useState<Draft>(blank);
  const [errors, setErrors] = useState<Partial<Record<"name" | "title" | "image" | "confirmed", string | undefined>>>({});
  const [busy, setBusy] = useState(false);
  const [removeWhite, setRemoveWhite] = useState(true);
  const [lastFile, setLastFile] = useState<File | null>(null);
  useEffect(() => {
    if (!open) return;
    setD(initial ? { id: initial.id, name: initial.name, title: initial.title, org: initial.org, image: initial.image, scale: initial.scale, confirmed: true } : blank); setErrors({}); setLastFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);
  const reset = (v: boolean) => onOpenChange(v);
  const load = async (file: File, white = removeWhite) => {
    const problem = brandFileProblem(file);
    if (problem) { setErrors((e) => ({ ...e, image: problem })); return; }
    setBusy(true);
    try {
      const image = await readBrandImage(file, { max: 700, trim: true, removeWhite: white });
      setD((v) => ({ ...v, image }));
      setLastFile(file);
      setErrors((e) => ({ ...e, image: undefined }));
    } catch (e) {
      setErrors((x) => ({ ...x, image: e instanceof Error ? e.message : "We couldn't read that image." }));
    } finally { setBusy(false); }
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!d.name.trim()) next.name = "Enter the signatory's name";
    if (!d.title.trim()) next.title = "Enter their position or title";
    if (!d.image) next.image = "Upload their handwritten signature";
    if (!d.confirmed) next.confirmed = "Confirm you're allowed to use this signature";
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const s: Signatory = { id: d.id ?? `sig-${Date.now().toString(36)}`, name: d.name.trim().slice(0, 60), title: d.title.trim().slice(0, 60), org: d.org.trim().slice(0, 60), image: d.image, scale: d.scale, confirmedAt: initial?.confirmedAt ?? new Date().toISOString() };
    const ok = updateBrandKit((k) => ({ ...k, signatories: k.signatories.some((x) => x.id === s.id) ? k.signatories.map((x) => (x.id === s.id ? s : x)) : [...k.signatories, s] }));
    if (!ok) { toast.error("This device is out of space for images. Remove an image and try again."); return; }
    toast.success(initial ? "Signatory updated" : "Signatory saved", { description: "Available for every certificate you design." });
    onSaved?.(s);
    onOpenChange(false);
  };
  const preview: CertificateContent = { learnerName: "Student name", courseTitle: "Your course", title: "Certificate of completion", issuedAt: new Date().toISOString(), code: "ENS-SAMP-LE22", creatorName: d.name || "Signatory", signer: d.name || "Signatory" };
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className={cn("max-h-[92dvh] overflow-y-auto sm:max-w-lg", phoneSheetClass)}>
        <form onSubmit={save} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{initial ? "Edit signatory" : "Add an authorised signatory"}</DialogTitle>
            <DialogDescription>Their signature is saved with your brand kit on this device and can be used on any of your certificates.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="sig-name">Signatory name</Label><Input id="sig-name" value={d.name} maxLength={60} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs font-semibold text-destructive">{errors.name}</p>}</div>
            <div className="grid gap-1.5"><Label htmlFor="sig-title">Position or title</Label><Input id="sig-title" value={d.title} maxLength={60} placeholder="e.g. Programme director" onChange={(e) => setD({ ...d, title: e.target.value })} aria-invalid={!!errors.title} />{errors.title && <p className="text-xs font-semibold text-destructive">{errors.title}</p>}</div>
            <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="sig-org">Organisation <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="sig-org" value={d.org} maxLength={60} onChange={(e) => setD({ ...d, org: e.target.value })} /></div>
          </div>
          <div>
            <UploadTile id="sig-image" label="Handwritten signature" hint="Sign on white paper and take a clear photo, or upload a transparent PNG. Empty edges are trimmed." value={d.image} busy={busy} error={errors.image ?? null} wide onPick={(f) => load(f)} onRemove={() => { setD({ ...d, image: "" }); setLastFile(null); }} />
            <label className="mt-2 flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox checked={removeWhite} onCheckedChange={(v) => { const on = v === true; setRemoveWhite(on); if (lastFile) void load(lastFile, on); }} />
              Remove the white paper background
            </label>
          </div>
          {d.image && (
            <div className="grid gap-2">
              <Label htmlFor="sig-scale">Signature size · {Math.round(d.scale * 100)}%</Label>
              <input id="sig-scale" type="range" min={60} max={150} step={5} value={Math.round(d.scale * 100)} onChange={(e) => setD({ ...d, scale: Number(e.target.value) / 100 })} className="range-input" />
              <div className="overflow-hidden rounded-md border"><CertificateArt content={preview} design={certificateDesignSchema.parse({ template: "minimal", signatureImage: d.image, signatureScale: d.scale, signerRole: d.title })} decorative className="block h-auto w-full" /></div>
            </div>
          )}
          <label className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm", errors.confirmed && "border-destructive")}>
            <Checkbox checked={d.confirmed} onCheckedChange={(v) => setD({ ...d, confirmed: v === true })} className="mt-0.5" />
            <span>I'm authorised to use this person's signature on certificates I issue. <span className="text-muted-foreground">An uploaded image is not proof of legal authorisation.</span></span>
          </label>
          {errors.confirmed && <p className="-mt-2 text-xs font-semibold text-destructive">{errors.confirmed}</p>}
          <DialogActions><Button type="submit" disabled={busy}>{initial ? "Save changes" : "Save signatory"}</Button></DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CertificateBrandingPage() {
  const kit = useBrandKit();
  const { state } = useCreator();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Signatory | null>(null);
  const [removing, setRemoving] = useState<Signatory | null>(null);
  const creatorName = `${state.profile.firstName} ${state.profile.lastName}`.trim();
  const filled = ASSETS.filter((a) => kit[a]).length + (kit.signatories.length ? 1 : 0);
  const [main, second] = kit.signatories;
  const sample: CertificateContent = { learnerName: "Student name", courseTitle: "Your course title", title: "Certificate of completion", issuedAt: new Date().toISOString(), code: certificateCode("brand-kit-sample"), creatorName, signer: main?.name || creatorName };
  const design = certificateDesignSchema.parse({ template: "classic", ...kitDesignPatch(kit, main, second) });
  return (
    <SettingsPage icon={Stamp} title="Certificate branding & identity" description="Logos, seal, artwork and authorised signatures for the certificates you issue. Saved on this device for your account only." tabs={tabs} status={<StatusPill tone={filled ? "success" : "neutral"}>{filled}/6 set up</StatusPill>}>
      <SettingsGrid
        main={
          <>
            <SettingsCard icon={ImagePlus} title="Logos, seal & artwork" description="PNG, JPG, WebP or SVG. Transparency is kept and images are never stretched.">
              <div className="grid gap-3 sm:grid-cols-2">{ASSETS.map((a) => <div key={a} className={a === "artwork" ? "sm:col-span-2" : undefined}><AssetCard asset={a} /></div>)}</div>
            </SettingsCard>
            <SettingsCard icon={SignatureIcon} title="Authorised signatures" description="People who can sign your certificates. Use up to two on one certificate." actions={<Button size="sm" onClick={() => setAdding(true)} disabled={kit.signatories.length >= 6}><Plus aria-hidden="true" />Add</Button>}>
              {kit.signatories.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {kit.signatories.map((s) => (
                    <li key={s.id} className="rounded-2xl border bg-card p-3">
                      <div className="checker grid aspect-[16/6] place-items-center overflow-hidden rounded-xl border">{s.image ? <img src={s.image} alt={`${s.name}'s signature`} className="max-h-full max-w-full object-contain p-2" /> : null}</div>
                      <p className="mt-2 truncate text-sm font-extrabold">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{[s.title, s.org].filter(Boolean).join(" · ")}</p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(s)}><PenLine aria-hidden="true" />Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRemoving(s)}><Trash2 aria-hidden="true" />Remove</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-center">
                  <p className="text-sm font-bold">No signatures yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Without one, certificates show the signer's name in a script style.</p>
                  <Button className="mt-3" size="sm" onClick={() => setAdding(true)}><Plus aria-hidden="true" />Add a signatory</Button>
                </div>
              )}
            </SettingsCard>
          </>
        }
        side={
          <>
            <section className="surface p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-extrabold"><span className="lime-tick" aria-hidden="true" />Preview with your kit</h2>
              <div className="overflow-hidden rounded-md border shadow-sm"><CertificateArt content={sample} design={design} className="block h-auto w-full" /></div>
              <p className="mt-2 text-xs text-muted-foreground">Apply the kit to a course from its Certificate tab, where you can also pick a template, colours and positions.</p>
              <Button asChild size="sm" variant="outline" className="mt-3 w-full"><Link to="/creator/courses">Go to my courses</Link></Button>
            </section>
            <SettingsTip icon={ShieldAlert} title="Good to know" items={[
              "Only you can change this kit while signed in as this creator; learners never see the raw files.",
              "A signature image on a certificate isn't legal proof of authorisation.",
              "Your files stay on this device.",
            ]} />
          </>
        }
      />
      <SignatoryDialog open={adding} onOpenChange={setAdding} />
      <SignatoryDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)} initial={editing ?? undefined} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(v) => !v && setRemoving(null)}
        art={brandArtwork.bin}
        eyebrow="Remove signatory"
        title={`Remove ${removing?.name ?? "this signatory"}?`}
        description="Courses that already use this signature keep it. You can't pick it for new certificates after this."
        confirmLabel="Remove"
        onConfirm={() => { if (removing) updateBrandKit((k) => ({ ...k, signatories: k.signatories.filter((x) => x.id !== removing.id) })); toast("Signatory removed"); setRemoving(null); }}
      />
    </SettingsPage>
  );
}
