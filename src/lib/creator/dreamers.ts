import type { CreatorState, Customer, ItemKind } from "./rules";

export type Channel = "self" | "dreamverse" | "offline";
export type DreamerStatus = "active" | "pending" | "waitlisted";
export const CHANNELS: Channel[] = ["dreamverse", "self", "offline"];
export const channelLabel: Record<Channel, string> = { self: "Self marketing", dreamverse: "Dreamverse", offline: "Offline" };
export const statusLabel: Record<DreamerStatus, string> = { active: "Active", pending: "Pending", waitlisted: "Waitlisted" };
export const KINDS: ItemKind[] = ["course", "ebook", "live", "service", "coaching"];

export interface Purchase { title: string; kind: ItemKind; amount: number; date: string }
export interface Dreamer {
  id: string;
  name: string;
  email: string;
  phone: string;
  channel: Channel;
  status: DreamerStatus;
  joined: string;
  purchases: Purchase[];
  interested?: string | undefined;
  notes?: string | undefined;
  sample: boolean;
  /** Real customer id when the record is saved. */
  customerId?: string | undefined;
}

/* ---------- Sample data (deterministic, relative to "now") ---------- */
export const SAMPLE_PRODUCTS: { title: string; kind: ItemKind; price: number }[] = [
  { title: "Product Design Foundations", kind: "course", price: 45000 },
  { title: "Brand Storytelling Masterclass", kind: "course", price: 30000 },
  { title: "Freelance Pricing Toolkit", kind: "ebook", price: 7500 },
  { title: "Portfolio Templates Pack", kind: "ebook", price: 5000 },
  { title: "Live: Pitching to Clients", kind: "live", price: 10000 },
  { title: "Portfolio Review Service", kind: "service", price: 25000 },
  { title: "1:1 Career Coaching", kind: "coaching", price: 20000 },
];
const FIRST = ["Adaeze", "Tunde", "Chiamaka", "Ibrahim", "Funke", "Emeka", "Zainab", "Seyi", "Ngozi", "Kelechi", "Amaka", "Bola", "Yusuf", "Temi", "Obinna", "Halima", "Femi", "Ifeoma", "Dapo", "Nkechi", "Musa", "Kemi", "Uche", "Aisha"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Nwosu", "Balogun", "Eze", "Abubakar", "Ogunleye", "Okeke", "Danjuma", "Afolabi", "Chukwu", "Lawal", "Ibe"];
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const DAY = 86400000;
export function sampleDreamers(now = Date.now(), count = 72): Dreamer[] {
  const r = rng(20261116);
  const out: Dreamer[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST[Math.floor(r() * FIRST.length)]!;
    const last = LAST[Math.floor(r() * LAST.length)]!;
    // skew towards recent joins
    const daysAgo = Math.floor(Math.pow(r(), 1.6) * 420);
    const joined = new Date(now - daysAgo * DAY - Math.floor(r() * DAY)).toISOString();
    const c = r();
    const channel: Channel = c < 0.45 ? "dreamverse" : c < 0.82 ? "self" : "offline";
    const st = r();
    const status: DreamerStatus = st < 0.78 ? "active" : st < 0.88 ? "pending" : "waitlisted";
    const n = status === "waitlisted" ? 0 : 1 + (r() < 0.3 ? 1 : 0);
    const purchases: Purchase[] = [];
    const picked = new Set<number>();
    for (let k = 0; k < n; k++) {
      const pi = Math.floor(r() * SAMPLE_PRODUCTS.length);
      if (picked.has(pi)) continue;
      picked.add(pi);
      const p = SAMPLE_PRODUCTS[pi]!;
      purchases.push({ title: p.title, kind: p.kind, amount: channel === "offline" || status === "pending" ? 0 : p.price, date: joined });
    }
    out.push({
      id: `sample-${i}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      phone: `+234 80${Math.floor(r() * 10)} ${String(Math.floor(r() * 900) + 100)} ${String(Math.floor(r() * 9000) + 1000)}`,
      channel,
      status,
      joined,
      purchases,
      interested: status === "waitlisted" ? SAMPLE_PRODUCTS[Math.floor(r() * SAMPLE_PRODUCTS.length)]!.title : undefined,
      sample: true,
    });
  }
  return out.sort((a, b) => b.joined.localeCompare(a.joined));
}

/** Real dreamers from the creator's saved customers and paid orders. */
export function realDreamers(state: Pick<CreatorState, "customers" | "orders" | "items">): Dreamer[] {
  const sampleOf = (id: string) => (id.startsWith("sample:") ? SAMPLE_PRODUCTS[Number(id.slice(7))] : undefined);
  const kindOf = (id: string) => state.items.find((i) => i.id === id)?.kind ?? sampleOf(id)?.kind ?? "course";
  const titleOf = (id: string) => state.items.find((i) => i.id === id)?.title ?? sampleOf(id)?.title ?? "Product";
  return state.customers.map((c: Customer) => {
    const paid = state.orders.filter((o) => o.customerId === c.id && o.status === "paid");
    const purchases: Purchase[] = paid.map((o) => ({ title: o.itemTitle, kind: kindOf(o.itemId), amount: o.amount, date: o.date }));
    for (const id of c.itemIds ?? [])
      if (!paid.some((o) => o.itemId === id))
        purchases.push({ title: titleOf(id), kind: kindOf(id), amount: c.amount ?? 0, date: c.date || new Date(0).toISOString() });
    return {
      id: c.id,
      customerId: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      channel: c.channel ?? (c.source === "manual" ? "offline" : "self"),
      status: c.status ?? "active",
      joined: c.date || paid[0]?.date || new Date(0).toISOString(),
      purchases,
      interested: c.interested,
      notes: c.notes,
      sample: false,
    };
  });
}

export function allDreamers(state: Pick<CreatorState, "customers" | "orders" | "items">, withSample: boolean, now = Date.now()) {
  const real = realDreamers(state);
  if (!withSample) return real;
  const moved = new Set(state.customers.map((c) => c.sampleId).filter(Boolean));
  return [...real, ...sampleDreamers(now).filter((d) => !moved.has(d.id))].sort((a, b) => b.joined.localeCompare(a.joined));
}

/* ---------- Ranges & series ---------- */
export type RangeKey = "7" | "30" | "90" | "year" | "all" | "custom";
export const RANGE_OPTIONS: [RangeKey, string][] = [
  ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["year", "This year"], ["all", "All time"], ["custom", "Custom range"],
];
export interface Range { start: number; end: number; comparable: boolean }
const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export function resolveRange(key: RangeKey, dreamers: Dreamer[], now = Date.now(), custom?: { from: string; to: string }): Range {
  const end = now;
  if (key === "7" || key === "30" || key === "90") return { start: startOfDay(now - (Number(key) - 1) * DAY), end, comparable: true };
  if (key === "year") return { start: new Date(new Date(now).getFullYear(), 0, 1).getTime(), end, comparable: true };
  if (key === "custom" && custom?.from && custom?.to) {
    const a = Date.parse(custom.from + "T00:00:00"), b = Date.parse(custom.to + "T23:59:59");
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) return { start: a, end: b, comparable: true };
  }
  const first = dreamers.reduce((m, d) => Math.min(m, Date.parse(d.joined)), now);
  return { start: startOfDay(Math.min(first, now - 29 * DAY)), end, comparable: false };
}
export const previousRange = (r: Range): Range => ({ start: r.start - (r.end - r.start), end: r.start, comparable: true });

export type Metric = "people" | "money";
const counts = (d: Dreamer) => d.status !== "waitlisted";
/** Value contributed in [start,end): new people by join date, or money by purchase date. */
export function total(dreamers: Dreamer[], metric: Metric, r: Range, channel?: Channel) {
  let n = 0;
  for (const d of dreamers) {
    if (!counts(d) || (channel && d.channel !== channel)) continue;
    if (metric === "people") { const t = Date.parse(d.joined); if (t >= r.start && t < r.end + 1) n++; }
    else for (const p of d.purchases) { const t = Date.parse(p.date); if (t >= r.start && t < r.end + 1) n += p.amount; }
  }
  return n;
}
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
export interface Point { label: string; start: number; dreamverse: number; self: number; offline: number; total: number }
export function series(dreamers: Dreamer[], metric: Metric, r: Range): Point[] {
  const span = r.end - r.start;
  const step = span <= 31 * DAY ? DAY : span <= 120 * DAY ? 7 * DAY : 0; // 0 = monthly
  const buckets: { start: number; end: number; label: string }[] = [];
  if (step) {
    for (let t = startOfDay(r.start); t <= r.end; t += step)
      buckets.push({ start: t, end: t + step - 1, label: new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) });
  } else {
    const d = new Date(r.start); d.setDate(1); d.setHours(0, 0, 0, 0);
    while (d.getTime() <= r.end) {
      const s = d.getTime(); d.setMonth(d.getMonth() + 1);
      buckets.push({ start: s, end: d.getTime() - 1, label: new Date(s).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) });
    }
  }
  return buckets.map((b) => {
    const rr = { start: b.start, end: b.end, comparable: true };
    const p = { label: b.label, start: b.start, dreamverse: total(dreamers, metric, rr, "dreamverse"), self: total(dreamers, metric, rr, "self"), offline: total(dreamers, metric, rr, "offline"), total: 0 };
    p.total = p.dreamverse + p.self + p.offline;
    return p;
  });
}

/* ---------- Filtering & export ---------- */
export interface DreamerFilters { channel: Channel | "all"; kinds: ItemKind[]; statuses: DreamerStatus[]; from: string; to: string }
export const emptyFilters: DreamerFilters = { channel: "all", kinds: [], statuses: [], from: "", to: "" };
export function filterDreamers(list: Dreamer[], q: string, f: DreamerFilters) {
  const needle = q.trim().toLowerCase();
  const digits = needle.replace(/\D/g, "").replace(/^0/, "");
  return list.filter((d) => {
    if (needle && !(d.name.toLowerCase().includes(needle) || d.email.toLowerCase().includes(needle) || (digits.length >= 3 && d.phone.replace(/\D/g, "").includes(digits)))) return false;
    if (f.channel !== "all" && d.channel !== f.channel) return false;
    if (f.statuses.length && !f.statuses.includes(d.status)) return false;
    if (f.kinds.length) {
      const kinds = d.purchases.map((p) => p.kind);
      const interestKind = SAMPLE_PRODUCTS.find((p) => p.title === d.interested)?.kind;
      if (!f.kinds.some((k) => kinds.includes(k) || k === interestKind)) return false;
    }
    const t = Date.parse(d.joined);
    if (f.from && t < Date.parse(f.from + "T00:00:00")) return false;
    if (f.to && t > Date.parse(f.to + "T23:59:59")) return false;
    return true;
  });
}
export function dreamersCsv(list: Dreamer[]): string[][] {
  return [
    ["Name", "Email", "Phone", "Products", "Channel", "Registered", "Status"],
    ...list.map((d) => [d.name, d.email, d.phone, d.purchases.map((p) => p.title).join("; ") || (d.interested ? `Interested: ${d.interested}` : ""), channelLabel[d.channel], d.joined, statusLabel[d.status]]),
  ];
}
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
