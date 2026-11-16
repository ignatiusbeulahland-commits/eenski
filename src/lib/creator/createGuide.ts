import {
  coachingConfigSchema, courseConfigSchema, downloadConfigSchema, isUrl as isHttpsUrl, liveConfigSchema, newId, serviceConfigSchema, validatePackage, validateTickets,
  type COURSE_LEVELS, type CoursePresentation, type LESSON_TYPES, type LICENSES, type ProductFile, type ServicePackage, type Ticket,
} from "./products";
import { COURSE_CATEGORIES, PRODUCT_TOPICS } from "./courseMeta";
import type { CreatorItem, ItemKind } from "./rules";

/** Copy that guides each product type's create flow. */
export const createGuide: Record<ItemKind, {
  what: string;
  titleLabel: string;
  titlePlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  categories: string[];
  priceLabel: string;
  priceHint: string;
  detailsTitle: string;
  detailsText: string;
  tips: string[];
  /** The two type-specific sections of the create form. */
  sections: [{ title: string; text: string; tip?: string }, { title: string; text: string; tip?: string }];
}> = {
  course: {
    what: "A self-paced programme of lessons students work through in order.",
    titleLabel: "Course title",
    titlePlaceholder: "e.g. Product design from zero",
    descLabel: "What will students learn?",
    descPlaceholder: "Who it's for, what they'll be able to do by the end, and how the course is structured.",
    categories: [...COURSE_CATEGORIES],
    priceLabel: "Course price",
    priceHint: "Students pay once for lifetime access.",
    detailsTitle: "Learning outcomes and first lessons",
    detailsText: "Outcomes appear on your sales page. Lessons become Module 1 — you can add videos and quizzes next.",
    tips: ["Lead with the result students get, not the topic.", "Three to five clear outcomes convert best.", "Short lessons (5–15 minutes) keep students moving."],
    sections: [
      { title: "What students will learn", text: "Outcomes appear on your sales page as a checklist.", tip: "Start each outcome with a verb: design, build, launch, write." },
      { title: "Curriculum", text: "Organise lessons into modules. Upload videos and files after saving.", tip: "Learning materials such as worksheets or slides are Download lessons. Attach the files from the Curriculum tab after saving." },
    ],
  },
  ebook: {
    what: "A file buyers download instantly — e-books, templates, presets or guides.",
    titleLabel: "Product name",
    titlePlaceholder: "e.g. The freelancer pricing playbook",
    descLabel: "What's inside?",
    descPlaceholder: "List the chapters, templates or files included and the problem they solve.",
    categories: [...PRODUCT_TOPICS.ebook.categories],
    priceLabel: "Price",
    priceHint: "Buyers get the download link as soon as they pay.",
    detailsTitle: "Licence and delivery",
    detailsText: "Choose how buyers may use the file and how long their link lasts. You'll upload the files next.",
    tips: ["Show a peek of the inside in your cover.", "Mention the file format and page count in the description.", "A commercial licence lets you charge more."],
    sections: [
      { title: "Files buyers receive", text: "Drop in everything included in the purchase.", tip: "Upload the final versions. You can replace a file later and buyers get the new version on their next download." },
      { title: "Delivery and licence", text: "How buyers get the files and how they may use them." },
    ],
  },
  live: {
    what: "A scheduled class, workshop or webinar people register for.",
    titleLabel: "Session title",
    titlePlaceholder: "e.g. Live portfolio review workshop",
    descLabel: "What happens in the session?",
    descPlaceholder: "The agenda, who should attend and what they'll leave with.",
    categories: [...PRODUCT_TOPICS.live.categories],
    priceLabel: "Ticket price",
    priceHint: "Attendees pay when they register.",
    detailsTitle: "Date, length and venue",
    detailsText: "Registrants see these details and get reminders before you start.",
    tips: ["Evenings and weekends usually get more sign-ups.", "Limited seats create urgency.", "Offer a replay to people who can't make it."],
    sections: [
      { title: "Schedule", text: "When it starts, how long it runs and how many can join." },
      { title: "Venue and tickets", text: "Where it happens and what people register for.", tip: "Leave ticket types empty and everyone registers at your ticket price." },
    ],
  },
  service: {
    what: "Done-for-you work you deliver within an agreed time.",
    titleLabel: "Service name",
    titlePlaceholder: "e.g. Brand identity design",
    descLabel: "What's included?",
    descPlaceholder: "The deliverables, the process and what the client receives at the end.",
    categories: [...PRODUCT_TOPICS.service.categories],
    priceLabel: "Starting price",
    priceHint: "Clients pay when they order.",
    detailsTitle: "Delivery and brief",
    detailsText: "Tell clients how long the work takes and what you need from them to begin.",
    tips: ["Be specific about the number of revisions.", "Ask only for what you need to start.", "Show past work in your cover image."],
    sections: [
      { title: "Packages", text: "Offer up to three tiers. Your listed price starts from the cheapest.", tip: "Packages are optional now, but you need at least one before you can publish." },
      { title: "Brief and policies", text: "What you need to start, and your refund terms." },
    ],
  },
  coaching: {
    what: "One-to-one sessions clients book in your available times.",
    titleLabel: "Coaching offer",
    titlePlaceholder: "e.g. 1:1 career coaching",
    descLabel: "What will you work on together?",
    descPlaceholder: "Who you help, the kind of goals you cover and how a session runs.",
    categories: [...PRODUCT_TOPICS.coaching.categories],
    priceLabel: "Price per session",
    priceHint: "Clients pay when they book a time.",
    detailsTitle: "Session format",
    detailsText: "Clients see the length and location when they pick a time from your availability.",
    tips: ["A free 15-minute intro call builds trust.", "Ask one or two questions before each booking.", "Set a notice period so you're never surprised."],
    sections: [
      { title: "Sessions", text: "Length and how you'll meet. Clients book from your availability." },
      { title: "Booking rules", text: "Notice, booking window, changes and what clients answer first." },
    ],
  },
};

