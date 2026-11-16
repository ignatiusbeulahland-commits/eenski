import type { LearnerEvent } from "./catalog";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** A one-event calendar file (.ics) so a registered learner can add the event to their own calendar. */
export function eventIcs(e: Pick<LearnerEvent, "id" | "title" | "host" | "description" | "venue" | "start" | "durationMinutes">, now = new Date()): string {
  const start = new Date(e.start);
  const end = new Date(start.getTime() + e.durationMinutes * 60000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Enski//Learner events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.id}@enski.demo`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(`Hosted by ${e.host}. ${e.description}`)}`,
    `LOCATION:${esc(e.venue)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** Downloads the event's calendar file in the browser. */
export function downloadEventIcs(e: Parameters<typeof eventIcs>[0]) {
  const url = URL.createObjectURL(new Blob([eventIcs(e)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
