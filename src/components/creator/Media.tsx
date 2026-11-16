import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import {
  Check, Clock, Download, Eye, FileText, Film, GraduationCap, HardDrive, Image as ImageIcon, LayoutGrid, List, Loader2, Maximize2, Music, Pencil, Ruler, Trash2, Upload, UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Panel, EmptyState, SearchInput, FilterSelect } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { useCreator, activityEntry } from "@/lib/creator/store";
import type { CreatorState, MediaFile } from "@/lib/creator/rules";
import { readCoverFile } from "@/lib/creator/cover";
import { deleteMedia, putMedia } from "@/lib/creator/mediaVault";
import { useMediaUrl } from "@/lib/creator/useMediaUrl";
import { MEDIA_FORMATS, MEDIA_KINDS, MEDIA_LIMITS, extOf, fileSize, formatDuration, mediaKindOf, mediaProblem, mediaUsage, type MediaKind } from "@/lib/creator/mediaRules";
import { GlassStat } from "./products/ProductChrome";
import { CreatorNotFound, itemPaths, shortDate } from "./shared";

export { fileSize };

const icons: Record<MediaKind, typeof Film> = { image: ImageIcon, video: Film, audio: Music, document: FileText };
const typeLabels: Record<MediaKind, string> = { image: "Images", video: "Videos", audio: "Audio", document: "Documents" };
const typeSingle: Record<MediaKind, string> = { image: "Image", video: "Video", audio: "Audio", document: "PDF" };
const ACCEPT = "image/*,video/*,audio/*,application/pdf";

// ---------- Reading files in the browser ----------
type Probe = Pick<MediaFile, "preview" | "duration" | "width" | "height">;
const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T) => Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

function probeVideo(file: File): Promise<Probe> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    const done = (p: Probe) => { URL.revokeObjectURL(url); resolve(p); };
    v.muted = true;
    v.preload = "metadata";
    v.playsInline = true;
    v.onerror = () => done({ preview: "" });
    v.onloadedmetadata = () => {
      const meta = { duration: Number.isFinite(v.duration) ? v.duration : undefined, width: v.videoWidth || undefined, height: v.videoHeight || undefined };
      v.onseeked = () => {
        try {
          const scale = Math.min(1, 480 / Math.max(v.videoWidth, v.videoHeight));
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(v.videoWidth * scale));
          c.height = Math.max(1, Math.round(v.videoHeight * scale));
          c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
          done({ ...meta, preview: c.toDataURL("image/webp", 0.72) });
        } catch { done({ ...meta, preview: "" }); }
      };
      v.currentTime = Math.min(1, (v.duration || 0) / 4);
    };
    v.src = url;
  });
}
function probeAudio(file: File): Promise<Probe> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve({ preview: "", duration: Number.isFinite(a.duration) ? a.duration : undefined }); };
    a.onerror = () => { URL.revokeObjectURL(url); resolve({ preview: "" }); };
    a.src = url;
  });
}
async function probeImage(file: File): Promise<Probe> {
  try {
    const preview = await readCoverFile(file, 480);
    const dims = await new Promise<{ width?: number | undefined; height?: number | undefined }>((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth || undefined, height: img.naturalHeight || undefined }); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve({}); };
      img.src = url;
    });
    return { preview, ...dims };
  } catch { return { preview: "" }; }
}
const probe = (file: File, kind: MediaKind): Promise<Probe> =>
  withTimeout(kind === "image" ? probeImage(file) : kind === "video" ? probeVideo(file) : kind === "audio" ? probeAudio(file) : Promise.resolve({ preview: "" }), 10000, { preview: "" });

/** Removes files everywhere: the library, this device's copy, and any lesson that pointed at them. */
function removeFiles(ids: string[]) {
  ids.forEach((id) => void deleteMedia(id));
  return (s: CreatorState): Partial<CreatorState> => ({
    media: s.media.filter((m) => !ids.includes(m.id)),
    items: s.items.map((i) => (i.course && i.course.modules.some((m) => m.lessons.some((l) => ids.includes(l.mediaId)))
      ? { ...i, course: { ...i.course, modules: i.course.modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => (ids.includes(l.mediaId) ? { ...l, mediaId: "" } : l)) })) } }
      : i)),
    activity: [...s.activity, activityEntry(`Deleted ${ids.length} file${ids.length === 1 ? "" : "s"} from Media Library`)],
  });
}

