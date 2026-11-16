import type { CreatorState, ItemKind } from "./rules";
import { DEMO_RATES } from "@/lib/pricing/demo-rates";
import { formatMoney } from "@/lib/shared/finance/currencies";

export type PerfCurrency = "NGN" | "USD" | "GBP";
export const PERF_CURRENCIES: { code: PerfCurrency; label: string }[] = [
  { code: "NGN", label: "NGN (₦)" }, { code: "USD", label: "USD ($)" }, { code: "GBP", label: "GBP (£)" },
];
export type PerfRange = "7" | "30" | "90" | "all";
export const PERF_RANGES: { key: PerfRange; label: string }[] = [
  { key: "7", label: "7d" }, { key: "30", label: "30d" }, { key: "90", label: "90d" }, { key: "all", label: "All" },
];
export type CommissionStatus = "paid" | "pending" | "processing";
export const statusText: Record<CommissionStatus, string> = { paid: "Paid", pending: "Pending", processing: "Processing" };

export interface Sale {
  id: string; ref: string; date: string; product: string; kind: ItemKind; customer: string;
  /** Gross amount in NGN. */ amount: number; refunded: boolean; rate: number; status: CommissionStatus; sample: boolean;
}

/** Converts an NGN amount using the saved demo rates. */
export const convert = (ngn: number, to: PerfCurrency) => (to === "NGN" ? ngn : (ngn / DEMO_RATES["NGN"]!) * DEMO_RATES[to]!);
export const money = (ngn: number, cur: PerfCurrency, compact = false) => formatMoney(Math.round(convert(ngn, cur) * 100) / 100, cur, { compact });

const DAY = 86400000;
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const SAMPLE_CATALOGUE: { title: string; kind: ItemKind; price: number; rate: number; weight: number }[] = [
  { title: "GET THE YES", kind: "course", price: 45000, rate: 0.2, weight: 9 },
  { title: "PRE-LAUNCH", kind: "course", price: 30000, rate: 0.2, weight: 7 },
  { title: "Coaching with Dan", kind: "coaching", price: 25000, rate: 0.25, weight: 5 },
  { title: "THE BOOK WE TEST", kind: "ebook", price: 7500, rate: 0.3, weight: 6 },
  { title: "MULTIPLE SESSIONS", kind: "live", price: 12000, rate: 0.15, weight: 4 },
  { title: "Brand Audit Service", kind: "service", price: 60000, rate: 0.1, weight: 2 },
  { title: "Pitch Deck Templates", kind: "ebook", price: 5000, rate: 0.3, weight: 3 },
];
const NAMES = ["Adaeze Okafor", "Tunde Adeyemi", "Chiamaka Bello", "Ibrahim Nwosu", "Funke Balogun", "Emeka Eze", "Zainab Abubakar", "Seyi Ogunleye", "Ngozi Okeke", "Kelechi Danjuma", "Amaka Afolabi", "Bola Chukwu", "Yusuf Lawal", "Temi Ibe"];

/** Settlement follows age: under a week pending, under two weeks processing, then paid. */
export function settlement(date: string, now: number): CommissionStatus {
  const age = (now - Date.parse(date)) / DAY;
  return age < 7 ? "pending" : age < 14 ? "processing" : "paid";
}

