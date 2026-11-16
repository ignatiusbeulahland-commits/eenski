import { Link } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Switch } from "@/components/dashboard-ui/switch";
import { kitDesignPatch, useBrandKit } from "@/lib/creator/brandKit";
import { PLATFORM_BADGES } from "@/lib/shared/badges";
import { accentHex, backgroundInfo, borderInfo, CERT_BACKGROUNDS, CERT_BORDERS, CERT_FONTS, fontInfo, type CertificateDesign } from "@/lib/shared/certificate";
import { customBadgeDefinition, useCredentials } from "@/lib/shared/credentials";
import { cn } from "@/lib/utils";

function Pills<T extends string>({ label, options, value, onChange, labels, disabled }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; labels: Record<T, string>; disabled?: (v: T) => boolean }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} disabled={disabled?.(o)} onClick={() => onChange(o)}
            className={cn("min-h-10 rounded-full border bg-card px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45", value === o ? "border-cobalt bg-cobalt text-primary-foreground" : "hover:border-cobalt-300")}>
            {labels[o]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Range({ id, label, value, min, max, step, onChange, format }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id} className="flex justify-between text-xs font-bold"><span>{label}</span><span className="tabular-nums text-muted-foreground">{format(value)}</span></Label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="range-input" />
    </div>
  );
}

