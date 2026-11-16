import { certificateNameOf, cleanFullName, fullNameProblem } from "@/lib/shared/names";
import { z } from "zod";
import { defaultFinancePrefs, financePrefsSchema } from "@/lib/shared/finance/beneficiaries";
import type { TxRow } from "@/lib/shared/finance/history";
import { findEvent, findResource, resources, events, isPast, type LearnerResource } from "./catalog";
import { clampTickets, cleanDraft, draftProblems, ticketReference, type AttendeeDraft } from "./eventRegistration";

export const STORAGE_KEY = "enski-learner-prototype-v1";
export type ItemRef = { kind: "resource" | "event"; id: string };

const ref = z.object({ kind: z.enum(["resource", "event"]), id: z.string() });
const purchaseItem = ref.extend({ title: z.string(), price: z.number(), qty: z.number().int().min(1), image: z.string().optional() });
export const stateSchema = z.object({
  profile: z.object({ fullName: z.string(), displayName: z.string(), email: z.string(), phone: z.string(), bio: z.string(), photo: z.string().default(""), certificateName: z.string().default("") }),
  wishlist: z.array(ref.extend({ addedAt: z.string() })).default([]),
  cart: z.array(ref.extend({ qty: z.number().int().min(1), addedAt: z.string() })).default([]),
  purchases: z.array(z.object({ id: z.string(), orderNumber: z.string(), date: z.string(), items: z.array(purchaseItem), total: z.number(), status: z.enum(["paid", "pending", "failed"]), method: z.enum(["card", "transfer"]) })).default([]),
  /** name/email/reference are the attendee details given at registration; older registrations may not have them. */
  registrations: z.array(z.object({ eventId: z.string(), date: z.string(), tickets: z.number().int().min(1), attendedAt: z.string().optional(), name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), reference: z.string().optional() })).default([]),
  /** Attendee details saved while registering (resumable), keyed by event id. */
  eventDrafts: z.record(z.object({ qty: z.number().int().min(1), name: z.string(), email: z.string(), phone: z.string(), goal: z.string(), access: z.string(), agree: z.boolean() })).default({}),
  progress: z.record(z.object({ completed: z.array(z.string()), lastAccessed: z.string().optional() })).default({}),
  /** recipientName is the name printed when it was issued; later name changes never rewrite it. */
  certificates: z.array(z.object({ id: z.string(), resourceId: z.string(), title: z.string(), issuer: z.string(), issuedAt: z.string(), recipientName: z.string().optional() })).default([]),
  /** Requests to correct the name on an issued certificate. The issuer reviews them; nothing changes until then. */
  corrections: z.array(z.object({ id: z.string(), certificateId: z.string(), currentName: z.string(), requestedName: z.string(), reason: z.string(), at: z.string(), status: z.enum(["pending", "withdrawn"]) })).default([]),
  badges: z.record(z.string()).default({}),
  celebrated: z.array(z.string()).default([]),
  notifications: z.array(z.object({ id: z.string(), title: z.string(), body: z.string(), date: z.string(), read: z.boolean(), type: z.enum(["purchase", "event", "achievement", "product", "account", "support"]) })).default([]),
  prefs: z.object({ inApp: z.boolean(), eventReminders: z.boolean(), purchaseUpdates: z.boolean(), productUpdates: z.boolean(), announcements: z.boolean() }),
  integrations: z.record(z.string()).default({}),
  security: z.object({ twoFactor: z.boolean(), loginAlerts: z.boolean(), passwordUpdatedAt: z.string().optional() }),
  support: z.array(z.object({ id: z.string(), reference: z.string(), subject: z.string(), category: z.string(), date: z.string() })).default([]),
  collapsed: z.boolean().default(false),
  /** Local calendar days (YYYY-MM-DD) with real learning activity: lessons, opens, attendance. */
  learningDays: z.array(z.string()).default([]),
  /** Owned resources the learner tucked away from their library view. Ownership is unchanged. */
  hiddenResources: z.array(z.string()).default([]),
  /** Courses and products bought through the sitewide checkout, kept as a snapshot so they open offline. */
  shopLibrary: z
    .array(
      z.object({
        id: z.string(), title: z.string(), creator: z.string(), description: z.string(),
        type: z.enum(["Course", "Ebook", "Template", "Coaching"]), category: z.string(), price: z.number(),
        image: z.string(), imageAlt: z.string(),
        units: z.array(z.object({
          id: z.string(), title: z.string(), minutes: z.number(),
          seconds: z.number().optional(), description: z.string().optional(), module: z.string().optional(), preview: z.boolean().optional(),
          kind: z.enum(["video", "text", "download", "quiz"]).optional(), mediaId: z.string().optional(), unlockDay: z.number().optional(),
        })),
        quiz: z.object({ passMark: z.number(), required: z.boolean(), questions: z.array(z.object({ id: z.string(), prompt: z.string(), options: z.array(z.string()), answer: z.number() })) }).optional(),
        eligible: z.boolean(), certificate: z.boolean(), downloadable: z.boolean(),
        publicRoute: z.object({ kind: z.enum(["course", "dreamverse", "store"]), slug: z.string(), item: z.string().optional() }).optional(),
      }),
    )
    .default([]),
  /** Final-quiz attempts per resource: best and latest score (0–100), and when it was first passed. */
  quizzes: z.record(z.object({ attempts: z.number().int(), best: z.number(), last: z.number(), passedAt: z.string().optional(), answers: z.array(z.number()).optional() })).default({}),
  /** Country of residence and display currency; learners don't receive payouts. */
  finance: financePrefsSchema.default({}),
});
export type LearnerState = z.infer<typeof stateSchema>;
export type Purchase = LearnerState["purchases"][number];
export type LearnerNotification = LearnerState["notifications"][number];

