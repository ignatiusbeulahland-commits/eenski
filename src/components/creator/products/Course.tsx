import { DialogActions } from "@/components/shared/DialogActions";
import { Link } from "@tanstack/react-router";
import { BrandingControls } from "@/components/creator/certificates/BrandingControls";
import { IssueCertificateDialog } from "@/components/creator/certificates/IssueDialogs";
import { undoToast } from "@/lib/shared/undo";
import { useState } from "react";
import { ArrowDown, ArrowUp, Award, FileQuestion, FileText, Download, Pencil, Plus, Trash2, Video, Users, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Progress } from "@/components/dashboard-ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/dashboard-ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Field } from "@/components/affiliate/Field";
import { EmptyState, FilterSelect, Panel } from "@/components/affiliate/ui";
import { CertificatePreview, CertificateStyleControls } from "@/components/shared/certificate/CertificateStudio";
import type { CertificateContent } from "@/components/shared/certificate/CertificateArt";
import { certificateCode, type CertificateDesign } from "@/lib/shared/certificate";
import { issuedCertificateCode } from "@/lib/creator/verification";
import {
  LESSON_TYPES,
  certificateEarned,
  courseOf,
  courseTotals,
  lessonTitles,
  newId,
  nextLessonFor,
  quizPassed,
  studentProgress,
  unlockedModules,
  validateQuestion,
  type CourseConfig,
  type CourseLesson,
} from "@/lib/creator/products";
import { shortDate } from "../shared";
import { Metric, MetricGrid, Pill, TextListEditor, ToggleRow, plural, useProduct, type ProductProps } from "./common";
import { CoursePresentationEditor, CourseTopicFields } from "./CourseFields";

const lessonIcon = { video: Video, text: FileText, download: Download, quiz: FileQuestion };
const lessonLabel = { video: "Video", text: "Reading", download: "Resource", quiz: "Quiz" };
const minutes = (n: number) => (n >= 60 ? `${Math.floor(n / 60)}h ${n % 60 ? `${n % 60}m` : ""}`.trim() : `${n}m`);

function useCourse(item: ProductProps["item"]) {
  const p = useProduct(item);
  const course = courseOf(item);
  const save = (next: CourseConfig, log?: string) => p.patchItem({ course: next, lessons: lessonTitles(next) }, log);
  return { ...p, course, save };
}

export function CourseOverview({ item, orders }: ProductProps) {
  const c = courseOf(item);
  const t = courseTotals(c);
  const paid = orders.filter((o) => o.status === "paid");
  const done = paid.filter((o) => studentProgress(o, c) === 100).length;
  return (
    <MetricGrid>
      <Metric label="Students" value={String(paid.length)} />
      <Metric label="Completion rate" value={paid.length ? `${Math.round((done / paid.length) * 100)}%` : "—"} hint={`${done} finished`} />
      <Metric label="Curriculum" value={plural(t.lessons, "lesson")} hint={`${plural(t.modules, "module")} · ${minutes(t.minutes)}`} />
      <Metric label="Certificates issued" value={String(paid.filter((o) => certificateEarned(o, c)).length)} hint={c.certificate.enabled ? "Enabled" : "Off"} />
    </MetricGrid>
  );
}
export const courseChecklist = (item: ProductProps["item"]) => {
  const c = courseOf(item);
  return [
    { label: "Add modules and lessons", done: courseTotals(c).lessons > 0, tab: "curriculum" },
    { label: "Write learning objectives", done: c.objectives.length > 0, tab: "curriculum" },
    { label: "Add an intro video (optional)", done: !!c.presentation.video, tab: "presentation" },
    { label: "Add a quiz (optional)", done: c.quiz.enabled && c.quiz.questions.length > 0, tab: "assessments" },
    { label: "Set up a certificate (optional)", done: c.certificate.enabled, tab: "certificate" },
  ];
};

