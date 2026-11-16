import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Hourglass, MessagesSquare, Reply, Ticket, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AgentAvatar } from "@/components/assistant/CharmFigure";
import { Button } from "@/components/ui/button";
import { acceptChat, agentById, chatStore, setAgentStatus, settingsStore, ticketStore } from "@/lib/assistant/store";
import { useStaffAgentId } from "@/lib/assistant/staff";
import { AUDIENCE_LABEL } from "@/lib/assistant/routing";
import { timeAgo } from "@/lib/assistant/format";
import type { LiveChat, Ticket as TicketT } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";
import { Chip, Empty, Heading, Panel, sentenceCase } from "./shared";

type Attention =
  | { kind: "chat"; id: string; at: number; urgent: boolean; chat: LiveChat }
  | { kind: "ticket"; id: string; at: number; urgent: boolean; ticket: TicketT; why: string };

function Kpi({ icon: Icon, label, value, hint, to, tone = "cobalt" }: { icon: LucideIcon; label: string; value: string; hint: string; to: "chat" | "tickets" | "history"; tone?: "cobalt" | "warn" | "lime" | "success" }) {
  const t = { cobalt: "bg-ice text-brand", warn: "bg-warning-soft text-warning-foreground", lime: "bg-midnight text-lime", success: "bg-success-soft text-success" }[tone];
  const cls = "stat-card surface group relative flex min-w-0 flex-col p-4 transition-transform sm:p-5";
  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground sm:text-[13px]">{label}</span>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", t)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </span>
      <span className="mt-2 text-2xl font-extrabold tabular-nums text-ink sm:text-[28px]">{value}</span>
      <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {hint}
        <ArrowRight className="size-3.5 text-brand opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </span>
      <span className="stat-card-bar absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
    </>
  );
  if (to === "chat") return <Link to="/support/live-chat" search={{ chat: undefined }} className={cls}>{body}</Link>;
  if (to === "history") return <Link to="/support/conversations" className={cls}>{body}</Link>;
  return <Link to="/support/tickets" className={cls}>{body}</Link>;
}

