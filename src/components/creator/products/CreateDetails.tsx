import { Link } from "@tanstack/react-router";
import {
  ArrowDown, ArrowUp, BadgeCheck, Briefcase, CalendarClock, CalendarDays, Clock, Download, Eye, EyeOff, FileArchive, FileAudio, FileImage, FileText, FileVideo,
  Infinity as InfinityIcon, ListChecks, Loader2, MapPin, Minus, Package, Phone, PlayCircle, Plus, RefreshCw, Repeat, ShieldCheck, Ticket as TicketIcon, Trash2, UploadCloud, User, Video, X,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { naira } from "@/lib/affiliate/products";
import { useCreator } from "@/lib/creator/store";
import { DAYS, type CreatorItem } from "@/lib/creator/rules";
import { LESSON_TYPES, newId, type ProductFile, type ServicePackage } from "@/lib/creator/products";
import { MAX_CREATE_LESSONS, MAX_PACKAGES, type CreateExtras, type CreateIssue, type DraftLesson, type DraftModule } from "@/lib/creator/createGuide";
import { cn } from "@/lib/utils";
import { fileSize } from "@/lib/creator/mediaRules";
import { MAX_FILE, previewable, sessionPreviews } from "./Download";
import { CreateField, ListEditor, OptionCards, PriceInput, Segmented, ToggleRow } from "./CreateKit";

export type DetailProps = {
  form: CreatorItem;
  x: CreateExtras;
  set: (p: Partial<CreatorItem>) => void;
  setExtra: (p: Partial<CreateExtras>) => void;
  issue: CreateIssue | null;
};
const errFor = (issue: CreateIssue | null, field: string) => (issue?.field === field ? issue.message : undefined);

function SubHead({ title, text, aside }: { title: string; text?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[13px] font-bold">{title}</p>
        {text && <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>}
      </div>
      {aside}
    </div>
  );
}
const Divider = () => <hr className="border-line/70" />;

// ---------------- Courses ----------------
const lessonMeta: Record<(typeof LESSON_TYPES)[number], { label: string; icon: typeof PlayCircle }> = {
  video: { label: "Video", icon: PlayCircle },
  text: { label: "Article", icon: FileText },
  download: { label: "Material", icon: Download },
  quiz: { label: "Quiz", icon: ListChecks },
};
const hm = (mins: number) => (mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}` : `${mins}m`);

export function CourseOutcomes({ x, setExtra }: DetailProps) {
  const examples = ["Design a mobile app screen", "Build a clickable prototype", "Present work to clients"];
  return (
    <div>
      <p className="mb-2.5 text-[13px] font-bold">By the end, students will be able to…</p>
      <ol className="space-y-2">
        {x.objectives.map((o, i) => (
          <li key={i} className="create-row flex items-center gap-2 rounded-[14px] border border-line bg-card p-1.5 pl-2.5">
            <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold transition-colors", o.trim() ? "bg-lime text-midnight" : "bg-soft text-muted-foreground")} aria-hidden="true">{i + 1}</span>
            <Input aria-label={`Outcome ${i + 1}`} value={o} maxLength={120} placeholder={examples[i] ?? "Another outcome"} className="h-9 border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0"
              onChange={(e) => setExtra({ objectives: x.objectives.map((v, n) => (n === i ? e.target.value : v)) })} />
            {x.objectives.length > 1 && (
              <button type="button" onClick={() => setExtra({ objectives: x.objectives.filter((_, n) => n !== i) })} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-soft hover:text-foreground" aria-label={`Remove outcome ${i + 1}`}><X className="h-4 w-4" /></button>
            )}
          </li>
        ))}
      </ol>
      {x.objectives.length < 6 && <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setExtra({ objectives: [...x.objectives, ""] })}><Plus />Add outcome</Button>}
    </div>
  );
}

function LessonRow({ lesson, n, first, last, onChange, onMove, onRemove }: {
  lesson: DraftLesson; n: string; first: boolean; last: boolean; onChange: (p: Partial<DraftLesson>) => void; onMove: (d: -1 | 1) => void; onRemove: () => void;
}) {
  const M = lessonMeta[lesson.type];
  return (
    <li className="create-lesson grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 px-3 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-ice text-cobalt" aria-hidden="true"><M.icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <Input aria-label={`Lesson ${n} title`} value={lesson.title} maxLength={120} placeholder="Lesson title" className="h-9" onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-1 sm:flex-nowrap">
        <Select value={lesson.type} onValueChange={(v) => onChange({ type: v as DraftLesson["type"] })}>
          <SelectTrigger aria-label={`Lesson ${n} type`} className="h-9 w-[118px] bg-card text-xs font-bold"><SelectValue /></SelectTrigger>
          <SelectContent>{LESSON_TYPES.map((t) => <SelectItem key={t} value={t}>{lessonMeta[t].label}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Input aria-label={`Lesson ${n} length in minutes`} type="number" min="0" step="1" value={Number.isNaN(lesson.minutes) ? "" : lesson.minutes} className="h-9 w-[92px] pr-10 text-sm font-bold tabular-nums"
            onChange={(e) => onChange({ minutes: e.target.value === "" ? NaN : Number(e.target.value) })} />
          <span className="pointer-events-none absolute inset-y-0 right-2.5 grid place-items-center text-[11px] font-bold text-muted-foreground">min</span>
        </div>
        <button type="button" aria-pressed={lesson.preview} aria-label={`Free preview for lesson ${n}`} title="Free preview" onClick={() => onChange({ preview: !lesson.preview })}
          className={cn("grid h-9 w-9 place-items-center rounded-[10px] border transition-colors", lesson.preview ? "border-cobalt bg-ice text-cobalt" : "border-line text-muted-foreground hover:text-cobalt")}>
          {lesson.preview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <span className="ml-auto flex sm:ml-0">
          <Button type="button" size="icon" variant="ghost" className="h-9 w-8" aria-label={`Move lesson ${n} up`} disabled={first} onClick={() => onMove(-1)}><ArrowUp /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-9 w-8" aria-label={`Move lesson ${n} down`} disabled={last} onClick={() => onMove(1)}><ArrowDown /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-9 w-8 hover:text-destructive" aria-label={`Remove lesson ${n}`} onClick={onRemove}><Trash2 /></Button>
        </span>
      </div>
    </li>
  );
}

function ModuleCard({ m, mi, count, total, onChange, onMove, onRemove }: {
  m: DraftModule; mi: number; count: number; total: number; onChange: (m: DraftModule) => void; onMove: (d: -1 | 1) => void; onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [type, setType] = useState<DraftLesson["type"]>("video");
  const full = total >= MAX_CREATE_LESSONS;
  const add = () => {
    const t = draft.trim();
    if (!t || full) return;
    onChange({ ...m, lessons: [...m.lessons, { id: newId(), title: t, type, minutes: type === "quiz" ? 5 : 10, preview: false }] });
    setDraft("");
  };
  const patch = (i: number, p: Partial<DraftLesson>) => onChange({ ...m, lessons: m.lessons.map((l, n) => (n === i ? { ...l, ...p } : l)) });
  const move = (i: number, d: -1 | 1) => {
    const next = m.lessons.slice();
    const [l] = next.splice(i, 1);
    next.splice(i + d, 0, l!);
    onChange({ ...m, lessons: next });
  };
  const mins = m.lessons.reduce((n, l) => n + (Number.isFinite(l.minutes) ? l.minutes : 0), 0);
  return (
    <li className="create-module overflow-hidden rounded-[18px] border border-line bg-card">
      <div className="flex items-center gap-2.5 border-b border-line/70 bg-soft/60 px-3 py-2.5">
        <span className="grid h-8 shrink-0 place-items-center rounded-[10px] bg-cobalt px-2.5 text-[11px] font-extrabold text-primary-foreground">M{mi + 1}</span>
        <Input aria-label={`Module ${mi + 1} title`} value={m.title} maxLength={80} placeholder={`Module ${mi + 1}`} className="h-9 min-w-0 flex-1 border-transparent bg-transparent px-2 text-sm font-extrabold shadow-none hover:border-line focus-visible:bg-card"
          onChange={(e) => onChange({ ...m, title: e.target.value })} />
        <span className="hidden shrink-0 text-xs font-bold text-muted-foreground sm:block">{m.lessons.length} lesson{m.lessons.length === 1 ? "" : "s"}{mins ? ` · ${hm(mins)}` : ""}</span>
        <span className="flex shrink-0">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move module ${mi + 1} up`} disabled={mi === 0} onClick={() => onMove(-1)}><ArrowUp /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move module ${mi + 1} down`} disabled={mi === count - 1} onClick={() => onMove(1)}><ArrowDown /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" aria-label={`Remove module ${mi + 1}`} disabled={count === 1} onClick={onRemove}><Trash2 /></Button>
        </span>
      </div>
      {m.lessons.length > 0 && (
        <ol className="divide-y divide-line/70">
          {m.lessons.map((l, i) => (
            <LessonRow key={l.id} lesson={l} n={`${mi + 1}.${i + 1}`} first={i === 0} last={i === m.lessons.length - 1} onChange={(p) => patch(i, p)} onMove={(d) => move(i, d)} onRemove={() => onChange({ ...m, lessons: m.lessons.filter((_, n) => n !== i) })} />
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2 border-t border-dashed border-line/80 p-3 sm:flex-nowrap">
        <Select value={type} onValueChange={(v) => setType(v as DraftLesson["type"])}>
          <SelectTrigger aria-label={`New lesson type for module ${mi + 1}`} className="h-10 w-[118px] shrink-0 bg-card text-xs font-bold"><SelectValue /></SelectTrigger>
          <SelectContent>{LESSON_TYPES.map((t) => <SelectItem key={t} value={t}>{lessonMeta[t].label}</SelectItem>)}</SelectContent>
        </Select>
        <Input aria-label={`New lesson title for module ${mi + 1}`} value={draft} maxLength={120} disabled={full} placeholder={mi === 0 && !m.lessons.length ? "e.g. Welcome and course overview" : "Add a lesson"}
          className="h-10 min-w-0 flex-1 basis-40" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="soft" className="h-10 shrink-0" disabled={!draft.trim() || full} onClick={add}><Plus />Lesson</Button>
      </div>
    </li>
  );
}

export function CourseCurriculum({ x, setExtra, issue }: DetailProps) {
  const lessons = x.modules.flatMap((m) => m.lessons);
  const mins = lessons.reduce((n, l) => n + (Number.isFinite(l.minutes) ? l.minutes : 0), 0);
  const setModule = (i: number, m: DraftModule) => setExtra({ modules: x.modules.map((v, n) => (n === i ? m : v)) });
  const moveModule = (i: number, d: -1 | 1) => {
    const next = x.modules.slice();
    const [m] = next.splice(i, 1);
    next.splice(i + d, 0, m!);
    setExtra({ modules: next });
  };
  const error = errFor(issue, "create-curriculum");
  return (
    <>
      <div id="create-curriculum" tabIndex={-1} className="space-y-3 outline-none">
        <SubHead
          title="Modules and lessons"
          text="Type a lesson title and press Enter. Tap the eye to make a lesson a free preview."
          aside={<span className="rounded-full bg-ice px-2.5 py-1 text-xs font-extrabold tabular-nums text-cobalt">{x.modules.length} module{x.modules.length === 1 ? "" : "s"} · {lessons.length}/{MAX_CREATE_LESSONS} lessons{mins ? ` · ${hm(mins)}` : ""}</span>}
        />
        <ol className="space-y-3">
          {x.modules.map((m, i) => (
            <ModuleCard key={m.id} m={m} mi={i} count={x.modules.length} total={lessons.length} onChange={(v) => setModule(i, v)} onMove={(d) => moveModule(i, d)} onRemove={() => setExtra({ modules: x.modules.filter((_, n) => n !== i) })} />
          ))}
        </ol>
        {x.modules.length < 12 && (
          <button type="button" onClick={() => setExtra({ modules: [...x.modules, { id: newId(), title: `Module ${x.modules.length + 1}`, lessons: [] }] })}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-cobalt-100 py-3 text-sm font-extrabold text-cobalt transition-colors hover:border-cobalt hover:bg-ice/60">
            <Plus className="h-4 w-4" />Add module
          </button>
        )}
        {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
        <p className="flex items-start gap-2 text-xs text-muted-foreground"><Download className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cobalt" />Learning materials such as worksheets and slides are <span className="font-bold text-foreground">Material</span> lessons. Attach videos and files after saving.</p>
      </div>
      <Divider />
      <OptionCards label="Student access" value={x.drip} onChange={(drip) => setExtra({ drip })} options={[
        { value: "all", title: "Everything at once", text: "Students open any module straight after enrolling.", icon: InfinityIcon },
        { value: "scheduled", title: "One module a week", text: "Module 2 opens a week after enrolling, and so on.", icon: CalendarClock },
      ]} />
      <div className="rounded-[16px] border border-line px-4">
        <ToggleRow id="create-certificate" label="Certificate of completion" description="Awarded automatically when a student finishes every lesson." checked={x.certificate} onChange={(certificate) => setExtra({ certificate })} />
      </div>
      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><BadgeCheck className="h-4 w-4 text-cobalt" />Students keep lifetime access after they pay.</p>
    </>
  );
}

// ---------------- Digital downloads ----------------
const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 5) : "FILE");
function fileIcon(f: { mime: string; name: string }) {
  const e = extOf(f.name);
  if (f.mime.startsWith("image/")) return FileImage;
  if (f.mime.startsWith("audio/")) return FileAudio;
  if (f.mime.startsWith("video/")) return FileVideo;
  if (["ZIP", "RAR", "7Z"].includes(e) || f.mime.includes("zip")) return FileArchive;
  return FileText;
}
const FORMATS = ["PDF", "EPUB", "ZIP", "DOCX", "MP3", "MP4", "PNG"];

export function DownloadFiles({ x, setExtra, issue }: DetailProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [problem, setProblem] = useState("");
  const add = async (list: FileList | null) => {
    const picked = Array.from(list ?? []);
    if (!picked.length) return;
    const bad = picked.find((f) => f.size > MAX_FILE || !f.size);
    setProblem(bad ? `${bad.name} ${bad.size ? "is larger than 500 MB" : "is empty"}. Other files were added.` : "");
    const ok = picked.filter((f) => f.size <= MAX_FILE && f.size > 0);
    const at = new Date().toISOString();
    const next: ProductFile[] = [];
    setProgress({ done: 0, total: ok.length });
    for (const f of ok) {
      const id = newId();
      if (previewable(f.type)) sessionPreviews.set(id, URL.createObjectURL(f));
      next.push({ id, name: f.name, size: f.size, mime: f.type || "application/octet-stream", version: 1, uploadedAt: at, history: [] });
      setProgress({ done: next.length, total: ok.length });
      await new Promise((r) => setTimeout(r, 120));
    }
    setExtra({ files: [...x.files, ...next] });
    setProgress(null);
    if (ref.current) ref.current.value = "";
  };
  const remove = (f: ProductFile) => {
    const url = sessionPreviews.get(f.id);
    if (url) URL.revokeObjectURL(url);
    sessionPreviews.delete(f.id);
    setExtra({ files: x.files.filter((v) => v.id !== f.id) });
  };
  const total = x.files.reduce((n, f) => n + f.size, 0);
  const busy = progress !== null;
  return (
    <div className="space-y-4">
      <button
        type="button"
        id="create-files"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void add(e.dataTransfer.files); }}
        aria-describedby="create-files-hint"
        className={cn("create-drop flex w-full flex-col items-center justify-center gap-3 rounded-[20px] border-[1.5px] border-dashed px-5 py-8 text-center transition-all", drag ? "is-drag border-cobalt bg-ice" : problem ? "border-destructive/60 bg-destructive/5" : "border-cobalt-100 bg-soft/40 hover:border-cobalt hover:bg-ice/50")}
      >
        <span className="create-drop-icon grid h-14 w-14 place-items-center rounded-[18px] bg-card text-cobalt shadow-sm ring-1 ring-line">{busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}</span>
        <span>
          <span className="block text-[15px] font-extrabold">{drag ? "Drop to add files" : <>Drag files here or <span className="text-cobalt underline underline-offset-2">browse</span></>}</span>
          <span id="create-files-hint" className="mt-1 block text-xs text-muted-foreground">Any format · up to 500 MB each · add as many as you need</span>
        </span>
        <span className="flex flex-wrap justify-center gap-1.5" aria-hidden="true">
          {FORMATS.map((f) => <span key={f} className="rounded-md bg-card px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-muted-foreground ring-1 ring-line">{f}</span>)}
        </span>
      </button>
      <input ref={ref} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void add(e.target.files)} />
      {busy && (
        <div role="status" className="rounded-[14px] border border-line bg-card p-3">
          <div className="flex items-center justify-between text-xs font-bold"><span>Adding files…</span><span className="tabular-nums text-muted-foreground">{progress.done} of {progress.total}</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-cobalt transition-[width] duration-200" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 100}%` }} /></div>
        </div>
      )}
      {(problem || errFor(issue, "create-files")) && <p role="alert" className="text-xs font-semibold text-destructive">{problem || errFor(issue, "create-files")}</p>}
      {x.files.length > 0 && (
        <div>
          <SubHead title="Included in this purchase" aside={<span className="text-xs font-bold tabular-nums text-muted-foreground">{x.files.length} file{x.files.length === 1 ? "" : "s"} · {fileSize(total)}</span>} />
          <ul className="mt-2.5 divide-y divide-line/70 overflow-hidden rounded-[16px] border border-line">
            {x.files.map((f) => {
              const Icon = fileIcon(f);
              const url = sessionPreviews.get(f.id);
              return (
                <li key={f.id} className="create-file flex items-center gap-3 bg-card px-3 py-2.5">
                  {url && f.mime.startsWith("image/") ? (
                    <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-[10px] object-cover ring-1 ring-line" />
                  ) : (
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-ice text-cobalt"><Icon className="h-5 w-5" /><span className="absolute -bottom-1 -right-1 rounded bg-cobalt px-1 text-[8px] font-extrabold leading-4 text-primary-foreground">{extOf(f.name)}</span></span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{f.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />Ready · {fileSize(f.size)}</span>
                  </span>
                  {url && <Button asChild size="sm" variant="ghost" className="shrink-0"><a href={url} target="_blank" rel="noreferrer" aria-label={`Preview ${f.name}`}><Eye />Preview</a></Button>}
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9 shrink-0 hover:text-destructive" aria-label={`Remove ${f.name}`} onClick={() => remove(f)}><Trash2 /></Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DownloadDelivery({ x, setExtra }: DetailProps) {
  return (
    <>
      <OptionCards label="Licence" columns={3} value={x.license} onChange={(license) => setExtra({ license })} options={[
        { value: "personal", title: "Personal use", text: "For the buyer's own projects.", icon: User },
        { value: "commercial", title: "Commercial use", text: "Use in client or paid work.", icon: Briefcase },
        { value: "extended", title: "Extended", text: "Resell inside their own products.", icon: Repeat },
      ]} />
      <div className="grid gap-5 @xl:grid-cols-2">
        <Segmented label="Downloads per buyer" value={x.limit} onChange={(limit) => setExtra({ limit })} options={[[3, "3"], [5, "5"], [10, "10"], [0, "Unlimited"]]} tip="Stops a single purchase link being shared widely." />
        <Segmented label="Link stays active" value={x.expiryDays} onChange={(expiryDays) => setExtra({ expiryDays })} options={[[0, "Forever"], [7, "7 days"], [30, "30 days"], [90, "90 days"]]} />
      </div>
      <div className="divide-y divide-line/70 rounded-[16px] border border-line px-4">
        <ToggleRow id="create-instant" label="Email the download link instantly" description="Buyers get their files the moment payment clears." checked={x.instantEmail} onChange={(instantEmail) => setExtra({ instantEmail })} />
        <ToggleRow id="create-watermark" label="Watermark PDFs" description="Stamps the buyer's email on each page to discourage sharing." checked={x.watermark} onChange={(watermark) => setExtra({ watermark })} />
      </div>
    </>
  );
}

// ---------------- Live sessions ----------------
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
function quickStarts(now = new Date()) {
  const at = (days: number, h: number) => { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, h, 0); return toLocalInput(d); };
  const toSat = ((6 - now.getDay() + 7) % 7) || 7;
  return [["Tomorrow, 6 pm", at(1, 18)], ["Saturday, 10 am", at(toSat, 10)], ["In 2 weeks, 6 pm", at(14, 18)]] as const;
}
export const browserZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "your local time"; } catch { return "your local time"; } };

function Stepper({ id, value, onChange, min = 1, label, invalid, describedBy }: { id: string; value: number; onChange: (v: number) => void; min?: number; label: string; invalid?: boolean; describedBy?: string }) {
  const n = Number.isFinite(value) ? value : 0;
  return (
    <div className="flex items-center rounded-[14px] border border-input bg-card">
      <button type="button" aria-label={`Fewer ${label}`} disabled={n <= min} onClick={() => onChange(Math.max(min, n - 1))} className="grid h-11 w-11 shrink-0 place-items-center text-cobalt disabled:text-muted-foreground/50"><Minus className="h-4 w-4" /></button>
      <Input id={id} type="number" min={min} step="1" aria-invalid={invalid || undefined} aria-describedby={describedBy} value={Number.isNaN(value) ? "" : value}
        className="h-11 min-w-0 flex-1 border-0 text-center text-[15px] font-extrabold tabular-nums shadow-none focus-visible:ring-0"
        onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))} />
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(n + 1)} className="grid h-11 w-11 shrink-0 place-items-center text-cobalt"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export function LiveSchedule({ form, x, set, setExtra, issue }: DetailProps) {
  const start = Date.parse(form.date);
  const valid = Number.isFinite(start);
  const end = valid ? new Date(start + x.durationMins * 60_000) : null;
  const t = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
  return (
    <>
      <div className="grid gap-4 @xl:grid-cols-[minmax(0,1fr)_200px]">
        <div className="space-y-2.5">
          <CreateField id="create-date" label="Starts" required error={errFor(issue, "create-date")} hint={`Times are in ${browserZone()}.`}>
            <Input id="create-date" type="datetime-local" aria-required="true" aria-invalid={!!errFor(issue, "create-date") || undefined} value={form.date.slice(0, 16)} onChange={(e) => set({ date: e.target.value })} className="h-11 font-bold" />
          </CreateField>
          <div className="flex flex-wrap gap-1.5">
            {quickStarts().map(([l, v]) => (
              <button key={l} type="button" onClick={() => set({ date: v })} aria-pressed={form.date.slice(0, 16) === v}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors", form.date.slice(0, 16) === v ? "border-cobalt bg-ice text-cobalt" : "border-line text-muted-foreground hover:border-cobalt-100 hover:text-cobalt")}>
                <CalendarDays className="h-3.5 w-3.5" />{l}
              </button>
            ))}
          </div>
        </div>
        <div className={cn("create-date-tile flex items-center gap-3 rounded-[18px] border p-3 @xl:flex-col @xl:items-stretch @xl:p-0", valid ? "border-cobalt-100 bg-card" : "border-dashed border-line bg-soft/40")} aria-live="polite">
          {valid && end ? (
            <>
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[14px] bg-cobalt text-primary-foreground @xl:h-auto @xl:w-auto @xl:rounded-b-none @xl:rounded-t-[17px] @xl:py-2.5">
                <span className="text-center leading-none"><span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-lime">{new Date(start).toLocaleDateString("en-GB", { month: "short" })}</span><span className="block text-2xl font-extrabold">{new Date(start).getDate()}</span></span>
              </div>
              <div className="min-w-0 @xl:px-3 @xl:pb-3">
                <p className="text-sm font-extrabold">{new Date(start).toLocaleDateString("en-GB", { weekday: "long" })}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t(new Date(start))} – {t(end)}</p>
              </div>
            </>
          ) : (
            <p className="flex items-center gap-2 p-1 text-xs font-semibold text-muted-foreground @xl:p-4 @xl:text-center"><CalendarDays className="h-4 w-4 shrink-0 text-cobalt" />Pick a date to see how it reads to attendees</p>
          )}
        </div>
      </div>
      <Segmented id="create-length" label="Length" value={x.durationMins} onChange={(durationMins) => setExtra({ durationMins })} options={[[30, "30 min"], [60, "1 hour"], [90, "1.5 hours"], [120, "2 hours"], [180, "3 hours"]]} />
      {errFor(issue, "create-length") && <p role="alert" className="-mt-4 text-xs font-semibold text-destructive">{errFor(issue, "create-length")}</p>}
      <div className="grid gap-3 @md:grid-cols-[220px_minmax(0,1fr)] @md:items-end">
        <CreateField id="create-capacity" label="Seats available" required error={errFor(issue, "create-capacity")} tip="Registration closes automatically when seats run out.">
          <Stepper id="create-capacity" label="seats" value={form.capacity} onChange={(capacity) => set({ capacity })} invalid={!!errFor(issue, "create-capacity")} />
        </CreateField>
        <div className="flex flex-wrap gap-1.5 pb-0.5">
          {[10, 30, 50, 100].map((n) => (
            <button key={n} type="button" aria-pressed={form.capacity === n} onClick={() => set({ capacity: n })} className={cn("rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums transition-colors", form.capacity === n ? "border-cobalt bg-ice text-cobalt" : "border-line text-muted-foreground hover:text-cobalt")}>{n} seats</button>
          ))}
        </div>
      </div>
    </>
  );
}

export function LiveVenue({ form, x, setExtra, issue }: DetailProps) {
  const allocated = x.tickets.reduce((n, t) => n + (Number.isFinite(t.quantity) ? t.quantity : 0), 0);
  const presets = ["Early bird", "Standard", "VIP"];
  const addTicket = () => {
    const name = presets.find((p) => !x.tickets.some((t) => t.name === p)) ?? "";
    setExtra({ tickets: [...x.tickets, { id: newId(), name, price: Number.isFinite(form.price) ? form.price : 0, quantity: Math.max(1, (Number.isFinite(form.capacity) ? form.capacity : 1) - allocated) }] });
  };
  const patch = (id: string, p: Partial<CreateExtras["tickets"][number]>) => setExtra({ tickets: x.tickets.map((t) => (t.id === id ? { ...t, ...p } : t)) });
  return (
    <>
      <OptionCards label="Where it happens" value={x.venue} onChange={(venue) => setExtra({ venue })} options={[
        { value: "online", title: "Online", text: "Zoom, Google Meet or any video link.", icon: Video },
        { value: "in_person", title: "In person", text: "A physical venue attendees travel to.", icon: MapPin },
      ]} />
      {x.venue === "online" ? (
        <CreateField id="create-link" label="Meeting link" hint="Only registered attendees see this. Needed before you publish." error={errFor(issue, "create-link")}>
          <Input id="create-link" type="url" inputMode="url" value={x.link} placeholder="https://zoom.us/j/…" aria-invalid={!!errFor(issue, "create-link") || undefined} onChange={(e) => setExtra({ link: e.target.value })} />
        </CreateField>
      ) : (
        <CreateField id="create-address" label="Venue address" required error={errFor(issue, "create-address")}>
          <Input id="create-address" value={x.address} maxLength={200} placeholder="e.g. 12 Admiralty Way, Lekki, Lagos" aria-required="true" aria-invalid={!!errFor(issue, "create-address") || undefined} onChange={(e) => setExtra({ address: e.target.value })} />
        </CreateField>
      )}
      <Divider />
      <div id="create-tickets" tabIndex={-1} className="space-y-3 outline-none">
        <SubHead title="Ticket types" text={x.tickets.length ? `${allocated} of ${Number.isFinite(form.capacity) ? form.capacity : 0} seats allocated` : "Optional. Without ticket types everyone registers at your ticket price."}
          aside={x.tickets.length < 5 && <Button type="button" size="sm" variant="soft" onClick={addTicket}><TicketIcon />Add ticket</Button>} />
        {x.tickets.length > 0 && (
          <ul className="space-y-2.5">
            {x.tickets.map((t, i) => (
              <li key={t.id} className="create-ticket relative grid gap-2.5 rounded-[16px] border border-line bg-card p-3 pl-5 @xl:grid-cols-[minmax(0,1fr)_150px_110px_auto] @xl:items-end">
                <CreateField id={`ticket-name-${i}`} label="Name"><Input id={`ticket-name-${i}`} value={t.name} maxLength={40} placeholder="e.g. Early bird" onChange={(e) => patch(t.id, { name: e.target.value })} /></CreateField>
                <CreateField id={`ticket-price-${i}`} label="Price"><PriceInput id={`ticket-price-${i}`} value={t.price} onChange={(price) => patch(t.id, { price })} placeholder="0" /></CreateField>
                <CreateField id={`ticket-qty-${i}`} label="Seats"><Input id={`ticket-qty-${i}`} type="number" min="1" step="1" value={Number.isNaN(t.quantity) ? "" : t.quantity} onChange={(e) => patch(t.id, { quantity: e.target.value === "" ? NaN : Number(e.target.value) })} /></CreateField>
                <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-2 h-8 w-8 hover:text-destructive @xl:static @xl:h-10 @xl:w-10" aria-label={`Remove ${t.name || "ticket"}`} onClick={() => setExtra({ tickets: x.tickets.filter((v) => v.id !== t.id) })}><Trash2 /></Button>
              </li>
            ))}
          </ul>
        )}
        {errFor(issue, "create-tickets") && <p role="alert" className="text-xs font-semibold text-destructive">{errFor(issue, "create-tickets")}</p>}
      </div>
      <Divider />
      <div>
        <SubHead title="Reminders and replay" text="Sent automatically to everyone registered." />
        <div className="mt-2 divide-y divide-line/70 rounded-[16px] border border-line px-4">
          <ToggleRow id="create-rem-week" label="1 week before" checked={x.reminders.week} onChange={(week) => setExtra({ reminders: { ...x.reminders, week } })} />
          <ToggleRow id="create-rem-day" label="1 day before" checked={x.reminders.day} onChange={(day) => setExtra({ reminders: { ...x.reminders, day } })} />
          <ToggleRow id="create-rem-hour" label="1 hour before" checked={x.reminders.hour} onChange={(hour) => setExtra({ reminders: { ...x.reminders, hour } })} />
          <ToggleRow id="create-replay" label="Offer a replay" description="Attendees can rewatch the recording afterwards." checked={x.replay} onChange={(replay) => setExtra({ replay })} />
        </div>
      </div>
    </>
  );
}

// ---------------- Services ----------------
const TIERS = ["Basic", "Standard", "Premium"];
export function ServicePackages({ form, x, set, setExtra, issue }: DetailProps) {
  const make = (name: string, n: number): ServicePackage => ({
    id: newId(), name, description: "", price: n === 0 && Number.isFinite(form.price) && form.price > 0 ? form.price : NaN, days: Math.max(1, form.duration || 7), revisions: 1,
  });
  const patch = (id: string, p: Partial<ServicePackage>) => setExtra({ packages: x.packages.map((v) => (v.id === id ? { ...v, ...p } : v)) });
  const error = errFor(issue, "create-packages");
  return (
    <>
      <div id="create-packages" tabIndex={-1} className="space-y-3 outline-none">
        {x.packages.length === 0 ? (
          <div className="create-empty rounded-[18px] border-[1.5px] border-dashed border-cobalt-100 bg-soft/40 p-5 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-card text-cobalt shadow-sm ring-1 ring-line"><Package className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-extrabold">No packages yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">Tiers let clients choose how much they need. Each has its own price, delivery time and revisions.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => setExtra({ packages: TIERS.map(make) })}><Package />Add Basic, Standard and Premium</Button>
              <Button type="button" variant="outline" onClick={() => setExtra({ packages: [make("Basic", 0)] })}>One package</Button>
            </div>
          </div>
        ) : (
          <>
            <ul className={cn("grid gap-3", x.packages.length > 1 && "@xl:grid-cols-2")}>
              {x.packages.map((p, i) => (
                <li key={p.id} className={cn("create-package relative flex flex-col gap-3 rounded-[18px] border-[1.5px] bg-card p-4", i === 1 ? "border-cobalt-100" : "border-line")}>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cobalt px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary-foreground">Tier {i + 1}</span>
                    <span className={cn("ml-auto tabular-nums", Number.isFinite(p.price) ? "text-lg font-extrabold" : "text-xs font-bold text-muted-foreground")}>{Number.isFinite(p.price) ? (p.price ? naira(p.price) : "Free") : "Set a price"}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" aria-label={`Remove ${p.name || `tier ${i + 1}`}`} onClick={() => setExtra({ packages: x.packages.filter((v) => v.id !== p.id) })}><Trash2 /></Button>
                  </div>
                  <CreateField id={`pkg-name-${i}`} label="Package name"><Input id={`pkg-name-${i}`} value={p.name} maxLength={40} placeholder={TIERS[i] ?? "Package"} onChange={(e) => patch(p.id, { name: e.target.value })} /></CreateField>
                  <CreateField id={`pkg-desc-${i}`} label="What's included" count={`${p.description.length}/200`}><Textarea id={`pkg-desc-${i}`} rows={2} maxLength={200} value={p.description} placeholder={["Logo and colour palette", "Logo, palette and social kit", "Full brand guide and templates"][i] ?? "Deliverables in this tier"} onChange={(e) => patch(p.id, { description: e.target.value })} /></CreateField>
                  <CreateField id={`pkg-price-${i}`} label="Price" required><PriceInput id={`pkg-price-${i}`} value={p.price} placeholder={["20000", "45000", "90000"][i] ?? "20000"} onChange={(price) => patch(p.id, { price })} /></CreateField>
                  <div className="grid grid-cols-2 gap-2.5">
                    <CreateField id={`pkg-days-${i}`} label="Delivery (days)"><Input id={`pkg-days-${i}`} type="number" min="1" step="1" value={Number.isNaN(p.days) ? "" : p.days} onChange={(e) => patch(p.id, { days: e.target.value === "" ? NaN : Number(e.target.value) })} /></CreateField>
                    <CreateField id={`pkg-rev-${i}`} label="Revisions"><Input id={`pkg-rev-${i}`} type="number" min="0" step="1" value={Number.isNaN(p.revisions) ? "" : p.revisions} onChange={(e) => patch(p.id, { revisions: e.target.value === "" ? NaN : Number(e.target.value) })} /></CreateField>
                  </div>
                </li>
              ))}
            </ul>
            {x.packages.length < MAX_PACKAGES && <Button type="button" variant="soft" size="sm" onClick={() => setExtra({ packages: [...x.packages, make(TIERS[x.packages.length] ?? "", x.packages.length)] })}><Plus />Add tier</Button>}
          </>
        )}
        {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
      </div>
      {x.packages.length === 0 && (
        <>
          <Divider />
          <Segmented id="create-delivery" label="Delivery time" value={form.duration} onChange={(duration) => set({ duration })} options={[[1, "1 day"], [3, "3 days"], [7, "1 week"], [14, "2 weeks"], [30, "1 month"]]} tip="Packages set their own delivery time once you add them." />
          {errFor(issue, "create-delivery") && <p role="alert" className="-mt-4 text-xs font-semibold text-destructive">{errFor(issue, "create-delivery")}</p>}
        </>
      )}
    </>
  );
}

export function ServiceBrief({ x, setExtra }: DetailProps) {
  const reqs = x.requirements.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <>
      <div>
        <SubHead title="What you need from the client" text="Asked straight after they order, so you can start without back-and-forth." />
        <div className="mt-2.5"><ListEditor id="create-reqs" label="Add a question for the client" placeholder="e.g. Your business name" items={reqs} max={10} onChange={(v) => setExtra({ requirements: v.join("\n") })} empty="No questions yet. Clients can still message you after ordering." examples={["Your business name", "Links to brands you like", "Preferred colours"]} /></div>
      </div>
      <Divider />
      <OptionCards label="Refunds" columns={3} value={x.refund} onChange={(refund) => setExtra({ refund })} options={[
        { value: "before_start", title: "Before work starts", text: "Full refund until you begin.", icon: ShieldCheck },
        { value: "full", title: "Any time", text: "Refund on request, no questions.", icon: RefreshCw },
        { value: "none", title: "No refunds", text: "All sales are final.", icon: X },
      ]} />
    </>
  );
}

