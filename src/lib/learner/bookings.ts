import { findEvent, findResource, isPast, publishedEvents, resources, type LearnerEvent, type LearnerResource } from "./catalog";
import type { LearnerState } from "./rules";

/** Upcoming-events categories. Gigs have no listings yet, so that tab shows its empty state. */
export type EventCategory = "all" | "live" | "coaching" | "gigs";
export type Listing =
  | { kind: "live"; id: string; event: LearnerEvent }
  | { kind: "coaching"; id: string; resource: LearnerResource };

export function upcomingListings(cat: EventCategory, now = Date.now()): Listing[] {
  const live: Listing[] = publishedEvents.filter((e) => !isPast(e, now)).sort((a, b) => a.start.localeCompare(b.start)).map((e) => ({ kind: "live", id: e.id, event: e }));
  const coaching: Listing[] = resources.filter((r) => r.type === "Coaching").map((r) => ({ kind: "coaching", id: r.id, resource: r }));
  if (cat === "live") return live;
  if (cat === "coaching") return coaching;
  if (cat === "gigs") return [];
  return [...live, ...coaching];
}

export type BookingStatus = "confirmed" | "awaiting" | "attended" | "ended";
export type Booking = {
  id: string;
  kind: "coaching" | "live";
  title: string;
  host: string;
  image: string;
  /** ISO start; coaching sessions are scheduled with the coach after booking, so may have none. */
  when: string | null;
  status: BookingStatus;
  when_past: boolean;
  href: { to: "/learner/events/$eventId"; params: { eventId: string } } | { to: "/learner/resources/$resourceId"; params: { resourceId: string } };
  reference?: string | undefined;
  /** Only free registrations not yet attended can be cancelled. */
  cancellable: boolean;
  online: boolean;
};

/** Bookings come only from the learner's own paid coaching purchases and event registrations. */
export function learnerBookings(s: Pick<LearnerState, "purchases" | "registrations">, now = Date.now()): Booking[] {
  const out: Booking[] = [];
  const seen = new Set<string>();
  for (const p of s.purchases) {
    if (p.status !== "paid") continue;
    for (const i of p.items) {
      if (i.kind !== "resource" || seen.has(i.id)) continue;
      const r = findResource(i.id);
      if (!r || r.type !== "Coaching") continue;
      seen.add(i.id);
      out.push({ id: `c-${i.id}`, kind: "coaching", title: r.title, host: r.creator, image: r.image, when: null, status: "awaiting", when_past: false, href: { to: "/learner/resources/$resourceId", params: { resourceId: r.id } }, reference: p.orderNumber, cancellable: false, online: true });
    }
  }
  for (const reg of s.registrations) {
    const e = findEvent(reg.eventId);
    if (!e) continue;
    const past = isPast(e, now);
    out.push({ id: `e-${e.id}`, kind: "live", title: e.title, host: e.host, image: e.image, when: e.start, status: reg.attendedAt ? "attended" : past ? "ended" : "confirmed", when_past: past || !!reg.attendedAt, href: { to: "/learner/events/$eventId", params: { eventId: e.id } }, reference: reg.reference, cancellable: e.price === 0 && !reg.attendedAt && !past, online: e.mode === "Online" });
  }
  return out.sort((a, b) => (a.when ?? "9").localeCompare(b.when ?? "9"));
}
