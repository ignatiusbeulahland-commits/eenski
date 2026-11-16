import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ticketStore, settingsStore, TICKET_STATUSES, agentById } from "@/lib/assistant/store";
import { AUDIENCE_LABEL, SUPPORT_CATEGORIES } from "@/lib/assistant/routing";
import { timeAgo } from "@/lib/assistant/format";
import { Search } from "lucide-react";
import { AgentAvatar } from "@/components/assistant/CharmFigure";
import { cn } from "@/lib/utils";
import { Heading, Panel, Pick, Chip, Empty, field } from "./shared";
export function TicketsPage() {
  const tickets = ticketStore.use(),
    settings = settingsStore.use();
  const [q, Q] = useState(""),
    [status, S] = useState("all"),
    [priority, P] = useState("all"),
    [category, C] = useState("all"),
    [agent, A] = useState("all");
  const list = tickets
    .filter(
      (t) =>
        [t.ref, t.subject, t.userName, t.userEmail].join(" ").toLowerCase().includes(q.toLowerCase()) &&
        (status === "all" || t.status === status) &&
        (priority === "all" || t.priority === priority) &&
        (category === "all" || t.category === category) &&
        (agent === "all" || (agent === "none" ? !t.assigneeId : t.assigneeId === agent)),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <Heading title="Tickets" description="Follow every request through to resolution. Urgent and unanswered requests are marked so you know where to start." />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Quick filters">
        {(
          [
            ["all", "All", tickets.length],
            ["Open", "Open", tickets.filter((t) => t.status === "Open").length],
            ["In Progress", "In progress", tickets.filter((t) => t.status === "In Progress").length],
            ["Waiting for User", "Waiting for user", tickets.filter((t) => t.status === "Waiting for User").length],
            ["Resolved", "Resolved", tickets.filter((t) => t.status === "Resolved").length],
          ] as const
        ).map(([v, l, n]) => (
          <button key={v} type="button" aria-pressed={status === v} onClick={() => S(v)} className={cn("inline-flex h-9 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors", status === v ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-sky")}>
            {l}
            <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", status === v ? "bg-on-dark/20" : "bg-soft text-muted-foreground")}>{n}</span>
          </button>
        ))}
      </div>
      <Panel>
        <label className="relative block text-sm">
          <span className="sr-only">Search tickets</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            className={`${field} pl-10`}
            value={q}
            onChange={(e) => Q(e.target.value)}
            placeholder="Search by reference, subject, name or email"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Pick label="Status" value={status} onChange={S} options={[{ value: "all", label: "All statuses" }, ...TICKET_STATUSES]} />
          <Pick label="Priority" value={priority} onChange={P} options={[{ value: "all", label: "All priorities" }, "normal", "urgent"]} />
          <Pick
            label="Category"
            value={category}
            onChange={C}
            options={[
              { value: "all", label: "All categories" },
              ...Array.from(new Set([...Object.values(SUPPORT_CATEGORIES).flat(), ...tickets.map((t) => t.category)])),
            ]}
          />
          <Pick
            label="Assignee"
            value={agent}
            onChange={A}
            options={[
              { value: "all", label: "All agents" },
              { value: "none", label: "Unassigned" },
              ...settings.agents.map((a) => ({ value: a.id, label: a.name })),
            ]}
          />
        </div>
        <p className="text-xs font-semibold text-muted-foreground" aria-live="polite">{list.length} {list.length === 1 ? "ticket" : "tickets"}</p>
        <ul className="-mx-5 -mb-5 divide-y border-t">
          {!list.length && <li><Empty title="No tickets match" text="Try another search or clear the filters." /></li>}
          {list.map((t) => {
            const needsReply = t.status !== "Resolved" && t.entries.at(-1)?.from === "user";
            const agent = agentById(t.assigneeId, settings);
            return (
              <li key={t.id}>
                <Link to="/support/tickets/$ticketId" params={{ ticketId: t.id }} className="group relative flex items-start gap-3 px-5 py-4 transition-colors hover:bg-soft">
                  <span className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", t.status === "Resolved" ? "bg-success/50" : t.priority === "urgent" ? "bg-warning" : "bg-sky/60")} aria-hidden="true" />
                  <AgentAvatar name={t.userName} className="mt-0.5 size-9 shrink-0 text-[11px]" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">{t.ref}</span>
                      <span className="min-w-0 truncate font-bold text-ink group-hover:text-brand">{t.subject}</span>
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{t.userName} · {AUDIENCE_LABEL[t.audience]}</span>
                      <span>{t.category}</span>
                      <span>{agent?.name ?? "Unassigned"}</span>
                      <span>updated {timeAgo(t.updatedAt)}</span>
                      {needsReply && <span className="font-extrabold text-ink">Customer replied</span>}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <Chip>{t.status}</Chip>
                    {t.priority === "urgent" && <Chip>urgent</Chip>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