export type CreateExtras = {
  objectives: string[];
  skill: string;
  /** Second dropdown for non-course products: format, session type, service or focus. */
  subtype: string;
  level: (typeof COURSE_LEVELS)[number];
  presentation: CoursePresentation;
  lessons: string;
  license: (typeof LICENSES)[number];
  limit: number;
  expiryDays: number;
  durationMins: number;
  venue: "online" | "in_person";
  link: string;
  address: string;
  requirements: string;
  refund: "none" | "before_start" | "full";
  location: "video" | "phone" | "in_person";
  meetingLink: string;
  noticeHours: number;
  modules: DraftModule[];
  drip: "all" | "scheduled";
  certificate: boolean;
  files: ProductFile[];
  watermark: boolean;
  instantEmail: boolean;
  tickets: Ticket[];
  reminders: { week: boolean; day: boolean; hour: boolean };
  replay: boolean;
  packages: ServicePackage[];
  intake: string[];
  windowDays: number;
  rescheduleHours: number;
  cancelHours: number;
  refundOnCancel: boolean;
};
export type DraftLesson = { id: string; title: string; type: (typeof LESSON_TYPES)[number]; minutes: number; preview: boolean };
export type DraftModule = { id: string; title: string; lessons: DraftLesson[] };
/** Most lessons the create form takes; more can be added in the Curriculum tab. */
export const MAX_CREATE_LESSONS = 30;
export const MAX_PACKAGES = 3;
export const defaultExtras: CreateExtras = {
  objectives: ["", "", ""],
  skill: "",
  subtype: "",
  level: "all",
  presentation: { video: null, slides: null, images: [] },
  lessons: "",
  license: "personal",
  limit: 5,
  expiryDays: 0,
  durationMins: 60,
  venue: "online",
  link: "",
  address: "",
  requirements: "",
  refund: "before_start",
  location: "video",
  meetingLink: "",
  noticeHours: 12,
  modules: [{ id: "draft-module-1", title: "Module 1", lessons: [] }],
  drip: "all",
  certificate: false,
  files: [],
  watermark: false,
  instantEmail: true,
  tickets: [],
  reminders: { week: false, day: true, hour: true },
  replay: false,
  packages: [],
  intake: [],
  windowDays: 30,
  rescheduleHours: 24,
  cancelHours: 24,
  refundOnCancel: true,
};