/** Category, skill and level plus the intro video, images and slide deck students see before enrolling. */
export function Presentation({ item }: ProductProps) {
  const { course, patchItem, update } = useCourse(item);
  const p = course.presentation;
  const count = (p.video ? 1 : 0) + (p.slides ? 1 : 0) + p.images.length;
  return (
    <div className="grid max-w-4xl gap-5">
      <Panel title="Category, skill and level" description="Helps students find the right course.">
        <div className="@container">
          <CourseTopicFields
            category={item.category === "General" ? "" : item.category}
            skill={course.skill}
            level={course.level}
            onChange={(v) => patchItem({
              ...(v.category !== undefined ? { category: v.category.trim() || "General" } : {}),
              course: { ...course, ...(v.skill !== undefined ? { skill: v.skill } : {}), ...(v.level ? { level: v.level } : {}) },
            })}
          />
        </div>
      </Panel>
      <Panel title="Course presentation" description={count ? `${plural(count, "file")} · kept on this device` : "Show students what's inside before they enrol."}>
        <div className="@container">
          <CoursePresentationEditor
            value={p}
            update={(fn) => update((s) => ({ items: s.items.map((i) => (i.id === item.id ? { ...i, course: { ...courseOf(i), presentation: fn(courseOf(i).presentation) } } : i)) }))}
          />
        </div>
      </Panel>
    </div>
  );
}

