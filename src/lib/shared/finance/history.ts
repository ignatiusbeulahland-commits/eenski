import type { CurrencyCode } from "./currencies";

/** One row in any role's transaction history. Statuses map from each role's own records. */
export type TxStatus = "successful" | "pending" | "processing" | "failed" | "refunded" | "reversed";
export type TxRow = {
  id: string;
  description: string;
  detail?: string;
  amount: number;
  currency: CurrencyCode;
  direction: "in" | "out";
  date: string;
  reference: string;
  method: string;
  status: TxStatus;
  href?: { to: string; params?: Record<string, string> };
};

export const TX_STATUS_LABEL: Record<TxStatus, string> = {
  successful: "Successful", pending: "Pending", processing: "Processing", failed: "Failed", refunded: "Refunded", reversed: "Reversed",
};

/** Short, stable, human reference from an internal id, e.g. "PAY-3F9A21". */
export const refFrom = (prefix: string, id: string) => `${prefix}-${id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase().padStart(6, "0")}`;

export function filterTx(rows: TxRow[], q: string, status: TxStatus | "all", direction: "all" | "in" | "out", days?: number, now = Date.now()) {
  const s = q.trim().toLowerCase();
  return rows
    .filter((r) => (status === "all" || r.status === status) && (direction === "all" || r.direction === direction))
    .filter((r) => !days || now - new Date(r.date).getTime() <= days * 86400000)
    .filter((r) => !s || [r.description, r.detail ?? "", r.reference, r.method].some((t) => t.toLowerCase().includes(s)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function paginate<T>(rows: T[], page: number, size: number) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(Math.max(1, page), pages);
  return { page: p, pages, items: rows.slice((p - 1) * size, p * size), from: rows.length ? (p - 1) * size + 1 : 0, to: Math.min(p * size, rows.length) };
}

export interface TxTotals {
  currency: CurrencyCode;
  /** Successful money in. */
  moneyIn: number;
  /** Money out that has left or is leaving (successful, processing or pending). */
  moneyOut: number;
  /** Money out still on its way (processing or pending). */
  inFlight: number;
  /** Sales refunded or reversed after they were paid. */
  refunded: number;
  count: number;
}

/**
 * Totals per currency for the rows shown, so a summary never adds different currencies
 * together. Failed rows count towards `count` only. Largest activity first.
 */
export function txSummary(rows: TxRow[]): TxTotals[] {
  const by = new Map<CurrencyCode, TxTotals>();
  for (const r of rows) {
    const t = by.get(r.currency) ?? { currency: r.currency, moneyIn: 0, moneyOut: 0, inFlight: 0, refunded: 0, count: 0 };
    t.count += 1;
    if (r.status === "refunded" || r.status === "reversed") t.refunded += r.amount;
    else if (r.status !== "failed") {
      if (r.direction === "in" && r.status === "successful") t.moneyIn += r.amount;
      if (r.direction === "out") {
        t.moneyOut += r.amount;
        if (r.status === "processing" || r.status === "pending") t.inFlight += r.amount;
      }
    }
    by.set(r.currency, t);
  }
  return [...by.values()].sort((a, b) => b.count - a.count);
}