/** A brand-new learner: identity only, every list empty. */
export const initialLearnerState: LearnerState = {
  profile: { fullName: "", displayName: "", email: "", phone: "", bio: "", photo: "", certificateName: "" },
  wishlist: [], cart: [], purchases: [], registrations: [], eventDrafts: {}, progress: {}, certificates: [], corrections: [], badges: {}, celebrated: [], notifications: [],
  prefs: { inApp: true, eventReminders: true, purchaseUpdates: true, productUpdates: false, announcements: false },
  integrations: {}, security: { twoFactor: false, loginAlerts: true }, support: [], collapsed: false, learningDays: [], hiddenResources: [], shopLibrary: [], quizzes: {}, finance: defaultFinancePrefs,
};

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const prefFor: Record<LearnerNotification["type"], keyof LearnerState["prefs"] | null> = { purchase: "purchaseUpdates", event: "eventReminders", achievement: null, product: "productUpdates", account: null, support: null };
export function notify(s: LearnerState, type: LearnerNotification["type"], title: string, body: string): LearnerNotification[] {
  const pref = prefFor[type];
  if (!s.prefs.inApp || (pref && !s.prefs[pref])) return s.notifications;
  return [{ id: uid(), type, title, body, date: new Date().toISOString(), read: false }, ...s.notifications].slice(0, 50);
}

/* ---------- ownership, catalogue lookups ---------- */
export const ownedResourceIds = (s: LearnerState) =>
  [...new Set(s.purchases.filter((p) => p.status === "paid").flatMap((p) => p.items.filter((i) => i.kind === "resource").map((i) => i.id)))];
export const owns = (s: LearnerState, id: string) => ownedResourceIds(s).includes(id);
export const registration = (s: LearnerState, eventId: string) => s.registrations.find((r) => r.eventId === eventId);
export const itemInfo = (r: ItemRef) => {
  const x = r.kind === "resource" ? findResource(r.id) : findEvent(r.id);
  return x ? { title: x.title, price: x.price, image: x.image, by: "creator" in x ? x.creator : x.host } : null;
};
export const sameRef = (a: ItemRef, b: ItemRef) => a.kind === b.kind && a.id === b.id;

