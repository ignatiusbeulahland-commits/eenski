/** Event times: shown in the learner's own time zone, with the event's WAT time kept alongside. */
import { useSyncExternalStore } from "react";

/** Enski events are scheduled in West Africa Time. */
export const EVENT_TZ = "Africa/Lagos";

export const browserTimeZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || EVENT_TZ; } catch { return EVENT_TZ; }
};
const noop = () => () => {};
/** The learner's time zone. Server render and hydration use WAT, then the browser's zone takes over. */
export const useViewerTimeZone = () => useSyncExternalStore(noop, browserTimeZone, () => EVENT_TZ);

/** YYYY-MM-DD for the calendar day an instant falls on in a time zone. */
export const dayKeyIn = (iso: string | Date, tz: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: tz });
export const timeIn = (iso: string | Date, tz: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz });
export const dayIn = (iso: string | Date, tz: string) => new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: tz });
export const dateTimeIn = (iso: string | Date, tz: string) => `${dayIn(iso, tz)}, ${timeIn(iso, tz)}`;

/** Short zone name at that instant: "WAT" for Lagos, otherwise e.g. "EST", "GMT", "GMT+4". */
export function zoneLabel(iso: string | Date, tz: string) {
  if (tz === EVENT_TZ) return "WAT";
  const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date(iso)).find((p) => p.type === "timeZoneName");
  return part?.value ?? tz;
}
/** Readable place for a zone id, e.g. "America/New_York" → "New York". */
export const zonePlace = (tz: string) => (tz.split("/").pop() ?? tz).replace(/_/g, " ");

/** True when the learner's clock reads the same as WAT for this instant. */
export const sameAsEventTime = (iso: string | Date, tz: string) => tz === EVENT_TZ || dateTimeIn(iso, tz) === dateTimeIn(iso, EVENT_TZ);

/** Start time in the learner's zone with its label, e.g. "Sun, 15 Nov, 14:00 EST". */
export const localDateTime = (iso: string | Date, tz: string) => `${dateTimeIn(iso, tz)} ${zoneLabel(iso, tz)}`;
/** The scheduled WAT time, e.g. "Sun, 15 Nov, 20:00 WAT". */
export const watDateTime = (iso: string | Date) => `${dateTimeIn(iso, EVENT_TZ)} WAT`;