export function Curriculum({ item }: ProductProps) {
  const { course, save, state } = useCourse(item);
  const [moduleTitle, setModuleTitle] = useState("");
  const [editing, setEditing] = useState<{ moduleId: string; lesson: CourseLesson } | null>(null);
  const [error, setError] = useState("");
  const videos = state.media.filter((m) => m.type === "video");
  const t = courseTotals(course);
  const setModules = (modules: CourseConfig["modules"]) => save({ ...course, modules });
  const moveModule = (i: number, d: -1 | 1) => {
    const next = course.modules.slice();
    const [m] = next.splice(i, 1);
    next.splice(i + d, 0, m!);
    setModules(next);
  };
  const saveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const l = editing.lesson;
    if (!l.title.trim()) return setError("Give this lesson a title.");
    if (!Number.isInteger(l.minutes) || l.minutes < 1) return setError("Enter the lesson length in whole minutes.");
    const lesson = { ...l, title: l.title.trim() };
    setModules(
      course.modules.map((m) =>
        m.id !== editing.moduleId
          ? m
          : { ...m, lessons: m.lessons.some((x) => x.id === l.id) ? m.lessons.map((x) => (x.id === l.id ? lesson : x)) : [...m.lessons, lesson] },
      ),
    );
    toast.success("Lesson saved");
    setEditing(null);
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Panel title="Modules and lessons" description={`${plural(t.modules, "module")} · ${plural(t.lessons, "lesson")} · ${minutes(t.minutes)} total · ${plural(t.previews, "free preview")}`}>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!moduleTitle.trim()) return;
              setModules([...course.modules, { id: newId(), title: moduleTitle.trim(), unlockDay: 0, lessons: [] }]);
              setModuleTitle("");
              toast.success("Module added");
            }}
          >
            <Label htmlFor="module-title" className="sr-only">New module title</Label>
            <Input id="module-title" value={moduleTitle} maxLength={120} placeholder="New module, e.g. Getting started" onChange={(e) => setModuleTitle(e.target.value)} />
            <Button type="submit" disabled={!moduleTitle.trim()}>
              <Plus />
              Add module
            </Button>
          </form>
          {!course.modules.length && (
            <EmptyState compact icon={GraduationCap} title="Build your curriculum" description="Add a module, then add video, reading, resource or quiz lessons inside it." />
          )}
        </Panel>
        {course.modules.map((m, i) => (
          <section key={m.id} className="surface overflow-hidden" aria-label={`Module ${i + 1}: ${m.title}`}>
            <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-ice text-xs font-extrabold text-cobalt">{i + 1}</span>
              <Label htmlFor={`m-${m.id}`} className="sr-only">Module title</Label>
              <Input
                id={`m-${m.id}`}
                defaultValue={m.title}
                className="h-10 min-w-0 flex-1 border-transparent font-bold shadow-none hover:border-line"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== m.title) setModules(course.modules.map((x) => (x.id === m.id ? { ...x, title: v } : x)));
                }}
              />
              <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Move module up" disabled={i === 0} onClick={() => moveModule(i, -1)}><ArrowUp /></Button>
              <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Move module down" disabled={i === course.modules.length - 1} onClick={() => moveModule(i, 1)}><ArrowDown /></Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                aria-label={`Delete module ${m.title}`}
                onClick={() => {
                  const before = course;
                  setModules(course.modules.filter((x) => x.id !== m.id));
                  undoToast(`Module "${m.title}" deleted`, () => save(before));
                }}
              >
                <Trash2 />
              </Button>
            </header>
            <ul className="divide-y">
              {m.lessons.map((l) => {
                const Icon = lessonIcon[l.type];
                const video = videos.find((v) => v.id === l.mediaId);
                return (
                  <li key={l.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-cobalt" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lessonLabel[l.type]} · {minutes(l.minutes)}
                        {l.type === "video" && (video ? ` · ${video.name}` : " · No video attached")}
                      </p>
                      {l.preview && <div className="mt-1"><Pill tone="success">Free preview</Pill></div>}
                    </div>
                    <Button size="icon" variant="ghost" className="h-9 w-9" aria-label={`Edit lesson ${l.title}`} onClick={() => { setError(""); setEditing({ moduleId: m.id, lesson: l }); }}><Pencil /></Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      aria-label={`Delete lesson ${l.title}`}
                      onClick={() => {
                        const before = course;
                        setModules(course.modules.map((x) => (x.id === m.id ? { ...x, lessons: x.lessons.filter((y) => y.id !== l.id) } : x)));
                        undoToast(`Lesson "${l.title}" deleted`, () => save(before));
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                );
              })}
            </ul>
            <div className="px-4 py-3">
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  setError("");
                  setEditing({ moduleId: m.id, lesson: { id: newId(), title: "", type: "video", minutes: 10, preview: false, mediaId: "" } });
                }}
              >
                <Plus />
                Add lesson
              </Button>
            </div>
          </section>
        ))}
      </div>
      <Panel title="Learning objectives" description="What students will be able to do after this course.">
        <TextListEditor
          id="objective"
          label="New learning objective"
          placeholder="e.g. Design a simple brand identity"
          items={course.objectives}
          onChange={(objectives) => save({ ...course, objectives })}
          empty="No objectives yet. Three to five clear outcomes work best."
        />
      </Panel>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing && course.modules.some((m) => m.lessons.some((l) => l.id === editing.lesson.id)) ? "Edit lesson" : "Add lesson"}</DialogTitle>
            <DialogDescription>Choose the lesson format, length and whether it's a free preview.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={saveLesson} className="space-y-4" noValidate>
              <Field id="lesson-title" label="Lesson title">
                <Input id="lesson-title" value={editing.lesson.title} maxLength={120} onChange={(e) => setEditing({ ...editing, lesson: { ...editing.lesson, title: e.target.value } })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-bold">Format</Label>
                  <FilterSelect label="Format"
                    className="w-full sm:w-full"
                    value={editing.lesson.type}
                    onChange={(v) => setEditing({ ...editing, lesson: { ...editing.lesson, type: v as CourseLesson["type"] } })}
                    options={LESSON_TYPES.map((t) => [t, lessonLabel[t]] as [string, string])}
                  />
                </div>
                <Field id="lesson-minutes" label="Length (minutes)">
                  <Input id="lesson-minutes" type="number" min="1" step="1" value={editing.lesson.minutes} onChange={(e) => setEditing({ ...editing, lesson: { ...editing.lesson, minutes: Number(e.target.value) } })} />
                </Field>
              </div>
              {editing.lesson.type === "video" && (
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-bold">Lesson video</Label>
                  <FilterSelect label="Lesson video"
                    className="w-full sm:w-full"
                    value={editing.lesson.mediaId || "none"}
                    onChange={(v) => setEditing({ ...editing, lesson: { ...editing.lesson, mediaId: v === "none" ? "" : v } })}
                    options={[["none", videos.length ? "No video yet" : "Upload videos in Media Library"], ...videos.map((v) => [v.id, v.name] as [string, string])]}
                  />
                </div>
              )}
              <ToggleRow id="lesson-preview" label="Free preview" description="Anyone can watch this lesson before buying." checked={editing.lesson.preview} onChange={(v) => setEditing({ ...editing, lesson: { ...editing.lesson, preview: v } })} />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit">Save lesson</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Assessments({ item, orders }: ProductProps) {
  const { course, save, customer } = useCourse(item);
  const quiz = course.quiz;
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("0");
  const [error, setError] = useState("");
  const attempts = orders.filter((o) => o.status === "paid" && o.quizScore !== undefined);
  const passed = attempts.filter((o) => quizPassed(o, course)).length;
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const q = { prompt, options, answer: Number(answer) };
    const err = validateQuestion(q);
    if (err) return setError(err);
    const kept = options.map((o) => o.trim()).filter(Boolean);
    save({ ...course, quiz: { ...quiz, questions: [...quiz.questions, { id: newId(), prompt: prompt.trim(), options: kept, answer: Number(answer) }] } });
    setOpen(false);
    toast.success("Question added");
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Panel
        title="Final quiz"
        description={`${quiz.questions.length} questions · pass mark ${quiz.passMark}%`}
        actions={
          <Button size="sm" disabled={!quiz.enabled} onClick={() => { setPrompt(""); setOptions(["", "", "", ""]); setAnswer("0"); setError(""); setOpen(true); }}>
            <Plus />
            Add question
          </Button>
        }
      >
        <ToggleRow id="quiz-on" label="Quiz enabled" description="Students take this quiz after the last lesson." checked={quiz.enabled} onChange={(enabled) => save({ ...course, quiz: { ...quiz, enabled } })} />
        <div className="max-w-[12rem] py-3">
          <Field id="pass-mark" label="Pass mark (%)">
            <Input
              id="pass-mark"
              type="number"
              min="1"
              max="100"
              defaultValue={quiz.passMark}
              disabled={!quiz.enabled}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (Number.isInteger(n) && n >= 1 && n <= 100) save({ ...course, quiz: { ...quiz, passMark: n } });
                else { e.target.value = String(quiz.passMark); toast.error("Pass mark must be a whole number from 1 to 100."); }
              }}
            />
          </Field>
        </div>
        {quiz.questions.length ? (
          <ol className="mt-2 space-y-3">
            {quiz.questions.map((q, i) => (
              <li key={q.id} className="rounded-[14px] border p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{i + 1}. {q.prompt}</p>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label={`Delete question ${i + 1}`} onClick={() => { const before = course; save({ ...course, quiz: { ...quiz, questions: quiz.questions.filter((x) => x.id !== q.id) } }); undoToast(`Question ${i + 1} deleted`, () => save(before)); }}><Trash2 /></Button>
                </div>
                <ul className="mt-2 space-y-1">
                  {q.options.map((o, n) => (
                    <li key={n} className={n === q.answer ? "font-semibold text-lime-text" : "text-muted-foreground"}>
                      {n === q.answer ? "✓ " : "· "}{o}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{quiz.enabled ? "No questions yet." : "Turn the quiz on to add questions."}</p>
        )}
      </Panel>
      <Panel title="Results">
        <MetricGrid>
          <Metric label="Attempts" value={String(attempts.length)} />
          <Metric label="Pass rate" value={attempts.length ? `${Math.round((passed / attempts.length) * 100)}%` : "—"} />
        </MetricGrid>
        <ul className="mt-4 divide-y text-sm">
          {attempts.map((o) => (
            <li key={o.id} className="flex justify-between gap-3 py-2">
              <span className="truncate">{customer(o.customerId)?.name ?? "Student"}</span>
              <Pill tone={quizPassed(o, course) ? "success" : "warn"}>{o.quizScore}%</Pill>
            </li>
          ))}
        </ul>
        {!attempts.length && <p className="mt-3 text-sm text-muted-foreground">Scores appear here once students take the quiz.</p>}
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>Multiple choice with one correct answer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={add} className="space-y-4" noValidate>
            <Field id="q-prompt" label="Question">
              <Input id="q-prompt" value={prompt} maxLength={240} onChange={(e) => setPrompt(e.target.value)} />
            </Field>
            <fieldset className="space-y-2">
              <legend className="mb-1 text-[13px] font-bold">Options · select the correct one</legend>
              <RadioGroup value={answer} onValueChange={setAnswer}>
                {options.map((o, n) => (
                  <div key={n} className="flex items-center gap-3">
                    <RadioGroupItem value={String(n)} id={`q-ans-${n}`} aria-label={`Option ${n + 1} is correct`} />
                    <Input aria-label={`Option ${n + 1}`} value={o} maxLength={120} placeholder={`Option ${n + 1}${n > 1 ? " (optional)" : ""}`} onChange={(e) => setOptions(options.map((x, i) => (i === n ? e.target.value : x)))} />
                  </div>
                ))}
              </RadioGroup>
            </fieldset>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Add question</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Students({ item, orders }: ProductProps) {
  const { course, customer, patchOrder } = useCourse(item);
  const [scoring, setScoring] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const paid = orders.filter((o) => o.status === "paid");
  const now = new Date();
  if (!paid.length)
    return <Panel><EmptyState icon={Users} title="No students yet" description="Students appear here when someone enrols. You can also add an enrolment by hand from the Overview tab." /></Panel>;
  return (
    <Panel title="Enrolled students" description="Progress, drip access, quiz results and certificates for each student." bodyClassName="p-0">
      <ul className="divide-y">
        {paid.map((o) => {
          const pct = studentProgress(o, course);
          const next = nextLessonFor(o, course, now);
          const open = unlockedModules(course, o.date, now).length;
          const c = customer(o.customerId);
          return (
            <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c?.name ?? "Student"}</p>
                <p className="truncate text-xs text-muted-foreground">{c?.email} · Enrolled {shortDate(o.date)} · {open}/{course.modules.length} modules open</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={pct} className="h-2 max-w-[14rem]" aria-label={`${pct}% complete`} />
                  <span className="text-xs font-bold tabular-nums">{pct}%</span>
                  {course.quiz.enabled && o.quizScore !== undefined && <Pill tone={quizPassed(o, course) ? "success" : "warn"}>Quiz {o.quizScore}%</Pill>}
                  {certificateEarned(o, course) && <Pill tone="success">Certified</Pill>}
                </div>
                {next && <p className="mt-1 text-xs text-muted-foreground">Next: {next.title}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="soft" disabled={!next} onClick={() => { if (next) { patchOrder(o.id, { completed: [...(o.completed ?? []), next.id] }); toast.success("Lesson marked complete"); } }}>
                  Mark next lesson done
                </Button>
                {course.quiz.enabled && course.quiz.questions.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => { setScore(""); setScoring(o.id); }}>Record quiz score</Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Dialog open={!!scoring} onOpenChange={(v) => !v && setScoring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record quiz score</DialogTitle>
            <DialogDescription>Pass mark is {course.quiz.passMark}%.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(score);
              if (score === "" || !Number.isFinite(n) || n < 0 || n > 100) { toast.error("Enter a score from 0 to 100."); return; }
              if (scoring) patchOrder(scoring, { quizScore: Math.round(n) });
              setScoring(null);
              toast.success(n >= course.quiz.passMark ? "Quiz passed" : "Quiz not passed");
            }}
          >
            <Field id="quiz-score" label="Score (%)">
              <Input id="quiz-score" type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
            </Field>
            <DialogActions><Button type="submit">Save score</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function Certificate({ item, orders }: ProductProps) {
  const { course, save, customer, state } = useCourse(item);
  const cert = course.certificate;
  const issued = orders.filter((o) => certificateEarned(o, course));
  const set = (patch: Partial<CourseConfig["certificate"]>) => save({ ...course, certificate: { ...cert, ...patch } });
  const setDesign = (patch: Partial<CertificateDesign>) => set({ design: { ...cert.design, ...patch } });
  const creatorName = `${state.profile.firstName} ${state.profile.lastName}`.trim();
  const [viewing, setViewing] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const viewed = issued.find((o) => o.id === viewing);
  const content: CertificateContent = {
    learnerName: "Student name",
    courseTitle: item.title,
    title: cert.title || "Certificate of completion",
    issuedAt: new Date().toISOString(),
    code: certificateCode(`${item.id}-sample`),
    creatorName,
    signer: cert.signer || creatorName,
  };
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <div className="min-w-0 space-y-6">
        <Panel title="Certificate settings">
          <ToggleRow id="cert-on" label="Award a certificate" description="Students get it when they finish every lesson." checked={cert.enabled} onChange={(enabled) => set({ enabled })} />
          <ToggleRow id="cert-quiz" label="Require a quiz pass" description={course.quiz.enabled ? `Students must score ${course.quiz.passMark}% or more.` : "Turn on the quiz under Assessments first."} checked={cert.requireQuiz && course.quiz.enabled} onChange={(requireQuiz) => set({ requireQuiz })} />
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field id="cert-title" label="Certificate title">
              <Input id="cert-title" value={cert.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} onBlur={(e) => !e.target.value.trim() && set({ title: "Certificate of completion" })} />
            </Field>
            <Field id="cert-signer" label="Signed by">
              <Input id="cert-signer" value={cert.signer} placeholder={creatorName || "Your name"} maxLength={80} onChange={(e) => set({ signer: e.target.value })} />
            </Field>
          </div>
        </Panel>
        <Panel title="Branding & identity" description="Your colours, type, logos, signatures and seal. Learners can change only the design and accent, never your branding.">
          <BrandingControls design={cert.design} onChange={setDesign} idPrefix={`cert-${item.id}-brand`} signer={cert.signer || creatorName} onSigner={(signer, patch) => set({ signer, ...(patch ? { design: { ...cert.design, ...patch } } : {}) })} />
        </Panel>
        <Panel title="Style learners see first" description="Choose a design and show your name, school or institution. Every certificate you issue opens in this style.">
          <CertificateStyleControls design={cert.design} onChange={setDesign} content={content} full idPrefix={`cert-${item.id}`} filename={`enski-certificate-sample-${item.id}.png`} />
          <div className="mt-4 border-t pt-1">
            <ToggleRow
              id={`cert-${item.id}-learner-style`}
              label="Let learners pick another style"
              description={cert.design.learnerCanChange ? "Learners start with your style and can switch to another design or accent." : "Every learner gets exactly this style."}
              checked={cert.design.learnerCanChange}
              onChange={(learnerCanChange) => setDesign({ learnerCanChange })}
            />
          </div>
        </Panel>
      </div>
      <div className="order-first min-w-0 space-y-6 xl:sticky xl:top-24 xl:order-none">
        <section aria-label="Certificate preview">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-extrabold"><span className="lime-tick" aria-hidden="true" />Live preview</h3>
            {!cert.enabled && <Pill tone="muted">Certificates are off</Pill>}
          </div>
          <CertificatePreview content={content} design={cert.design} filename={`enski-certificate-sample-${item.id}.png`} className={cert.enabled ? "" : "opacity-70"} />
          <p className="mt-2 text-xs text-muted-foreground">Students see their own name, completion date and certificate ID.</p>
        </section>
        <Panel title="Issue by hand" description="For students who completed the course outside an Enski order, or to award a badge with it.">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIssuing(true)} disabled={!cert.enabled}>Issue a certificate</Button>
            <Button asChild variant="outline"><Link to="/creator/badges" search={{ tab: "certificates" }}>See issued certificates</Link></Button>
          </div>
          {!cert.enabled && <p className="mt-2 text-xs text-muted-foreground">Turn on "Award a certificate" first.</p>}
          <IssueCertificateDialog open={issuing} onOpenChange={setIssuing} itemId={item.id} />
        </Panel>
        <Panel title="Issued certificates" description={issued.length ? "Each one uses the style above." : undefined}>
          {issued.length ? (
            <ul className="divide-y text-sm">
              {issued.map((o) => (
                <li key={o.id} className="flex items-center gap-2 py-2">
                  <Award className="h-4 w-4 shrink-0 text-lime-text" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{customer(o.customerId)?.name ?? "Student"}</span>
                  <Button size="sm" variant="quiet" onClick={() => setViewing(o.id)} aria-label={`View certificate for ${customer(o.customerId)?.name ?? "student"}`}>View</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No certificates issued yet.</p>
          )}
        </Panel>
      </div>
      <Dialog open={!!viewed} onOpenChange={(o) => !o && setViewing(null)}>
        {viewed && (
          <DialogContent className="max-w-3xl gap-3 p-4 sm:gap-4 sm:p-6">
            <DialogHeader className="pr-10 text-left">
              <DialogTitle>{customer(viewed.customerId)?.name ?? "Student"}'s certificate</DialogTitle>
              <DialogDescription>Shown in the style learners see first. ID {issuedCertificateCode(item.id, viewed.id)}.</DialogDescription>
            </DialogHeader>
            <CertificatePreview
              design={cert.design}
              filename={`enski-certificate-${item.id}-${viewed.id}.png`}
              content={{ ...content, learnerName: customer(viewed.customerId)?.name ?? "Student", issuedAt: viewed.date, code: issuedCertificateCode(item.id, viewed.id) }}
            />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export function Drip({ item }: ProductProps) {
  const { course, save } = useCourse(item);
  return (
    <Panel title="Drip schedule" description="Release modules over time instead of all at once." className="max-w-3xl">
      <RadioGroup value={course.drip} onValueChange={(v) => save({ ...course, drip: v as CourseConfig["drip"] })} className="grid gap-2 sm:grid-cols-2">
        {([["all", "Everything at once", "Students can open every module after enrolling."], ["scheduled", "Scheduled release", "Each module unlocks a set number of days after enrolment."]] as const).map(([v, l, d]) => (
          <Label key={v} htmlFor={`drip-${v}`} className="flex cursor-pointer gap-3 rounded-[14px] border p-4 has-[[data-state=checked]]:border-cobalt has-[[data-state=checked]]:bg-ice">
            <RadioGroupItem id={`drip-${v}`} value={v} className="mt-0.5" />
            <span><span className="block text-sm font-bold">{l}</span><span className="block text-xs font-normal text-muted-foreground">{d}</span></span>
          </Label>
        ))}
      </RadioGroup>
      {course.drip === "scheduled" && (
        course.modules.length ? (
          <ol className="mt-5 divide-y rounded-[14px] border">
            {course.modules.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-5 font-bold text-cobalt">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{m.title}</span>
                <Label htmlFor={`unlock-${m.id}`} className="text-xs text-muted-foreground">Unlocks on day</Label>
                <Input
                  id={`unlock-${m.id}`}
                  type="number"
                  min="0"
                  className="h-10 w-20"
                  defaultValue={m.unlockDay}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isInteger(n) || n < 0) { e.target.value = String(m.unlockDay); { toast.error("Use a whole number of days, 0 or more."); return; } }
                    save({ ...course, modules: course.modules.map((x) => (x.id === m.id ? { ...x, unlockDay: n } : x)) });
                  }}
                />
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">Add modules in Curriculum to schedule them.</p>
        )
      )}
    </Panel>
  );
}
