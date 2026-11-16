import { certificateDesignSchema } from "@/lib/shared/certificate";
/**
 * Product-type specific configuration and rules for Manage Products.
 * Shared fields (title, description, cover, price, status) live on the item itself;
 * everything here belongs to exactly one product type.
 */
import { z } from "zod";

// ---------- Courses ----------
export const LESSON_TYPES = ["video", "text", "download", "quiz"] as const;
export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(LESSON_TYPES).default("video"),
  minutes: z.number().int().nonnegative().default(10),
  preview: z.boolean().default(false),
  mediaId: z.string().default(""),
});
export const moduleSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** Days after enrolment when this module unlocks (used when drip is scheduled). */
  unlockDay: z.number().int().nonnegative().default(0),
  lessons: z.array(lessonSchema).default([]),
});
export const questionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()),
  answer: z.number().int().nonnegative(),
});
export const COURSE_LEVELS = ["beginner", "intermediate", "advanced", "all"] as const;
/** A presentation file whose bytes live in the browser's media vault (IndexedDB), keyed by id. */
export const mediaRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().nonnegative(),
  mime: z.string(),
  uploadedAt: z.string().default(""),
});
export type MediaRef = z.infer<typeof mediaRefSchema>;
export const presentationSchema = z.object({
  /** Intro or trailer video students watch before enrolling. */
  video: mediaRefSchema.nullable().default(null),
  /** Slide deck (PDF, PowerPoint or Keynote). */
  slides: mediaRefSchema.nullable().default(null),
  /** Screenshots, slides as images or examples of student work. */
  images: z.array(mediaRefSchema).default([]),
});
export type CoursePresentation = z.infer<typeof presentationSchema>;
export const courseConfigSchema = z.object({
  modules: z.array(moduleSchema).default([]),
  objectives: z.array(z.string()).default([]),
  /** Main skill students gain; empty when not set. */
  skill: z.string().default(""),
  level: z.enum(COURSE_LEVELS).default("all"),
  presentation: presentationSchema.default({}),
  drip: z.enum(["all", "scheduled"]).default("all"),
  quiz: z
    .object({ enabled: z.boolean(), passMark: z.number().int().min(1).max(100), questions: z.array(questionSchema) })
    .default({ enabled: false, passMark: 70, questions: [] }),
  certificate: z
    .object({ enabled: z.boolean(), title: z.string(), signer: z.string(), requireQuiz: z.boolean(), design: certificateDesignSchema.default({}) })
    .default({ enabled: false, title: "Certificate of completion", signer: "", requireQuiz: false }),
});
export type CourseConfig = z.infer<typeof courseConfigSchema>;
export type CourseModule = z.infer<typeof moduleSchema>;
export type CourseLesson = z.infer<typeof lessonSchema>;
export type QuizQuestion = z.infer<typeof questionSchema>;

// ---------- Digital downloads ----------
export const fileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().nonnegative(),
  mime: z.string(),
  version: z.number().int().positive(),
  uploadedAt: z.string(),
  history: z
    .array(z.object({ version: z.number().int().positive(), name: z.string(), size: z.number().nonnegative(), uploadedAt: z.string() }))
    .default([]),
});
export const LICENSES = ["personal", "commercial", "extended"] as const;
export const downloadConfigSchema = z.object({
  files: z.array(fileSchema).default([]),
  /** Downloads allowed per buyer; 0 means unlimited. */
  limit: z.number().int().nonnegative().default(5),
  /** Days the download link stays valid after purchase; 0 means it never expires. */
  expiryDays: z.number().int().nonnegative().default(0),
  watermark: z.boolean().default(false),
  instantEmail: z.boolean().default(true),
  license: z.enum(LICENSES).default("personal"),
  /** E-book, template, workbook… or the creator's own wording. */
  format: z.string().default(""),
});
export type DownloadConfig = z.infer<typeof downloadConfigSchema>;
export type ProductFile = z.infer<typeof fileSchema>;

// ---------- Live sessions ----------
export const ticketSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().finite().nonnegative(),
  quantity: z.number().int().positive(),
});
export const liveConfigSchema = z.object({
  durationMins: z.number().int().positive().default(60),
  venue: z.enum(["online", "in_person"]).default("online"),
  link: z.string().default(""),
  address: z.string().default(""),
  tickets: z.array(ticketSchema).default([]),
  reminders: z
    .object({ week: z.boolean(), day: z.boolean(), hour: z.boolean() })
    .default({ week: false, day: true, hour: true }),
  replay: z.boolean().default(false),
  /** Workshop, webinar, masterclass… or the creator's own wording. */
  sessionType: z.string().default(""),
  level: z.enum(COURSE_LEVELS).default("all"),
});
export type LiveConfig = z.infer<typeof liveConfigSchema>;
export type Ticket = z.infer<typeof ticketSchema>;