// ---------- Pieces ----------
function Thumb({ file, className, compact }: { file: MediaFile; className: string; compact?: boolean }) {
  const Icon = icons[file.type];
  if (file.preview) return <img src={file.preview} alt="" className={cn(className, "object-cover")} loading="lazy" />;
  return (
    <div className={cn(className, "media-thumb relative grid place-items-center", `media-thumb-${file.type}`)}>
      {file.type === "audio" && !compact ? (
        <span className="flex h-12 items-end gap-1" aria-hidden="true">{[40, 75, 55, 90, 60, 80, 45, 70, 50, 85].map((h, i) => <span key={i} className="w-1.5 rounded-full bg-cobalt/70" style={{ height: `${h}%` }} />)}</span>
      ) : (
        <span className={cn("grid place-items-center bg-card text-cobalt shadow-sm ring-1 ring-line", compact ? "h-8 w-8 rounded-[10px]" : "h-14 w-14 rounded-[18px]")}><Icon className={compact ? "h-4 w-4" : "h-6 w-6"} /></span>
      )}
    </div>
  );
}

const fmt = (f: MediaFile) => (extOf(f.name) || f.mime.split("/")[1] || "").toUpperCase();

/** Plays or shows the real file when this device has it; otherwise the saved preview. */
function MediaViewer({ file, className }: { file: MediaFile; className?: string }) {
  const { url, missing } = useMediaUrl(file.id);
  const fallback = (
    <div className="relative">
      <Thumb file={file} className="aspect-video w-full" />
      {missing && <p className="absolute inset-x-3 bottom-3 rounded-[12px] bg-card/95 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">This file isn't stored on this device, so only its preview shows. Upload it again to play or download it here.</p>}
    </div>
  );
  return (
    <div className={cn("overflow-hidden rounded-[18px] border border-line bg-midnight", className)}>
      {!url ? (missing ? fallback : <div className="grid aspect-video place-items-center"><Loader2 className="h-6 w-6 animate-spin text-on-dark-muted" /></div>)
        : file.type === "image" ? <img src={url} alt={file.name} className="mx-auto max-h-[70vh] w-auto object-contain" />
        : file.type === "video" ? <video src={url} controls playsInline className="aspect-video w-full" poster={file.preview || undefined} aria-label={file.name} />
        : file.type === "audio" ? (
          <div className="bg-brand-panel relative flex flex-col items-center gap-5 px-5 py-10 text-on-dark">
            <span className="hero-dots" aria-hidden="true" />
            <span className="flex h-16 items-end gap-1.5" aria-hidden="true">{[40, 75, 55, 90, 60, 80, 45, 70, 50, 85, 65, 40].map((h, i) => <span key={i} className="w-2 rounded-full bg-lime/80" style={{ height: `${h}%` }} />)}</span>
            <audio src={url} controls className="relative w-full max-w-md" aria-label={file.name} />
          </div>
        )
        : <iframe src={url} title={file.name} className="h-[70vh] w-full bg-card" />}
    </div>
  );
}

function DownloadButton({ file, size = "sm", variant = "soft" }: { file: MediaFile; size?: "sm" | "default"; variant?: "soft" | "outline" }) {
  const { url } = useMediaUrl(file.id);
  if (!url) return null;
  return <Button asChild size={size} variant={variant}><a href={url} download={file.name}><Download />Download</a></Button>;
}

function TypeChip({ file }: { file: MediaFile }) {
  const Icon = icons[file.type];
  return <span className="inline-flex items-center gap-1 rounded-full bg-midnight/80 px-2 py-0.5 text-[11px] font-extrabold text-on-dark backdrop-blur"><Icon className="h-3 w-3 text-lime" />{typeSingle[file.type]}</span>;
}

type Upload = { id: string; name: string; progress: number; done: boolean };

// ---------- Library ----------
export function MediaLibrary() {
  const { state, update } = useCreator();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | MediaKind>("all");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag] = useState(false);
  const [viewing, setViewing] = useState<MediaFile | null>(null);

  const usage = new Map(state.media.map((m) => [m.id, mediaUsage(state.items, m.id).length]));
  const list = state.media
    .filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase()) && (type === "all" || m.type === type))
    .slice()
    .reverse()
    .sort((x, y) => (sort === "name" ? x.name.localeCompare(y.name) : sort === "size" ? y.size - x.size : sort === "old" ? x.date.localeCompare(y.date) : 0));
  const count = (t: MediaKind) => state.media.filter((m) => m.type === t).length;
  const used = state.media.reduce((a, m) => a + m.size, 0);
  const inLessons = state.media.filter((m) => (usage.get(m.id) ?? 0) > 0).length;
  const empty = !state.media.length;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const usedBySelected = selected.reduce((n, id) => n + (usage.get(id) ?? 0), 0);

  const upload = async (files: FileList | null) => {
    const picked = Array.from(files ?? []);
    if (!picked.length) return;
    const problems = picked.map(mediaProblem).filter(Boolean) as string[];
    const ok = picked.filter((f) => !mediaProblem(f));
    const queue = ok.map((f) => ({ id: crypto.randomUUID(), name: f.name, progress: 6, done: false }));
    setUploads((u) => [...queue, ...u.filter((x) => !x.done)]);
    const added: MediaFile[] = [];
    for (const [n, f] of ok.entries()) {
      const job = queue[n]!;
      const kind = mediaKindOf(f)!;
      const set = (progress: number, done = false) => setUploads((u) => u.map((x) => (x.id === job.id ? { ...x, progress, done } : x)));
      set(30);
      const meta = await probe(f, kind);
      set(65);
      let stored = true;
      try { await putMedia(job.id, f); } catch { stored = false; }
      added.push({ id: job.id, name: f.name, type: kind, mime: f.type || "application/octet-stream", size: f.size, date: new Date().toISOString(), stored, ...meta });
      set(100, true);
    }
    if (added.length) {
      update((s) => ({ media: [...s.media, ...added], activity: [...s.activity, activityEntry(`Added ${added.length} file${added.length === 1 ? "" : "s"} to Media Library`)] }));
      toast.success(`${added.length} file${added.length === 1 ? "" : "s"} added`);
      setTimeout(() => setUploads((u) => u.filter((x) => !x.done)), 1800);
    }
    if (problems.length) toast.error(`${problems.length} file${problems.length === 1 ? "" : "s"} skipped`, { description: problems.slice(0, 2).join(" ") });
    if (input.current) input.current.value = "";
  };
  const dropProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDrag(true); },
    onDragLeave: (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDrag(false); void upload(e.dataTransfer.files); },
  };
  const filters: [string, string, number][] = [["all", "All files", state.media.length], ...MEDIA_KINDS.map((t) => [t, typeLabels[t], count(t)] as [string, string, number])];

  return (
    <div {...dropProps} className="relative">
      <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="Upload files" onChange={(e) => void upload(e.target.files)} />

      <section data-surface="dark" className="bg-brand-panel relative mb-6 overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Your files</p>
            <h1 className="mt-2 text-2xl sm:text-[32px]">Media library</h1>
            <p className="mt-2 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">Keep the images, videos, audio and PDFs for your products in one place, then attach videos to course lessons.</p>
            <Button variant="lime" size="lg" className="mt-5" onClick={() => input.current?.click()}><Upload />Upload files</Button>
          </div>
          <BrandIcon src={brandArtwork.video} className="product-hero-art h-20 w-20 sm:h-32 sm:w-32" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3 lg:grid-cols-4">
          <GlassStat label="Files" value={state.media.length} />
          <GlassStat label="Videos" value={count("video")} />
          <GlassStat label="Used in lessons" value={inLessons} />
          <GlassStat label="Storage used" value={empty ? "0 KB" : fileSize(used)} />
        </div>
      </section>

      {drag && (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-midnight/40 p-6 backdrop-blur-sm" aria-hidden="true">
          <div className="flex flex-col items-center gap-3 rounded-[28px] border-2 border-dashed border-lime bg-card px-10 py-12 text-center shadow-lift">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-cobalt text-primary-foreground"><UploadCloud className="h-7 w-7" /></span>
            <p className="text-lg font-extrabold">Drop to upload</p>
            <p className="text-sm text-muted-foreground">Images, videos, audio and PDFs</p>
          </div>
        </div>
      )}

      {uploads.length > 0 && (
        <section className="surface mb-5 overflow-hidden" aria-live="polite" aria-label="Uploads">
          <header className="flex items-center justify-between border-b px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-extrabold"><span className="lime-tick" aria-hidden="true" />Uploading</p>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">{uploads.filter((u) => u.done).length} of {uploads.length} done</span>
          </header>
          <ul className="divide-y">
            {uploads.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", u.done ? "bg-lime text-midnight" : "bg-ice text-cobalt")}>{u.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Loader2 className="h-4 w-4 animate-spin" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{u.name}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-soft"><div className={cn("h-full rounded-full transition-[width] duration-500", u.done ? "bg-lime" : "bg-cobalt")} style={{ width: `${u.progress}%` }} /></div>
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-bold text-muted-foreground">{u.done ? "Added" : `${u.progress}%`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {empty ? (
        <section className="surface overflow-hidden">
          <button type="button" onClick={() => input.current?.click()} className="create-drop m-4 flex w-[calc(100%-2rem)] flex-col items-center gap-3 rounded-[22px] border-[1.5px] border-dashed border-cobalt-100 bg-soft/40 px-5 py-10 text-center transition-colors hover:border-cobalt hover:bg-ice/50 sm:m-6 sm:w-[calc(100%-3rem)] sm:py-14">
            <span className="relative"><BrandIcon src={brandArtwork.video} className="h-20 w-20" /><span className="lime-pedestal" aria-hidden="true" /></span>
            <span className="text-lg font-extrabold">Your library is empty</span>
            <span className="max-w-md text-sm text-muted-foreground">Drag files anywhere on this page or <span className="font-bold text-cobalt underline underline-offset-2">browse</span>. Everything you upload stays here, ready for your products and lessons.</span>
          </button>
          <div className="grid gap-3 border-t px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {MEDIA_KINDS.map((t) => {
              const Icon = icons[t];
              return (
                <div key={t} className="flex items-start gap-3 rounded-[16px] bg-soft/60 p-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-card text-cobalt shadow-sm ring-1 ring-line"><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">{typeLabels[t]}</p>
                    <p className="text-xs text-muted-foreground">{MEDIA_FORMATS[t].join(", ")} · up to {fileSize(MEDIA_LIMITS[t])}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <>
          <div className="mb-4 flex flex-col-reverse gap-3">
            <div className="hidden flex-wrap gap-1.5 md:flex" role="group" aria-label="File type">
              {filters.map(([v, l, n]) => (
                <button key={v} type="button" aria-pressed={type === v} onClick={() => setType(v as typeof type)} className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-extrabold transition-colors", type === v ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card text-muted-foreground hover:border-cobalt-100 hover:text-cobalt")}>
                  {l}<span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", type === v ? "chip-count" : "bg-soft")}>{n}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput value={q} onChange={setQ} placeholder="Search files" />
              <div className="flex items-center gap-2">
                <FilterSelect label="File type" className="flex-1 md:hidden" value={type} onChange={(v) => setType(v as typeof type)} options={filters.map(([v, l, n]) => [v, `${l} (${n})`] as [string, string])} />
                <FilterSelect label="Sort by" className="flex-1 sm:flex-none" value={sort} onChange={setSort} options={[["new", "Newest first"], ["old", "Oldest first"], ["name", "Name A–Z"], ["size", "Largest first"]]} />
                <div className="inline-flex shrink-0 rounded-full border bg-card p-1" role="group" aria-label="View">
                  {([["grid", LayoutGrid, "Grid view"], ["list", List, "List view"]] as const).map(([v, I, l]) => (
                    <button key={v} type="button" aria-label={l} aria-pressed={view === v} onClick={() => setView(v)} className={cn("grid h-8 w-8 place-items-center rounded-full transition-colors", view === v ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}><I className="h-4 w-4" /></button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="sticky top-20 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-full border bg-card/95 py-2 pl-4 pr-2 shadow-lift backdrop-blur" role="status">
              <span className="flex items-center gap-2 text-sm font-extrabold"><span className="rounded-full bg-lime px-2 text-xs tabular-nums text-midnight">{selected.length}</span>selected</span>
              <button type="button" className="text-[13px] font-bold text-cobalt" onClick={() => setSelected(list.map((m) => m.id))}>Select all {list.length}</button>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="quiet" onClick={() => setSelected([])}>Clear</Button>
                <Button size="sm" variant="destructive" onClick={() => setConfirmBulk(true)}><Trash2 />Delete</Button>
              </div>
            </div>
          )}

          {list.length > 0 && view === "grid" && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {list.map((m) => {
                const on = selected.includes(m.id);
                const uses = usage.get(m.id) ?? 0;
                return (
                  <li key={m.id} className={cn("media-card surface group relative min-w-0 overflow-hidden transition-all", on ? "border-cobalt ring-2 ring-cobalt" : "hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-lift")}>
                    <Link to="/creator/media-library/$mediaId" params={{ mediaId: m.id }} className="block" aria-label={`Open ${m.name}`}>
                      <div className="relative overflow-hidden">
                        <Thumb file={m} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                        {m.preview && <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-midnight/50 to-transparent" aria-hidden="true" />}
                        <span className="absolute bottom-2 left-2"><TypeChip file={m} /></span>
                        {m.duration ? <span className="absolute bottom-2 right-2 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-foreground shadow-sm">{formatDuration(m.duration)}</span> : null}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-bold">{m.name}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{fmt(m)} · {fileSize(m.size)} · {shortDate(m.date)}</p>
                        {uses > 0 && <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-ice px-2 py-0.5 text-[11px] font-extrabold text-cobalt"><GraduationCap className="h-3 w-3" />In {uses} lesson{uses === 1 ? "" : "s"}</p>}
                      </div>
                    </Link>
                    <label className={cn("absolute left-2.5 top-2.5 grid h-7 w-7 cursor-pointer place-items-center rounded-full border-[1.5px] shadow-sm transition-opacity", on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card/95 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100", selected.length > 0 && "sm:opacity-100")}>
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(m.id)} aria-label={`Select ${m.name}`} />
                      {on && <Check className="h-4 w-4" />}
                    </label>
                    <button type="button" onClick={() => setViewing(m)} aria-label={`Preview ${m.name}`} className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-card/95 text-cobalt shadow-sm transition-opacity hover:bg-card sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"><Maximize2 className="h-4 w-4" /></button>
                  </li>
                );
              })}
            </ul>
          )}
          {list.length > 0 && view === "list" && (
            <Panel bodyClassName="p-0">
              <ul className="divide-y">
                {list.map((m) => {
                  const on = selected.includes(m.id);
                  const uses = usage.get(m.id) ?? 0;
                  return (
                    <li key={m.id} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", on ? "bg-ice/60" : "hover:bg-soft/60")}>
                      <input type="checkbox" checked={on} onChange={() => toggle(m.id)} aria-label={`Select ${m.name}`} className="h-4 w-4 shrink-0 accent-[var(--cobalt)]" />
                      <Thumb file={m} compact className="h-12 w-16 shrink-0 overflow-hidden rounded-[12px]" />
                      <Link to="/creator/media-library/$mediaId" params={{ mediaId: m.id }} className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold hover:text-cobalt">{m.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{typeSingle[m.type]} · {fmt(m)}{m.duration ? ` · ${formatDuration(m.duration)}` : ""} · {shortDate(m.date)}{uses ? ` · in ${uses} lesson${uses === 1 ? "" : "s"}` : ""}</p>
                      </Link>
                      <span className="hidden shrink-0 text-xs font-bold tabular-nums text-muted-foreground sm:block">{fileSize(m.size)}</span>
                      <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" aria-label={`Preview ${m.name}`} onClick={() => setViewing(m)}><Eye /></Button>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
          {!list.length && (
            <Panel>
              <EmptyState icon={Upload} title="No matching files" description="Try another search or file type." action={<Button variant="outline" onClick={() => { setQ(""); setType("all"); }}>Clear filters</Button>} />
            </Panel>
          )}

          <button type="button" onClick={() => input.current?.click()} className="mt-5 flex w-full items-center gap-4 rounded-[20px] border-[1.5px] border-dashed border-cobalt-100 bg-soft/40 p-4 text-left transition-colors hover:border-cobalt hover:bg-ice/50">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-cobalt shadow-sm ring-1 ring-line"><UploadCloud className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">Add more files</span>
              <span className="block text-xs text-muted-foreground">Drop files anywhere on this page · videos up to {fileSize(MEDIA_LIMITS.video)}, other files up to {fileSize(MEDIA_LIMITS.audio)}</span>
            </span>
          </button>
        </>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate pr-8">{viewing.name}</DialogTitle>
                <DialogDescription>{typeSingle[viewing.type]} · {fmt(viewing)} · {fileSize(viewing.size)}{viewing.duration ? ` · ${formatDuration(viewing.duration)}` : ""}</DialogDescription>
              </DialogHeader>
              <MediaViewer file={viewing} />
              <DialogFooter className="gap-2 sm:justify-between">
                <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
                <div className="flex flex-wrap gap-2">
                  <DownloadButton file={viewing} size="default" variant="outline" />
                  <Button asChild><Link to="/creator/media-library/$mediaId" params={{ mediaId: viewing.id }}>Open details</Link></Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmBulk}
        onOpenChange={setConfirmBulk}
        art={brandArtwork.bin}
        eyebrow="Media Library"
        title={`Delete ${selected.length} file${selected.length === 1 ? "" : "s"}?`}
        description="They'll be removed from your Media Library. This can't be undone."
        confirmLabel="Delete"
        confirmIcon={<Trash2 />}
        onConfirm={() => {
          const n = selected.length;
          update(removeFiles(selected));
          setSelected([]);
          toast.success(`${n} file${n === 1 ? "" : "s"} deleted`);
        }}
      >
        {usedBySelected > 0 && <ConfirmNote>{usedBySelected} lesson{usedBySelected === 1 ? " uses" : "s use"} {selected.length === 1 ? "this file" : "these files"} and will need a new video.</ConfirmNote>}
      </ConfirmDialog>
    </div>
  );
}

// ---------- Details ----------
function Fact({ icon: Icon, label, children }: { icon: typeof Film; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-soft/60 px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-card text-cobalt ring-1 ring-line"><Icon className="h-4 w-4" /></span>
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="ml-auto truncate text-right text-sm font-extrabold">{children}</dd>
    </div>
  );
}

export function MediaDetails({ id }: { id: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const file = state.media.find((m) => m.id === id);
  const [name, setName] = useState(file?.name ?? "");
  const [remove, setRemove] = useState(false);
  if (!file) return <CreatorNotFound what="media" />;
  const uses = mediaUsage(state.items, file.id);
  const Icon = icons[file.type];
  const rename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return void toast.error("Enter a file name.");
    update((s) => ({ media: s.media.map((m) => (m.id === id ? { ...m, name: name.trim() } : m)) }));
    toast.success("File renamed");
  };
  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Media Library · {typeSingle[file.type]}</p>
          <h1 className="mt-2 break-words text-2xl sm:text-[28px]">{file.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Added {shortDate(file.date)} · {fileSize(file.size)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DownloadButton file={file} size="default" variant="outline" />
          <Button variant="outline" className="text-destructive" onClick={() => setRemove(true)}><Trash2 />Delete</Button>
        </div>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <MediaViewer file={file} />
          <Panel title="Used in" description={uses.length ? `${uses.length} course lesson${uses.length === 1 ? "" : "s"}` : undefined}>
            {uses.length ? (
              <ul className="divide-y">
                {uses.map((u) => (
                  <li key={u.lessonId} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-ice text-cobalt"><GraduationCap className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{u.lessonTitle}</span>
                      <span className="block truncate text-xs text-muted-foreground">{u.itemTitle}</span>
                    </span>
                    <Button asChild size="sm" variant="soft"><Link to={itemPaths.course.detail} params={{ slug: u.itemId }} search={{ tab: "curriculum" }}>Open</Link></Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{file.type === "video" ? "Not attached to any lesson yet. Open a course's Curriculum tab, edit a video lesson and pick this file." : "Not used in any lessons. Lessons can use videos from your library."}</p>
            )}
          </Panel>
        </div>
        <div className="min-w-0 space-y-6">
          <Panel title="Details">
            <dl className="space-y-2">
              <Fact icon={Icon} label="Type">{typeSingle[file.type]} · {fmt(file)}</Fact>
              <Fact icon={HardDrive} label="Size">{fileSize(file.size)}</Fact>
              {file.width && file.height ? <Fact icon={Ruler} label="Dimensions">{file.width} × {file.height}</Fact> : null}
              {file.duration ? <Fact icon={Clock} label="Length">{formatDuration(file.duration)}</Fact> : null}
              <Fact icon={Upload} label="Added">{shortDate(file.date)}</Fact>
            </dl>
          </Panel>
          <Panel title="Rename">
            <form className="space-y-3" onSubmit={rename}>
              <Field id="media-name" label="File name">
                <Input id="media-name" value={name} maxLength={160} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Button type="submit" disabled={!name.trim() || name.trim() === file.name}><Pencil />Save name</Button>
            </form>
          </Panel>
        </div>
      </div>
      <ConfirmDialog
        open={remove}
        onOpenChange={setRemove}
        art={brandArtwork.bin}
        eyebrow="Media Library"
        title="Delete this file?"
        description="It will be removed from your Media Library. This can't be undone."
        confirmLabel="Delete file"
        confirmIcon={<Trash2 />}
        onConfirm={() => { update(removeFiles([id])); toast.success("File deleted"); navigate({ to: "/creator/media-library" }); }}
      >
        {uses.length > 0 && <ConfirmNote>{uses.length} lesson{uses.length === 1 ? " uses" : "s use"} it and will need a new video.</ConfirmNote>}
      </ConfirmDialog>
    </div>
  );
}
