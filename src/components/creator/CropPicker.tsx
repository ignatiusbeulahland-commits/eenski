import { Crop as CropIcon, Move, ZoomIn } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { COVER_TYPES, validateCoverFile } from "@/lib/creator/cover";
import { CROP_START, MIN_IMAGE_SIDE, cropRect, imageSizeProblem, loadImage, renderCrop, type Crop } from "@/lib/creator/imageCrop";
import { cn } from "@/lib/utils";

type Options = { aspect: number; outWidth: number; round?: boolean; title: string; onDone: (dataUrl: string) => void };

/** File picker that checks the 1080 × 1080 minimum, then lets the creator drag and zoom the crop before saving. */
export function useCropPicker({ aspect, outWidth, round, title, onDone }: Options) {
  const input = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>(CROP_START);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number; start: Crop } | null>(null);

  const take = async (file?: File) => {
    if (input.current) input.current.value = "";
    if (!file) return;
    const problem = validateCoverFile(file);
    if (problem) { toast.error(problem); return; }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const el = await loadImage(url);
      const small = imageSizeProblem(el.naturalWidth, el.naturalHeight);
      if (small) { toast.error("Image too small", { description: small }); URL.revokeObjectURL(url); return; }
      setCrop(CROP_START);
      setImg(el);
    } catch {
      URL.revokeObjectURL(url);
      toast.error("We couldn't read that image. Try another file.");
    } finally { setBusy(false); }
  };

  const close = () => { if (img) URL.revokeObjectURL(img.src); setImg(null); };
  const r = img ? cropRect(img.naturalWidth, img.naturalHeight, aspect, crop) : null;

  const onDown = (e: ReactPointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, start: crop }; (e.target as Element).setPointerCapture?.(e.pointerId); };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current || !img || !frame.current) return;
    const box = frame.current.getBoundingClientRect();
    const base = cropRect(img.naturalWidth, img.naturalHeight, aspect, drag.current.start);
    const perPx = base.sw / box.width;
    const freeX = img.naturalWidth - base.sw;
    const freeY = img.naturalHeight - base.sh;
    const x = freeX > 0 ? (base.sx - (e.clientX - drag.current.x) * perPx) / freeX : 0.5;
    const y = freeY > 0 ? (base.sy - (e.clientY - drag.current.y) * perPx) / freeY : 0.5;
    setCrop({ ...drag.current.start, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };
  const nudge = (dx: number, dy: number) => setCrop((c) => ({ ...c, x: Math.max(0, Math.min(1, c.x + dx)), y: Math.max(0, Math.min(1, c.y + dy)) }));

  const confirm = () => {
    if (!img) return;
    try { onDone(renderCrop(img, aspect, crop, outWidth)); close(); }
    catch { toast.error("We couldn't save that crop. Try another image."); }
  };

  const element = (
    <>
      <input ref={input} type="file" accept={COVER_TYPES.join(",")} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void take(e.target.files?.[0])} />
      <Dialog open={Boolean(img)} onOpenChange={(v) => !v && close()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CropIcon className="h-5 w-5 text-cobalt" aria-hidden="true" />{title}</DialogTitle>
            <DialogDescription>Drag the picture to place it, and zoom to get closer. What's inside the frame is what visitors see.</DialogDescription>
          </DialogHeader>
          {img && r && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-midnight p-3 sm:p-4">
                <div
                  ref={frame}
                  role="img"
                  aria-label="Crop preview. Use the arrow keys to move the picture."
                  tabIndex={0}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={() => { drag.current = null; }}
                  onPointerCancel={() => { drag.current = null; }}
                  onKeyDown={(e) => {
                    const step = 0.05;
                    if (e.key === "ArrowLeft") nudge(-step, 0); else if (e.key === "ArrowRight") nudge(step, 0); else if (e.key === "ArrowUp") nudge(0, -step); else if (e.key === "ArrowDown") nudge(0, step); else return;
                    e.preventDefault();
                  }}
                  className={cn("relative mx-auto w-full cursor-grab touch-none select-none overflow-hidden ring-2 ring-lime active:cursor-grabbing focus-visible:outline-none focus-visible:ring-4", round ? "max-w-72 rounded-full" : "rounded-xl")}
                  style={{ aspectRatio: String(aspect) }}
                >
                  <img
                    src={img.src}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute max-w-none"
                    style={{ width: `${(img.naturalWidth / r.sw) * 100}%`, left: `${(-r.sx / r.sw) * 100}%`, top: `${(-r.sy / r.sh) * 100}%` }}
                  />
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-on-dark-muted"><Move className="h-3.5 w-3.5" aria-hidden="true" />Drag to move · {img.naturalWidth} × {img.naturalHeight} px</p>
              </div>
              <label className="flex items-center gap-3 text-sm font-bold">
                <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Zoom</span>
                <input type="range" min={1} max={3} step={0.01} value={crop.zoom} onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })} className="w-full accent-cobalt" aria-label="Zoom" />
              </label>
              <DialogActions><Button type="button" onClick={confirm}>Use this crop</Button></DialogActions>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );

  return { open: () => input.current?.click(), busy, element, minSide: MIN_IMAGE_SIDE };
}