/** Creator-only certificate branding: colours, type, borders, logos, signatures, emblem and QR. Uses the brand kit. */
export function BrandingControls({ design, onChange, idPrefix, signer, onSigner }: { design: CertificateDesign; onChange: (p: Partial<CertificateDesign>) => void; idPrefix: string; signer: string; onSigner: (name: string, design?: Partial<CertificateDesign>) => void }) {
  const kit = useBrandKit();
  const creds = useCredentials();
  const d = design;
  const sigs = kit.signatories;
  const mainId = sigs.find((s) => s.image && s.image === d.signatureImage)?.id ?? "";
  const secondId = sigs.find((s) => s.name === d.cosignName && s.image === d.cosignImage)?.id ?? "";
  const kitHasAnything = !!(kit.orgLogo || kit.creatorLogo || kit.secondaryLogo || kit.seal || kit.artwork || sigs.length);
  const badges = [...PLATFORM_BADGES, ...creds.customBadges.filter((b) => !b.archived).map(customBadgeDefinition)];
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const pos = (v: number) => (v === 0 ? "Centre" : v < 0 ? `${Math.round(-v * 100)}% left` : `${Math.round(v * 100)}% right`);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border bg-soft p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">Your brand kit</p>
          <p className="text-xs text-muted-foreground">{kitHasAnything ? `${[kit.orgLogo && "logo", kit.seal && "seal", kit.artwork && "artwork", sigs.length && `${sigs.length} signator${sigs.length === 1 ? "y" : "ies"}`].filter(Boolean).join(", ")} ready to use.` : "Upload logos, a seal and signatures once, then use them here."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {kitHasAnything && (
            <Button type="button" size="sm" onClick={() => { { const patch = kitDesignPatch(kit, sigs[0], sigs[1]); if (sigs[0]) onSigner(sigs[0].name, patch); else onChange(patch); } toast.success("Brand kit applied to this certificate"); }}>
              <Wand2 aria-hidden="true" />Apply kit
            </Button>
          )}
          <Button asChild type="button" size="sm" variant="outline"><Link to="/creator/settings/certificate-branding">Manage kit</Link></Button>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-bold">Exact brand colour</legend>
        <div className="flex flex-wrap items-center gap-2">
          <input type="color" aria-label="Pick a colour" value={d.accentHex || accentHex(d.accent)} onChange={(e) => onChange({ accentHex: e.target.value.toUpperCase() })} className="h-11 w-14 cursor-pointer rounded-xl border bg-card p-1" />
          <Input aria-label="Colour hex code" className="w-32 font-mono uppercase" maxLength={7} value={d.accentHex} placeholder={accentHex(d.accent)} onChange={(e) => { const v = e.target.value.trim(); if (/^$|^#[0-9a-fA-F]{6}$/.test(v)) onChange({ accentHex: v.toUpperCase() }); }} />
          {d.accentHex && <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ accentHex: "" })}>Use accent above</Button>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Overrides the accent with your exact colour, e.g. #1A42A6.</p>
      </fieldset>

      <Pills label="Typography" options={CERT_FONTS} value={d.font} onChange={(font) => onChange({ font })} labels={Object.fromEntries(CERT_FONTS.map((f) => [f, fontInfo[f].label])) as Record<(typeof CERT_FONTS)[number], string>} />
      <Pills label="Border" options={CERT_BORDERS} value={d.border} onChange={(border) => onChange({ border })} labels={borderInfo} />
      <div className="space-y-3">
        <Pills label="Background" options={CERT_BACKGROUNDS} value={d.background} labels={backgroundInfo}
          disabled={(b) => b === "artwork" && !d.artwork && !kit.artwork}
          onChange={(background) => onChange(background === "artwork" && !d.artwork ? { background, artwork: kit.artwork } : { background })} />
        {d.background === "artwork" && <Range id={`${idPrefix}-art-op`} label="Artwork strength" value={d.artworkOpacity} min={0.04} max={0.4} step={0.02} onChange={(artworkOpacity) => onChange({ artworkOpacity })} format={pct} />}
        {!d.artwork && !kit.artwork && <p className="text-xs text-muted-foreground">Add supporting artwork in your brand kit to use it as a background.</p>}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-[13px] font-bold">Logos</legend>
        {d.issuerLogo ? <Range id={`${idPrefix}-logo-size`} label="Organisation logo size" value={d.logoScale} min={0.7} max={1.4} step={0.05} onChange={(logoScale) => onChange({ logoScale })} format={pct} /> : <p className="text-xs text-muted-foreground">Upload an organisation logo above, or apply your kit.</p>}
        {([["creatorLogo", "Show my personal or creator logo"], ["secondaryLogo", "Show my secondary organisation logo"]] as const).map(([k, l]) => (
          <div key={k} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2">
            <Label htmlFor={`${idPrefix}-${k}`} className="text-sm font-semibold">{l}{!kit[k] && <span className="block text-xs font-normal text-muted-foreground">Not in your kit yet</span>}</Label>
            <Switch id={`${idPrefix}-${k}`} disabled={!kit[k] && !d[k]} checked={!!d[k]} onCheckedChange={(v) => onChange({ [k]: v ? kit[k] : "" })} />
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-[13px] font-bold">Signatures</legend>
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-sig-main`} className="text-xs font-bold">Main signature</Label>
          <select id={`${idPrefix}-sig-main`} value={mainId} className="h-11 rounded-xl border bg-card px-3 text-sm"
            onChange={(e) => { const s = sigs.find((x) => x.id === e.target.value); if (s) onSigner(s.name, { signatureImage: s.image, signatureScale: s.scale, signerRole: s.title, showSignature: true }); else onChange({ signatureImage: "" }); }}>
            <option value="">{signer ? `${signer}, typed in a script style` : "Typed name in a script style"}</option>
            {sigs.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.title}</option>)}
          </select>
        </div>
        {d.signatureImage && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Range id={`${idPrefix}-sig-size`} label="Size" value={d.signatureScale} min={0.6} max={1.5} step={0.05} onChange={(signatureScale) => onChange({ signatureScale })} format={pct} />
            <Range id={`${idPrefix}-sig-pos`} label="Position" value={d.signatureOffset} min={-1} max={1} step={0.1} onChange={(signatureOffset) => onChange({ signatureOffset })} format={pos} />
          </div>
        )}
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-sig-2`} className="text-xs font-bold">Second authorised signatory</Label>
          <select id={`${idPrefix}-sig-2`} value={secondId} className="h-11 rounded-xl border bg-card px-3 text-sm"
            onChange={(e) => { const s = sigs.find((x) => x.id === e.target.value); onChange(s ? { cosignName: s.name, cosignTitle: s.title, cosignOrg: s.org, cosignImage: s.image, cosignScale: s.scale } : { cosignName: "", cosignTitle: "", cosignOrg: "", cosignImage: "" }); }}>
            <option value="">None</option>
            {sigs.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.title}</option>)}
          </select>
          {!sigs.length && <p className="text-xs text-muted-foreground">Add signatories in your brand kit to choose them here.</p>}
        </div>
        {d.cosignName && d.cosignImage && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Range id={`${idPrefix}-co-size`} label="Second signature size" value={d.cosignScale} min={0.6} max={1.5} step={0.05} onChange={(cosignScale) => onChange({ cosignScale })} format={pct} />
            <Range id={`${idPrefix}-co-pos`} label="Second signature position" value={d.cosignOffset} min={-1} max={1} step={0.1} onChange={(cosignOffset) => onChange({ cosignOffset })} format={pos} />
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-[13px] font-bold">Seal spot</legend>
        <div className="flex flex-wrap gap-2">
          {([["enski", "Enski seal"], ["custom", "Your official seal"], ["badge", "Achievement badge"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={d.emblem === v} disabled={v === "custom" && !kit.seal && !d.sealImage}
              onClick={() => onChange(v === "custom" ? { emblem: v, sealImage: d.sealImage || kit.seal, showSeal: true } : v === "badge" ? { emblem: v, badgeId: d.badgeId || "course-completed", showSeal: true } : { emblem: v, showSeal: true })}
              className={cn("min-h-10 rounded-full border bg-card px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45", d.emblem === v ? "border-cobalt bg-cobalt text-primary-foreground" : "hover:border-cobalt-300")}>{l}</button>
          ))}
        </div>
        {d.emblem === "badge" && (
          <select aria-label="Badge shown on the certificate" value={d.badgeId} onChange={(e) => onChange({ badgeId: e.target.value })} className="h-11 w-full rounded-xl border bg-card px-3 text-sm">
            {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        {d.emblem === "badge" && <p className="text-xs text-muted-foreground">Shows the badge as artwork. To give a learner the badge itself, award it from Badges & certificates.</p>}
      </fieldset>

      <div className="flex items-start justify-between gap-4 rounded-2xl border bg-card px-4 py-3">
        <div className="min-w-0"><Label htmlFor={`${idPrefix}-qr`} className="text-sm font-bold">Verification QR code</Label><p className="mt-0.5 text-xs text-muted-foreground">Opens the public verification page for that certificate's ID.</p></div>
        <Switch id={`${idPrefix}-qr`} checked={d.showQr} onCheckedChange={(showQr) => onChange({ showQr })} />
      </div>
    </div>
  );
}