/* ---------- wishlist & cart ---------- */
export type CartCheck = { ok: true } | { ok: false; reason: string };
export function canAddToCart(s: LearnerState, r: ItemRef, now = Date.now()): CartCheck {
  if (r.kind === "resource") {
    if (!findResource(r.id)) return { ok: false, reason: "This resource is unavailable" };
    if (owns(s, r.id)) return { ok: false, reason: "You already own this resource" };
  } else {
    const e = findEvent(r.id);
    if (!e) return { ok: false, reason: "This event is unavailable" };
    if (isPast(e, now)) return { ok: false, reason: "This event has already happened" };
    if (e.price === 0) return { ok: false, reason: "Free events don't need a ticket. Register instead" };
    if (registration(s, r.id)) return { ok: false, reason: "You're already registered" };
  }
  return { ok: true };
}
export const MAX_TICKETS = 5;
export function addToCart(s: LearnerState, r: ItemRef, now = Date.now()): Partial<LearnerState> {
  if (!canAddToCart(s, r, now).ok || s.cart.some((c) => sameRef(c, r))) return {};
  return { cart: [...s.cart, { ...r, qty: 1, addedAt: new Date(now).toISOString() }] };
}
export function setQty(s: LearnerState, r: ItemRef, qty: number): Partial<LearnerState> {
  if (r.kind === "resource") return {};
  const q = Math.min(MAX_TICKETS, Math.max(1, Math.round(qty)));
  return { cart: s.cart.map((c) => (sameRef(c, r) ? { ...c, qty: q } : c)) };
}
export const toggleWishlist = (s: LearnerState, r: ItemRef): Partial<LearnerState> =>
  s.wishlist.some((w) => sameRef(w, r)) ? { wishlist: s.wishlist.filter((w) => !sameRef(w, r)) } : { wishlist: [{ ...r, addedAt: new Date().toISOString() }, ...s.wishlist] };
export function moveToCart(s: LearnerState, r: ItemRef): Partial<LearnerState> {
  const added = addToCart(s, r);
  if (!added.cart) return {};
  return { ...added, wishlist: s.wishlist.filter((w) => !sameRef(w, r)) };
}
/** Prices come from the catalogue; no invented fees or taxes are added. */
export function cartTotals(cart: LearnerState["cart"]) {
  const lines = cart.flatMap((c) => {
    const info = itemInfo(c);
    return info ? [{ ...c, ...info, line: info.price * c.qty }] : [];
  });
  const subtotal = lines.reduce((a, l) => a + l.line, 0);
  return { lines, subtotal, total: subtotal, count: lines.reduce((a, l) => a + l.qty, 0) };
}

/* ---------- checkout ---------- */
export type CheckoutOutcome = "success" | "failure";
export function checkout(s: LearnerState, method: "card" | "transfer", outcome: CheckoutOutcome, now = new Date()): { patch: Partial<LearnerState>; purchase: Purchase } | null {
  const { lines, total } = cartTotals(s.cart);
  if (!lines.length) return null;
  const status: Purchase["status"] = outcome === "failure" ? "failed" : method === "transfer" ? "pending" : "paid";
  const purchase: Purchase = {
    id: uid(), orderNumber: `ENS-${String(s.purchases.length + 1).padStart(4, "0")}`, date: now.toISOString(),
    items: lines.map((l) => ({ kind: l.kind, id: l.id, title: l.title, price: l.price, qty: l.qty, image: l.image })), total, status, method,
  };
  let next: LearnerState = { ...s, purchases: [purchase, ...s.purchases], cart: status === "failed" ? s.cart : [] };
  next = status === "paid" ? fulfil(next, purchase) : next;
  const msg = status === "paid" ? ["Payment confirmed", `${purchase.orderNumber} · your items are ready`] : status === "pending" ? ["Awaiting transfer", `${purchase.orderNumber} is pending confirmation`] : ["Payment didn't go through", `${purchase.orderNumber} · your cart is saved`];
  next = { ...next, notifications: notify(next, "purchase", msg[0]!, msg[1]!) };
  return { patch: next, purchase };
}
/** Grants event tickets for a paid order. Resource access is derived from paid purchases. */
function fulfil(s: LearnerState, p: Purchase): LearnerState {
  const items = p.items.filter((i) => i.kind === "event" && !registration(s, i.id));
  const regs = items.map((i) => ({ eventId: i.id, date: new Date().toISOString(), tickets: i.qty, ...attendeeFor(s, i.id) }));
  const eventDrafts = { ...s.eventDrafts };
  for (const i of items) delete eventDrafts[i.id];
  return { ...s, registrations: [...s.registrations, ...regs], eventDrafts };
}
/** Attendee fields for a new registration: the saved draft, else the learner's profile. */
function attendeeFor(s: LearnerState, eventId: string) {
  const d = s.eventDrafts[eventId];
  const name = d?.name || s.profile.fullName;
  const email = d?.email || s.profile.email;
  const phone = d?.phone || s.profile.phone;
  return { ...(name ? { name } : {}), ...(email ? { email, reference: ticketReference(eventId, email) } : {}), ...(phone ? { phone } : {}) };
}
export function confirmTransfer(s: LearnerState, purchaseId: string): Partial<LearnerState> {
  const p = s.purchases.find((x) => x.id === purchaseId);
  if (!p || p.status !== "pending") return {};
  const paid = { ...p, status: "paid" as const };
  const next = fulfil({ ...s, purchases: s.purchases.map((x) => (x.id === purchaseId ? paid : x)) }, paid);
  return { ...next, notifications: notify(next, "purchase", "Transfer confirmed", `${p.orderNumber} · your items are ready`) };
}
export function retryPurchase(s: LearnerState, purchaseId: string): Partial<LearnerState> {
  const p = s.purchases.find((x) => x.id === purchaseId);
  if (!p || p.status !== "failed") return {};
  let next = s;
  for (const i of p.items) {
    const added = addToCart(next, i);
    if (added.cart) next = { ...next, cart: added.cart.map((c) => (sameRef(c, i) ? { ...c, qty: i.qty } : c)) };
  }
  return { cart: next.cart };
}

