import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, Award, BookOpenText, CheckCircle2, Circle, CircleHelp, ClipboardList, Download, FileDown, ListOrdered, Lock, Pause, Play, PlayCircle, RotateCcw, Medal,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { StatusBadge } from "@/components/affiliate/ui";
import { unitWord, type LearnerResource, type ResourceUnit } from "@/lib/learner/catalog";
import {
  courseOutline, currentLessonIndex, isLocked, moduleState, quizStatus, recordQuizAttempt, totalLength, unitLength, unlockDate, type QuizResult,
} from "@/lib/learner/learning";
import { resourceProgress, toggleUnit } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { CourseQuiz } from "./CourseQuiz";
import { CharmFigure } from "@/components/assistant/CharmFigure";
import { StepCurtain } from "@/components/assistant/VictoryCurtain";
import { lookFor } from "@/components/assistant/looks";
import { prefsStore } from "@/lib/assistant/store";
import { shortDate } from "./shared";

export function downloadResource(r: LearnerResource) {
  toast.success("Download started", { description: r.title });
  window.__lovableEvents?.track?.("project.download_accessed", { surface: "learner", resource_type: r.type });
}

/** Used only when the creator didn't write a lesson summary. */
const NOTES: Record<LearnerResource["type"], (lesson: string) => string[]> = {
  Course: (l) => [`The big idea behind "${l}" and why it matters for your work.`, "A short walkthrough you can follow along with.", "One small exercise to try before the next lesson."],
  Ebook: (l) => [`Read "${l}" in one sitting; it takes about ten minutes.`, "Highlight the one idea you'll use this week.", "Jot your answer to the end-of-chapter question."],
  Template: (l) => [`${l}: follow the steps in the file.`, "Replace the sample text with your own.", "Save your copy so it's ready to reuse."],
  Coaching: (l) => [`${l}: everything you need is listed here.`, "Bring one clear question you want answered.", "Keep notes so you can act on them straight after."],
};

const KIND_LABEL = { video: "Video", text: "Reading", download: "Resource", quiz: "Activity" } as const;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Creator-uploaded lesson video kept in this browser, when there is one. */
function useLessonVideo(mediaId: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    setUrl(null);
    if (!mediaId) return;
    let live = true;
    let made: string | null = null;
    void import("@/lib/creator/mediaVault")
      .then(({ getMedia }) => getMedia(mediaId))
      .then((blob) => {
        if (!live || !blob || !blob.type.startsWith("video/")) return;
        made = URL.createObjectURL(blob);
        setUrl(made);
      })
      .catch(() => undefined);
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [mediaId]);
  return url;
}

type Feedback = { title: string; body: string; kind?: "lesson" | "module" } | null;

/**
 * The learning space for an owned resource: course header with progress, the current
 * lesson (media, summary, previous/next, completion), the curriculum by module with
 * done / current / locked states, and the creator's final quiz when there is one.
 */
