import { beforeEach, describe, expect, it } from "vitest";

import { initialCreatorState, STORAGE_KEY } from "@/lib/creator/data";
import { creditStoreSales, findStore, storeShopItem, syncStoreLearning } from "@/lib/creator/publicStore";
import { registerResources, type LearnerResource } from "@/lib/learner/catalog";
import { courseOutline, currentLessonIndex, formatLength, isLocked, quizStatus, recordQuizAttempt, scoreQuiz, totalLength } from "@/lib/learner/learning";
import { initialLearnerState, resourceProgress, type LearnerState } from "@/lib/learner/rules";
import { resourceFromShopItem } from "@/lib/learner/shopBridge";
import type { PaymentRecord } from "@/lib/shop/payments";

const quiz = {
  passMark: 70,
  required: true,
  questions: [
    { id: "q1", prompt: "One?", options: ["a", "b"], answer: 0 },
    { id: "q2", prompt: "Two?", options: ["a", "b"], answer: 1 },
    { id: "q3", prompt: "Three?", options: ["a", "b"], answer: 1 },
  ],
};

const course: LearnerResource = {
  id: "store:ada:c1", title: "Pitch decks", creator: "Ada", description: "", type: "Course", category: "Business", price: 12000,
  image: "", imageAlt: "", eligible: true, certificate: true, downloadable: false,
  units: [
    { id: "l1", title: "Intro", minutes: 10, module: "Start here" },
    { id: "l2", title: "Story", minutes: 10, module: "Start here" },
    { id: "l3", title: "Slides", minutes: 15, module: "Build it", unlockDay: 7 },
  ],
  quiz,
};

const owner = (s: Partial<LearnerState>): LearnerState => ({
  ...initialLearnerState,
  purchases: [{ id: "p1", orderNumber: "ENS-1", date: "2026-11-13T09:00:00.000Z", items: [{ kind: "resource", id: course.id, title: course.title, price: 12000, qty: 1 }], total: 12000, status: "paid", method: "card" }],
  ...s,
});

describe("course outline and lesson states", () => {
  it("groups lessons into their modules in order", () => {
    expect(courseOutline(course).map((m) => [m.title, m.items.map((i) => i.unit.id)])).toEqual([["Start here", ["l1", "l2"]], ["Build it", ["l3"]]]);
  });

  it("a drip lesson stays locked until its day after purchase", () => {
    const bought = "2026-11-13T09:00:00.000Z";
    expect(isLocked(course.units[2]!, bought, new Date("2026-11-19T09:00:00.000Z"))).toBe(true);
    expect(isLocked(course.units[2]!, bought, new Date("2026-11-20T09:00:00.000Z"))).toBe(false);
    expect(isLocked(course.units[0]!, bought, new Date("2026-11-13T09:00:00.000Z"))).toBe(false);
  });

  it("picks up at the first open lesson not yet done", () => {
    expect(currentLessonIndex(course, new Set(["l1"]), "2026-11-13T09:00:00.000Z", new Date("2026-11-14T00:00:00.000Z"))).toBe(1);
    // Everything open is done and the rest is locked: stay on the last open lesson.
    expect(currentLessonIndex(course, new Set(["l1", "l2"]), "2026-11-13T09:00:00.000Z", new Date("2026-11-14T00:00:00.000Z"))).toBe(1);
  });

  it("shows real running times, including lessons under a minute", () => {
    expect(formatLength(81)).toBe("1 min");
    expect(formatLength(15)).toBe("15 sec");
    expect(formatLength(4800)).toBe("1 hr 20 min");
    expect(totalLength(course.units)).toBe("35 min");
  });
});

