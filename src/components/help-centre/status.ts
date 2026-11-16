import type { TicketStatus } from "@/lib/assistant/types";

/** How a request's status reads to the person who sent it. */
export const STATUS_LABEL: Record<TicketStatus, string> = {
  Open: "Received",
  "In Progress": "In progress",
  "Waiting for User": "Waiting for you",
  Resolved: "Resolved",
};

export const STATUS_ORDER: TicketStatus[] = ["Open", "In Progress", "Waiting for User", "Resolved"];

export const STATUS_TONE: Record<TicketStatus, string> = {
  Open: "bg-ice text-brand ring-1 ring-line",
  "In Progress": "bg-warning-soft text-warning-foreground",
  "Waiting for User": "bg-midnight text-lime",
  Resolved: "bg-success-soft text-success",
};
