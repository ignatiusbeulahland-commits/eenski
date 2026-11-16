import { describe, expect, it } from "vitest";
import { blankDraft, draftProblems, registrationTotal } from "./eventRegistration";
import { findEvent } from "./catalog";
import { canRegister, registerFree, saveEventDraft, startPaidRegistration, initialLearnerState, type LearnerState } from "./rules";

const free = findEvent("ai-app-workshop")!;
const paid = findEvent("lagos-creators-meetup")!;
const state = (): LearnerState => ({ ...initialLearnerState, profile: { ...initialLearnerState.profile, fullName: "Ada Lovelace", email: "ada@example.com", phone: "" } });

describe("event registration flow", () => {
  it("registers for a free event with valid details and blocks a second seat", () => {
    const s = state();
    const withDraft = { ...s, ...saveEventDraft(s, free.id, { ...blankDraft(s.profile), agree: true }) };
    const done = registerFree(withDraft, free.id);
    expect(done.registrations).toHaveLength(1);
    const next = { ...withDraft, ...done };
    expect(canRegister(next, free.id)).toEqual({ ok: false, reason: "You're already registered" });
  });
  it("requires name, email and agreement before details can be saved", () => {
    const problems = draftProblems({ ...blankDraft(state().profile), name: "", email: "nope", agree: false });
    expect(problems.name).toBeTruthy();
    expect(problems.email).toBeTruthy();
    expect(problems.agree).toBeTruthy();
  });
  it("puts the chosen paid tickets in the cart only with valid saved details", () => {
    const s = state();
    expect(startPaidRegistration(s, paid.id).cart).toBeUndefined();
    const withDraft = { ...s, ...saveEventDraft(s, paid.id, { ...blankDraft(s.profile), qty: 3, agree: true }) };
    const carted = startPaidRegistration(withDraft, paid.id);
    expect(carted.cart).toEqual([expect.objectContaining({ kind: "event", id: paid.id, qty: 3 })]);
    expect(registrationTotal(paid, 3)).toBe(paid.price * 3);
  });
  it("caps paid tickets at five", () => {
    const s = state();
    const withDraft = { ...s, ...saveEventDraft(s, paid.id, { ...blankDraft(s.profile), qty: 9, agree: true }) };
    expect(withDraft.eventDrafts[paid.id]?.qty).toBe(5);
  });
});