const isUrl = (v: string) => /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v.trim());
const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

export type CreateIssue = { field: string; message: string };
const issue = (field: string, message: string): CreateIssue => ({ field, message });
const draftLessons = (x: CreateExtras) => x.modules.flatMap((m) => m.lessons).filter((l) => l.title.trim());

/** Every problem in the create flow, at most one per field, in check order. */
export function createIssues(form: CreatorItem, x: CreateExtras, now = new Date()): CreateIssue[] {
  const found = new Map<string, CreateIssue>();
  const add = (field: string, message: string) => { if (!found.has(field)) found.set(field, issue(field, message)); };
  if (!form.title.trim()) add("item-title", "Add a title.");
  if (!form.description.trim()) add("item-description", "Add a description.");
  if (!(form.kind === "service" && x.packages.length) && (!Number.isFinite(form.price) || form.price < 0))
    add("item-price", "Enter a valid price, or 0 to make it free.");
  if (form.kind === "course") {
    const lessons = draftLessons(x);
    if (lessons.length > MAX_CREATE_LESSONS) add("create-curriculum", `Add up to ${MAX_CREATE_LESSONS} lessons now. You can add more after saving.`);
    if (lessons.some((l) => !Number.isInteger(l.minutes) || l.minutes < 0)) add("create-curriculum", "Lesson length must be a whole number of minutes.");
  }
  if (form.kind === "live") {
    const t = Date.parse(form.date);
    if (!form.date || !Number.isFinite(t)) add("create-date", "Choose when the session starts.");
    if (t <= now.getTime()) add("create-date", "Choose a start time in the future.");
    if (!Number.isInteger(form.capacity) || form.capacity < 1) add("create-capacity", "Seats must be a whole number of at least 1.");
    if (!Number.isInteger(x.durationMins) || x.durationMins < 15) add("create-length", "Sessions need to be at least 15 minutes long.");
    if (x.venue === "online" && x.link.trim() && !isUrl(x.link)) add("create-link", "Enter a full meeting link starting with https://");
    if (x.venue === "in_person" && !x.address.trim()) add("create-address", "Add the venue address.");
    if (x.tickets.length) {
      const err = validateTickets(x.tickets, form.capacity);
      if (err) add("create-tickets", err);
      if (x.tickets.some((tk) => !Number.isFinite(tk.price) || tk.price < 0)) add("create-tickets", "Enter a valid price for every ticket.");
    }
  }
  if (form.kind === "service") {
    if (!x.packages.length && (!Number.isInteger(form.duration) || form.duration < 1)) add("create-delivery", "Delivery time must be at least 1 whole day.");
    if (x.packages.length > MAX_PACKAGES) add("create-packages", `Offer up to ${MAX_PACKAGES} packages.`);
    for (const p of x.packages) {
      const err = validatePackage(p);
      if (err) add("create-packages", `${p.name.trim() || "A package"}: ${err}`);
    }
  }
  if (form.kind === "coaching") {
    if (!Number.isInteger(form.duration) || form.duration < 15) add("create-session-length", "Sessions need to be at least 15 minutes long.");
    if (x.location === "video" && x.meetingLink.trim() && !isUrl(x.meetingLink)) add("create-meet", "Enter a full meeting link starting with https://");
  }
  return [...found.values()];
}
/** Validation for the create flow; returns the first problem and the field it belongs to. */
export function createIssue(form: CreatorItem, x: CreateExtras, now = new Date()): CreateIssue | null {
  return createIssues(form, x, now)[0] ?? null;
}
/** Validation for the create flow; returns the first problem, or "". */
export function validateCreate(form: CreatorItem, x: CreateExtras, now = new Date()) {
  return createIssue(form, x, now)?.message ?? "";
}