describe("final quiz", () => {
  it("scores against the pass mark", () => {
    expect(scoreQuiz(quiz, [0, 1, 0])).toMatchObject({ correct: 2, total: 3, score: 67, passed: false });
    expect(scoreQuiz(quiz, [0, 1, 1])).toMatchObject({ correct: 3, score: 100, passed: true });
    expect(scoreQuiz(quiz, [0, null, 1]).answers[1]).toMatchObject({ chosen: null, correct: false });
  });

  it("keeps the best score and the first pass, even after a later fail", () => {
    let s: Pick<LearnerState, "quizzes"> = { quizzes: {} };
    s = recordQuizAttempt(s, course.id, scoreQuiz(quiz, [0, 0, 0]), new Date("2026-11-13T10:00:00.000Z"));
    expect(s.quizzes[course.id]).toMatchObject({ attempts: 1, best: 33, last: 33 });
    expect(s.quizzes[course.id]!.passedAt).toBeUndefined();
    s = recordQuizAttempt(s, course.id, scoreQuiz(quiz, [0, 1, 1]), new Date("2026-11-13T10:05:00.000Z"));
    s = recordQuizAttempt(s, course.id, scoreQuiz(quiz, [1, 0, 0]), new Date("2026-11-13T10:10:00.000Z"));
    expect(s.quizzes[course.id]).toMatchObject({ attempts: 3, best: 100, last: 0, passedAt: "2026-11-13T10:05:00.000Z" });
  });

  it("opens only after every lesson is done", () => {
    expect(quizStatus(course, new Set(["l1", "l2"]), undefined)).toBe("locked");
    expect(quizStatus(course, new Set(["l1", "l2", "l3"]), undefined)).toBe("ready");
    expect(quizStatus(course, new Set(["l1", "l2", "l3"]), { attempts: 1, best: 33, last: 33 })).toBe("failed");
  });

  it("a required quiz must be passed before the course counts as complete", () => {
    registerResources([course]);
    const lessonsDone = owner({ progress: { [course.id]: { completed: ["l1", "l2", "l3"] } } });
    expect(resourceProgress(lessonsDone, course.id)).toMatchObject({ pct: 100, lessonsDone: true, quizPending: true, complete: false });
    const passed = { ...lessonsDone, quizzes: { [course.id]: { attempts: 1, best: 100, last: 100, passedAt: "2026-11-13T10:00:00.000Z" } } };
    expect(resourceProgress(passed, course.id).complete).toBe(true);
  });

  it("an optional quiz doesn't hold back completion", () => {
    const optional = { ...course, id: "store:ada:c2", quiz: { ...quiz, required: false } };
    registerResources([optional]);
    const s = owner({ progress: { [optional.id]: { completed: ["l1", "l2", "l3"] } } });
    expect(resourceProgress(s, optional.id).complete).toBe(true);
  });
});

describe("storefront courses match the creator's set-up", () => {
  const creatorKey = `${STORAGE_KEY}:ada@example.com`;
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(creatorKey, JSON.stringify({
      ...initialCreatorState,
      storefront: { ...initialCreatorState.storefront, name: "Ada's studio", handle: "ada", published: true },
      items: [{ id: "c1", kind: "course", title: "Pitch decks", description: "", category: "Business", price: 12000, status: "published", image: "", lessons: ["Intro", "Story"], date: "", capacity: 0, duration: 0, createdAt: "2026-11-01T00:00:00.000Z" }],
    }));
  });

  it("keeps lesson details and the quiz when bought", () => {
    const item = storeShopItem(findStore("ada")!, findStore("ada")!.items[0]!);
    const r = resourceFromShopItem(item, [{ id: "l1", title: "Intro", durationSeconds: 600, module: "Start here", description: "Why decks matter" }], { quiz, certificate: false });
    expect(r.units[0]).toMatchObject({ id: "l1", minutes: 10, seconds: 600, module: "Start here", description: "Why decks matter" });
    expect(r.quiz?.passMark).toBe(70);
    expect(r.certificate).toBe(false);
  });

  it("mirrors the buyer's lessons and best quiz score into the creator's order", () => {
    const store = findStore("ada")!;
    const item = storeShopItem(store, store.items[0]!);
    const p: PaymentRecord = { reference: "ENS-ABC123", items: [item], totals: [{ currency: "NGN", label: "₦12,000", total: 12000 }], method: "card", methodLabel: "Visa •••• 4242", buyer: { name: "Bola", email: "bola@example.com" }, status: "successful", createdAt: "2026-11-13T09:00:00.000Z", updatedAt: "2026-11-13T09:00:05.000Z", events: [], plan: "successful", resolveAt: 0 };
    creditStoreSales(p);
    expect(syncStoreLearning(item.key, "Bola@example.com", { completed: ["lesson-1"] })).toBe(true);
    syncStoreLearning(item.key, "bola@example.com", { quizScore: 80 });
    syncStoreLearning(item.key, "bola@example.com", { quizScore: 40 });
    const order = JSON.parse(localStorage.getItem(creatorKey)!).orders[0];
    expect(order).toMatchObject({ completed: ["lesson-1"], quizScore: 80 });
    expect(syncStoreLearning(item.key, "stranger@example.com", { quizScore: 100 })).toBe(false);
  });
});