// ---------- Services ----------
export const packageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  price: z.number().finite().nonnegative(),
  days: z.number().int().positive(),
  revisions: z.number().int().nonnegative(),
});
export const STAGES = ["requirements", "in_progress", "delivered", "completed"] as const;
export type Stage = (typeof STAGES)[number];
export const stageLabel: Record<Stage, string> = {
  requirements: "Awaiting requirements",
  in_progress: "In progress",
  delivered: "Delivered",
  completed: "Completed",
};
export const serviceConfigSchema = z.object({
  packages: z.array(packageSchema).default([]),
  requirements: z.array(z.string()).default([]),
  refund: z.enum(["none", "before_start", "full"]).default("before_start"),
  serviceType: z.string().default(""),
});
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
export type ServicePackage = z.infer<typeof packageSchema>;

// ---------- Coaching ----------
export const coachingConfigSchema = z.object({
  location: z.enum(["video", "phone", "in_person"]).default("video"),
  meetingLink: z.string().default(""),
  windowDays: z.number().int().min(1).max(180).default(30),
  noticeHours: z.number().int().nonnegative().default(12),
  rescheduleHours: z.number().int().nonnegative().default(24),
  cancelHours: z.number().int().nonnegative().default(24),
  refundOnCancel: z.boolean().default(true),
  intake: z.array(z.string()).default([]),
  focus: z.string().default(""),
});
export type CoachingConfig = z.infer<typeof coachingConfigSchema>;

// ---------- Per-order fulfilment (only the fields that apply to the product type are used) ----------
export const fulfilmentSchema = {
  /** Course: lesson ids the student has completed. */
  completed: z.array(z.string()).optional(),
  quizScore: z.number().min(0).max(100).optional(),
  /** Download: times the buyer downloaded; revoked removes access. */
  downloads: z.number().int().nonnegative().optional(),
  revoked: z.boolean().optional(),
  /** Live: ticket bought and check-in. */
  ticketId: z.string().optional(),
  checkedIn: z.boolean().optional(),
  /** Service: chosen package, stage, buyer answers and delivery note. */
  packageId: z.string().optional(),
  stage: z.enum(STAGES).optional(),
  answers: z.array(z.string()).optional(),
  deliveryNote: z.string().optional(),
  /** Coaching: booked session time and its state. */
  sessionAt: z.string().optional(),
  booking: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
};

// ---------- Rules ----------
type Kind = "course" | "ebook" | "live" | "service" | "coaching";
interface ItemLike {
  kind: Kind;
  price: number;
  date: string;
  capacity: number;
  duration: number;
  lessons: string[];
  course?: CourseConfig | undefined;
  download?: DownloadConfig | undefined;
  live?: LiveConfig | undefined;
  service?: ServiceConfig | undefined;
  coaching?: CoachingConfig | undefined;
}
interface OrderLike {
  id: string;
  date: string;
  status: "paid" | "refunded";
  completed?: string[] | undefined;
  quizScore?: number | undefined;
  downloads?: number | undefined;
  revoked?: boolean | undefined;
  ticketId?: string | undefined;
  checkedIn?: boolean | undefined;
  packageId?: string | undefined;
  stage?: Stage | undefined;
  sessionAt?: string | undefined;
  booking?: "scheduled" | "completed" | "cancelled" | "no_show" | undefined;
}

const DAY = 86_400_000;
const HOUR = 3_600_000;
export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

/** Course config, migrating an older flat lesson list into a first module. */
export function courseOf(item: ItemLike): CourseConfig {
  if (item.course) return item.course;
  const base = courseConfigSchema.parse({});
  const lessons = item.lessons.filter((l) => l.trim());
  if (!lessons.length) return base;
  return {
    ...base,
    modules: [{ id: "module-1", title: "Module 1", unlockDay: 0, lessons: lessons.map((title, n) => ({ id: `lesson-${n + 1}`, title, type: "video", minutes: 10, preview: false, mediaId: "" })) }],
  };
}
export const downloadOf = (item: ItemLike): DownloadConfig => item.download ?? downloadConfigSchema.parse({});
export const liveOf = (item: ItemLike): LiveConfig => item.live ?? liveConfigSchema.parse({});
export const serviceOf = (item: ItemLike): ServiceConfig => item.service ?? serviceConfigSchema.parse({});
export const coachingOf = (item: ItemLike): CoachingConfig => item.coaching ?? coachingConfigSchema.parse({});