/** Which sections of the create form are complete, in order. */
export function createProgress(form: CreatorItem, x: CreateExtras, now = new Date()) {
  const basics = !!form.title.trim() && !!form.description.trim();
  const priced = form.kind === "service" && x.packages.length > 0 ? true : Number.isFinite(form.price) && form.price >= 0;
  let a = false;
  let b = false;
  switch (form.kind) {
    case "course":
      a = x.objectives.some((o) => o.trim());
      b = draftLessons(x).length > 0;
      break;
    case "ebook":
      a = x.files.length > 0;
      b = true;
      break;
    case "live": {
      const t = Date.parse(form.date);
      a = Number.isFinite(t) && t > now.getTime() && Number.isInteger(form.capacity) && form.capacity > 0;
      b = x.venue === "online" ? isHttpsUrl(x.link) : !!x.address.trim();
      break;
    }
    case "service":
      a = x.packages.length > 0;
      b = true;
      break;
    case "coaching":
      a = form.duration >= 15 && (x.location !== "video" || isHttpsUrl(x.meetingLink));
      b = true;
      break;
  }
  return [basics, a, b, priced, !!form.image];
}

export const CREATE_STEPS = 5;
/** Search params for the create pages: steps 2–5 live at ?step=n, step 1 has no param. */
export function parseCreateStep(s: Record<string, unknown>): { step?: number } {
  const n = Number(s["step"]);
  return Number.isInteger(n) && n >= 2 && n <= CREATE_STEPS ? { step: n } : {};
}
/** Which create step owns each validated field (1 basics, 2–3 type sections, 4 pricing, 5 cover). */
const STEP_OF_FIELD: Record<string, number> = {
  "item-title": 1, "item-description": 1, "item-category": 1,
  "create-date": 2, "create-capacity": 2, "create-length": 2, "create-delivery": 2, "create-packages": 2, "create-session-length": 2, "create-meet": 2,
  "create-curriculum": 3, "create-link": 3, "create-address": 3, "create-tickets": 3,
  "item-price": 4, "item-cover": 5,
};
export function createStepOf(field: string) {
  return STEP_OF_FIELD[field] ?? 1;
}
/** First problem that belongs to one step, so Next only checks the page the creator is on. */
export function stepIssue(form: CreatorItem, x: CreateExtras, step: number, now = new Date()): CreateIssue | null {
  return createIssues(form, x, now).find((i) => createStepOf(i.field) === step) ?? null;
}
/** The problem on the earliest step, which is where saving sends the creator back to. */
export function earliestIssue(form: CreatorItem, x: CreateExtras, now = new Date()): CreateIssue | null {
  return createIssues(form, x, now).reduce<CreateIssue | null>((best, i) => (!best || createStepOf(i.field) < createStepOf(best.field) ? i : best), null);
}

