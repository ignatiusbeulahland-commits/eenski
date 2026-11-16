import { describe, expect, it } from "vitest";
import { advancePayment, cancelPayment, type PaymentRecord } from "./payments";

const base = (over: Partial<PaymentRecord>): PaymentRecord => ({
  reference: "ENS-ABC234",
  items: [],
  totals: [{ currency: "NGN", label: "₦5,000", total: 5000 }],
  method: "card",
  methodLabel: "Visa •••• 4242",
  buyer: null,
  status: "processing",
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  events: [{ status: "processing", at: new Date(0).toISOString() }],
  plan: "successful",
  resolveAt: 3000,
  ...over,
});

describe("payment states", () => {
  it("stays processing until it resolves", () => {
    expect(advancePayment(base({}), 2999).status).toBe("processing");
    expect(advancePayment(base({}), 3000).status).toBe("successful");
  });
  it("fails with the planned reason", () => {
    const p = advancePayment(base({ plan: "insufficient_funds" }), 5000);
    expect(p.status).toBe("failed");
    expect(p.reason).toBe("insufficient_funds");
  });
  it("turns a pending transfer successful once confirmed", () => {
    const pending = advancePayment(base({ plan: "pending", method: "bank", expiresAt: 100000 }), 4000);
    expect(pending.status).toBe("pending");
    expect(advancePayment({ ...pending, confirmAt: 9000 }, 9000).status).toBe("successful");
  });
  it("times out a transfer that was never sent", () => {
    const p = advancePayment(base({ plan: "pending", method: "bank", expiresAt: 10000 }), 10000);
    expect(p.status).toBe("failed");
    expect(p.reason).toBe("timed_out");
  });
  it("cancels only unfinished payments", () => {
    expect(cancelPayment(base({}), 1000).status).toBe("cancelled");
    const done = advancePayment(base({}), 4000);
    expect(cancelPayment(done, 5000).status).toBe("successful");
  });
});
