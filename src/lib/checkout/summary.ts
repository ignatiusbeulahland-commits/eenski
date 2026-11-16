import type { FailReason, PayMethod } from "./card";

/**
 * The payment method a buyer picked, held for the Payment summary step so it survives a
 * refresh or the browser's back/forward buttons. Only the label (e.g. "Visa •••• 4242") is
 * kept, never card numbers or codes.
 */
export interface SummaryChoice {
  method: PayMethod;
  methodLabel: string;
  plan: "successful" | "pending" | FailReason;
  needsOtp?: boolean;
}

export type SummaryScope = "site" | "learner";

const KEY: Record<SummaryScope, string> = {
  site: "enski:checkout:summary:v1",
  learner: "enski:learner:checkout-summary:v1",
};
const METHODS: PayMethod[] = ["card", "bank", "ussd", "paypal", "stripe"];
const PLANS = ["successful", "pending", "declined", "insufficient_funds", "expired_card", "otp_failed", "timed_out", "bank_unavailable"];

/** Reads back a saved choice; anything malformed or missing counts as "no method chosen yet". */
export function parseSummaryChoice(raw: unknown): SummaryChoice | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!METHODS.includes(r["method"] as PayMethod)) return null;
  if (typeof r["methodLabel"] !== "string" || !r["methodLabel"].trim()) return null;
  if (!PLANS.includes(r["plan"] as string)) return null;
  const choice: SummaryChoice = { method: r["method"] as PayMethod, methodLabel: r["methodLabel"], plan: r["plan"] as SummaryChoice["plan"] };
  if (r["needsOtp"] === true) choice.needsOtp = true;
  return choice;
}

/** The summary only opens for the method shown in the address; otherwise the buyer picks again. */
export function choiceFor(saved: SummaryChoice | null, method: PayMethod): SummaryChoice | null {
  return saved && saved.method === method ? saved : null;
}

export function saveSummaryChoice(scope: SummaryScope, choice: SummaryChoice) {
  try {
    window.sessionStorage.setItem(KEY[scope], JSON.stringify(choice));
  } catch {
    /* blocked storage: the summary sends the buyer back to pick a method */
  }
}

export function readSummaryChoice(scope: SummaryScope): SummaryChoice | null {
  try {
    return parseSummaryChoice(JSON.parse(window.sessionStorage.getItem(KEY[scope]) ?? "null"));
  } catch {
    return null;
  }
}

export function clearSummaryChoice(scope: SummaryScope) {
  try {
    window.sessionStorage.removeItem(KEY[scope]);
  } catch {
    /* ignore */
  }
}