/* ---------- events ---------- */
export function registerFree(s: LearnerState, eventId: string, now = Date.now()): Partial<LearnerState> {
  const e = findEvent(eventId);
  if (!e || e.price > 0 || isPast(e, now) || registration(s, eventId)) return {};
  const eventDrafts = { ...s.eventDrafts };
  const reg = { eventId, date: new Date(now).toISOString(), tickets: 1, ...attendeeFor(s, eventId) };
  delete eventDrafts[eventId];
  const next = { ...s, registrations: [...s.registrations, reg], eventDrafts };
  return { registrations: next.registrations, eventDrafts, notifications: notify(next, "event", "You're registered", e.title) };
}
/** Saves attendee details while registering, so the journey can be resumed. */
export function saveEventDraft(s: LearnerState, eventId: string, d: AttendeeDraft): Partial<LearnerState> {
  const e = findEvent(eventId);
  if (!e) return {};
  return { eventDrafts: { ...s.eventDrafts, [eventId]: { ...cleanDraft(d), qty: clampTickets(e, d.qty) } } };
}
export type RegisterCheck = { ok: true } | { ok: false; reason: string };
/** Whether this learner can start or finish registering for an event right now. */
export function canRegister(s: LearnerState, eventId: string, now = Date.now()): RegisterCheck {
  const e = findEvent(eventId);
  if (!e) return { ok: false, reason: "This event is unavailable" };
  if (isPast(e, now)) return { ok: false, reason: "This event has already happened" };
  if (registration(s, eventId)) return { ok: false, reason: "You're already registered" };
  return { ok: true };
}
/** Paid events: puts the chosen tickets in the cart, ready for checkout. Needs valid saved details. */
export function startPaidRegistration(s: LearnerState, eventId: string, now = Date.now()): Partial<LearnerState> {
  const e = findEvent(eventId);
  const d = s.eventDrafts[eventId];
  if (!e || e.price === 0 || !d || Object.keys(draftProblems(d)).length || !canRegister(s, eventId, now).ok) return {};
  const qty = clampTickets(e, d.qty);
  const inCart = s.cart.some((c) => c.kind === "event" && c.id === eventId);
  const cart = inCart
    ? s.cart.map((c) => (c.kind === "event" && c.id === eventId ? { ...c, qty } : c))
    : [...s.cart, { kind: "event" as const, id: eventId, qty, addedAt: new Date(now).toISOString() }];
  return { cart };
}
export const cancelRegistration = (s: LearnerState, eventId: string): Partial<LearnerState> => {
  const e = findEvent(eventId);
  const r = registration(s, eventId);
  // Paid tickets come from a purchase; the demo has no refund flow, so only free registrations can be cancelled.
  if (!e || !r || e.price > 0 || r.attendedAt) return {};
  return { registrations: s.registrations.filter((x) => x.eventId !== eventId) };
};
export const markAttended = (s: LearnerState, eventId: string): Partial<LearnerState> =>
  registration(s, eventId) && !registration(s, eventId)!.attendedAt ? { registrations: s.registrations.map((r) => (r.eventId === eventId ? { ...r, attendedAt: new Date().toISOString() } : r)) } : {};

