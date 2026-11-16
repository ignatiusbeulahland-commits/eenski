import { Check, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { COVER_TYPES, readCoverFile, validateCoverFile } from "@/lib/creator/cover";
import { cn } from "@/lib/utils";

/** Accessible image picker with drag and drop, preview, replace and remove. Images are resized before saving. */
export function ImageUpload({ id, label, value, onChange, hint = "JPG, PNG or WebP · up to 5 MB", aspect = "aspect-[16/9]", maxSide = 1200, className }: {
  id: string;
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  hint?: string;
  aspect?: string;
  maxSide?: number;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const take = async (file?: File) => {
    if (!file) return;
    const problem = validateCoverFile(file);
    if (problem) { setError(problem); return; }
    setError(""); setBusy(true);
    try { onChange(await readCoverFile(file, maxSide)); }
    catch { setError("We couldn't read that image. Try another file."); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  return (
    <div className={className}>
      <p id={`${id}-label`} className="mb-1.5 text-[13px] font-bold">{label}</p>
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-[18px] border-[1.5px] border-line bg-soft", aspect)}>
          <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-midnight/80 px-2.5 py-1 text-[11px] font-extrabold text-on-dark backdrop-blur"><Check className="h-3 w-3 text-lime" strokeWidth={3} />Uploaded</span>
          <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5">
            <button type="button" onClick={() => ref.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-card/95 px-3 text-xs font-extrabold text-foreground shadow-sm backdrop-blur hover:text-cobalt" aria-label={`Replace ${label.toLowerCase()}`}><RefreshCw className="h-3.5 w-3.5" />Replace</button>
            <button type="button" onClick={() => onChange("")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-card/95 px-3 text-xs font-extrabold text-destructive shadow-sm backdrop-blur" aria-label={`Remove ${label.toLowerCase()}`}><Trash2 className="h-3.5 w-3.5" />Remove</button>
          </div>
          {busy && <div className="absolute inset-0 grid place-items-center bg-card/70"><Loader2 className="h-6 w-6 animate-spin text-cobalt" /></div>}
        </div>
      ) : (
        <button
          type="button"
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint`}
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); void take(e.dataTransfer.files[0]); }}
          aria-busy={busy || undefined}
          className={cn("create-drop flex w-full flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed px-4 text-center transition-colors", aspect, drag ? "border-cobalt bg-ice" : error ? "border-destructive bg-destructive/5" : "border-cobalt-100 bg-soft/50 hover:border-cobalt hover:bg-ice/60")}
        >
          <span className="create-drop-icon grid h-12 w-12 place-items-center rounded-[16px] bg-card text-cobalt shadow-sm ring-1 ring-line">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}</span>
          <span className="text-[13px] font-extrabold">{busy ? "Optimising image…" : drag ? "Drop to upload" : <>Drop an image or <span className="text-cobalt underline underline-offset-2">browse</span></>}</span>
          {busy ? (
            <span className="h-1 w-32 overflow-hidden rounded-full bg-card" aria-hidden="true"><span className="block h-full w-1/2 animate-pulse rounded-full bg-cobalt" /></span>
          ) : (
            <span className="flex gap-1" aria-hidden="true">{["JPG", "PNG", "WEBP"].map((f) => <span key={f} className="rounded-md bg-card px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-muted-foreground ring-1 ring-line">{f}</span>)}</span>
          )}
        </button>
      )}
      <input ref={ref} type="file" accept={COVER_TYPES.join(",")} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void take(e.target.files?.[0])} />
      {error ? <p role="alert" className="mt-1.5 text-xs font-semibold text-destructive">{error}</p> : <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
