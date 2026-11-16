import type { CreatorItem, CreatorState, Order } from "./rules";
import { stageLabel, type Stage } from "./products";

/**
 * Facilitation view for creators: coaching bookings, live sessions and service
 * orders gathered in one list. Pure: reads the creator's saved state only.
 */
export type BookingKind = "coaching" | "live" | "service";
export type BookingTone = "info" | "success" | "warn" | "muted";
export type BookingRow = {
  id: string;
  kind: BookingKind;
  item: Pick<CreatorItem, "id" | "kind" | "title">;
  /** Client name (coaching/service) or "N booked" (live). */
  who: string;
  /** ISO time of the session; services have none. */
  when: string | null;
  label: string;
  tone: BookingTone;
  /** Something the creator should do now. */
  action: string | null;
  amount: number;
};

const FACILITATION: BookingKind[] = ["coaching", "live", "service"];

export function isFacilitation(kind: string): kind is BookingKind {
  return (FACILITATION as string[]).includes(kind);
}

function clientName(s: Pick<CreatorState, "customers">, o: Order) {
  return s.customers.find((c) => c.id === o.customerId)?.name ?? "Client";
}

export function bookingRows(s: Pick<CreatorState, "items" | "orders" | "customers">, now = Date.now()): BookingRow[] {
  const rows: BookingRow[] = [];
  const items = s.items.filter((i) => isFacilitation(i.kind) && !i.binnedAt);
  for (const item of items) {
    const orders = s.orders.filter((o) => o.itemId === item.id);
    if (item.kind === "coaching") {
      for (const o of orders) {
        if (o.status !== "paid" && o.booking !== "cancelled") continue;
        const b = o.booking ?? "scheduled";
        const at = o.sessionAt ? Date.parse(o.sessionAt) : NaN;
        const past = Number.isFinite(at) && at < now;
        const map = {
          scheduled: past ? { label: "Needs outcome", tone: "warn" as const, action: "Mark done or no-show" } : { label: "Scheduled", tone: "info" as const, action: null },
          completed: { label: "Completed", tone: "success" as const, action: null },
          cancelled: { label: "Cancelled", tone: "muted" as const, action: null },
          no_show: { label: "No-show", tone: "muted" as const, action: null },
        }[b];
        rows.push({ id: o.id, kind: "coaching", item, who: clientName(s, o), when: o.sessionAt ?? null, ...map, amount: o.status === "paid" ? o.amount : 0 });
      }
    } else if (item.kind === "live") {
      if (!item.date) continue;
      const paid = orders.filter((o) => o.status === "paid");
      const at = Date.parse(item.date);
      const past = Number.isFinite(at) && at < now;
      rows.push({
        id: `live-${item.id}`,
        kind: "live",
        item,
        who: `${paid.length} booked${item.capacity ? ` of ${item.capacity}` : ""}`,
        when: item.date,
        label: item.status !== "published" ? "Draft" : past ? "Ended" : "Upcoming",
        tone: item.status !== "published" ? "muted" : past ? "success" : "info",
        action: !past && item.status !== "published" ? "Publish to take bookings" : null,
        amount: paid.reduce((n, o) => n + o.amount, 0),
      });
    } else {
      for (const o of orders) {
        if (o.status !== "paid") continue;
        const stage: Stage = o.stage ?? "requirements";
        rows.push({
          id: o.id,
          kind: "service",
          item,
          who: clientName(s, o),
          when: null,
          label: stageLabel[stage],
          tone: stage === "completed" ? "success" : stage === "delivered" ? "info" : "warn",
          action: stage === "requirements" ? "Waiting for the client's brief" : stage === "in_progress" ? "Deliver the work" : null,
          amount: o.amount,
        });
      }
    }
  }
  return rows;
}

/** Upcoming sessions, soonest first. */
export function upcomingSessions(rows: BookingRow[], now = Date.now()) {
  return rows
    .filter((r) => r.when && Date.parse(r.when) >= now && r.label !== "Cancelled" && r.label !== "Draft")
    .sort((a, b) => Date.parse(a.when!) - Date.parse(b.when!));
}

export function needsAction(rows: BookingRow[]) {
  return rows.filter((r) => r.action && r.kind !== "live");
}

export function facilitationEarnings(rows: BookingRow[]) {
  return rows.reduce((n, r) => n + r.amount, 0);
}