/* ---------- learning progress ---------- */
export function toggleUnit(s: LearnerState, resourceId: string, unitId: string): Partial<LearnerState> {
  if (!owns(s, resourceId)) return {};
  const cur = s.progress[resourceId] ?? { completed: [] };
  const completed = cur.completed.includes(unitId) ? cur.completed.filter((u) => u !== unitId) : [...cur.completed, unitId];
  return { progress: { ...s.progress, [resourceId]: { completed, lastAccessed: new Date().toISOString() } } };
}
export const touchResource = (s: LearnerState, resourceId: string): Partial<LearnerState> =>
  owns(s, resourceId) ? { progress: { ...s.progress, [resourceId]: { completed: s.progress[resourceId]?.completed ?? [], lastAccessed: new Date().toISOString() } } } : {};
export function resourceProgress(s: LearnerState, resourceId: string) {
  const r = findResource(resourceId);
  if (!r) return { done: 0, total: 0, pct: 0, lessonsDone: false, quizPending: false, complete: false };
  const done = (s.progress[resourceId]?.completed ?? []).filter((u) => r.units.some((x) => x.id === u)).length;
  const lessonsDone = done === r.units.length;
  // A required final quiz must be passed before the course counts as complete.
  const quizPending = Boolean(r.quiz?.required && r.quiz.questions.length && !s.quizzes?.[resourceId]?.passedAt);
  return { done, total: r.units.length, pct: Math.round((done / r.units.length) * 100), lessonsDone, quizPending, complete: lessonsDone && !quizPending };
}

/* ---------- achievements ---------- */
export type BadgeDef = { id: string; title: string; description: string; how: string; target: number; art: "spark" | "book" | "flag" | "stack" | "ticket" | "people" | "compass" | "star" | "user"; category: "Learning" | "Participation" };
export const badgeDefs: BadgeDef[] = [
  { id: "profile-ready", title: "Profile Ready", description: "Set up your learner profile so creators know who they're teaching.", how: "Add your full name, display name, email and a short bio", target: 1, art: "user", category: "Participation" },
  { id: "first-lesson", title: "First Lesson", description: "You started learning on Enski.", how: "Complete one lesson or chapter in a resource you own", target: 1, art: "spark", category: "Learning" },
  { id: "steady-learner", title: "Steady Learner", description: "Ten lessons in, learning is becoming a habit.", how: "Complete 10 lessons or chapters", target: 10, art: "book", category: "Learning" },
  { id: "finisher", title: "First Course Completed", description: "You saw a resource through from start to finish.", how: "Complete every lesson in one eligible resource", target: 1, art: "flag", category: "Learning" },
  { id: "knowledge-builder", title: "Knowledge Builder", description: "You've finished three resources. Keep it going.", how: "Complete 3 eligible resources", target: 3, art: "stack", category: "Learning" },
  { id: "rsvp", title: "Saved a Seat", description: "You committed to learning live with others.", how: "Register for an eligible event", target: 1, art: "ticket", category: "Participation" },
  { id: "show-up", title: "Showed Up", description: "You attended your first Enski event.", how: "Attend one eligible event", target: 1, art: "compass", category: "Participation" },
  { id: "community-regular", title: "Community Regular", description: "A familiar face at Enski events.", how: "Attend 3 eligible events", target: 3, art: "people", category: "Participation" },
  { id: "learning-milestone", title: "Learning Milestone", description: "Twenty-five lessons completed.", how: "Complete 25 lessons or chapters", target: 25, art: "book", category: "Learning" },
  { id: "early-achiever", title: "Early Achiever", description: "You finished a resource within a week of getting it.", how: "Complete a certificate-eligible resource within 7 days of getting it", target: 1, art: "flag", category: "Learning" },
  { id: "well-rounded", title: "Well Rounded", description: "You learn on your own and with the community.", how: "Complete an eligible resource and attend an eligible event", target: 2, art: "star", category: "Learning" },
];
export function badgeProgress(s: LearnerState): Record<string, number> {
  const owned = ownedResourceIds(s);
  const lessons = owned.reduce((a, id) => a + resourceProgress(s, id).done, 0);
  const completed = owned.filter((id) => findResource(id)?.eligible && resourceProgress(s, id).complete).length;
  const eligibleRegs = s.registrations.filter((r) => findEvent(r.eventId)?.eligible);
  const attended = eligibleRegs.filter((r) => r.attendedAt).length;
  const p = s.profile;
  return {
    "profile-ready": p.fullName.trim() && p.displayName.trim() && p.email.trim() && p.bio.trim() ? 1 : 0,
    "first-lesson": Math.min(1, lessons),
    "steady-learner": Math.min(10, lessons),
    finisher: Math.min(1, completed),
    "knowledge-builder": Math.min(3, completed),
    rsvp: Math.min(1, eligibleRegs.length),
    "show-up": Math.min(1, attended),
    "community-regular": Math.min(3, attended),
    "well-rounded": (completed > 0 ? 1 : 0) + (attended > 0 ? 1 : 0),
    "learning-milestone": Math.min(25, lessons),
    "early-achiever": s.certificates.some((c) => {
      const bought = s.purchases.filter((p) => p.status === "paid" && p.items.some((i) => i.id === c.resourceId)).map((p) => Date.parse(p.date)).sort()[0];
      return bought !== undefined && Date.parse(c.issuedAt) - bought <= 7 * 24 * 3600 * 1000;
    }) ? 1 : 0,
  };
}
/** Records each badge and certificate once, the first time it is earned. Never revokes. */
export function withAchievements(s: LearnerState, now = new Date()): LearnerState {
  const prog = badgeProgress(s);
  let next = s;
  for (const b of badgeDefs) {
    if ((prog[b.id] ?? 0) >= b.target && !next.badges[b.id]) {
      next = { ...next, badges: { ...next.badges, [b.id]: now.toISOString() } };
      next = { ...next, notifications: notify(next, "achievement", `Badge earned: ${b.title}`, b.description) };
    }
  }
  for (const id of ownedResourceIds(s)) {
    const r = findResource(id);
    if (r?.certificate && resourceProgress(s, id).complete && !next.certificates.some((c) => c.resourceId === id)) {
      next = { ...next, certificates: [{ id: `cert-${id}`, resourceId: id, title: r.title, issuer: r.creator, issuedAt: now.toISOString(), recipientName: certificateNameOf(next.profile) }, ...next.certificates] };
      next = { ...next, notifications: notify(next, "achievement", "Certificate of completion issued", r.title) };
    }
  }
  return next;
}
/** Older saved certificates had no printed name: lock in the full name they were showing, once. */
export function withPrintedNames(s: LearnerState): LearnerState {
  if (s.certificates.every((c) => c.recipientName)) return s;
  return { ...s, certificates: s.certificates.map((c) => (c.recipientName ? c : { ...c, recipientName: cleanFullName(s.profile.fullName) })) };
}
/** The name on an issued certificate. */
export const printedName = (c: { recipientName?: string | undefined }, p: LearnerState["profile"]) => c.recipientName || certificateNameOf(p);
export const pendingCorrection = (s: LearnerState, certificateId: string) => s.corrections.find((c) => c.certificateId === certificateId && c.status === "pending");