const MODULE_DEFAULT = /^Module \d+$/;
/** Applies the type-specific create answers to a new item's config. */
export function withCreateDetails(item: CreatorItem, x: CreateExtras): CreatorItem {
  switch (item.kind) {
    case "course": {
      let built = x.modules
        .map((m, i) => ({
          id: newId(),
          title: m.title.trim() || `Module ${i + 1}`,
          unlockDay: x.drip === "scheduled" ? i * 7 : 0,
          lessons: m.lessons.filter((l) => l.title.trim()).map((l) => ({ id: newId(), title: l.title.trim(), type: l.type, minutes: l.minutes, preview: l.preview, mediaId: "" })),
        }))
        .filter((m) => m.lessons.length || !MODULE_DEFAULT.test(m.title));
      if (!built.some((m) => m.lessons.length)) {
        const titles = lines(x.lessons).slice(0, MAX_CREATE_LESSONS);
        built = titles.length
          ? [{ id: newId(), title: "Module 1", unlockDay: 0, lessons: titles.map((title) => ({ id: newId(), title, type: "video" as const, minutes: 10, preview: false, mediaId: "" })) }, ...built]
          : built;
      }
      const course = courseConfigSchema.parse({
        modules: built,
        objectives: x.objectives.map((o) => o.trim()).filter(Boolean),
        skill: x.skill.trim(),
        level: x.level,
        presentation: x.presentation,
        drip: x.drip,
        certificate: { enabled: x.certificate, title: "Certificate of completion", signer: "", requireQuiz: false },
      });
      return { ...item, lessons: course.modules.flatMap((m) => m.lessons.map((l) => l.title)), course };
    }
    case "ebook":
      return { ...item, download: downloadConfigSchema.parse({ license: x.license, limit: x.limit, expiryDays: x.expiryDays, files: x.files, watermark: x.watermark, instantEmail: x.instantEmail, format: x.subtype.trim() }) };
    case "live":
      return {
        ...item,
        live: liveConfigSchema.parse({
          durationMins: x.durationMins, venue: x.venue, link: x.venue === "online" ? x.link.trim() : "", address: x.venue === "in_person" ? x.address.trim() : "",
          tickets: x.tickets.map((t) => ({ ...t, name: t.name.trim() })), reminders: x.reminders, replay: x.replay,
          sessionType: x.subtype.trim(), level: x.level,
        }),
      };
    case "service": {
      const packages = x.packages.map((p) => ({ ...p, name: p.name.trim(), description: p.description.trim() }));
      return {
        ...item,
        ...(packages.length ? { price: Math.min(...packages.map((p) => p.price)), duration: Math.min(...packages.map((p) => p.days)) } : {}),
        service: serviceConfigSchema.parse({ packages, requirements: lines(x.requirements).slice(0, 10), refund: x.refund, serviceType: x.subtype.trim() }),
      };
    }
    case "coaching":
      return {
        ...item,
        coaching: coachingConfigSchema.parse({
          location: x.location, meetingLink: x.location === "video" ? x.meetingLink.trim() : "", noticeHours: x.noticeHours,
          windowDays: x.windowDays, rescheduleHours: x.rescheduleHours, cancelHours: x.cancelHours, refundOnCancel: x.refundOnCancel,
          intake: x.intake.map((q) => q.trim()).filter(Boolean).slice(0, 10),
          focus: x.subtype.trim(),
        }),
      };
  }
}

const fix = (v: number, ok: (n: number) => boolean, fallback: number) => (ok(v) ? v : fallback);
const whole = (min: number, max = Infinity) => (n: number) => Number.isInteger(n) && n >= min && n <= max;
const money = (n: number) => Number.isFinite(n) && n >= 0;
/**
 * Makes unfinished answers safe to save as a draft, so the creator is never stuck:
 * a blank title becomes "Untitled …" and unreadable numbers fall back to sensible defaults.
 * Publishing still runs the full checks.
 */
export function draftAnswers(form: CreatorItem, x: CreateExtras, noun: string): { form: CreatorItem; x: CreateExtras } {
  return {
    form: {
      ...form,
      title: form.title.trim() || `Untitled ${noun}`,
      price: fix(form.price, money, 0),
      capacity: fix(form.capacity, whole(0), 30),
      duration: fix(form.duration, money, form.kind === "coaching" ? 60 : form.kind === "service" ? 7 : 0),
    },
    x: {
      ...x,
      durationMins: fix(x.durationMins, whole(1), 60),
      limit: fix(x.limit, whole(0), 5),
      expiryDays: fix(x.expiryDays, whole(0), 0),
      noticeHours: fix(x.noticeHours, whole(0), 12),
      windowDays: fix(x.windowDays, whole(1, 180), 30),
      rescheduleHours: fix(x.rescheduleHours, whole(0), 24),
      cancelHours: fix(x.cancelHours, whole(0), 24),
      modules: x.modules.map((m) => ({ ...m, lessons: m.lessons.slice(0, MAX_CREATE_LESSONS).map((l) => ({ ...l, minutes: fix(l.minutes, whole(0), 10) })) })),
      tickets: x.tickets.map((t) => ({ ...t, price: fix(t.price, money, 0), quantity: fix(t.quantity, whole(1), 1) })),
      packages: x.packages.slice(0, MAX_PACKAGES).map((p) => ({ ...p, price: fix(p.price, money, 0), days: fix(p.days, whole(1), 7), revisions: fix(p.revisions, whole(0), 1) })),
    },
  };
}
