import { Check, ExternalLink, FileText, Film, ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { undoToast } from "@/lib/shared/undo";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { COVER_TYPES, readCoverFile, validateCoverFile } from "@/lib/creator/cover";
import {
  COURSE_CATEGORIES, LEVEL_LABEL, PRODUCT_TOPICS, PRESENTATION_MAX_IMAGES, SLIDE_EXTS, VIDEO_EXTS, skillOptions, validateSlidesFile, validateVideoFile,
} from "@/lib/creator/courseMeta";
import { deleteMedia, putMedia } from "@/lib/creator/mediaVault";
import { useMediaUrl } from "@/lib/creator/useMediaUrl";
import { COURSE_LEVELS, newId, type CoursePresentation, type MediaRef } from "@/lib/creator/products";
import { cn } from "@/lib/utils";
import { fileSize } from "@/lib/creator/mediaRules";
import { CreateField } from "./CreateKit";

const OTHER = "__other";
type Level = (typeof COURSE_LEVELS)[number];

/** Dropdown of suggestions with an "Other" choice that reveals a text box. With no suggestions it is just a text box. */
export function PickOrType({ id, value, options, onChange, placeholder, otherPlaceholder }: {
  id: string; value: string; options: readonly string[]; onChange: (v: string) => void; placeholder: string; otherPlaceholder: string;
}) {
  const [other, setOther] = useState(() => !!value.trim() && !options.includes(value));
  const otherRef = useRef<HTMLInputElement>(null);
  if (!options.length) {
    return <Input id={id} value={value} maxLength={40} placeholder={otherPlaceholder} onChange={(e) => onChange(e.target.value)} />;
  }
  const selected = other ? OTHER : options.includes(value) ? value : "";
  return (
    <div className="space-y-2">
      <Select
        value={selected}
        onValueChange={(v) => {
          if (v === OTHER) {
            setOther(true);
            onChange("");
            requestAnimationFrame(() => otherRef.current?.focus());
          } else {
            setOther(false);
            onChange(v);
          }
        }}
      >
        <SelectTrigger id={id} className="h-11 bg-card text-sm font-bold"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          <SelectSeparator />
          <SelectItem value={OTHER}>Other (type your own)</SelectItem>
        </SelectContent>
      </Select>
      {other && (
        <Input ref={otherRef} id={`${id}-other`} aria-label={`${otherPlaceholder}`} value={value} maxLength={40} placeholder={otherPlaceholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

/** Category, main skill and level for a course. Skill suggestions follow the chosen category. */
export function CourseTopicFields({ category, skill, level, onChange, categoryError }: {
  category: string; skill: string; level: Level;
  onChange: (p: { category?: string; skill?: string; level?: Level }) => void;
  categoryError?: string | undefined;
}) {
  const skills = skillOptions(category);
  return (
    <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
      <CreateField id="item-category" label="Category" hint="Helps students find your course." error={categoryError}>
        <PickOrType id="item-category" value={category} options={COURSE_CATEGORIES} placeholder="Choose a category" otherPlaceholder="Type your category"
          onChange={(v) => onChange(v === category ? { category: v } : { category: v, ...(skillOptions(v).includes(skill) ? {} : { skill: "" }) })} />
      </CreateField>
      <CreateField id="create-skill" label="Main skill" hint={skills.length ? "The skill students gain from this course." : "Type the main skill students gain."}>
        <PickOrType key={skills.length ? category : "custom"} id="create-skill" value={skill} options={skills} placeholder="Choose a skill" otherPlaceholder="Type the skill" onChange={(v) => onChange({ skill: v })} />
      </CreateField>
      <CreateField id="create-level" label="Level" hint="Who the course is right for.">
        <Select value={level} onValueChange={(v) => onChange({ level: v as Level })}>
          <SelectTrigger id="create-level" className="h-11 bg-card text-sm font-bold"><SelectValue /></SelectTrigger>
          <SelectContent>{COURSE_LEVELS.map((l) => <SelectItem key={l} value={l}>{LEVEL_LABEL[l]}</SelectItem>)}</SelectContent>
        </Select>
      </CreateField>
    </div>
  );
}

/** Category plus a type dropdown (format, session type, service or focus) for the non-course products; live sessions also get a level. */
export function ProductTopicFields({ kind, category, sub, level, onChange }: {
  kind: keyof typeof PRODUCT_TOPICS; category: string; sub: string; level: Level;
  onChange: (p: { category?: string; sub?: string; level?: Level }) => void;
}) {
  const t = PRODUCT_TOPICS[kind];
  const subs = t.sub.options(category);
  return (
    <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
      <CreateField id="item-category" label="Category" hint={t.categoryHint}>
        <PickOrType id="item-category" value={category} options={t.categories} placeholder="Choose a category" otherPlaceholder="Type your category"
          onChange={(v) => onChange(v === category || t.sub.options(v).includes(sub) || !t.sub.options(category).length ? { category: v } : { category: v, sub: "" })} />
      </CreateField>
      <CreateField id="create-subtype" label={t.sub.label} hint={subs.length ? t.sub.hint : `${t.sub.otherPlaceholder}.`}>
        <PickOrType key={subs.length ? `${kind}-${subs.join("|")}` : "custom"} id="create-subtype" value={sub} options={subs} placeholder={t.sub.placeholder} otherPlaceholder={t.sub.otherPlaceholder} onChange={(v) => onChange({ sub: v })} />
      </CreateField>
      {t.level && (
        <CreateField id="create-level" label="Level" hint="Who the session is right for.">
          <Select value={level} onValueChange={(v) => onChange({ level: v as Level })}>
            <SelectTrigger id="create-level" className="h-11 bg-card text-sm font-bold"><SelectValue /></SelectTrigger>
            <SelectContent>{COURSE_LEVELS.map((l) => <SelectItem key={l} value={l}>{LEVEL_LABEL[l]}</SelectItem>)}</SelectContent>
          </Select>
        </CreateField>
      )}
    </div>
  );
}

const refFor = (file: File | Blob, name: string, mime: string): MediaRef => ({ id: newId(), name, size: file.size, mime, uploadedAt: new Date().toISOString() });

function Block({ title, text, count, children }: { title: string; text: string; count?: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[13px] font-bold"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />{title}<span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-bold text-muted-foreground">Optional</span></p>
          <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
        </div>
        {count && <span className="shrink-0 text-[11px] font-bold tabular-nums text-muted-foreground">{count}</span>}
      </div>
      {children}
    </div>
  );
}

function DropZone({ id, icon: Icon, title, formats, hint, busy, error, onFiles, accept, multiple, compact }: {
  id: string; icon: typeof Film; title: string; formats: readonly string[]; hint: string; busy: boolean; error: string; onFiles: (f: FileList | null) => void; accept: string; multiple?: boolean; compact?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <>
      <button
        type="button"
        id={id}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
        aria-describedby={`${id}-hint`}
        aria-busy={busy || undefined}
        disabled={busy}
        className={cn("create-drop flex w-full flex-col items-center justify-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed px-4 text-center transition-colors", compact ? "py-5" : "py-7",
          drag ? "border-cobalt bg-ice" : error ? "border-destructive/60 bg-destructive/5" : "border-cobalt-100 bg-soft/40 hover:border-cobalt hover:bg-ice/50")}
      >
        <span className="create-drop-icon grid h-12 w-12 place-items-center rounded-[16px] bg-card text-cobalt shadow-sm ring-1 ring-line">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}</span>
        <span className="text-[13px] font-extrabold">{busy ? "Saving…" : drag ? "Drop to upload" : <>{title} or <span className="text-cobalt underline underline-offset-2">browse</span></>}</span>
        <span className="flex flex-wrap justify-center gap-1" aria-hidden="true">{formats.map((f) => <span key={f} className="rounded-md bg-card px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground ring-1 ring-line">{f}</span>)}</span>
      </button>
      <input ref={ref} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
      {error ? <p role="alert" className="text-xs font-semibold text-destructive">{error}</p> : <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
    </>
  );
}

function Missing({ what }: { what: string }) {
  return <p className="rounded-[12px] bg-soft px-3 py-2 text-xs text-muted-foreground">This {what} isn't on this device. Upload it again to show it here.</p>;
}

function VideoBlock({ value, onChange }: { value: MediaRef | null; onChange: (v: MediaRef | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const replaceRef = useRef<HTMLInputElement>(null);
  const { url, missing } = useMediaUrl(value?.id);
  const take = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const problem = validateVideoFile(f);
    if (problem) { setError(problem); return; }
    setError(""); setBusy(true);
    try {
      const ref = refFor(f, f.name, f.type || "video/mp4");
      await putMedia(ref.id, f);
      if (value) void deleteMedia(value.id);
      onChange(ref);
    } catch { setError("We couldn't save that video on this device. Try a smaller file."); }
    finally { setBusy(false); }
  };
  return (
    <Block title="Intro video" text="A short trailer students watch before they enrol. One to three minutes works best.">
      {value ? (
        <div className="overflow-hidden rounded-[18px] border border-line bg-card">
          <div className="relative aspect-video bg-midnight">
            {url ? <video src={url} controls preload="metadata" className="h-full w-full" aria-label={`Intro video: ${value.name}`} /> : (
              <div className="grid h-full place-items-center text-on-dark-muted">{missing ? <Film className="h-8 w-8" /> : <Loader2 className="h-6 w-6 animate-spin" />}</div>
            )}
            {busy && <div className="absolute inset-0 grid place-items-center bg-midnight/60"><Loader2 className="h-6 w-6 animate-spin text-on-dark" /></div>}
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-ice text-cobalt"><Film className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1 basis-40">
              <span className="block truncate text-[13px] font-extrabold">{value.name}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Check className="h-3 w-3 text-cobalt" strokeWidth={3} />{fileSize(value.size)}</span>
            </span>
            <Button type="button" size="sm" variant="soft" disabled={busy} onClick={() => replaceRef.current?.click()}><RefreshCw />Replace</Button>
            <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => { const removed = value; onChange(null); undoToast(`"${removed.name}" removed`, () => onChange(removed), { onCommit: () => void deleteMedia(removed.id) }); }}><Trash2 />Remove</Button>
          </div>
          {missing && <div className="px-3 pb-3"><Missing what="video" /></div>}
          <input ref={replaceRef} type="file" accept="video/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { void take(e.target.files); e.target.value = ""; }} />
          {error && <p role="alert" className="px-3 pb-3 text-xs font-semibold text-destructive">{error}</p>}
        </div>
      ) : (
        <DropZone id="create-video" icon={Film} title="Drop a video" formats={VIDEO_EXTS} hint="MP4, MOV or WebM · up to 500 MB" busy={busy} error={error} accept="video/*" onFiles={(l) => void take(l)} />
      )}
    </Block>
  );
}

function VaultThumb({ item, n, onRemove }: { item: MediaRef; n: number; onRemove: () => void }) {
  const { url, missing } = useMediaUrl(item.id);
  return (
    <li className="group relative overflow-hidden rounded-[14px] border border-line bg-soft">
      <div className="aspect-video">
        {url ? <img src={url} alt={`Presentation image ${n}`} className="h-full w-full object-cover" /> : (
          <div className="grid h-full place-items-center p-2 text-center text-[11px] text-muted-foreground">{missing ? "Not on this device" : <Loader2 className="h-4 w-4 animate-spin" />}</div>
        )}
      </div>
      <span className="absolute left-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-midnight/80 px-1 text-[10px] font-extrabold text-on-dark">{n}</span>
      <button type="button" onClick={onRemove} aria-label={`Remove presentation image ${n}`} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/95 text-foreground shadow-sm hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
    </li>
  );
}

function ImagesBlock({ value, onChange }: { value: MediaRef[]; onChange: (v: MediaRef[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const room = PRESENTATION_MAX_IMAGES - value.length;
  const take = async (list: FileList | null) => {
    const picked = Array.from(list ?? []);
    if (!picked.length) return;
    const bad = picked.map((f) => validateCoverFile(f)).find(Boolean);
    const ok = picked.filter((f) => !validateCoverFile(f)).slice(0, room);
    const over = picked.filter((f) => !validateCoverFile(f)).length > room;
    setError(bad ? `Some files were skipped. ${bad}` : over ? `You can add up to ${PRESENTATION_MAX_IMAGES} images.` : "");
    if (!ok.length) return;
    setBusy(true);
    const added: MediaRef[] = [];
    try {
      for (const f of ok) {
        const dataUrl = await readCoverFile(f, 1600);
        const blob = await (await fetch(dataUrl)).blob();
        const ref = refFor(blob, f.name, blob.type);
        await putMedia(ref.id, blob);
        added.push(ref);
      }
    } catch { setError("We couldn't read one of those images. Try another file."); }
    finally { setBusy(false); if (added.length) onChange([...value, ...added]); }
  };
  return (
    <Block title="Presentation images" text="Screenshots, slides saved as images or examples of student work." count={`${value.length}/${PRESENTATION_MAX_IMAGES}`}>
      {value.length > 0 && (
        <ol className="grid grid-cols-2 gap-2.5 @md:grid-cols-4">
          {value.map((m, i) => <VaultThumb key={m.id} item={m} n={i + 1} onRemove={() => { const before = value; onChange(value.filter((v) => v.id !== m.id)); undoToast(`Image ${i + 1} removed`, () => onChange(before), { onCommit: () => void deleteMedia(m.id) }); }} />)}
        </ol>
      )}
      {room > 0 ? (
        <DropZone id="create-images" icon={ImagePlus} title={value.length ? "Add more images" : "Drop images"} formats={["jpg", "png", "webp"]} hint={`JPG, PNG or WebP · up to 5 MB each · ${room} more allowed`} busy={busy} error={error} accept={COVER_TYPES.join(",")} multiple compact={value.length > 0} onFiles={(l) => void take(l)} />
      ) : error ? <p role="alert" className="text-xs font-semibold text-destructive">{error}</p> : null}
    </Block>
  );
}

function SlidesBlock({ value, onChange }: { value: MediaRef | null; onChange: (v: MediaRef | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const replaceRef = useRef<HTMLInputElement>(null);
  const { url, missing } = useMediaUrl(value?.id);
  const accept = SLIDE_EXTS.map((e) => `.${e}`).join(",");
  const take = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const problem = validateSlidesFile(f);
    if (problem) { setError(problem); return; }
    setError(""); setBusy(true);
    try {
      const ref = refFor(f, f.name, f.type || "application/octet-stream");
      await putMedia(ref.id, f);
      if (value) void deleteMedia(value.id);
      onChange(ref);
    } catch { setError("We couldn't save that file on this device. Try a smaller file."); }
    finally { setBusy(false); }
  };
  const isPdf = value?.name.toLowerCase().endsWith(".pdf");
  return (
    <Block title="Slide deck" text="Upload your course presentation so students can view or download it.">
      {value ? (
        <div className="rounded-[18px] border border-line bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-cobalt text-primary-foreground"><FileText className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1 basis-40">
              <span className="block truncate text-[13px] font-extrabold">{value.name}</span>
              <span className="text-xs text-muted-foreground">{(value.name.split(".").pop() ?? "").toUpperCase()} · {fileSize(value.size)}</span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              {url && <Button asChild size="sm" variant="soft"><a href={url} target="_blank" rel="noreferrer" {...(isPdf ? {} : { download: value.name })}><ExternalLink />{isPdf ? "Open" : "Download"}</a></Button>}
              <Button type="button" size="sm" variant="soft" disabled={busy} onClick={() => replaceRef.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Replace</Button>
              <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => { const removed = value; onChange(null); undoToast(`"${removed.name}" removed`, () => onChange(removed), { onCommit: () => void deleteMedia(removed.id) }); }}><Trash2 />Remove</Button>
            </span>
          </div>
          {missing && <div className="mt-3"><Missing what="file" /></div>}
          <input ref={replaceRef} type="file" accept={accept} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { void take(e.target.files); e.target.value = ""; }} />
          {error && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
        </div>
      ) : (
        <DropZone id="create-slides" icon={UploadCloud} title="Drop your slides" formats={SLIDE_EXTS} hint="PDF, PowerPoint or Keynote · up to 100 MB" busy={busy} error={error} accept={accept} compact onFiles={(l) => void take(l)} />
      )}
    </Block>
  );
}

/** Intro video, presentation images and slide deck for a course. Files are kept on this device. */
export function CoursePresentationEditor({ value, update }: { value: CoursePresentation; update: (fn: (v: CoursePresentation) => CoursePresentation) => void }) {
  return (
    <div className="space-y-6">
      <VideoBlock value={value.video} onChange={(video) => update((v) => ({ ...v, video }))} />
      <hr className="border-line/70" />
      <ImagesBlock value={value.images} onChange={(images) => update((v) => ({ ...v, images }))} />
      <hr className="border-line/70" />
      <SlidesBlock value={value.slides} onChange={(slides) => update((v) => ({ ...v, slides }))} />
    </div>
  );
}
