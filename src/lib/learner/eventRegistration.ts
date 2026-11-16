/** Pure helpers for the event registration journey: steps, attendee details, ticket references. */
import { cleanFullName, fullNameProblem } from "@/lib/shared/names";
import type { LearnerEvent } from "./catalog";

export type RegStep = "tickets" | "details" | "review";
export type AttendeeDraft = { qty: number; name: string; email: string; phone: string; goal: string; access: string; agree: boolean };
export const MAX_EVENT_TICKETS = 5;

/** Free events give one seat per person; paid events sell up to five tickets per order. */
export const regSteps = (e: Pick<LearnerEvent, "price">): RegStep[] => (e.price > 0 ? ["tickets", "details", "review"] : ["details", "review"]);
export const regStepLabels = (e: Pick<LearnerEvent, "price">): string[] => (e.price > 0 ? ["Tickets", "Your details", "Review", "Payment"] : ["Your details", "Review", "Confirmed"]);
export const firstRegStep = (e: Pick<LearnerEvent, "price">): RegStep => regSteps(e)[0]!;
/** A step that doesn't apply to this event falls back to its first step. */
export const safeRegStep = (e: Pick<LearnerEvent, "price">, step: RegStep | undefined): RegStep => (step && regSteps(e).includes(step) ? step : firstRegStep(e));
export const nextRegStep = (e: Pick<LearnerEvent, "price">, step: RegStep): RegStep | null => {
  const list = regSteps(e);
  return list[list.indexOf(step) + 1] ?? null;
};
export const prevRegStep = (e: Pick<LearnerEvent, "price">, step: RegStep): RegStep | null => {
  const list = regSteps(e);
  return list[list.indexOf(step) - 1] ?? null;
};

export const clampTickets = (e: Pick<LearnerEvent, "price">, qty: number) => (e.price > 0 ? Math.min(MAX_EVENT_TICKETS, Math.max(1, Math.round(qty) || 1)) : 1);
export const registrationTotal = (e: Pick<LearnerEvent, "price">, qty: number) => e.price * clampTickets(e, qty);

export const blankDraft = (profile: { fullName: string; email: string; phone: string }): AttendeeDraft => ({
  qty: 1, name: profile.fullName, email: profile.email, phone: profile.phone, goal: "", access: "", agree: false,
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export type DraftProblems = Partial<Record<"name" | "email" | "phone" | "agree", string>>;
/** What still needs fixing before the attendee details can be saved. Empty when it's fine. */
export function draftProblems(d: AttendeeDraft): DraftProblems {
  const out: DraftProblems = {};
  const n = fullNameProblem(d.name);
  if (n) out.name = n;
  const email = d.email.trim();
  if (!email) out.email = "Enter your email address";
  else if (!EMAIL.test(email)) out.email = "Enter an email like name@example.com";
  const digits = d.phone.replace(/\D/g, "");
  if (d.phone.trim() && (digits.length < 7 || digits.length > 15)) out.phone = "Enter a phone number with 7 to 15 digits, or leave it blank";
  if (!d.agree) out.agree = "Please agree to the event guidelines to continue";
  return out;
}
export const cleanDraft = (d: AttendeeDraft): AttendeeDraft => ({ ...d, name: cleanFullName(d.name), email: d.email.trim().toLowerCase(), phone: d.phone.trim(), goal: d.goal.trim(), access: d.access.trim() });

/** Stable ticket reference for one attendee at one event, e.g. EVT-AIAP-4821. */
export function ticketReference(eventId: string, email: string): string {
  const letters = eventId.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  let h = 2166136261;
  for (const ch of `${eventId}|${email.trim().toLowerCase()}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `EVT-${letters}-${String(h % 10000).padStart(4, "0")}`;
}
