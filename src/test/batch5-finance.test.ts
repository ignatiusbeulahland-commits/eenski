import { describe, expect, it } from "vitest";
import { txSummary, type TxRow } from "@/lib/shared/finance/history";
import { cleanAmount, groupedAmount } from "@/lib/shared/finance/withdrawals";
import { creatorTransactions } from "@/lib/creator/rules";
import { initialCreatorState } from "@/lib/creator/data";

const row = (id: string, p: Partial<TxRow>): TxRow => ({ id, description: id, amount: 1000, currency: "NGN", direction: "in", date: "2026-11-01T09:00:00.000Z", reference: id, method: "x", status: "successful", ...p });

describe("transaction totals", () => {
  it("never adds different currencies together", () => {
    const t = txSummary([row("a", { amount: 5000 }), row("b", { amount: 20, currency: "USD" })]);
    expect(t.map((x) => [x.currency, x.moneyIn])).toEqual([["NGN", 5000], ["USD", 20]]);
  });
  it("leaves failed rows out of the money totals and keeps refunds separate", () => {
    const [t] = txSummary([
      row("sale", { amount: 12000 }),
      row("refund", { amount: 2000, status: "refunded" }),
      row("sent", { amount: 5000, direction: "out" }),
      row("sending", { amount: 3000, direction: "out", status: "processing" }),
      row("failed", { amount: 9000, direction: "out", status: "failed" }),
    ]);
    expect(t).toMatchObject({ moneyIn: 12000, moneyOut: 8000, inFlight: 3000, refunded: 2000, count: 5 });
  });
});

describe("withdrawal amount entry", () => {
  it("shows thousands separators while typing", () => {
    expect(groupedAmount("1250000")).toBe("1,250,000");
    expect(groupedAmount("5000.5")).toBe("5,000.5");
  });
  it("keeps one dot and two decimals", () => {
    expect(cleanAmount("₦1,250.759")).toBe("1250.75");
    expect(cleanAmount("12.3.4")).toBe("12.34");
  });
});

describe("refunded sales", () => {
  it("show as Refunded, not Successful", () => {
    const s = { ...initialCreatorState, customers: [], payouts: [], beneficiaries: [], orders: [{ id: "o1", itemId: "i", itemTitle: "Deck", customerId: "c", amount: 4000, date: "2026-11-02T00:00:00.000Z", status: "refunded" as const, currency: "NGN" as const, refundedAt: "2026-11-03T00:00:00.000Z" }] };
    expect(creatorTransactions(s)[0]?.status).toBe("refunded");
  });
});