export function sampleSales(now = Date.now(), count = 140): Sale[] {
  const r = rng(20261116);
  const totalW = SAMPLE_CATALOGUE.reduce((n, p) => n + p.weight, 0);
  return Array.from({ length: count }, (_, i) => {
    let pick = r() * totalW; const p = SAMPLE_CATALOGUE.find((x) => (pick -= x.weight) < 0) ?? SAMPLE_CATALOGUE[0]!;
    const date = new Date(now - Math.floor(Math.pow(r(), 1.6) * 200 * DAY) - Math.floor(r() * DAY)).toISOString();
    return { id: `s${i}`, ref: `ENS-TX-${(100000 + Math.floor(r() * 899999)).toString(36).toUpperCase()}`, date, product: p.title, kind: p.kind,
      customer: NAMES[Math.floor(r() * NAMES.length)]!, amount: p.price, refunded: r() < 0.04, rate: p.rate, status: settlement(date, now), sample: true };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export const DEFAULT_RATE = 0.2;
export function realSales(s: Pick<CreatorState, "orders" | "items" | "customers">, now = Date.now()): Sale[] {
  return s.orders.map((o) => {
    const item = s.items.find((i) => i.id === o.itemId); const c = s.customers.find((x) => x.id === o.customerId);
    return { id: o.id, ref: `ENS-TX-${o.id.slice(-6).toUpperCase()}`, date: o.date, product: o.itemTitle, kind: item?.kind ?? "course",
      customer: c?.name ?? "Customer", amount: o.amount, refunded: o.status === "refunded", rate: DEFAULT_RATE, status: settlement(o.date, now), sample: false };
  });
}

export function inRange(sales: Sale[], range: PerfRange, now = Date.now()) {
  if (range === "all") return sales;
  const from = now - Number(range) * DAY;
  return sales.filter((s) => Date.parse(s.date) >= from);
}

export const commissionOf = (s: Sale) => (s.refunded ? 0 : Math.round(s.amount * s.rate * 100) / 100);

export function summary(sales: Sale[], publishedCount: number) {
  const ok = sales.filter((s) => !s.refunded);
  const gross = sales.reduce((n, s) => n + s.amount, 0);
  const refunded = sales.filter((s) => s.refunded).reduce((n, s) => n + s.amount, 0);
  const comm = ok.map(commissionOf);
  const commTotal = comm.reduce((n, c) => n + c, 0);
  const by = (st: CommissionStatus) => ok.filter((s) => s.status === st);
  return {
    enrolments: ok.length, gross, refunded, net: gross - refunded,
    avgCommission: comm.length ? commTotal / comm.length : 0, commTotal,
    commPaid: by("paid").reduce((n, s) => n + commissionOf(s), 0),
    commPending: by("pending").reduce((n, s) => n + commissionOf(s), 0),
    commProcessing: by("processing").reduce((n, s) => n + commissionOf(s), 0),
    waiting: by("pending").length + by("processing").length,
    published: publishedCount,
  };
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
/** Revenue (net) and sales per bucket: daily up to 90 days, weekly beyond. */
export function revenueSeries(sales: Sale[], range: PerfRange, now = Date.now()) {
  const earliest = sales.length ? Math.min(...sales.map((s) => Date.parse(s.date))) : now;
  const days = range === "all" ? Math.max(7, Math.ceil((now - earliest) / DAY) + 1) : Number(range);
  const step = days > 90 ? 7 : 1;
  const start = new Date(now - (days - 1) * DAY); start.setUTCHours(0, 0, 0, 0);
  const buckets: { key: string; label: string; revenue: number; sales: number }[] = [];
  for (let t = start.getTime(); t <= now; t += step * DAY) {
    const d = new Date(t);
    buckets.push({ key: dayKey(d), label: d.toLocaleDateString("en", { day: "numeric", month: "short" }), revenue: 0, sales: 0 });
  }
  for (const s of sales) {
    if (s.refunded) continue;
    const idx = Math.floor((Date.parse(s.date) - start.getTime()) / (step * DAY));
    const b = buckets[idx]; if (!b) continue;
    b.revenue += s.amount; b.sales += 1;
  }
  return buckets;
}

export function topProducts(sales: Sale[]) {
  const map = new Map<string, { name: string; kind: ItemKind; sales: number; revenue: number }>();
  for (const s of sales) {
    if (s.refunded) continue;
    const e = map.get(s.product) ?? { name: s.product, kind: s.kind, sales: 0, revenue: 0 };
    e.sales += 1; e.revenue += s.amount; map.set(s.product, e);
  }
  return [...map.values()].sort((a, b) => b.sales - a.sales || b.revenue - a.revenue || a.name.localeCompare(b.name)).map((p, i) => ({ ...p, rank: i + 1 }));
}

export function monthlyCommission(sales: Sale[]) {
  const map = new Map<string, number>();
  for (const s of sales) { if (s.refunded) continue; const k = s.date.slice(0, 7); map.set(k, (map.get(k) ?? 0) + commissionOf(s)); }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, total]) => ({
    key, total: Math.round(total * 100) / 100, label: new Date(`${key}-01T12:00:00Z`).toLocaleDateString("en", { month: "long", year: "numeric" }),
    short: new Date(`${key}-01T12:00:00Z`).toLocaleDateString("en", { month: "short" }),
  }));
}

export interface TxFilters { q: string; status: "all" | CommissionStatus; product: string; from: string; to: string }
export const emptyTxFilters: TxFilters = { q: "", status: "all", product: "all", from: "", to: "" };
export function filterTx(sales: Sale[], f: TxFilters) {
  const q = f.q.trim().toLowerCase();
  return sales.filter((s) => !s.refunded
    && (!q || `${s.product} ${s.customer} ${s.ref}`.toLowerCase().includes(q))
    && (f.status === "all" || s.status === f.status)
    && (f.product === "all" || s.product === f.product)
    && (!f.from || s.date.slice(0, 10) >= f.from)
    && (!f.to || s.date.slice(0, 10) <= f.to));
}

export function txCsv(sales: Sale[], cur: PerfCurrency): string[][] {
  const r = (n: number) => convert(n, cur).toFixed(2);
  return [["Date", "Product", "Customer", `Sale amount (${cur})`, "Commission rate", `Commission (${cur})`, "Status", "Reference"],
    ...sales.map((s) => [s.date.slice(0, 10), s.product, s.customer, r(s.amount), `${Math.round(s.rate * 100)}%`, r(commissionOf(s)), statusText[s.status], s.ref])];
}