export function courseTotals(c: CourseConfig) {
  const lessons = c.modules.flatMap((m) => m.lessons);
  return { modules: c.modules.length, lessons: lessons.length, minutes: lessons.reduce((n, l) => n + l.minutes, 0), previews: lessons.filter((l) => l.preview).length };
}
/** Lesson titles in order — kept on the item so older screens still read the curriculum. */
export const lessonTitles = (c: CourseConfig) => c.modules.flatMap((m) => m.lessons.map((l) => l.title));

export function studentProgress(order: OrderLike, c: CourseConfig) {
  const ids = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
  if (!ids.length) return 0;
  const done = ids.filter((id) => order.completed?.includes(id)).length;
  return Math.round((done / ids.length) * 100);
}
/** Modules a student can open now. With drip off every module is open. */
export function unlockedModules(c: CourseConfig, enrolledAt: string, now: Date) {
  if (c.drip === "all") return c.modules.map((m) => m.id);
  const days = Math.floor((now.getTime() - Date.parse(enrolledAt)) / DAY);
  return c.modules.filter((m) => m.unlockDay <= days).map((m) => m.id);
}
export function nextLessonFor(order: OrderLike, c: CourseConfig, now: Date) {
  const open = unlockedModules(c, order.date, now);
  for (const m of c.modules) {
    if (!open.includes(m.id)) continue;
    const l = m.lessons.find((x) => !order.completed?.includes(x.id));
    if (l) return l;
  }
  return undefined;
}
export function quizPassed(order: OrderLike, c: CourseConfig) {
  return !c.quiz.enabled || (order.quizScore ?? -1) >= c.quiz.passMark;
}
export function certificateEarned(order: OrderLike, c: CourseConfig) {
  if (!c.certificate.enabled || order.status !== "paid") return false;
  if (studentProgress(order, c) < 100) return false;
  return !c.certificate.requireQuiz || quizPassed(order, c);
}
export function validateQuestion(q: Pick<QuizQuestion, "prompt" | "options" | "answer">) {
  const options = q.options.map((o) => o.trim()).filter(Boolean);
  if (!q.prompt.trim()) return "Write the question.";
  if (options.length < 2) return "Add at least two answer options.";
  if (q.answer < 0 || q.answer >= options.length) return "Choose the correct answer.";
  return "";
}

export function downloadAccess(order: OrderLike, d: DownloadConfig, now: Date) {
  const used = order.downloads ?? 0;
  const expiresAt = d.expiryDays ? new Date(Date.parse(order.date) + d.expiryDays * DAY) : null;
  const remaining = d.limit ? Math.max(0, d.limit - used) : Infinity;
  if (order.status !== "paid") return { ok: false, reason: "Refunded", remaining, expiresAt };
  if (order.revoked) return { ok: false, reason: "Access revoked", remaining, expiresAt };
  if (expiresAt && now > expiresAt) return { ok: false, reason: "Link expired", remaining, expiresAt };
  if (remaining <= 0) return { ok: false, reason: "Limit reached", remaining, expiresAt };
  return { ok: true, reason: "", remaining, expiresAt };
}
/** Replacing a file keeps the old version in its history and bumps the version number. */
export function replaceFile(f: ProductFile, next: { name: string; size: number; mime: string }, at: string): ProductFile {
  return { ...f, ...next, version: f.version + 1, uploadedAt: at, history: [{ version: f.version, name: f.name, size: f.size, uploadedAt: f.uploadedAt }, ...f.history] };
}

export const ticketsSold = (orders: OrderLike[], ticketId: string) =>
  orders.filter((o) => o.status === "paid" && o.ticketId === ticketId).length;