export function LessonPlayer({ r, purchasedAt, cert, orderLink, initialView }: {
  r: LearnerResource;
  purchasedAt?: string | undefined;
  cert?: { id: string } | undefined;
  orderLink?: { id: string; number: string; date: string } | undefined;
  initialView?: "quiz" | undefined;
}) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const done = useMemo(() => new Set(state.progress[r.id]?.completed ?? []), [state.progress, r.id]);
  const outline = useMemo(() => courseOutline(r), [r]);
  const hasModules = outline.some((m) => m.title);
  const [view, setView] = useState<number | "quiz">(() => (initialView === "quiz" && r.quiz ? "quiz" : currentLessonIndex(r, done, purchasedAt)));
  const [playing, setPlaying] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const look = lookFor(prefsStore.use().look);
  const top = useRef<HTMLDivElement>(null);
  const p = resourceProgress(state, r.id);
  const rec = state.quizzes?.[r.id];
  const qStatus = quizStatus(r, done, rec);
  const idx = view === "quiz" ? -1 : view;
  const unit = idx >= 0 ? r.units[idx] : undefined;
  const isDone = unit ? done.has(unit.id) : false;
  const locked = unit ? isLocked(unit, purchasedAt) : false;
  const word = unitWord(r.type);
  const Word = word.replace(/^./, (c) => c.toUpperCase());
  const video = useLessonVideo(unit?.kind === "video" || (!unit?.kind && r.type === "Course") ? unit?.mediaId : undefined);
  useEffect(() => setPlaying(false), [view]);

  // Storefront courses: the creator's Students view follows the same lessons done.
  const doneKey = [...done].sort().join("|");
  useEffect(() => {
    if (!r.id.startsWith("store:") || !state.profile.email) return;
    void import("@/lib/creator/publicStore").then(({ syncStoreLearning }) => syncStoreLearning(r.id, state.profile.email, { completed: doneKey ? doneKey.split("|") : [] }));
  }, [doneKey, r.id, state.profile.email]);

  const scrollTop = () => top.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  const go = (next: number | "quiz", keepFeedback = false) => {
    setView(next);
    if (!keepFeedback) setFeedback(null);
    scrollTop();
  };
  const moduleOf = (u: ResourceUnit) => outline.find((m) => m.items.some((i) => i.unit.id === u.id));
  const finishedPath = () => void navigate({ to: "/learner/resources/$resourceId/complete", params: { resourceId: r.id } });

  const completeAndContinue = () => {
    if (!unit || locked) return;
    const nowDone = new Set(done).add(unit.id);
    if (!isDone) update((s) => toggleUnit(s, r.id, unit.id));
    const allDone = r.units.every((u) => nowDone.has(u.id));
    if (allDone) {
      if (r.quiz?.questions.length && !rec?.passedAt) {
        setFeedback({ title: "Every lesson done", body: r.quiz.required ? `Last step: pass the final quiz (${r.quiz.passMark}%) to complete the course.` : "Take the optional final quiz to check what you've learned." });
        go("quiz", true);
        return;
      }
      finishedPath();
      return;
    }
    const m = moduleOf(unit);
    const moduleDone = Boolean(m?.title && m.items.every((i) => nowDone.has(i.unit.id)));
    const nextIdx = r.units.findIndex((u, i) => i > idx && !nowDone.has(u.id) && !isLocked(u, purchasedAt));
    const target = nextIdx >= 0 ? nextIdx : idx < r.units.length - 1 ? idx + 1 : idx;
    const left = r.units.length - nowDone.size;
    setFeedback(
      moduleDone
        ? { kind: "module", title: `Module complete: ${m!.title}`, body: `${left} ${left === 1 ? word : `${word}s`} left in the course.` }
        : { kind: "lesson", title: `"${unit.title}" done`, body: `${nowDone.size} of ${r.units.length} ${word}s complete. Keep going.` },
    );
    go(target, true);
  };
  const undo = () => {
    if (!unit) return;
    update((s) => toggleUnit(s, r.id, unit.id));
    setFeedback(null);
  };
  const onQuizSubmit = (result: QuizResult) => {
    update((s) => recordQuizAttempt(s, r.id, result));
    if (r.id.startsWith("store:") && state.profile.email) {
      void import("@/lib/creator/publicStore").then(({ syncStoreLearning }) => syncStoreLearning(r.id, state.profile.email, { quizScore: result.score }));
    }
  };

  const media = r.type === "Course" && unit?.kind !== "text" && unit?.kind !== "download";
  const lessonsLeft = r.units.length - p.done;
  const isLast = idx === r.units.length - 1;
  const nextLabel = isLast ? (r.quiz?.questions.length ? "Go to the final quiz" : p.complete ? "See your completion" : null) : `Next ${word}`;
  const onNext = () => (isLast ? (r.quiz?.questions.length ? go("quiz") : finishedPath()) : go(idx + 1));
  const finalStep = !isDone && p.done + 1 === r.units.length;
  const completeLabel = finalStep ? (r.quiz?.questions.length ? "Complete & take the quiz" : r.type === "Course" ? "Complete course" : "Complete and finish") : "Mark complete & continue";

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Course header */}
      <header className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <img src={r.image} alt="" width={80} height={80} className="size-16 shrink-0 rounded-xl bg-ice object-cover sm:size-20" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-cobalt">{r.type} · {r.category}</p>
            <h1 className="mt-0.5 text-lg font-extrabold leading-tight sm:text-2xl">{r.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">by <span className="font-bold text-foreground">{r.creator}</span></p>
          </div>
        </div>
        <div className="sm:w-56">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-bold">{p.complete ? "Completed" : `${p.done} of ${p.total} ${word}s`}</span>
            <span className="font-extrabold tabular-nums">{p.pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ice" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.pct}>
            <span className={cn("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", p.complete ? "bg-lime" : "bg-cobalt")} style={{ width: `${p.pct}%` }} />
          </div>
          {p.quizPending && p.lessonsDone && <p className="mt-1.5 text-xs font-semibold text-cobalt">Final quiz left</p>}
        </div>
      </header>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {feedback?.kind === "module" ? (
            <StepCurtain key={feedback.title} className="mb-1" eyebrow="Learning milestone" title={feedback.title} pose="clap" then="proud" onClose={() => setFeedback(null)}>
              {feedback.body}
            </StepCurtain>
          ) : feedback && (
            <div role="status" className="screen-in flex items-start gap-3 rounded-xl border border-lime/60 bg-lime-100/70 px-4 py-3">
              {feedback.kind === "lesson" ? (
                <span className="relative -my-2 h-14 w-8 shrink-0" aria-hidden="true">
                  <CharmFigure look={look} pose="thumbsup" then="wink" thenAfter={1800} className="absolute bottom-0 left-1/2 h-14 w-auto max-w-none -translate-x-1/2" />
                </span>
              ) : (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lime-text" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold text-lime-text">{feedback.title}</p>
                <p className="text-muted-foreground">{feedback.body}</p>
              </div>
              <button type="button" onClick={() => setFeedback(null)} className="shrink-0 rounded-full px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-card">Dismiss</button>
            </div>
          )}

          {view === "quiz" && r.quiz ? (
            <CourseQuiz quiz={r.quiz} status={qStatus} record={rec} onSubmit={onQuizSubmit} onFinish={finishedPath} onReview={() => go(currentLessonIndex(r, done, purchasedAt))} lessonsLeft={lessonsLeft} onStart={() => setFeedback(null)} />
          ) : unit ? (
            <section className="surface overflow-hidden" aria-labelledby="lesson-title">
              {locked ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-soft px-6 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-card text-muted-foreground shadow-sm"><Lock className="size-6" aria-hidden="true" /></span>
                  <p className="text-sm font-bold">Opens on {shortDate(unlockDate(unit, purchasedAt)!.toISOString())}</p>
                  <p className="max-w-xs text-xs text-muted-foreground">{r.creator} releases this module {unit.unlockDay} days after you join.</p>
                </div>
              ) : media ? (
                video ? (
                  <video key={video} src={video} controls playsInline preload="metadata" poster={r.image} className="aspect-video w-full bg-midnight" onEnded={() => !isDone && setFeedback({ title: "Video finished", body: "Mark the lesson complete when you're ready to move on." })}>
                    <track kind="captions" />
                  </video>
                ) : (
                  <div className="relative aspect-video overflow-hidden bg-midnight">
                    <img src={r.image} alt="" className={cn("absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-500", playing ? "opacity-30 blur-sm" : "opacity-60")} />
                    <span className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-midnight/30 to-transparent" aria-hidden="true" />
                    <button type="button" onClick={() => setPlaying((v) => !v)} className="lesson-play absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-midnight shadow-lg transition-transform hover:scale-105 active:scale-95 sm:size-20" aria-label={playing ? "Pause lesson" : "Play lesson"}>
                      {playing ? <Pause className="size-7" aria-hidden="true" /> : <Play className="ml-1 size-7" aria-hidden="true" />}
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-on-dark sm:p-5">
                      <p className="text-xs font-bold text-on-dark-muted">{Word} {idx + 1} of {r.units.length} · {unitLength(unit)}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-on-dark/20" aria-hidden="true">
                        <span key={`${unit.id}-${playing}`} className={cn("block h-full rounded-full bg-lime", playing ? "lesson-progress" : isDone ? "w-full" : "w-0")} />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-3 bg-ice px-5 py-4">
                  {unit.kind === "download" ? <FileDown className="size-6 text-cobalt" aria-hidden="true" /> : r.type === "Coaching" ? <ClipboardList className="size-6 text-cobalt" aria-hidden="true" /> : <BookOpenText className="size-6 text-cobalt" aria-hidden="true" />}
                  <p className="text-xs font-bold text-cobalt">{unit.kind ? `${KIND_LABEL[unit.kind]} · ` : ""}{Word} {idx + 1} of {r.units.length} · {unitLength(unit)}</p>
                </div>
              )}
              <div key={unit.id} className="screen-in p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  {moduleOf(unit)?.title && <span>{hasModules ? `Module ${outline.indexOf(moduleOf(unit)!) + 1} · ` : ""}{moduleOf(unit)!.title}</span>}
                  {isDone && <StatusBadge tone="success">Completed</StatusBadge>}
                  {unit.preview && <StatusBadge tone="info">Free preview</StatusBadge>}
                </div>
                <h2 id="lesson-title" className="mt-1.5 text-xl font-extrabold leading-snug sm:text-2xl">{unit.title}</h2>
                {unit.description ? (
                  <p className="mt-3 max-w-prose whitespace-pre-line text-[15px] leading-relaxed">{unit.description}</p>
                ) : (
                  <>
                    <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">In this {word}</p>
                    <ul className="mt-2 max-w-prose space-y-2.5 text-[15px] leading-relaxed">
                      {NOTES[r.type](unit.title).map((n) => (
                        <li key={n} className="flex gap-2.5"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky" aria-hidden="true" />{n}</li>
                      ))}
                    </ul>
                  </>
                )}
                {(unit.kind === "download" || r.downloadable) && !locked && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-soft/60 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-semibold"><FileDown className="size-4 text-cobalt" aria-hidden="true" /> {unit.kind === "download" ? "Lesson file" : "Files for this resource"}</p>
                    <Button size="sm" variant="outline" onClick={() => downloadResource(r)}><Download /> Download</Button>
                  </div>
                )}
                <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" disabled={idx === 0} onClick={() => go(idx - 1)}><ArrowLeft /> Previous</Button>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {isDone && <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={undo}><RotateCcw /> Mark as not done</Button>}
                    {!isDone && !locked && !isLast && <Button variant="outline" className="order-2 sm:order-none" onClick={() => go(idx + 1)}>Next {word} <ArrowRight /></Button>}
                    {!isDone && !locked && <Button className="order-1 sm:order-none" onClick={completeAndContinue}><CheckCircle2 /> {completeLabel}</Button>}
                    {(isDone || locked) && nextLabel && <Button variant={isDone ? "default" : "outline"} onClick={onNext}>{nextLabel} <ArrowRight /></Button>}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
          <a href="#course-content" className="flex items-center justify-center gap-2 rounded-full border bg-card py-2.5 text-sm font-bold text-cobalt lg:hidden"><ListOrdered className="size-4" aria-hidden="true" /> All {word}s</a>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section id="course-content" className="surface scroll-mt-24 overflow-hidden" aria-labelledby="content-title">
            <header className="border-b px-5 py-4">
              <h2 id="content-title" className="flex items-center gap-2.5 text-[15px] font-bold"><span className="lime-tick" aria-hidden="true" />{r.type === "Course" ? "Course content" : `${Word}s`}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.done} of {p.total} done · {totalLength(r.units)}{hasModules ? ` · ${outline.length} modules` : ""}</p>
            </header>
            <div className="lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto">
              {outline.map((m, mi) => {
                const ms = moduleState(m, done);
                return (
                  <div key={`${m.title}-${mi}`} className={cn(mi > 0 && "border-t")}>
                    {m.title && (
                      <div className="flex items-center justify-between gap-3 bg-soft/70 px-5 py-2.5">
                        <p className="min-w-0 text-xs font-extrabold"><span className="text-muted-foreground">Module {mi + 1} · </span>{m.title}</p>
                        {ms.complete ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-[11px] font-bold text-lime-text"><CheckCircle2 className="size-3" aria-hidden="true" /> Done</span>
                        ) : (
                          <span className="shrink-0 text-[11px] font-bold tabular-nums text-muted-foreground">{ms.done}/{ms.total}</span>
                        )}
                      </div>
                    )}
                    <ol className="divide-y">
                      {m.items.map(({ unit: u, index: i }) => {
                        const d = done.has(u.id);
                        const current = view === i;
                        const lock = isLocked(u, purchasedAt);
                        const opens = lock ? unlockDate(u, purchasedAt) : null;
                        return (
                          <li key={u.id}>
                            <button type="button" onClick={() => go(i)} aria-current={current ? "step" : undefined} className={cn("flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-soft/60", current && "bg-ice hover:bg-ice")}>
                              {lock ? <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" /> : d ? <CheckCircle2 className="size-5 shrink-0 text-lime-text" aria-hidden="true" /> : current ? <PlayCircle className="size-5 shrink-0 text-cobalt" aria-hidden="true" /> : <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                              <span className="min-w-0 flex-1">
                                <span className={cn("block text-sm font-semibold", current && "text-cobalt", (d || lock) && !current && "text-muted-foreground")}>{i + 1}. {u.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {u.kind ? `${KIND_LABEL[u.kind]} · ` : ""}{unitLength(u)}
                                  {opens ? ` · opens ${shortDate(opens.toISOString())}` : d ? " · done" : ""}
                                </span>
                              </span>
                              {current && <span className="shrink-0 rounded-full bg-cobalt px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">Now</span>}
                              <span className="sr-only">{lock ? "Locked" : d ? "Completed" : current ? "Current" : "Not started"}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
              {r.quiz?.questions.length ? (
                <div className="border-t">
                  <button type="button" onClick={() => go("quiz")} aria-current={view === "quiz" ? "step" : undefined} className={cn("flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-soft/60", view === "quiz" && "bg-ice hover:bg-ice")}>
                    {qStatus === "passed" ? <CheckCircle2 className="size-5 shrink-0 text-lime-text" aria-hidden="true" /> : qStatus === "locked" ? <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" /> : <CircleHelp className="size-5 shrink-0 text-cobalt" aria-hidden="true" />}
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm font-semibold", view === "quiz" && "text-cobalt")}>Final quiz{r.quiz.required ? "" : " (optional)"}</span>
                      <span className="text-xs text-muted-foreground">
                        {qStatus === "passed" ? `Passed · best ${rec?.best}%` : qStatus === "failed" ? `Best ${rec?.best}% · pass mark ${r.quiz.passMark}%` : qStatus === "locked" ? "Opens after the last lesson" : `${r.quiz.questions.length} questions · pass mark ${r.quiz.passMark}%`}
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <section className="surface p-5 text-sm" aria-label="Certificate and purchase">
            {r.certificate ? (
              cert ? (
                <Link to="/learner/certificates/$certificateId" params={{ certificateId: cert.id }} className="flex items-center gap-2 rounded-lg bg-lime-100 p-3 font-bold text-lime-text"><Award className="size-4" aria-hidden="true" /> View your certificate</Link>
              ) : (
                <p className="flex gap-2 rounded-lg bg-ice p-3 text-xs text-cobalt">
                  <Award className="size-4 shrink-0" aria-hidden="true" />
                  {r.quiz?.required ? `Finish every lesson and pass the final quiz to receive a certificate of completion from ${r.creator}.` : `Complete every ${word} to receive a certificate of completion from ${r.creator}.`}
                </p>
              )
            ) : (
              <p className="flex gap-2 text-xs text-muted-foreground"><Medal className="size-4 shrink-0" aria-hidden="true" /> Finishing it counts towards your learning badges.</p>
            )}
            {p.complete && (
              <Button asChild variant="outline" className="mt-3 w-full"><Link to="/learner/resources/$resourceId/complete" params={{ resourceId: r.id }}><Award /> See your completion</Link></Button>
            )}
            {orderLink && (
              <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                Purchased {shortDate(orderLink.date)} · <Link to="/learner/purchases/$purchaseId" params={{ purchaseId: orderLink.id }} className="font-bold text-cobalt">{orderLink.number}</Link>
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
