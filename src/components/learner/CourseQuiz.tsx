import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CircleHelp, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import type { ResourceQuiz } from "@/lib/learner/catalog";
import { scoreQuiz, type QuizRecord, type QuizResult, type QuizStatus } from "@/lib/learner/learning";
import { cn } from "@/lib/utils";

const LETTERS = "ABCDEFGH";

/**
 * The creator's final quiz: an intro with past attempts, one question at a time,
 * then a scored review showing right and wrong answers, with retry.
 */
export function CourseQuiz({
  quiz,
  status,
  record,
  onSubmit,
  onFinish,
  onReview,
  lessonsLeft,
  onStart,
}: {
  quiz: ResourceQuiz;
  status: QuizStatus;
  record: QuizRecord | undefined;
  onSubmit: (result: QuizResult) => void;
  /** Continue to the completion screen. */
  onFinish: () => void;
  /** Back to the lessons (to revise, or to finish the ones left). */
  onReview: () => void;
  lessonsLeft: number;
  /** A new attempt began (clears any banner above). */
  onStart?: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "taking" | "result">("intro");
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [q, setQ] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (phase !== "intro") heading.current?.focus({ preventScroll: true });
  }, [phase, q]);
  const total = quiz.questions.length;
  const answered = answers.filter((a) => a !== null).length;
  const start = () => {
    setAnswers(quiz.questions.map(() => null));
    setQ(0);
    setResult(null);
    setPhase("taking");
    onStart?.();
  };
  const submit = () => {
    const r = scoreQuiz(quiz, answers);
    setResult(r);
    onSubmit(r);
    setPhase("result");
  };

  if (phase === "intro") {
    const locked = status === "locked";
    return (
      <section className="surface overflow-hidden" aria-labelledby="quiz-title">
        <div className="flex items-center gap-3 bg-ice px-5 py-4">
          <CircleHelp className="size-6 text-cobalt" aria-hidden="true" />
          <p className="text-xs font-bold text-cobalt">Final quiz · {total} {total === 1 ? "question" : "questions"} · pass mark {quiz.passMark}%</p>
        </div>
        <div className="screen-in p-5 sm:p-6">
          <h2 id="quiz-title" className="text-xl font-extrabold sm:text-2xl">Check what you've learned</h2>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
            {quiz.required
              ? `Score ${quiz.passMark}% or more to complete the course and receive your certificate. You can retake it as many times as you need.`
              : `This quiz is optional. Take it to test yourself; you can retake it as often as you like.`}
          </p>
          {record && (
            <dl className="mt-5 grid grid-cols-3 gap-2 rounded-xl border bg-soft/60 p-3 text-center">
              <div><dt className="text-[11px] font-semibold text-muted-foreground">Best score</dt><dd className="mt-0.5 text-lg font-extrabold tabular-nums">{record.best}%</dd></div>
              <div><dt className="text-[11px] font-semibold text-muted-foreground">Last score</dt><dd className="mt-0.5 text-lg font-extrabold tabular-nums">{record.last}%</dd></div>
              <div><dt className="text-[11px] font-semibold text-muted-foreground">Attempts</dt><dd className="mt-0.5 text-lg font-extrabold tabular-nums">{record.attempts}</dd></div>
            </dl>
          )}
          {status === "passed" && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-lime-100 px-3 py-2.5 text-sm font-bold text-lime-text"><Check className="size-4" aria-hidden="true" /> You passed this quiz.</p>
          )}
          {locked && (
            <p className="mt-4 rounded-lg bg-ice px-3 py-2.5 text-sm text-cobalt">
              Finish the last {lessonsLeft === 1 ? "lesson" : `${lessonsLeft} lessons`} to open the quiz.
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={onReview}><BookOpen /> {locked ? "Go to lessons" : "Review lessons"}</Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              {status === "passed" && <Button variant="outline" onClick={onFinish}><Award /> See your completion</Button>}
              <Button disabled={locked} onClick={start}>{record ? <><RotateCcw /> {status === "passed" ? "Retake quiz" : "Try again"}</> : <>Start quiz <ArrowRight /></>}</Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (phase === "taking") {
    const question = quiz.questions[q]!;
    const last = q === total - 1;
    const choose = (i: number) => setAnswers((a) => a.map((x, j) => (j === q ? i : x)));
    return (
      <section className="surface overflow-hidden" aria-labelledby="quiz-question">
        <div className="bg-ice px-5 py-4">
          <div className="flex items-center justify-between text-xs font-bold text-cobalt">
            <span>Question {q + 1} of {total}</span>
            <span className="tabular-nums">{answered} answered</span>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {quiz.questions.map((x, i) => (
              <span key={x.id} className={cn("h-1.5 flex-1 rounded-full transition-colors", i === q ? "bg-cobalt" : answers[i] !== null ? "bg-sky" : "bg-card")} />
            ))}
          </div>
        </div>
        <div key={question.id} className="screen-in p-5 sm:p-6">
          <h2 id="quiz-question" ref={heading} tabIndex={-1} className="text-lg font-extrabold leading-snug outline-none sm:text-xl">{question.prompt}</h2>
          <div role="radiogroup" aria-labelledby="quiz-question" className="mt-5 grid gap-2.5">
            {question.options.map((opt, i) => {
              const on = answers[q] === i;
              return (
                <button
                  key={`${question.id}-${i}`}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => choose(i)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] font-semibold transition-[border-color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky",
                    on ? "border-cobalt bg-ice text-cobalt" : "border-line bg-card hover:border-sky",
                  )}
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold", on ? "bg-cobalt text-primary-foreground" : "bg-soft text-muted-foreground")}>{LETTERS[i]}</span>
                  <span className="min-w-0 flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={() => (q === 0 ? setPhase("intro") : setQ(q - 1))}><ArrowLeft /> {q === 0 ? "Back" : "Previous"}</Button>
            {last ? (
              <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
                <Button disabled={answered < total} onClick={submit}><Check /> Submit answers</Button>
                {answered < total && <p className="text-center text-xs text-muted-foreground sm:text-right">Answer every question to submit ({total - answered} left).</p>}
              </div>
            ) : (
              <Button disabled={answers[q] === null} onClick={() => setQ(q + 1)}>Next question <ArrowRight /></Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const r = result!;
  const finished = r.passed && lessonsLeft === 0;
  return (
    <section className="surface overflow-hidden" aria-labelledby="quiz-result" role="status">
      <div className={cn("screen-in flex flex-col items-center px-5 pb-6 pt-8 text-center sm:px-8", r.passed ? "bg-lime-100/60" : "bg-soft")}>
        <span className={cn("quiz-score grid size-24 place-items-center rounded-full border-[6px] bg-card text-2xl font-extrabold tabular-nums", r.passed ? "border-lime text-lime-text" : "border-warning text-warning-foreground")}>{r.score}%</span>
        <h2 id="quiz-result" ref={heading} tabIndex={-1} className="mt-4 text-2xl font-extrabold outline-none">{r.passed ? "You passed!" : "Not quite yet"}</h2>
        <p className="mt-1.5 max-w-md text-[15px] text-muted-foreground">
          You got {r.correct} of {r.total} right. The pass mark is {quiz.passMark}%.
          {r.passed ? (finished && quiz.required ? " Your course is now complete." : "") : " Look over the answers below, revise the lessons, then try again."}
        </p>
      </div>
      <ol className="divide-y border-t">
        {quiz.questions.map((question, i) => {
          const a = r.answers[i]!;
          return (
            <li key={question.id} className="px-5 py-4 sm:px-6">
              <p className="flex gap-2.5 text-sm font-bold">
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", a.correct ? "bg-lime text-midnight" : "bg-destructive text-destructive-foreground")}>
                  {a.correct ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
                </span>
                <span>{i + 1}. {question.prompt}<span className="sr-only">{a.correct ? " — correct" : " — incorrect"}</span></span>
              </p>
              <dl className="ml-8 mt-2 space-y-1 text-sm">
                <div className="flex flex-wrap gap-x-1.5"><dt className="text-muted-foreground">Your answer:</dt><dd className={cn("font-semibold", a.correct ? "text-lime-text" : "text-destructive")}>{a.chosen !== null ? question.options[a.chosen] : "No answer"}</dd></div>
                {!a.correct && <div className="flex flex-wrap gap-x-1.5"><dt className="text-muted-foreground">Correct answer:</dt><dd className="font-semibold text-foreground">{question.options[a.answer]}</dd></div>}
              </dl>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-between sm:px-6">
        <Button variant="ghost" onClick={onReview}><BookOpen /> Review lessons</Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {!r.passed && <Button onClick={start}><RotateCcw /> Try again</Button>}
          {r.passed && <Button variant="outline" onClick={start}><RotateCcw /> Retake</Button>}
          {r.passed && lessonsLeft === 0 && <Button onClick={onFinish}><Award /> {quiz.required ? "Finish course" : "See your completion"}</Button>}
        </div>
      </div>
    </section>
  );
}
