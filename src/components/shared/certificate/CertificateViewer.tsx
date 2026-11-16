import { ChevronDown, Download, FileImage, FileText, Loader2, Maximize2, Minus, Plus, Printer, RotateCw, Share2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/dashboard-ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/dashboard-ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/dashboard-ui/sheet";
import { downloadBlob } from "@/lib/download";
import { accentInfo, certSize, isPortrait, templateInfo, type CertificateDesign } from "@/lib/shared/certificate";
import { pdfFilename } from "@/lib/shared/certificatePdf";
import { CertificateArt, type CertificateContent } from "./CertificateArt";
import { printCertificate, renderCertificatePdf, renderCertificatePng } from "./exportCertificate";

const ZOOMS = [1, 1.5, 2, 3] as const;

export type CertificateFormat = "pdf" | "png";
type Ready = { blob: Blob; url: string; file: File; canShare: boolean; format: CertificateFormat };

const formatCopy: Record<CertificateFormat, { label: string; detail: string; save: string }> = {
  pdf: { label: "PDF", detail: "Print-ready A4 page at print resolution.", save: "Save PDF" },
  png: { label: "PNG", detail: "High-resolution image, 2828 × 2000 pixels.", save: "Save image" },
};

/**
 * Creates the certificate as a print-ready PDF or a PNG, in exactly the style and details shown.
 * Mouse users get the file straight away; on touch screens the file is prepared first and a sheet
 * offers Save / Share, so the save tap keeps the browser's permission.
 */
export function useCertificateExport({ filename, onDownloaded, content, design }: {
  filename: string;
  onDownloaded?: (() => void) | undefined;
  content: CertificateContent;
  design: CertificateDesign;
}) {
  const [busy, setBusy] = useState<CertificateFormat | null>(null);
  const [ready, setReady] = useState<Ready | null>(null);
  const close = useCallback(() => setReady((r) => { if (r) setTimeout(() => URL.revokeObjectURL(r.url), 30_000); return null; }), []);
  const nameFor = (f: CertificateFormat) => (f === "pdf" ? pdfFilename(filename) : filename);
  const done = (format: CertificateFormat) => {
    window.__lovableEvents?.track?.("project.certificate_downloaded", { format, style: design.template });
    onDownloaded?.();
  };

  const run = async (svg: SVGSVGElement | null, format: CertificateFormat = "png") => {
    if (!svg || busy) return;
    setBusy(format);
    try {
      await document.fonts.ready;
      let blob: Blob, preview: Blob;
      if (format === "pdf") {
        ({ pdf: blob, preview } = await renderCertificatePdf(svg, {
          title: content.title,
          learnerName: content.learnerName,
          courseTitle: content.courseTitle,
          issuer: design.issuerName.trim() || content.creatorName,
          code: content.code,
          issuedAt: content.issuedAt,
          style: templateInfo[design.template].label,
        }));
      } else {
        blob = preview = await renderCertificatePng(svg);
      }
      const name = nameFor(format);
      if (matchMedia("(pointer: coarse)").matches) {
        const file = new File([blob], name, { type: blob.type });
        setReady({ blob, file, format, url: URL.createObjectURL(preview), canShare: !!navigator.canShare?.({ files: [file] }) });
      } else {
        downloadBlob(blob, name);
        toast.success(format === "pdf" ? "Certificate PDF downloaded" : "Certificate downloaded");
        done(format);
      }
    } catch {
      toast.error(`Could not create the certificate ${format === "pdf" ? "PDF" : "image"}. Please try again.`);
    } finally {
      setBusy(null);
    }
  };

  const save = () => {
    if (!ready) return;
    downloadBlob(ready.blob, ready.file.name);
    toast.success(ready.format === "pdf" ? "Certificate PDF saved" : "Certificate saved");
    done(ready.format);
    close();
  };
  const share = () => {
    if (!ready) return;
    const format = ready.format;
    navigator.share({ files: [ready.file], title: ready.file.name }).then(
      () => { done(format); close(); },
      (e: DOMException) => { if (e.name !== "AbortError") toast.error(`Sharing isn't available here. Use ${formatCopy[format].save} instead.`); },
    );
  };

  const sheet = (
    <Sheet open={!!ready} onOpenChange={(o) => !o && close()}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-[28px] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />Your certificate {ready?.format === "pdf" ? "PDF " : ""}is ready</SheetTitle>
          <SheetDescription>{ready ? formatCopy[ready.format].detail : ""}</SheetDescription>
        </SheetHeader>
        {ready && (
          <div className="relative mt-4">
            <img src={ready.url} alt="Your certificate" className="cert-paper block h-auto w-full rounded-md" />
            {ready.format === "pdf" && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-midnight/80 px-2.5 py-1 text-[11px] font-extrabold text-on-dark backdrop-blur-sm"><FileText className="h-3 w-3" aria-hidden="true" />A4 PDF</span>}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {ready?.format === "pdf" ? "Open it in Files or your PDF app to print, or send it to a print shop." : "You can also press and hold the image to save it to your photos."}
        </p>
        <div className={ready?.canShare ? "mt-4 grid grid-cols-2 gap-2" : "mt-4 grid gap-2"}>
          <Button onClick={save} size="lg"><Download aria-hidden="true" /> {ready ? formatCopy[ready.format].save : "Save"}</Button>
          {ready?.canShare && <Button onClick={share} size="lg" variant="outline"><Share2 aria-hidden="true" /> Share</Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
  const [printing, setPrinting] = useState(false);
  const print = async (svg: SVGSVGElement | null) => {
    if (!svg || printing) return;
    setPrinting(true);
    try { await document.fonts.ready; await printCertificate(svg); }
    catch { toast.error("Printing didn't open. Download the PDF and print it instead."); }
    finally { setPrinting(false); }
  };
  return { busy, run, sheet, print, printing };
}

/** Download button with a PDF / PNG choice. */
export function CertificateDownloadMenu({ busy, onPick, onPrint, portrait, variant = "default", className }: {
  busy: CertificateFormat | null;
  onPick: (format: CertificateFormat) => void;
  /** Adds a "Print" choice that opens the printer dialog with only the certificate. */
  onPrint?: (() => void) | undefined;
  /** Portrait certificates print on an upright A4 page. */
  portrait?: boolean | undefined;
  variant?: "default" | "lime";
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} disabled={!!busy} className={className}>
          {busy ? <Loader2 className="animate-spin" /> : <Download />} {busy ? `Preparing ${formatCopy[busy].label}…` : "Download"}
          {!busy && <ChevronDown className="-mr-1 opacity-80" aria-hidden="true" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuItem onSelect={() => onPick("pdf")} className="items-start gap-3 rounded-xl p-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ice text-cobalt"><FileText className="h-4 w-4" aria-hidden="true" /></span>
          <span className="min-w-0"><span className="block text-sm font-extrabold">PDF for printing</span><span className="block text-xs text-muted-foreground">A4 {portrait ? "portrait" : "landscape"}, print resolution</span></span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onPick("png")} className="items-start gap-3 rounded-xl p-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ice text-cobalt"><FileImage className="h-4 w-4" aria-hidden="true" /></span>
          <span className="min-w-0"><span className="block text-sm font-extrabold">PNG image</span><span className="block text-xs text-muted-foreground">For sharing online and profiles</span></span>
        </DropdownMenuItem>
        {onPrint && (
          <DropdownMenuItem onSelect={() => onPrint()} className="items-start gap-3 rounded-xl p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ice text-cobalt"><Printer className="h-4 w-4" aria-hidden="true" /></span>
            <span className="min-w-0"><span className="block text-sm font-extrabold">Print</span><span className="block text-xs text-muted-foreground">Only the certificate, on one A4 page</span></span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Full-screen certificate viewer with zoom, a sideways view for upright phones, and download. */
export function CertificateViewer({ open, onOpenChange, content, design, filename, onDownloaded, label = "Certificate" }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: CertificateContent;
  design: CertificateDesign;
  filename: string;
  onDownloaded?: (() => void) | undefined;
  label?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const exp = useCertificateExport({ filename, onDownloaded, content, design });
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(0);
  const [turned, setTurned] = useState(false);

  useEffect(() => { if (open) { setZoom(0); setTurned(false); } }, [open]);
  useEffect(() => {
    if (!stage) return;
    const measure = () => setBox({ w: stage.clientWidth, h: stage.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [stage]);

  const portrait = box.h > box.w;
  const sideways = turned && portrait;
  const pad = 32;
  const W = Math.max(0, box.w - pad), H = Math.max(0, box.h - pad);
  const z = ZOOMS[zoom] ?? 1;
  const size = certSize(design);
  const RATIO = size.w / size.h;
  const artW = (sideways ? Math.min(H, W * RATIO) : Math.min(W, H * RATIO)) * z;
  const artH = artW / RATIO;
  const [bw, bh] = sideways ? [artH, artW] : [artW, artH];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          data-surface="dark"
          className="flex h-[100dvh] max-h-none w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-midnight p-0 text-on-dark sm:rounded-none"
        >
          <div className="flex items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-[15px] font-extrabold">{label}</DialogTitle>
              <DialogDescription className="truncate text-xs text-on-dark-muted">{templateInfo[design.template].label} · {accentInfo[design.accent]} accent</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="glass" size="icon" className="h-10 w-10 rounded-full" aria-label="Close full screen"><X /></Button>
            </DialogClose>
          </div>
          <div ref={setStage} className="relative min-h-0 flex-1 overflow-auto overscroll-contain" onDoubleClick={() => setZoom((v) => (v ? 0 : 2))}>
            <div className="flex min-h-full w-max min-w-full p-4">
              {box.w > 0 && (
                <div className="relative m-auto shrink-0" style={{ width: bw, height: bh }}>
                  <div
                    className="cert-paper absolute overflow-hidden rounded-md motion-safe:transition-transform motion-safe:duration-300"
                    style={{ width: artW, height: artH, left: (bw - artW) / 2, top: (bh - artH) / 2, transform: sideways ? "rotate(90deg)" : undefined }}
                  >
                    <CertificateArt content={content} design={design} svgRef={svgRef} className="block h-full w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-on-dark/10 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="flex items-center gap-1 rounded-full border border-on-dark/15 bg-on-dark/5 p-1" role="group" aria-label="Zoom">
              <ToolButton label="Zoom out" disabled={zoom === 0} onClick={() => setZoom((v) => Math.max(0, v - 1))}><Minus /></ToolButton>
              <button type="button" onClick={() => setZoom(0)} className="h-9 min-w-[3rem] rounded-full px-1.5 text-[13px] font-extrabold tabular-nums hover:text-lime" aria-label={zoom ? "Fit to screen" : "Fitted to screen"}>
                {zoom ? `${Math.round(z * 100)}%` : "Fit"}
              </button>
              <ToolButton label="Zoom in" disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((v) => Math.min(ZOOMS.length - 1, v + 1))}><Plus /></ToolButton>
            </div>
            {portrait && (
              <Button variant={turned ? "glass-active" : "glass"} size="sm" className="h-11 w-11 px-0 min-[420px]:w-auto min-[420px]:px-4" onClick={() => setTurned((t) => !t)} aria-pressed={turned} aria-label="View sideways">
                <RotateCw aria-hidden="true" /> <span className="hidden min-[420px]:inline">{turned ? "Upright" : "Sideways"}</span>
              </Button>
            )}
            <CertificateDownloadMenu variant="lime" className="h-11 px-4 sm:px-5" busy={exp.busy} portrait={isPortrait(design)} onPrint={() => void exp.print(svgRef.current)} onPick={(f) => exp.run(svgRef.current, f)} />
          </div>
        </DialogContent>
      </Dialog>
      {exp.sheet}
    </>
  );
}

function ToolButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-on-dark/10 hover:text-lime disabled:opacity-40 [&_svg]:h-4 [&_svg]:w-4">
      {children}
    </button>
  );
}

/** Small "view full size" chip laid over a certificate thumbnail. */
export function ExpandChip({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <span className="inline-grid h-7 min-w-7 grid-flow-col place-items-center gap-1.5 rounded-full bg-midnight/80 px-2 text-[11px] font-extrabold text-on-dark shadow-sm backdrop-blur-sm sm:px-2.5">
        <Maximize2 className="h-3 w-3" /> <span className="hidden sm:inline">Full size</span>
      </span>
    </span>
  );
}
