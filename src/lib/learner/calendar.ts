/** Pure date helpers for the Learner events calendar. Days are calendar days in a given time zone (WAT by default). */
import { dayKeyIn, EVENT_TZ } from "./timezone";

/** YYYY-MM-DD for the Lagos calendar day an instant falls on. */
export const lagosDayKey = (iso: string | Date) => dayKeyIn(iso, EVENT_TZ);

export type MonthRef = { year: number; month: number }; // month is 0-11
export const monthOf = (key: string): MonthRef => ({ year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 });
export const addMonths = (m: MonthRef, n: number): MonthRef => {
  const total = m.year * 12 + m.month + n;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
};
export const compareMonths = (a: MonthRef, b: MonthRef) => a.year * 12 + a.month - (b.year * 12 + b.month);
const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export type CalendarCell = { key: string; day: number; inMonth: boolean };
/** Whole weeks (Monday first) covering the month, padded with days from the neighbouring months. */
export function monthGrid({ year, month }: MonthRef): CalendarCell[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7; // days before the 1st since Monday
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = Math.ceil((lead + days) / 7);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(Date.UTC(year, month, 1 - lead + i));
    cells.push({ key: keyOf(d), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month });
  }
  return Array.from({ length: weeks }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** Items grouped by calendar day in a time zone, each day sorted by start time. */
export function groupByDay<T extends { start: string }>(items: readonly T[], tz = EVENT_TZ): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const it of [...items].sort((a, b) => a.start.localeCompare(b.start))) {
    const k = dayKeyIn(it.start, tz);
    map.set(k, [...(map.get(k) ?? []), it]);
  }
  return map;
}

export const monthLabel = ({ year, month }: MonthRef) => new Date(Date.UTC(year, month, 15)).toLocaleDateString("en-NG", { month: "long", year: "numeric", timeZone: "UTC" });
export const longDayLabel = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
export const shortDayLabel = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
