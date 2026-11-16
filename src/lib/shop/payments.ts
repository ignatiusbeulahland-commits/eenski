import type { FailReason, PayMethod, PayStatus } from "@/lib/checkout/card";
import type { ShopItem } from "./types";

/**
 * One payment attempt at checkout. Every attempt is kept (never deleted) so the
 * status page and receipt survive a refresh; only a successful one becomes an order.
 */
export interface PaymentRecord {
  reference: string;
  items: ShopItem[];
  totals: { currency: string; label: string; total: number }[];
  method: PayMethod;
  /** e.g. "Visa •••• 4242", "GTBank USSD", "ada@mail.com (PayPal)". */
  methodLabel: string;
  buyer: { name: string; email: string } | null;
  status: PayStatus;
  reason?: FailReason | undefined;
  createdAt: string;
  updatedAt: string;
  events: { status: PayStatus; at: string }[];
  /** What the processor answers once processing finishes. */
  plan: "successful" | "pending" | FailReason;
  /** When processing ends (ms since epoch). */
  resolveAt: number;
  /** When a pending transfer/USSD payment is confirmed (ms). */
  confirmAt?: number | undefined;
  /** Bank transfer: when the virtual account stops accepting money (ms). */
  expiresAt?: number | undefined;
  free?: boolean | undefined;
}

const FAILS = new Set<string>(["declined", "insufficient_funds", "expired_card", "otp_failed", "timed_out", "bank_unavailable"]);

function moveTo(p: PaymentRecord, status: PayStatus, at: number, reason?: FailReason): PaymentRecord {
  const iso = new Date(at).toISOString();
  return { ...p, status, reason, updatedAt: iso, events: [...p.events, { status, at: iso }] };
}

/**
 * Applies every transition that is due by `now`: processing → planned outcome,
 * pending → successful at `confirmAt`, or pending → failed (timed out) at `expiresAt`.
 * Finished payments never change again.
 */
export function advancePayment(p: PaymentRecord, now: number): PaymentRecord {
  let cur = p;
  if (cur.status === "processing" && now >= cur.resolveAt) {
    if (cur.plan === "successful") cur = moveTo(cur, "successful", cur.resolveAt);
    else if (cur.plan === "pending") cur = moveTo(cur, "pending", cur.resolveAt);
    else if (FAILS.has(cur.plan)) cur = moveTo(cur, "failed", cur.resolveAt, cur.plan);
  }
  if (cur.status === "pending") {
    if (cur.confirmAt && now >= cur.confirmAt && (!cur.expiresAt || cur.confirmAt <= cur.expiresAt)) cur = moveTo(cur, "successful", cur.confirmAt);
    else if (cur.expiresAt && now >= cur.expiresAt) cur = moveTo(cur, "failed", cur.expiresAt, "timed_out");
  }
  return cur;
}

/** Cancels a payment that hasn't finished; finished ones stay as they are. */
export function cancelPayment(p: PaymentRecord, now: number): PaymentRecord {
  if (p.status !== "processing" && p.status !== "pending") return p;
  return moveTo(p, "cancelled", now);
}

export const isFinal = (s: PayStatus) => s === "successful" || s === "failed" || s === "cancelled";
