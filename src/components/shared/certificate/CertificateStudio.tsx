import { Check, ImagePlus, Loader2, Maximize2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Switch } from "@/components/dashboard-ui/switch";
import { readCoverFile, validateCoverFile } from "@/lib/creator/cover";
import {
  accentInfo, CERT_ACCENTS, CERT_LAYOUTS, defaultCertificateDesign, isPortrait, issuerInfo, ISSUER_TYPES, layoutInfo, layoutOf, templateForLayout, templateInfo, templatesFor,
  type CertificateDesign, type CertTemplate,
} from "@/lib/shared/certificate";
import { cn } from "@/lib/utils";
import { CertificateArt, type CertificateContent } from "./CertificateArt";
import { CertificateDownloadMenu, CertificateViewer, ExpandChip, useCertificateExport } from "./CertificateViewer";

const swatch: Record<(typeof CERT_ACCENTS)[number], string> = { lime: "bg-lime", sky: "bg-sky", cobalt: "bg-cobalt" };

/** Large certificate preview on a soft stage: tap for full size, download as PNG. */
export function CertificatePreview({ content, design, filename, onDownloaded, actions, className, label, below }: {
  content: CertificateContent;
  design: CertificateDesign;
  filename: string;
  onDownloaded?: (() => void) | undefined;
  actions?: ReactNode;
  className?: string;
  /** Title shown in the full-screen viewer. */
  label?: string;
  /** Small line right under the artwork, e.g. the recipient name with "Edit name". */
  below?: ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const exp = useCertificateExport({ filename, onDownloaded, content, design });
  const [full, setFull] = useState(false);
  return (
    <div data-cert-preview="" className={cn("cert-stage rounded-[20px] p-2.5 sm:rounded-[24px] sm:p-6", className)}>
      <button
        type="button"
        onClick={() => setFull(true)}
        aria-label="View certificate full size"
        className="cert-paper group relative block w-full cursor-zoom-in overflow-hidden rounded-md text-left"
      >
        <CertificateArt content={content} design={design} svgRef={ref} decorative className="block h-auto w-full" />
        <ExpandChip className="pointer-events-none absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" />
      </button>
      {below}
      <div className="mt-2.5 grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
        {actions}
        <Button variant="quiet" onClick={() => setFull(true)} aria-label="Full screen" className="px-4 sm:px-5">
          <Maximize2 aria-hidden="true" /> <span className="hidden sm:inline">Full screen</span>
        </Button>
        <CertificateDownloadMenu busy={exp.busy} portrait={isPortrait(design)} onPrint={() => void exp.print(ref.current)} onPick={(f) => exp.run(ref.current, f)} />
      </div>
      <CertificateViewer open={full} onOpenChange={setFull} content={content} design={design} filename={filename} onDownloaded={onDownloaded} label={label ?? content.courseTitle} />
      {exp.sheet}
    </div>
  );
}

/** Phones only: a floating mini preview while the style controls are on screen and the main preview isn't. */
function MiniPreviewBar({ content, design, filename, anchor }: { content: CertificateContent; design: CertificateDesign; filename: string; anchor: HTMLElement | null }) {
  const [show, setShow] = useState(false);
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!anchor) return;
    let inControls = false;
    const previews = new Set<Element>();
    const update = () => setShow(inControls && previews.size === 0);
    const controls = new IntersectionObserver((entries) => { inControls = entries.some((e) => e.isIntersecting); update(); });
    const main = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.intersectionRatio >= 0.6) previews.add(e.target);
        else previews.delete(e.target);
      }
      update();
    }, { threshold: [0, 0.6, 1] });
    controls.observe(anchor);
    document.querySelectorAll("[data-cert-preview]").forEach((el) => main.observe(el));
    return () => { controls.disconnect(); main.disconnect(); };
  }, [anchor]);
  if (!anchor) return null;
  return (
    <>
      {createPortal(<div
        className={cn(
          "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-(--z-sticky) md:hidden motion-safe:transition-[opacity,transform] motion-safe:duration-200",
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-hidden={!show}
        inert={!show}
      >
        <button
          type="button"
          onClick={() => setFull(true)}
          className="flex w-full items-center gap-3 rounded-[20px] border border-line bg-card/95 p-2 pr-3 text-left shadow-lift backdrop-blur-md"
          aria-label="Preview your certificate full size"
        >
          <span className="w-[88px] shrink-0 overflow-hidden rounded-md border border-line">
            <CertificateArt content={content} design={design} decorative className="block h-auto w-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">Live preview</span>
            <span className="block truncate text-sm font-extrabold">{templateInfo[design.template].label} · {accentInfo[design.accent]}</span>
          </span>
          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ice px-3 text-[13px] font-extrabold text-cobalt"><Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />View</span>
        </button>
      </div>, document.body)}
      <CertificateViewer open={full} onOpenChange={setFull} content={content} design={design} filename={filename} label={content.courseTitle} />
    </>
  );
}

/** Template and accent pickers; `full` adds issuer, logo, signer title and visibility controls for creators. */
export function CertificateStyleControls({ design, onChange, content, full, idPrefix = "cert", creatorPick, filename }: {
  design: CertificateDesign;
  /** When set, phones get a floating live preview while these controls are on screen. */
  filename?: string;
  /** Marks the creator's chosen design so learners can find their way back to it. */
  creatorPick?: Pick<CertificateDesign, "template" | "accent">;
  onChange: (patch: Partial<CertificateDesign>) => void;
  content: CertificateContent;
  full?: boolean;
  idPrefix?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const pickLogo = async (file: File | undefined) => {
    if (!file) return;
    const err = validateCoverFile(file);
    if (err) { toast.error(err); return; }
    setLogoBusy(true);
    try {
      onChange({ issuerLogo: await readCoverFile(file, 360) });
      toast.success("Logo added to your certificate");
    } catch {
      toast.error("We couldn't read that image. Try another file.");
    } finally {
      setLogoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const info = issuerInfo[design.issuerType];
  const layout = layoutOf(design);
  // Remembers the last landscape template so switching to portrait and back restores it.
  const lastLandscape = useRef<CertTemplate | undefined>(isPortrait(design) ? undefined : design.template);
  if (!isPortrait(design)) lastLandscape.current = design.template;
  const switchLayout = (l: (typeof CERT_LAYOUTS)[number]) => {
    const next = templateForLayout(design.template, l, lastLandscape.current ?? (creatorPick && !isPortrait(creatorPick) ? creatorPick.template : undefined));
    if (next !== design.template) onChange({ template: next });
  };
  return (
    <div ref={setRoot} className={cn("space-y-6", filename && "max-md:pb-20")}>
      {filename && <MiniPreviewBar content={content} design={design} filename={filename} anchor={root} />}
      <fieldset>
        <legend className="mb-2 flex items-center gap-2 text-[13px] font-bold"><span className="lime-tick" aria-hidden="true" />Layout</legend>
        <div className="grid grid-cols-2 gap-1 rounded-full border bg-card p-1" role="group" aria-label="Page layout">
          {CERT_LAYOUTS.map((l) => {
            const on = layout === l;
            return (
              <button key={l} type="button" aria-pressed={on} onClick={() => switchLayout(l)}
                className={cn("lime-pip flex h-10 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors", on ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}>
                <span aria-hidden="true" className={cn("rounded-[3px] border-2", on ? "border-current" : "border-current opacity-70", l === "portrait" ? "h-4 w-3" : "h-3 w-4")} />
                {layoutInfo[l].label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{layoutInfo[layout].hint}{creatorPick && layoutOf(creatorPick) !== layout ? " · the creator chose " + layoutInfo[layoutOf(creatorPick)].label.toLowerCase() : ""}</p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 flex items-center gap-2 text-[13px] font-bold"><span className="lime-tick" aria-hidden="true" />Design</legend>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {templatesFor(layout).map((t) => {
            const on = design.template === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ template: t })}
                aria-pressed={on}
                className={cn("group relative min-w-0 rounded-[18px] border bg-card p-1.5 text-left transition-[border-color,box-shadow] sm:rounded-2xl", on ? "border-cobalt shadow-[0_0_0_2px_var(--cobalt)]" : "hover:border-cobalt-300")}
              >
                <span className="relative block overflow-hidden rounded-lg border border-line">
                  <CertificateArt content={content} design={{ ...design, template: t }} decorative className="block h-auto w-full" />
                  {creatorPick?.template === t && <span className="absolute left-1 top-1 rounded-full bg-cobalt px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-sm sm:hidden">Creator's pick</span>}
                </span>
                <span className="flex items-center gap-1.5 px-1 pb-0.5 pt-1.5 sm:px-1.5 sm:pb-1 sm:pt-2">
                  <span className="min-w-0 flex-1">
                    <span className={cn("flex flex-wrap items-center gap-1.5 text-[13px] font-extrabold sm:text-sm", on && "text-cobalt")}>
                      {templateInfo[t].label}
                      {creatorPick?.template === t && <span className="hidden rounded-full bg-ice px-1.5 py-px text-[10px] font-extrabold uppercase tracking-wide text-cobalt sm:inline">Creator's pick</span>}
                    </span>
                    <span className="hidden text-[11px] text-muted-foreground sm:line-clamp-1">{templateInfo[t].description}</span>
                  </span>
                  {on && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="h-3 w-3" aria-hidden="true" /></span>}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground sm:hidden" aria-live="polite"><span className="font-bold text-foreground">{templateInfo[design.template].label}:</span> {templateInfo[design.template].description}</p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[13px] font-bold">Accent</legend>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {CERT_ACCENTS.map((a) => (
            <button key={a} type="button" onClick={() => onChange({ accent: a })} aria-pressed={design.accent === a}
              className={cn("inline-flex h-11 min-w-0 items-center gap-2 rounded-full border bg-card pl-1.5 pr-3 text-sm font-bold transition-colors sm:h-10 sm:pr-4", design.accent === a ? "border-cobalt text-cobalt" : "hover:border-cobalt-300")}>
              <span className={cn("h-7 w-7 shrink-0 rounded-full ring-2 ring-card", swatch[a], design.accent === a && "ring-offset-2 ring-offset-cobalt")} aria-hidden="true" />
              {accentInfo[a]}
              {creatorPick?.accent === a && <span className="sr-only"> (creator's pick)</span>}
            </button>
          ))}
        </div>
      </fieldset>

      {full && (
        <>
          <fieldset>
            <legend className="mb-2 text-[13px] font-bold">Issued by</legend>
            <div className="grid grid-cols-3 gap-1 rounded-full border bg-card p-1" role="group">
              {ISSUER_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => onChange({ issuerType: t })} aria-pressed={design.issuerType === t}
                  className={cn("lime-pip h-9 rounded-full text-sm font-bold transition-colors", design.issuerType === t ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}>
                  {issuerInfo[t].label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-issuer`} className="text-[13px] font-bold">{info.nameLabel}</Label>
              <Input id={`${idPrefix}-issuer`} value={design.issuerName} maxLength={80} placeholder={content.creatorName || info.nameLabel} onChange={(e) => onChange({ issuerName: e.target.value })} />
              <p className="text-xs text-muted-foreground">Leave empty to use your creator name.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-role`} className="text-[13px] font-bold">Signer's title</Label>
              <Input id={`${idPrefix}-role`} value={design.signerRole} maxLength={60} placeholder={info.role} onChange={(e) => onChange({ signerRole: e.target.value })} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold">{design.issuerType === "creator" ? "Brand logo" : `${info.label} logo`} <span className="font-normal text-muted-foreground">(optional)</span></p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border bg-card">
                {design.issuerLogo ? <img src={design.issuerLogo} alt="Your logo" className="h-full w-full object-contain p-1" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
              </span>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id={`${idPrefix}-logo`} onChange={(e) => pickLogo(e.target.files?.[0])} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={logoBusy}>
                {logoBusy ? <Loader2 className="animate-spin" /> : <ImagePlus />} {design.issuerLogo ? "Replace logo" : "Upload logo"}
              </Button>
              {design.issuerLogo && <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ issuerLogo: "" })}><Trash2 /> Remove</Button>}
              <p className="w-full text-xs text-muted-foreground">PNG, JPG or WebP up to 5 MB. Without a logo, your initials appear instead.</p>
            </div>
          </div>
          <div className="divide-y rounded-2xl border bg-card px-4">
            {([["showSignature", "Handwritten signature", "Shows the signer's name in a signature style."], ["showSeal", "Enski seal", "The ribboned completion seal."], ["showId", "Certificate ID", "A unique number printed on each certificate."]] as const).map(([k, l, dsc]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0"><Label htmlFor={`${idPrefix}-${k}`} className="text-sm font-bold">{l}</Label><p className="mt-0.5 text-xs text-muted-foreground">{dsc}</p></div>
                <Switch id={`${idPrefix}-${k}`} checked={design[k]} onCheckedChange={(v) => onChange({ [k]: v })} />
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ template: defaultCertificateDesign.template, accent: defaultCertificateDesign.accent, showSignature: true, showSeal: true, showId: true })}>Reset design</Button>
        </>
      )}
    </div>
  );
}