// ---------------- Coaching ----------------
function AvailabilitySummary() {
  const { state } = useCreator();
  const a = state.availability;
  const on = a.days.map((d, i) => ({ ...d, day: DAYS[i]!.slice(0, 3) })).filter((d) => d.enabled);
  return (
    <div className={cn("flex flex-col gap-3 rounded-[16px] border p-4 sm:flex-row sm:items-center", on.length ? "border-line bg-card" : "border-dashed border-cobalt-100 bg-soft/40")}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-ice text-cobalt"><Clock className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold">{on.length ? "Your weekly hours" : "Set your weekly hours"}</p>
        {on.length ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {on.map((d) => <span key={d.day} className="rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-bold tabular-nums">{d.day} {d.start}–{d.end}</span>)}
          </div>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">Clients can only book once you choose the days and times you coach.</p>
        )}
        <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{a.timezone.replace(/_/g, " ")} · {a.buffer} min break between sessions</p>
      </div>
      <Button asChild size="sm" variant={on.length ? "outline" : "default"} className="shrink-0"><Link to="/creator/settings/availability">{on.length ? "Edit hours" : "Set hours"}</Link></Button>
    </div>
  );
}

export function CoachingSessions({ form, x, set, setExtra, issue }: DetailProps) {
  return (
    <>
      <Segmented id="create-session-length" label="Session length" value={form.duration} onChange={(duration) => set({ duration })} options={[[30, "30 min"], [45, "45 min"], [60, "1 hour"], [90, "1.5 hours"]]} />
      {errFor(issue, "create-session-length") && <p role="alert" className="-mt-4 text-xs font-semibold text-destructive">{errFor(issue, "create-session-length")}</p>}
      <OptionCards label="How you'll meet" columns={3} value={x.location} onChange={(location) => setExtra({ location })} options={[
        { value: "video", title: "Video call", text: "Meet, Zoom or similar.", icon: Video },
        { value: "phone", title: "Phone", text: "You call the client.", icon: Phone },
        { value: "in_person", title: "In person", text: "Meet at an agreed place.", icon: MapPin },
      ]} />
      {x.location === "video" && (
        <CreateField id="create-meet" label="Meeting link" hint="Sent to clients with their booking. Needed before you publish." error={errFor(issue, "create-meet")}>
          <Input id="create-meet" type="url" inputMode="url" value={x.meetingLink} placeholder="https://meet.google.com/…" aria-invalid={!!errFor(issue, "create-meet") || undefined} onChange={(e) => setExtra({ meetingLink: e.target.value })} />
        </CreateField>
      )}
      <AvailabilitySummary />
    </>
  );
}

