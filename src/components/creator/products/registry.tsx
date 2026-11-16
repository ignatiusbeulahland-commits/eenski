import type { ComponentType } from "react";
import type { CreatorItem, CreatorState, ItemKind, Order } from "@/lib/creator/rules";
import { naira } from "@/lib/affiliate/products";
import { courseOf, courseTotals, downloadOf, liveOf, serviceOf, studentProgress } from "@/lib/creator/products";
import type { ProductProps } from "./common";
import { plural, when } from "./common";
import { Assessments, Certificate, CourseOverview, Curriculum, Drip, Presentation, Students, courseChecklist } from "./Course";
import { Buyers, Delivery, DownloadOverview, Files, downloadChecklist } from "./Download";
import { LiveOverview, Registrations, Reminders, Schedule, Tickets, liveChecklist } from "./Live";
import { Packages, Requirements, ServiceOrders, ServiceOverview, ServicePolicies, serviceChecklist } from "./Service";
import { Bookings, CoachingOverview, CoachingPolicies, Intake, Sessions, coachingChecklist } from "./Coaching";

export interface ProductTab {
  id: string;
  label: string;
  Component: ComponentType<ProductProps>;
}
/** Management tabs unique to each product type; Overview is shared and always first. */
export const productTabs: Record<ItemKind, ProductTab[]> = {
  course: [
    { id: "curriculum", label: "Curriculum", Component: Curriculum },
    { id: "presentation", label: "Presentation", Component: Presentation },
    { id: "assessments", label: "Assessments", Component: Assessments },
    { id: "students", label: "Students", Component: Students },
    { id: "certificate", label: "Certificate", Component: Certificate },
    { id: "drip", label: "Drip schedule", Component: Drip },
  ],
  ebook: [
    { id: "files", label: "Files", Component: Files },
    { id: "delivery", label: "Delivery", Component: Delivery },
    { id: "buyers", label: "Buyers", Component: Buyers },
  ],
  live: [
    { id: "schedule", label: "Schedule & venue", Component: Schedule },
    { id: "tickets", label: "Tickets", Component: Tickets },
    { id: "registrations", label: "Registrations", Component: Registrations },
    { id: "reminders", label: "Reminders", Component: Reminders },
  ],
  service: [
    { id: "packages", label: "Packages", Component: Packages },
    { id: "requirements", label: "Requirements", Component: Requirements },
    { id: "orders", label: "Orders", Component: ServiceOrders },
    { id: "policies", label: "Policies", Component: ServicePolicies },
  ],
  coaching: [
    { id: "sessions", label: "Sessions", Component: Sessions },
    { id: "bookings", label: "Bookings", Component: Bookings },
    { id: "intake", label: "Intake form", Component: Intake },
    { id: "policies", label: "Policies", Component: CoachingPolicies },
  ],
};
/** Where a newly created product opens so the creator can finish setting it up. */
export const setupTab: Record<ItemKind, string> = {
  course: "curriculum",
  ebook: "files",
  live: "schedule",
  service: "packages",
  coaching: "sessions",
};

const overviews: Record<ItemKind, ComponentType<ProductProps>> = {
  course: CourseOverview,
  ebook: DownloadOverview,
  live: LiveOverview,
  service: ServiceOverview,
  coaching: CoachingOverview,
};
export function TypeOverview(props: ProductProps) {
  const Overview = overviews[props.item.kind];
  return <Overview {...props} />;
}
export function typeChecklist(item: CreatorItem, state: Pick<CreatorState, "availability">) {
  switch (item.kind) {
    case "course": return courseChecklist(item);
    case "ebook": return downloadChecklist(item);
    case "live": return liveChecklist(item);
    case "service": return serviceChecklist(item);
    case "coaching": return coachingChecklist(item, state.availability.days.filter((d) => d.enabled).length);
  }
}

/** One-line summary on product cards, specific to each type. */
export function cardMeta(item: CreatorItem, orders: Order[]) {
  const paid = orders.filter((o) => o.itemId === item.id && o.status === "paid");
  switch (item.kind) {
    case "course": {
      const c = courseOf(item);
      const t = courseTotals(c);
      const done = paid.filter((o) => studentProgress(o, c) === 100).length;
      return `${plural(t.modules, "module")} · ${plural(t.lessons, "lesson")} · ${plural(paid.length, "student")}${paid.length ? ` · ${done} finished` : ""}`;
    }
    case "ebook": {
      const d = downloadOf(item);
      return `${d.files.length} file${d.files.length === 1 ? "" : "s"} · ${paid.reduce((n, o) => n + (o.downloads ?? 0), 0)} downloads`;
    }
    case "live":
      return `${item.date ? when(item.date) : "Not scheduled"} · ${paid.length}/${item.capacity} seats · ${liveOf(item).venue === "online" ? "Online" : "In person"}`;
    case "service": {
      const s = serviceOf(item);
      return `${s.packages.length} package${s.packages.length === 1 ? "" : "s"} · ${plural(paid.filter((o) => (o.stage ?? "requirements") !== "completed").length, "active order")}`;
    }
    case "coaching": {
      const upcoming = paid.filter((o) => (o.booking ?? "scheduled") === "scheduled" && o.sessionAt && Date.parse(o.sessionAt) > Date.now()).length;
      return `${item.duration} min sessions · ${upcoming} upcoming`;
    }
  }
}
/** Price label: services start from their cheapest package, live sessions from the cheapest ticket. */
export function priceLabel(item: CreatorItem) {
  const free = (n: number) => (n ? naira(n) : "Free");
  if (item.kind === "service" && serviceOf(item).packages.length) return `From ${free(Math.min(...serviceOf(item).packages.map((p) => p.price)))}`;
  if (item.kind === "live" && liveOf(item).tickets.length) return `From ${free(Math.min(...liveOf(item).tickets.map((t) => t.price)))}`;
  return free(item.price);
}
