import { describe, expect, it } from "vitest";
import { convert, filterTx, inRange, monthlyCommission, revenueSeries, sampleSales, summary, topProducts, txCsv, emptyTxFilters, type Sale } from "./performance";

const now = Date.parse("2026-11-16T12:00:00Z");
const sale = (p: Partial<Sale>): Sale => ({ id: "x", ref: "R", date: "2026-11-15T10:00:00Z", product: "A", kind: "course", customer: "Ada", amount: 10000, refunded: false, rate: 0.2, status: "pending", sample: true, ...p });

describe("performance", () => {
  it("net revenue subtracts refunds and refunds earn no commission", () => {
    const s = summary([sale({}), sale({ id: "y", refunded: true })], 3);
    expect(s).toMatchObject({ gross: 20000, refunded: 10000, net: 10000, enrolments: 1, commTotal: 2000, avgCommission: 2000, waiting: 1, published: 3 });
  });
  it("converts naira with the saved rates", () => {
    expect(convert(1349.822603, "USD")).toBeCloseTo(1);
    expect(convert(500, "NGN")).toBe(500);
  });
  it("range keeps only sales inside the period", () => {
    const list = [sale({ date: "2026-11-14T00:00:00Z" }), sale({ id: "o", date: "2026-09-01T00:00:00Z" })];
    expect(inRange(list, "7", now)).toHaveLength(1);
    expect(inRange(list, "all", now)).toHaveLength(2);
  });
  it("series totals match the sales", () => {
    const list = inRange(sampleSales(now), "30", now);
    const pts = revenueSeries(list, "30", now);
    expect(pts).toHaveLength(30);
    expect(pts.reduce((n, p) => n + p.sales, 0)).toBe(list.filter((s) => !s.refunded).length);
  });
  it("ranks products by sales, then monthly commission totals", () => {
    const list = [sale({ product: "B" }), sale({ product: "B" }), sale({ product: "A" })];
    expect(topProducts(list).map((p) => [p.name, p.rank])).toEqual([["B", 1], ["A", 2]]);
    expect(monthlyCommission(list)).toEqual([expect.objectContaining({ key: "2026-11", total: 6000 })]);
  });
  it("filters transactions and exports csv", () => {
    const list = [sale({ status: "paid", customer: "Tunde" }), sale({ id: "z" })];
    expect(filterTx(list, { ...emptyTxFilters, status: "paid" })).toHaveLength(1);
    expect(filterTx(list, { ...emptyTxFilters, q: "tunde" })).toHaveLength(1);
    expect(txCsv(list, "NGN")[1]).toEqual(["2026-11-15", "A", "Tunde", "10000.00", "20%", "2000.00", "Paid", "R"]);
  });
});