export function CoachingRules({ x, setExtra }: DetailProps) {
  return (
    <>
      <div className="grid gap-5 @xl:grid-cols-2">
        <Segmented label="Minimum notice" value={x.noticeHours} onChange={(noticeHours) => setExtra({ noticeHours })} options={[[2, "2 hrs"], [12, "12 hrs"], [24, "1 day"], [48, "2 days"]]} tip="How far ahead clients must book." />
        <Segmented label="Book up to" value={x.windowDays} onChange={(windowDays) => setExtra({ windowDays })} options={[[14, "2 wks"], [30, "1 month"], [60, "2 months"], [90, "3 months"]]} tip="How far into the future clients can book." />
        <Segmented label="Reschedule until" value={x.rescheduleHours} onChange={(rescheduleHours) => setExtra({ rescheduleHours })} options={[[12, "12 hrs"], [24, "1 day"], [48, "2 days"]]} tip="Before the session starts." />
        <Segmented label="Cancel until" value={x.cancelHours} onChange={(cancelHours) => setExtra({ cancelHours })} options={[[12, "12 hrs"], [24, "1 day"], [48, "2 days"]]} tip="Before the session starts." />
      </div>
      <div className="rounded-[16px] border border-line px-4">
        <ToggleRow id="create-refund-cancel" label="Refund cancelled sessions" description="Clients who cancel in time get their money back." checked={x.refundOnCancel} onChange={(refundOnCancel) => setExtra({ refundOnCancel })} />
      </div>
      <Divider />
      <div>
        <SubHead title="Before the first session" text="Questions clients answer when they book, so you arrive prepared." />
        <div className="mt-2.5"><ListEditor id="create-intake" label="Add an intake question" placeholder="e.g. What would you like to focus on?" items={x.intake} max={10} onChange={(intake) => setExtra({ intake })} empty="No intake questions yet." examples={["What would you like to focus on?", "Where are you today?", "What does success look like for you?"]} /></div>
      </div>
    </>
  );
}