export function Overview() {
  const chats = chatStore.use();
  const tickets = ticketStore.use();
  const settings = settingsStore.use();
  const id = useStaffAgentId();
  const me = agentById(id, settings);
  const now = Date.now();

  const waits = chats.filter((c) => c.status === "waiting").sort((a, b) => a.createdAt - b.createdAt);
  const active = chats.filter((c) => c.status === "active");
  const openTickets = tickets.filter((t) => t.status !== "Resolved");
  const urgent = openTickets.filter((t) => t.priority === "urgent");
  const waitingUser = openTickets.filter((t) => t.status === "Waiting for User");
  const resolvedWeek = tickets.filter((t) => t.status === "Resolved" && now - t.updatedAt < 7 * 86_400_000);

  const firsts = [
    ...chats.map((c) => ({ at: c.createdAt, entries: c.messages })),
    ...tickets.map((t) => ({ at: t.createdAt, entries: t.entries })),
  ].flatMap((x) => {
    const first = x.entries.filter((e) => e.from === "agent" && !("internal" in e && e.internal)).sort((a, b) => a.at - b.at)[0];
    return first ? [first.at - x.at] : [];
  });
  const avgFirst = firsts.length ? Math.round(firsts.reduce((a, b) => a + b, 0) / firsts.length / 60000) : null;
  const fmtMins = (m: number) => (m >= 120 ? `${Math.round(m / 60)} h` : `${m} min`);

  const attention: Attention[] = [
    ...waits.map((c) => ({ kind: "chat" as const, id: c.id, at: c.createdAt, urgent: true, chat: c })),
    ...openTickets
      .filter((t) => t.status !== "Waiting for User" && (!t.assigneeId || t.entries.at(-1)?.from === "user" || t.priority === "urgent"))
      .map((t) => ({
        kind: "ticket" as const,
        id: t.id,
        at: t.updatedAt,
        urgent: t.priority === "urgent",
        ticket: t,
        why: !t.assigneeId ? "Not assigned yet" : t.entries.at(-1)?.from === "user" ? "Customer replied" : "Check progress",
      })),
  ]
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.at - b.at)
    .slice(0, 7);

  const mine = openTickets.filter((t) => t.assigneeId === id).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

  const byStatus = (["Open", "In Progress", "Waiting for User", "Resolved"] as const).map((s) => ({ s, n: tickets.filter((t) => t.status === s).length }));
  const totalTickets = Math.max(1, tickets.length);
  const statusColor = { Open: "bg-sky", "In Progress": "bg-warning", "Waiting for User": "bg-midnight", Resolved: "bg-success" } as const;
  const cats = Object.entries(openTickets.reduce<Record<string, number>>((m, t) => ({ ...m, [t.category]: (m[t.category] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCat = Math.max(1, ...cats.map((c) => c[1]));
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <Heading
        title={me ? `${hello}, ${me.name.split(" ")[0]}` : "Support overview"}
        description={attention.length ? `${attention.length} ${attention.length === 1 ? "thing needs" : "things need"} you now. Start at the top of the list.` : "Everyone's been helped. New chats and requests will appear here."}
        actions={
          me ? (
            <div className="flex items-center gap-1 rounded-full bg-soft p-1 ring-1 ring-line" role="group" aria-label="Your availability">
              {(["online", "away", "offline"] as const).map((s) => (
                <button key={s} type="button" aria-pressed={me.status === s} onClick={() => setAgentStatus(me.id, s)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold capitalize transition-colors", me.status === s ? "bg-card text-ink shadow-soft" : "text-muted-foreground hover:text-ink")}>
                  <span className={cn("size-2 rounded-full", s === "online" ? "bg-success" : s === "away" ? "bg-warning" : "bg-muted-foreground/50")} aria-hidden="true" />
                  {s}
                </button>
              ))}
            </div>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <Kpi icon={Hourglass} label="Waiting chats" value={String(waits.length)} hint={waits[0] ? `Longest ${timeAgo(waits[0].createdAt).replace(" ago", "")}` : "Queue clear"} to="chat" tone={waits.length ? "warn" : "success"} />
        <Kpi icon={MessagesSquare} label="Active chats" value={String(active.length)} hint={`${active.filter((c) => c.agentId === id).length} with you`} to="chat" />
        <Kpi icon={Ticket} label="Open tickets" value={String(openTickets.length)} hint={`${openTickets.filter((t) => !t.assigneeId).length} unassigned`} to="tickets" />
        <Kpi icon={AlertTriangle} label="Urgent" value={String(urgent.length)} hint="Money and verification" to="tickets" tone={urgent.length ? "warn" : "cobalt"} />
        <Kpi icon={Reply} label="Waiting for user" value={String(waitingUser.length)} hint="Asked for more info" to="tickets" tone="lime" />
        <Kpi icon={Timer} label="First response" value={avgFirst === null ? "—" : fmtMins(avgFirst)} hint={`${resolvedWeek.length} resolved this week`} to="history" tone="success" />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Panel title="Needs attention" description="Waiting chats first, then urgent and unanswered requests">
            {!attention.length ? (
              <Empty title="All caught up" text="Nobody is waiting. Nice work." />
            ) : (
              <ul className="-mx-5 -my-5 divide-y">
                {attention.map((a) => (
                  <li key={a.id} className="relative flex flex-wrap items-center gap-3 px-5 py-3.5 sm:flex-nowrap">
                    <span className={cn("absolute inset-y-2 left-0 w-1 rounded-r-full", a.urgent ? "bg-warning" : "bg-sky")} aria-hidden="true" />
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", a.kind === "chat" ? "bg-midnight text-lime" : "bg-ice text-brand")}>
                      {a.kind === "chat" ? <MessagesSquare className="size-[18px]" aria-hidden="true" /> : <Ticket className="size-[18px]" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-bold text-ink">{a.kind === "chat" ? a.chat.userName : a.ticket.subject}</span>
                        {a.urgent && <Chip>urgent</Chip>}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        {a.kind === "chat" ? (
                          <>
                            <span>Live chat · {a.chat.category}</span>
                            <span className="inline-flex items-center gap-1 font-bold text-warning-foreground"><Clock className="size-3" aria-hidden="true" />waiting {timeAgo(a.chat.createdAt).replace(" ago", "")}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono font-bold text-brand">{a.ticket.ref}</span>
                            <span>{a.ticket.userName} · {AUDIENCE_LABEL[a.ticket.audience]}</span>
                            <span className="font-bold text-ink">{a.why}</span>
                          </>
                        )}
                      </span>
                    </span>
                    {a.kind === "chat" ? (
                      <span className="flex w-full gap-2 sm:w-auto">
                        <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
                          <Link to="/support/live-chat" search={{ chat: a.chat.id }}>View</Link>
                        </Button>
                        <Button size="sm" disabled={!id} className="flex-1 sm:flex-none" onClick={() => id && acceptChat(a.chat.id, id)}>
                          Accept chat
                        </Button>
                      </span>
                    ) : (
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link to="/support/tickets/$ticketId" params={{ ticketId: a.ticket.id }}>{a.why === "Customer replied" ? "Reply" : "Open ticket"}</Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="My queue" description="Open requests assigned to you" actions={<Link to="/support/tickets" className="text-xs font-bold text-brand hover:underline">All tickets</Link>}>
            {!mine.length ? (
              <Empty title="Nothing assigned to you" text="Pick up something from Needs attention, or accept the next chat." />
            ) : (
              <ul className="-mx-5 -my-5 divide-y">
                {mine.map((t) => (
                  <li key={t.id}>
                    <Link to="/support/tickets/$ticketId" params={{ ticketId: t.id }} className="group flex items-center gap-3 px-5 py-3 hover:bg-soft">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink group-hover:text-brand">{t.subject}</span>
                        <span className="text-xs text-muted-foreground">{t.ref} · {t.userName} · {timeAgo(t.updatedAt)}</span>
                      </span>
                      <Chip>{t.status}</Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Ticket activity" description={`${tickets.length} requests on this desk`}>
            <div className="flex h-3 overflow-hidden rounded-full bg-soft" role="img" aria-label={byStatus.map((b) => `${b.s}: ${b.n}`).join(", ")}>
              {byStatus.map((b) => b.n > 0 && <span key={b.s} className={cn("h-full transition-[width] duration-700", statusColor[b.s])} style={{ width: `${(b.n / totalTickets) * 100}%` }} />)}
            </div>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {byStatus.map((b) => (
                <li key={b.s} className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-sm", statusColor[b.s])} aria-hidden="true" />
                  <span className="text-muted-foreground">{sentenceCase(b.s)}</span>
                  <b className="ml-auto tabular-nums text-ink">{b.n}</b>
                </li>
              ))}
            </ul>
            {cats.length > 0 && (
              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Open by topic</p>
                <ul className="space-y-2">
                  {cats.map(([c, n]) => (
                    <li key={c} className="text-xs">
                      <span className="flex justify-between gap-2"><span className="truncate font-semibold text-ink">{c}</span><b className="tabular-nums">{n}</b></span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-cobalt" style={{ width: `${(n / maxCat) * 100}%` }} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel title="Team availability" description="Who can take live chats right now">
            <ul className="-mx-5 -my-5 divide-y">
              {settings.agents.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="relative">
                    <AgentAvatar name={a.name} className="size-9 text-[11px]" />
                    <span className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card", a.status === "online" ? "bg-success" : a.status === "away" ? "bg-warning" : "bg-muted-foreground/50")} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{a.name}{a.id === id && <span className="ml-1.5 text-xs font-semibold text-muted-foreground">(you)</span>}</span>
                    <span className="block text-xs text-muted-foreground">{a.role} · {active.filter((c) => c.agentId === a.id).length} active chats</span>
                  </span>
                  <Chip>{a.status}</Chip>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Resolved recently">
            {!resolvedWeek.length ? (
              <Empty title="No resolved requests this week" text="Resolved requests from the last seven days show here." />
            ) : (
              <ul className="-mx-5 -my-5 divide-y">
                {resolvedWeek.slice(0, 4).map((t) => (
                  <li key={t.id}>
                    <Link to="/support/tickets/$ticketId" params={{ ticketId: t.id }} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-soft">
                      <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-semibold">{t.subject}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(t.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
