import type { JoinRole } from "@/components/site/data";

/** Role-specific setup steps after sign-up. Pure: progress is worked out from what the person has finished. */
export type StepId = "about" | "interests" | "explore" | "profile" | "photo" | "tools" | "referrals" | "earnings";
export type OnboardingStep = { id: StepId; title: string; short: string; intro: string };

export const ONBOARDING: Record<JoinRole, OnboardingStep[]> = {
  learner: [
    { id: "about", title: "Tell us about you", short: "About you", intro: "A few details so Enski feels like yours." },
    { id: "interests", title: "What do you want to learn?", short: "Interests", intro: "Pick a few topics. We'll use them to suggest courses." },
    { id: "explore", title: "Courses picked for you", short: "Explore", intro: "A first look at what you can start today." },
  ],
  creator: [
    { id: "profile", title: "Set up your creator profile", short: "Profile", intro: "This is what learners see on your storefront and products." },
    { id: "photo", title: "Add a profile photo", short: "Photo", intro: "People buy from people. A clear, friendly photo builds trust." },
    { id: "tools", title: "Meet your creator tools", short: "Tools", intro: "Everything you need to sell, teach live and coach, in one place." },
  ],
  affiliate: [
    { id: "profile", title: "Set up your affiliate profile", short: "Profile", intro: "Tell us where you'll share, so we can suggest the right products." },
    { id: "referrals", title: "Your referral tools", short: "Referrals", intro: "Your personal link tracks every sale you send our way." },
    { id: "earnings", title: "How you earn", short: "Earnings", intro: "See how commission moves from pending to paid." },
  ],
};

export type OnboardingAnswers = {
  country?: string | undefined;
  stage?: string | undefined;
  interests?: string[] | undefined;
  goal?: string | undefined;
  headline?: string | undefined;
  bio?: string | undefined;
  photo?: string | undefined;
  firstProduct?: string | undefined;
  channels?: string[] | undefined;
  audience?: string | undefined;
  payout?: string | undefined;
};
export type OnboardingRecord = { role: JoinRole; done: StepId[]; answers: OnboardingAnswers; finishedAt?: string | undefined; startedAt?: string | undefined };

export function stepsFor(role: JoinRole): OnboardingStep[] {
  return ONBOARDING[role];
}

/** How far someone is: steps finished for their role, and whether setup is complete. */
export function progressOf(rec: OnboardingRecord | undefined, role: JoinRole) {
  const steps = stepsFor(role);
  const done = rec && rec.role === role ? steps.filter((s) => rec.done.includes(s.id)).length : 0;
  return { done, total: steps.length, complete: done === steps.length || !!(rec && rec.role === role && rec.finishedAt) };
}

/** The step to resume at: the first unfinished one, or the "ready" screen (index = steps.length). */
export function resumeIndex(rec: OnboardingRecord | undefined, role: JoinRole): number {
  const steps = stepsFor(role);
  if (!rec || rec.role !== role) return 0;
  const i = steps.findIndex((s) => !rec.done.includes(s.id));
  return i === -1 ? steps.length : i;
}

/** Keeps a requested step in range; "ready" (the last index) is only reachable once every step is finished. */
export function clampStep(requested: number | undefined, rec: OnboardingRecord | undefined, role: JoinRole): number {
  const total = stepsFor(role).length;
  if (requested === undefined || !Number.isInteger(requested) || requested < 0) return resumeIndex(rec, role);
  if (requested >= total) return progressOf(rec, role).done === total ? total : resumeIndex(rec, role);
  return requested;
}

/** Marks a step finished (idempotent), keeping the role's step order. */
export function withStepDone(rec: OnboardingRecord | undefined, role: JoinRole, id: StepId, answers: OnboardingAnswers = {}): OnboardingRecord {
  const base: OnboardingRecord = rec && rec.role === role ? rec : { role, done: [], answers: {}, startedAt: new Date().toISOString() };
  const done = stepsFor(role).map((s) => s.id).filter((s) => s === id || base.done.includes(s));
  return { ...base, done, answers: { ...base.answers, ...answers } };
}

export const LEARNING_TOPICS = ["Design", "Tech & coding", "AI tools", "Business", "Marketing", "Product management", "Personal growth", "Money & finance", "Content creation", "Career"] as const;
export const LEARNING_GOALS = ["Get a job", "Grow my business", "Learn a new skill", "Earn certificates"] as const;
export const LEARNER_STAGES = ["Student", "Working professional", "Looking for work", "Running a business"] as const;
export const SHARE_CHANNELS = ["WhatsApp", "Instagram", "Twitter", "TikTok", "LinkedIn", "YouTube", "Blog or website", "Community or school"] as const;