export const pendingCelebration = (s: LearnerState) => badgeDefs.find((b) => s.badges[b.id] && !s.celebrated.includes(b.id));
/** A certificate earned in the last two weeks that the learner hasn't been told about yet (badges go first). */
/** The course whose completion screen is open, if any. That screen already announces the certificate, so pop-ups wait. */
export function completionScreenResource(pathname: string): string | null {
  const m = /^\/learner\/resources\/([^/]+)\/complete\/?$/.exec(pathname);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

export const pendingCertificateNotice = (s: LearnerState, now = Date.now()) =>
  s.certificates.find((c) => !s.celebrated.includes(`cert:${c.id}`) && now - new Date(c.issuedAt).getTime() < 14 * 86_400_000);

export function profileCompletion(s: LearnerState) {
  const p = s.profile;
  const fields = [p.fullName, p.displayName, p.email, p.phone, p.bio, p.photo];
  return Math.round((fields.filter((f) => f.trim()).length / fields.length) * 100);
}

/* ---------- validation ---------- */
export const profileSchema = z.object({
  fullName: z.string().transform(cleanFullName).superRefine((v, ctx) => { const m = fullNameProblem(v); if (m) ctx.addIssue({ code: "custom", message: m }); }),
  displayName: z.string().trim().min(2, "Enter a display name").max(40),
  certificateName: z.string().transform(cleanFullName).superRefine((v, ctx) => { const m = v ? fullNameProblem(v) : null; if (m) ctx.addIssue({ code: "custom", message: m }); }),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().regex(/^$|^\+?[0-9 ]{7,16}$/, "Enter a valid phone number"),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters"),
});
export const passwordSchema = z
  .object({ current: z.string().min(1, "Enter your current password"), next: z.string().min(8, "Use at least 8 characters").regex(/[0-9]/, "Include a number").regex(/[A-Za-z]/, "Include a letter"), confirm: z.string() })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don't match" })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Choose a new password" });
export const supportSchema = z.object({
  category: z.enum(["account", "purchases", "resources", "events", "other"]),
  subject: z.string().trim().min(4, "Add a short subject").max(100),
  message: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(1500),
  email: z.string().trim().email("Enter a valid email"),
});
export const catalogue = { resources, events };

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const learningSignature = (s: LearnerState) =>
  Object.entries(s.progress).map(([k, v]) => `${k}:${v.completed.length}:${v.lastAccessed ?? ""}`).join("|") +
  "#" + s.registrations.map((r) => r.attendedAt ?? "").join("|");

/** Adds today to learningDays when lessons, resource opens or attendance changed. */
export function recordLearningDay(prev: LearnerState, next: LearnerState, now = new Date()): LearnerState {
  if (learningSignature(prev) === learningSignature(next)) return next;
  const today = dayKey(now);
  return next.learningDays.includes(today) ? next : { ...next, learningDays: [...next.learningDays, today].slice(-400) };
}

/** Consecutive learning days ending today (or yesterday, so the streak survives until midnight). */
export function learningStreak(days: string[], now = new Date()) {
  const set = new Set(days);
  const d = new Date(now);
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ---------------- Recommendations ---------------- */
export type RecommendationReason = "saved" | "library" | "starter";
export type Recommendation = { resource: LearnerResource; reason: RecommendationReason };
const typeOrder: LearnerResource["type"][] = ["Course", "Template", "Coaching", "Ebook"];

/** Percentage off a demo list price, or 0 when there is no promotion. */
export const discountPct = (r: Pick<LearnerResource, "price" | "originalPrice">) =>
  r.originalPrice && r.originalPrice > r.price ? Math.round((1 - r.price / r.originalPrice) * 100) : 0;

/**
 * Personalised picks from local signals only: categories the learner saved or put in the cart rank first,
 * then categories already in their library, then a mixed starter set. Owned resources are never recommended.
 */
export function recommendResources(s: LearnerState, list: LearnerResource[] = resources): Recommendation[] {
  const owned = new Set(ownedResourceIds(s));
  const cats = (refs: { kind: string; id: string }[]) =>
    new Set(refs.flatMap((r) => (r.kind === "resource" ? [findResource(r.id)?.category] : [])).filter(Boolean));
  const saved = cats([...s.wishlist, ...s.cart]);
  const library = cats([...owned].map((id) => ({ kind: "resource", id })));
  const reasonFor = (r: LearnerResource): RecommendationReason => (saved.has(r.category) ? "saved" : library.has(r.category) ? "library" : "starter");
  const buckets: Record<RecommendationReason, LearnerResource[]> = { saved: [], library: [], starter: [] };
  for (const r of list) if (!owned.has(r.id)) buckets[reasonFor(r)].push(r);
  // Within each bucket, alternate product types so the grid mixes courses, templates, coaching and ebooks.
  const mix = (items: LearnerResource[]) => {
    const byType = typeOrder.map((t) => items.filter((r) => r.type === t).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
    const out: LearnerResource[] = [];
    for (let i = 0; out.length < items.length; i++) for (const group of byType) if (group[i]) out.push(group[i]!);
    return out;
  };
  return (["saved", "library", "starter"] as const).flatMap((reason) => mix(buckets[reason]).map((resource) => ({ resource, reason })));
}

/** Learner orders as shared history rows (money out). Statuses map 1:1; nothing is invented. */
export function learnerTransactions(purchases: Purchase[]): TxRow[] {
  return purchases.map((p) => ({
    id: p.id,
    description: `${p.items[0]?.title ?? "Order"}${p.items.length > 1 ? ` +${p.items.length - 1} more` : ""}`,
    detail: `${p.items.reduce((n, i) => n + i.qty, 0)} item${p.items.reduce((n, i) => n + i.qty, 0) === 1 ? "" : "s"}`,
    amount: p.total, currency: "NGN", direction: "out", date: p.date, reference: p.orderNumber,
    method: p.method === "card" ? "Card" : "Bank transfer",
    status: p.status === "paid" ? "successful" : p.status === "pending" ? "pending" : "failed",
    href: { to: "/learner/purchases/$purchaseId", params: { purchaseId: p.id } },
  }));
}
