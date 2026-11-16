import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ticketStore,
  settingsStore,
  TICKET_STATUSES,
  staffReply,
  staffAssign,
  staffSetStatus,
  staffSetPriority,
  agentById,
} from "@/lib/assistant/store";
import { useStaffAgentId } from "@/lib/assistant/staff";
import { AUDIENCE_LABEL } from "@/lib/assistant/routing";
import type { TicketStatus, Ticket } from "@/lib/assistant/types";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/assistant/CharmFigure";
import { timeAgo } from "@/lib/assistant/format";
import { cn } from "@/lib/utils";
import { Heading, Panel, Pick, Chip, field, ImageAttachment, Empty } from "./shared";

const QUICK_REPLIES = [
  "Thanks for getting in touch. I'm looking into this now and will update you shortly.",
  "Could you send a screenshot of what you see, and the email on your account?",
  "This is fixed on our side. Could you try again and let me know if it works?",
  "I've passed this to our payments team. You'll hear from us within one working day.",
];
export function TicketDetails({ id }: { id: string }) {
  const tickets = ticketStore.use(),
    settings = settingsStore.use(),
    agent = useStaffAgentId(),
    t = tickets.find((x) => x.id === id);
  const others = t ? tickets.filter((x) => x.id !== t.id && x.userEmail && x.userEmail === t.userEmail) : [];
  const [text, T] = useState(""),
    [mode, M] = useState("reply");
  if (!t)
    return (
      <Panel title="Ticket not found">
        <Empty title="We couldn't find this ticket" text="It may have been removed, or the link is wrong." />
        <Button asChild variant="outline"><Link to="/support/tickets">Back to tickets</Link></Button>
      </Panel>
    );
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] font-semibold text-muted-foreground">
        <Link to="/support/tickets" className="hover:text-brand">Tickets</Link> <span aria-hidden="true">/</span> <span className="text-ink">{t.ref}</span>
      </nav>
      <Heading eyebrow={t.ref} title={t.subject} description={`Opened ${new Date(t.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · last update ${timeAgo(t.updatedAt)}`} />
      <div className="-mt-3 mb-5 flex flex-wrap gap-2">
        <Chip>{t.status}</Chip>
        <Chip>{t.priority}</Chip>
        <Chip>{t.category}</Chip>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          <Panel title="Request" description={`From ${t.userName}`}>
            <p className="whitespace-pre-wrap text-[15px] leading-7">{t.description}</p>
            <ImageAttachment attachment={t.attachment} />
          </Panel>
          <Panel title="Charm conversation summary">
            <p className="whitespace-pre-wrap text-sm">{t.summary || "No summary provided."}</p>
          </Panel>
          <Panel title="Timeline">
            {!t.entries.length && <Empty title="No replies yet" text="Your first reply moves the ticket to In progress." />}
            <ol className="space-y-3">
              {t.entries.map((e) => {
                const who = e.from === "agent" ? agentById(e.agentId, settings)?.name || "Agent" : t.userName;
                return (
                  <li key={e.id} className="flex gap-3">
                    <AgentAvatar name={who} className="size-8 shrink-0 text-[10px]" />
                    <article className={cn("min-w-0 flex-1 rounded-2xl p-4", e.internal ? "bg-warning-soft ring-1 ring-warning/30" : e.from === "agent" ? "bg-ice" : "bg-soft")}>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <strong className="text-ink">{who}</strong>
                        <span className="text-muted-foreground">{new Date(e.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", e.internal ? "bg-warning/20 text-warning-foreground" : e.from === "agent" ? "bg-card text-brand" : "bg-card text-muted-foreground")}>{e.internal ? "Internal note" : e.from === "agent" ? "Reply" : "Customer"}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{e.text}</p>
                      <ImageAttachment attachment={e.attachment} />
                    </article>
                  </li>
                );
              })}
            </ol>
          </Panel>
          <Panel title="Write a response">
            <Pick
              label="Response type"
              value={mode}
              onChange={M}
              options={[
                { value: "reply", label: "Reply to user" },
                { value: "internal", label: "Internal note" },
              ]}
            />
            {mode === "reply" && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Quick replies</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((r) => (
                    <button key={r} type="button" onClick={() => T(r)} className="max-w-full truncate rounded-full border-[1.5px] border-line bg-card px-3 py-1.5 text-xs font-bold text-brand hover:border-sky hover:bg-ice" title={r}>
                      {r.split(".")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label className="block text-sm">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{mode === "internal" ? "Internal note" : "Reply to " + t.userName.split(" ")[0]}</span>
              <textarea className={`${field} mt-1.5`} rows={5} value={text} onChange={(e) => T(e.target.value)} placeholder={mode === "internal" ? "Only the support team sees this" : "Write a clear, friendly reply"} />
            </label>
            {mode === "internal" && <p className="text-xs text-muted-foreground">Only support staff can see this note.</p>}
            <Button
              disabled={!agent || !text.trim()}
              onClick={() => {
                if (!agent || !text.trim()) return;
                staffReply(id, agent, text, mode === "internal");
                T("");
                toast.success(mode === "internal" ? "Internal note added" : "Reply sent");
              }}
            >
              {mode === "internal" ? "Add note" : "Send reply"}
            </Button>
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel title="User details">
            <div className="flex items-center gap-3">
              <AgentAvatar name={t.userName} className="size-11 text-xs" />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{t.userName}</p>
                <p className="break-all text-xs text-muted-foreground">{t.userEmail || "Guest"}</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Workspace</dt><dd className="font-bold">{AUDIENCE_LABEL[t.audience]}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Topic</dt><dd className="text-right font-bold">{t.category}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Requests from them</dt><dd className="font-bold tabular-nums">{others.length + 1}</dd></div>
            </dl>
            {others.length > 0 && (
              <div className="border-t pt-3">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Earlier requests</p>
                <ul className="space-y-1.5">
                  {others.slice(0, 4).map((o) => (
                    <li key={o.id}>
                      <Link to="/support/tickets/$ticketId" params={{ ticketId: o.id }} className="flex items-center justify-between gap-2 text-xs font-semibold hover:text-brand">
                        <span className="truncate">{o.ref} · {o.subject}</span>
                        <Chip>{o.status}</Chip>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
          <Panel title="Ticket controls">
            <Pick
              label="Status"
              value={t.status}
              options={TICKET_STATUSES}
              onChange={(v) => {
                staffSetStatus(id, v as TicketStatus);
                toast.success("Status updated");
              }}
            />
            <Pick
              label="Assignee"
              value={t.assigneeId || "none"}
              options={[{ value: "none", label: "Unassigned" }, ...settings.agents.map((a) => ({ value: a.id, label: a.name }))]}
              onChange={(v) => staffAssign(id, v === "none" ? null : v)}
            />
            <Pick
              label="Priority"
              value={t.priority}
              options={["normal", "urgent"]}
              onChange={(v) => staffSetPriority(id, v as Ticket["priority"])}
            />
            <Button
              disabled={t.status === "Resolved"}
              onClick={() => {
                staffSetStatus(id, "Resolved");
                toast.success("Ticket resolved");
              }}
            >
              Mark resolved
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}
