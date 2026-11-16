/** Pure filters for browsing Learner events by topic, date, price and format. Days are calendar days in the learner's time zone (WAT by default). */
import { naira } from "@/lib/affiliate/products";
import { dayKeyIn, EVENT_TZ } from "./timezone";
import type { LearnerEvent } from "./catalog";

export type DateFilter = "any" | "today" | "weekend" | "week" | "next7" | "month" | "nextMonth" | "past" | "on";
export type PriceFilter = "any" | "free" | "paid" | "under5k" | "5kPlus";
export type FormatFilter = "any" | "Online" | "In person";
export type EventFilters = { q: string; topic: string; date: DateFilter; on: string; price: PriceFilter; format: FormatFilter };
export const defaultEventFilters: EventFilters = { q: "", topic: "all", date: "any", on: "", price: "any", format: "any" };

export const dateOptions: [DateFilter, string][] = [
  ["any", "Any date"], ["today", "Today"], ["weekend", "This weekend"], ["week", "This week"], ["next7", "Next 7 days"],
  ["month", "This month"], ["nextMonth", "Next month"], ["past", "Already happened"], ["on", "Pick a date"],
];
export const PRICE_SPLIT = 5000;
export const priceOptions: [PriceFilter, string][] = [
  ["any", "Any price"], ["free", "Free"], ["paid", "Paid"], ["under5k", `Paid, under ${naira(PRICE_SPLIT)}`], ["5kPlus", `${naira(PRICE_SPLIT)} and above`],
];
export const formatOptions: [FormatFilter, string][] = [["any", "Any format"], ["Online", "Online"], ["In person", "In person"]];

const shift = (key: string, days: number) => {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const weekday = (key: string) => (new Date(`${key}T12:00:00Z`).getUTCDay() + 6) % 7; // Mon 0 … Sun 6

/** Inclusive Lagos day range [from, to] for a date filter, or null for "any"/"past". */
export function dateRange(f: DateFilter, now: Date, on = "", tz = EVENT_TZ): [string, string] | null {
  const today = dayKeyIn(now, tz);
  const wd = weekday(today);
  switch (f) {
    case "today": return [today, today];
    case "weekend": return wd === 6 ? [today, today] : [shift(today, Math.max(0, 5 - wd)), shift(today, 6 - wd)];
    case "week": return [today, shift(today, 6 - wd)];
    case "next7": return [today, shift(today, 6)];
    case "month": { const m = today.slice(0, 7); return [today, `${m}-31`]; }
    case "nextMonth": {
      const [y, mo] = today.split("-").map(Number) as [number, number];
      const ny = mo === 12 ? y + 1 : y, nm = mo === 12 ? 1 : mo + 1;
      const m = `${ny}-${String(nm).padStart(2, "0")}`;
      return [`${m}-01`, `${m}-31`];
    }
    case "on": return on ? [on, on] : null;
    default: return null;
  }
}

export function matchesEvent(e: LearnerEvent, f: EventFilters, now = new Date(), tz = EVENT_TZ): boolean {
  if (f.topic !== "all" && e.category !== f.topic) return false;
  if (f.format !== "any" && e.mode !== f.format) return false;
  if (f.price === "free" && e.price !== 0) return false;
  if (f.price === "paid" && e.price === 0) return false;
  if (f.price === "under5k" && !(e.price > 0 && e.price < PRICE_SPLIT)) return false;
  if (f.price === "5kPlus" && e.price < PRICE_SPLIT) return false;
  const started = new Date(e.start).getTime() < now.getTime();
  if (f.date === "past") { if (!started) return false; }
  else if (f.date !== "any") {
    const range = dateRange(f.date, now, f.on, tz);
    if (range) {
      const day = dayKeyIn(e.start, tz);
      if (day < range[0] || day > range[1]) return false;
      if (f.date !== "on" && started) return false; // upcoming-only ranges
    }
  }
  const q = f.q.trim().toLowerCase();
  if (q && ![e.title, e.host, e.description, e.venue, e.category].some((t) => t.toLowerCase().includes(q))) return false;
  return true;
}

export const filterEvents = (list: readonly LearnerEvent[], f: EventFilters, now = new Date(), tz = EVENT_TZ) => list.filter((e) => matchesEvent(e, f, now, tz));

/** Removable chips describing every active filter. */
export function activeFilterChips(f: EventFilters): { key: keyof EventFilters; label: string }[] {
  const chips: { key: keyof EventFilters; label: string }[] = [];
  if (f.q.trim()) chips.push({ key: "q", label: `“${f.q.trim()}”` });
  if (f.topic !== "all") chips.push({ key: "topic", label: f.topic });
  if (f.date === "on") { if (f.on) chips.push({ key: "date", label: new Date(`${f.on}T12:00:00Z`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) }); }
  else if (f.date !== "any") chips.push({ key: "date", label: dateOptions.find(([v]) => v === f.date)![1] });
  if (f.price !== "any") chips.push({ key: "price", label: priceOptions.find(([v]) => v === f.price)![1] });
  if (f.format !== "any") chips.push({ key: "format", label: f.format });
  return chips;
}

export type EventGroupKey = "week" | "next" | "later";
const GROUP_LABEL: Record<EventGroupKey, string> = { week: "This week", next: "Next week", later: "Later" };
/** Splits upcoming events into this week (to Sunday), next week and later, keeping their order. Empty groups are left out. */
export function groupUpcoming(list: readonly LearnerEvent[], now = new Date(), tz = EVENT_TZ): { key: EventGroupKey; label: string; events: LearnerEvent[] }[] {
  const today = dayKeyIn(now, tz);
  const endWeek = shift(today, 6 - weekday(today));
  const endNext = shift(endWeek, 7);
  const groups: Record<EventGroupKey, LearnerEvent[]> = { week: [], next: [], later: [] };
  for (const e of list) {
    const d = dayKeyIn(e.start, tz);
    groups[d <= endWeek ? "week" : d <= endNext ? "next" : "later"].push(e);
  }
  return (["week", "next", "later"] as const).filter((k) => groups[k].length).map((k) => ({ key: k, label: GROUP_LABEL[k], events: groups[k] }));
}