export function seatsLeft(item: ItemLike, orders: OrderLike[]) {
  return Math.max(0, item.capacity - orders.filter((o) => o.status === "paid").length);
}
/** A ticket can be sold while both the ticket and the whole event have seats left. */
export function ticketAvailable(item: ItemLike, orders: OrderLike[], t: Ticket) {
  return ticketsSold(orders, t.id) < t.quantity && seatsLeft(item, orders) > 0;
}
export function validateTickets(tickets: Ticket[], capacity: number) {
  if (tickets.some((t) => !t.name.trim())) return "Give every ticket a name.";
  if (tickets.some((t) => !Number.isInteger(t.quantity) || t.quantity < 1)) return "Each ticket needs at least 1 seat.";
  if (tickets.reduce((n, t) => n + t.quantity, 0) > capacity) return `Ticket seats add up to more than the ${capacity} seats available.`;
  return "";
}
export function attendanceRate(orders: OrderLike[]) {
  const paid = orders.filter((o) => o.status === "paid");
  return paid.length ? Math.round((paid.filter((o) => o.checkedIn).length / paid.length) * 100) : 0;
}
export function reminderTimes(date: string, r: LiveConfig["reminders"]) {
  const at = Date.parse(date);
  if (!Number.isFinite(at)) return [];
  const list: { label: string; at: Date }[] = [];
  if (r.week) list.push({ label: "1 week before", at: new Date(at - 7 * DAY) });
  if (r.day) list.push({ label: "1 day before", at: new Date(at - DAY) });
  if (r.hour) list.push({ label: "1 hour before", at: new Date(at - HOUR) });
  return list;
}

export function nextStage(stage: Stage): Stage | null {
  const i = STAGES.indexOf(stage);
  return i < STAGES.length - 1 ? STAGES[i + 1]! : null;
}
export function serviceDue(order: OrderLike, pkg: ServicePackage | undefined) {
  return pkg ? new Date(Date.parse(order.date) + pkg.days * DAY) : null;
}
export function validatePackage(p: Pick<ServicePackage, "name" | "price" | "days" | "revisions">) {
  if (!p.name.trim()) return "Name this package.";
  if (!Number.isFinite(p.price) || p.price < 0) return "Enter a valid price.";
  if (!Number.isInteger(p.days) || p.days < 1) return "Delivery needs at least 1 whole day.";
  if (!Number.isInteger(p.revisions) || p.revisions < 0) return "Revisions must be a whole number.";
  return "";
}

/** Open coaching slots from weekly availability, skipping booked times, notice and buffer. */
export function coachingSlots(
  days: { enabled: boolean; start: string; end: string }[],
  bufferMins: number,
  durationMins: number,
  c: CoachingConfig,
  booked: string[],
  now: Date,
  limit = 12,
) {
  const out: string[] = [];
  const step = (durationMins + bufferMins) * 60_000;
  const earliest = now.getTime() + c.noticeHours * HOUR;
  const taken = booked.map((b) => Date.parse(b));
  for (let d = 0; d <= c.windowDays && out.length < limit; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    const rule = days[(day.getDay() + 6) % 7];
    if (!rule?.enabled) continue;
    const [sh, sm] = rule.start.split(":").map(Number);
    const [eh, em] = rule.end.split(":").map(Number);
    const end = new Date(day).setHours(eh ?? 0, em ?? 0, 0, 0);
    for (let t = new Date(day).setHours(sh ?? 0, sm ?? 0, 0, 0); t + durationMins * 60_000 <= end && out.length < limit; t += step) {
      if (t < earliest) continue;
      if (taken.some((b) => Math.abs(b - t) < step)) continue;
      out.push(new Date(t).toISOString());
    }
  }
  return out;
}
/** Reschedule or cancel is allowed only while the session is at least `hours` away. */
export const changeAllowed = (sessionAt: string, hours: number, now: Date) => Date.parse(sessionAt) - now.getTime() >= hours * HOUR;

const isUrl = (v: string) => /^https:\/\/[^\s.]+\.[^\s]+$/.test(v.trim());
/** Extra checks a product type needs before it can be published. */
export function typeIssue(item: ItemLike) {
  switch (item.kind) {
    case "course": {
      const c = courseOf(item);
      if (!courseTotals(c).lessons) return "Add at least one lesson to your curriculum.";
      if (c.quiz.enabled && !c.quiz.questions.length) return "Add a quiz question or turn the quiz off.";
      return "";
    }
    case "ebook":
      return downloadOf(item).files.length ? "" : "Upload at least one file for buyers to download.";
    case "live": {
      const l = liveOf(item);
      if (l.venue === "online" && !isUrl(l.link)) return "Add a meeting link that starts with https://.";
      if (l.venue === "in_person" && !l.address.trim()) return "Add the venue address.";
      return validateTickets(l.tickets, item.capacity);
    }
    case "service":
      return serviceOf(item).packages.length ? "" : "Add at least one package.";
    case "coaching": {
      const c = coachingOf(item);
      return c.location === "video" && !isUrl(c.meetingLink) ? "Add a meeting link that starts with https://." : "";
    }
  }
}
export { isUrl };
