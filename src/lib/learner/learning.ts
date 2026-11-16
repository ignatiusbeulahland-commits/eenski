import type { LearnerResource, ResourceQuiz, ResourceUnit } from "./catalog";
import type { LearnerState } from "./rules";

/**
 * Pure helpers for the learning space: module outline, lesson lengths and
 * drip locks, and the creator's final quiz (scoring and saved attempts).
 */

const DAY = 86_400_000;

export type OutlineModule = { title: string | null; items: { unit: ResourceUnit; index: number }[] };

/** Lessons grouped into their modules, in order. Resources without modules come back as one untitled group. */
export function courseOutline(r: Pick<LearnerResource, "units">): OutlineModule[] {
  const out: OutlineModule[] = [];
  r.units.forEach((unit, index) => {
    const title = unit.module?.trim() || null;
    const last = out[out.length - 1];
    if (last && last.title === title) last.items.push({ unit, index });
    else out.push({ title, items: [{ unit, index }] });
  });
  return out;
}

/** "1 hr 20 min" / "12 min"; seconds win over the rounded minutes when the course page gives them. */
export function formatLength(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return total > 0 ? `${total} sec` : "0 min";
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
export const unitSeconds = (u: Pick<ResourceUnit, "minutes" | "seconds">) => (u.seconds != null && u.seconds > 0 ? u.seconds : u.minutes * 60);
export const unitLength = (u: Pick<ResourceUnit, "minutes" | "seconds">) => formatLength(unitSeconds(u));
export const totalLength = (units: readonly Pick<ResourceUnit, "minutes" | "seconds">[]) => formatLength(units.reduce((n, u) => n + unitSeconds(u), 0));

/** When a drip-scheduled lesson opens, or null when it's open from the day of purchase. */
export function unlockDate(u: Pick<ResourceUnit, "unlockDay">, purchasedAt: string | undefined): Date | null {
  if (!u.unlockDay || !purchasedAt) return null;
  const start = Date.parse(purchasedAt);
  return Number.isNaN(start) ? null : new Date(start + u.unlockDay * DAY);
}
export const isLocked = (u: Pick<ResourceUnit, "unlockDay">, purchasedAt: string | undefined, now = new Date()) => {
  const d = unlockDate(u, purchasedAt);
  return d !== null && d.getTime() > now.getTime();
};

/** Where to pick up: the first open lesson not yet done, else the last open one. */
export function currentLessonIndex(r: Pick<LearnerResource, "units">, done: ReadonlySet<string>, purchasedAt?: string, now = new Date()): number {
  const open = (u: ResourceUnit) => !isLocked(u, purchasedAt, now);
  const next = r.units.findIndex((u) => open(u) && !done.has(u.id));
  if (next >= 0) return next;
  for (let i = r.units.length - 1; i >= 0; i--) if (open(r.units[i]!)) return i;
  return 0;
}

export type ModuleState = { done: number; total: number; complete: boolean };
export const moduleState = (m: OutlineModule, done: ReadonlySet<string>): ModuleState => {
  const n = m.items.filter((i) => done.has(i.unit.id)).length;
  return { done: n, total: m.items.length, complete: n === m.items.length && n > 0 };
};

/* ---------- final quiz ---------- */
export type QuizResult = {
  correct: number;
  total: number;
  /** Percentage, rounded. */
  score: number;
  passed: boolean;
  answers: { id: string; chosen: number | null; answer: number; correct: boolean }[];
};

export function scoreQuiz(quiz: Pick<ResourceQuiz, "passMark" | "questions">, chosen: readonly (number | null | undefined)[]): QuizResult {
  const answers = quiz.questions.map((q, i) => {
    const c = chosen[i] ?? null;
    return { id: q.id, chosen: c, answer: q.answer, correct: c === q.answer };
  });
  const correct = answers.filter((a) => a.correct).length;
  const total = quiz.questions.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  return { correct, total, score, passed: total > 0 && score >= quiz.passMark, answers };
}

export type QuizRecord = LearnerState["quizzes"][string];

/** Saves an attempt: attempts +1, latest and best score, and the first time it was passed (kept on later fails). */
export function recordQuizAttempt(s: Pick<LearnerState, "quizzes">, resourceId: string, result: Pick<QuizResult, "score" | "passed" | "answers">, now = new Date()): Pick<LearnerState, "quizzes"> {
  const prev = s.quizzes?.[resourceId];
  const passedAt = prev?.passedAt ?? (result.passed ? now.toISOString() : undefined);
  const next: QuizRecord = {
    attempts: (prev?.attempts ?? 0) + 1,
    best: Math.max(prev?.best ?? 0, result.score),
    last: result.score,
    answers: result.answers.map((a) => a.chosen ?? -1),
    ...(passedAt ? { passedAt } : {}),
  };
  return { quizzes: { ...s.quizzes, [resourceId]: next } };
}

export type QuizStatus = "none" | "locked" | "ready" | "failed" | "passed";
/** The quiz opens once every lesson is done. */
export function quizStatus(r: Pick<LearnerResource, "quiz" | "units">, done: ReadonlySet<string>, rec: QuizRecord | undefined): QuizStatus {
  if (!r.quiz?.questions.length) return "none";
  if (rec?.passedAt) return "passed";
  if (!r.units.every((u) => done.has(u.id))) return "locked";
  return rec ? "failed" : "ready";
}
