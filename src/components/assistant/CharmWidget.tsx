import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronUp, Minus, Shirt, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDemoProfile } from "@/lib/demo/profile";
import { useIdentity } from "@/lib/shared/identity";
import { assistantTitle, audienceForPath, summarise } from "@/lib/assistant/engine";
import {
  agentById,
  chatStore,
  chooseLook,
  ensureActiveThread,
  kbStore,
  markSeen,
  markThreadRead,
  myTickets,
  prefsStore,
  selectThread,
  settingsStore,
  startThread,
  supportAvailability,
  threadStore,
  ticketStore,
} from "@/lib/assistant/store";
import type { Pose, Thread, Ticket } from "@/lib/assistant/types";
import { CharmFigure, CharmHead, Confetti, AgentAvatar } from "./CharmFigure";
import { ChatView, currentLiveChat, mergedItems } from "./ChatView";
import { LookPicker } from "./LookPicker";
import { lookFor } from "./looks";
import { OPEN_CHARM_EVENT, type OpenCharmRequest } from "@/lib/assistant/open";
import { ThreadList } from "./ThreadList";
import { TicketDetail, TicketForm, TicketList, TicketSubmitted } from "./TicketViews";

type View = { tab: "chat" } | { tab: "threads" } | { tab: "tickets"; ticketId?: string } | { tab: "ticket-form" } | { tab: "ticket-done"; ticket: Ticket };

const BUBBLE_KEY = "enski:charm:bubble";
const DASHBOARD_HELLO = {
  learner: "Ask me about your courses, certificates or badges.",
  creator: "I can help with products, payouts and certificates.",
  affiliate: "Ask me about links, commissions or withdrawals.",
} as const;

function lastAt(thread: Thread, chats: ReturnType<typeof chatStore.get>) {
  const items = mergedItems(thread, chats);
  return items.at(-1)?.at ?? 0;
}

/** Floating Charm button + chat panel, on the public site and every dashboard. */
export function CharmWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const storePreview = useRouterState({ select: (s) => s.location.pathname.startsWith("/store/") && Boolean((s.location.search as { preview?: boolean }).preview) });
  // A creator's page preview shows only what visitors see.
  if (storePreview) return null;
  // Focused journeys (support desk, checkout, receipts, admin, sign-in and welcome) keep the screen to themselves.
  if (/^\/(support|checkout|orders|admin|auth|welcome|onboarding)(\/|$)/.test(pathname)) return null;
  // Money steps keep their action bar clear: withdrawing, adding a payout account and paying.
  if (/^\/(creator|affiliate|learner)\/(wallet\/(withdraw|beneficiaries)|checkout)/.test(pathname)) return null;
  return <CharmDock pathname={pathname} />;
}

function CharmDock({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const profile = useDemoProfile();
  const identity = useIdentity();
  const prefs = prefsStore.use();
  const { threads, activeId } = threadStore.use();
  const chats = chatStore.use();
  const tickets = ticketStore.use();
  const settings = settingsStore.use();
  const look = lookFor(prefs.look);
  const audience = audienceForPath(pathname);
  const user = profile ? { name: profile.name, email: profile.email } : null;

  const [mode, setMode] = useState<"closed" | "open" | "min">("closed");
  const [view, setView] = useState<View>({ tab: "chat" });
  const [picker, setPicker] = useState<{ open: boolean; first: boolean }>({ open: false, first: false });
  const [typing, setTyping] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const [bubble, setBubble] = useState(false);
  const [request, setRequest] = useState<{ prompt?: string | undefined; human?: boolean | undefined; key: number } | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  // Movable + tuckable launcher (saved per device).
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tucked, setTucked] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const movedRef = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("enski:charm:dock") ?? "null");
      if (saved && typeof saved.x === "number" && typeof saved.y === "number") setOffset({ x: saved.x, y: saved.y });
      if (saved?.tucked) setTucked(true);
    } catch {}
  }, []);
  const saveDock = (o: { x: number; y: number }, t: boolean) => {
    try { localStorage.setItem("enski:charm:dock", JSON.stringify({ ...o, tucked: t })); } catch {}
  };
  const clamp = (x: number, y: number) => {
    const maxX = 0, minX = -(window.innerWidth - 90);
    const maxY = 0, minY = -(window.innerHeight - 110);
    return { x: Math.min(maxX, Math.max(minX, x)), y: Math.min(maxY, Math.max(minY, y)) };
  };
  const onDragStart = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y, moved: false };
    movedRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    movedRef.current = true;
    setOffset(clamp(d.ox + dx, d.oy + dy));
  };
  const onDragEnd = () => {
    if (dragRef.current?.moved) saveDock(offset, tucked);
    dragRef.current = null;
  };
  const guardClick = (fn: () => void) => () => {
    if (movedRef.current) { movedRef.current = false; return; }
    fn();
  };
  const tuck = (t: boolean) => { setTucked(t); setBubble(false); saveDock(offset, t); };
  const panelRef = useRef<HTMLDivElement>(null);

  const thread = threads.find((t) => t.id === activeId);
  const live = currentLiveChat(thread, chats);
  const liveAgent = live && live.status === "active" ? agentById(live.agentId, settings) : null;
  const mine = useMemo(() => myTickets(tickets), [tickets]);

  const unreadIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of threads) {
      const items = mergedItems(t, chats);
      if (items.some((m) => m.at > t.readAt && (m.from === "agent" || (m.from === "charm" && t.id !== activeId)))) ids.add(t.id);
    }
    return ids;
  }, [threads, chats, activeId]);
  const ticketUpdates = mine.filter((t) => t.unseenUpdate).length;
  const hasUnread = unreadIds.size > 0 || ticketUpdates > 0 || !prefs.seen;

  // First visit: a small hello next to the button, once per session. In a dashboard it is a personal,
  // role-aware hello (once per session per dashboard) so Charm feels part of the workspace.
  const inDashboard = audience !== "public";
  const bubbleKey = inDashboard ? `${BUBBLE_KEY}:${audience}` : BUBBLE_KEY;
  useEffect(() => {
    if ((prefs.seen && !inDashboard) || mode !== "closed") return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(bubbleKey) === "1";
    } catch {
      shown = false;
    }
    if (shown) return;
    const t = window.setTimeout(() => {
      setBubble(true);
      try {
        sessionStorage.setItem(bubbleKey, "1");
      } catch {
        /* ignore */
      }
    }, inDashboard ? 4200 : 2600);
    return () => window.clearTimeout(t);
  }, [prefs.seen, mode, inDashboard, bubbleKey]);
  const firstName = identity?.greet || profile?.name.trim().split(/\s+/)[0];
  const bubbleText = !inDashboard
    ? "Hi, I'm Charm! Need a hand finding your way around Enski?"
    : `${firstName ? `Hi ${firstName}! ` : "Hi! "}${DASHBOARD_HELLO[audience]}`;

  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => setBubble(false), 9000);
    return () => window.clearTimeout(t);
  }, [bubble]);

  // Keep the open conversation marked as read.
  const latest = thread ? lastAt(thread, chats) : 0;
  useEffect(() => {
    if (mode === "open" && view.tab === "chat" && thread && latest > thread.readAt) markThreadRead(thread.id);
  }, [mode, view.tab, thread, latest]);

  const open = useCallback(() => {
    const returning = prefsStore.get().seen;
    ensureActiveThread(audience, { name: profile?.name, returning });
    markSeen();
    setBubble(false);
    setMode("open");
    setView((v) => (v.tab === "ticket-done" ? { tab: "chat" } : v));
    setFocusKey((k) => k + 1);
    if (!prefsStore.get().look) setPicker({ open: true, first: true });
  }, [audience, profile?.name]);

  // Pages (support centre, conversation history) open the panel through openCharm().
  useEffect(() => {
    const onOpen = (e: Event) => {
      const r = (e as CustomEvent<OpenCharmRequest>).detail ?? {};
      if (r.fresh) startThread(audience, { name: profile?.name, returning: true });
      else if (r.threadId && threadStore.get().threads.some((t) => t.id === r.threadId)) selectThread(r.threadId);
      open();
      setView({ tab: "chat" });
      if (r.prompt || r.human) setRequest({ prompt: r.prompt, human: r.human, key: Date.now() });
    };
    window.addEventListener(OPEN_CHARM_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHARM_EVENT, onOpen);
  }, [audience, profile?.name, open]);

  const close = useCallback((to: "closed" | "min") => {
    setMode(to);
    window.setTimeout(() => launcherRef.current?.focus({ preventScroll: true }), 0);
  }, []);

  useEffect(() => {
    if (mode !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !picker.open && panelRef.current?.contains(document.activeElement)) close("min");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, picker.open, close]);

  const onNavigate = (href: string) => {
    void navigate({ href });
    if (window.matchMedia("(max-width: 639.98px)").matches) setMode("min");
  };

  const newConversation = () => {
    startThread(audience, { name: profile?.name, returning: true });
    setView({ tab: "chat" });
    setFocusKey((k) => k + 1);
  };

  // Charm's expression follows the conversation, then settles back to idle.
  const lastCharm = thread ? [...thread.messages].reverse().find((m) => m.from === "charm") : undefined;
  const [settled, setSettled] = useState<string | null>(null);
  useEffect(() => {
    if (!lastCharm) return;
    const t = window.setTimeout(() => setSettled(lastCharm.id), lastCharm.pose === "celebrate" ? 2600 : 6000);
    return () => window.clearTimeout(t);
  }, [lastCharm?.id, lastCharm?.pose]);
  let pose: Pose = "idle";
  if (typing || thread?.handover === "connecting") pose = "think";
  else if (view.tab === "ticket-done") pose = "celebrate";
  else if (lastCharm && settled !== lastCharm.id) pose = lastCharm.pose ?? "idle";
  const celebrateNow = pose === "celebrate" && (view.tab === "ticket-done" || (lastCharm && Date.now() - lastCharm.at < 4000));

  const ticketDefaults = () => {
    const asked = (thread?.messages ?? []).filter((m) => m.from === "user").map((m) => m.text.trim()).filter(Boolean);
    return {
      subject: asked[0]?.slice(0, 80) ?? "",
      description: asked.slice(-3).join("\n"),
      summary: thread ? summarise(thread, pathname, kbStore.get()) : `${audience} on ${pathname}.`,
    };
  };

  const team = supportAvailability(settings);
  const statusLine = liveAgent
    ? `Chatting with ${liveAgent.name}`
    : live?.status === "waiting"
      ? "Waiting for the next agent"
      : team.available
        ? "Support team online · replies in minutes"
        : "Team offline · leave a message anytime";
  const statusDot = liveAgent || (!live && team.available) ? "bg-lime" : live?.status === "waiting" ? "bg-warning animate-pulse" : "bg-on-dark-muted";

  return (
    <>
      {/* Launcher */}
      {mode !== "open" && tucked && (
        <button
          type="button"
          onClick={() => tuck(false)}
          aria-label={`Show Charm${hasUnread ? " (new messages)" : ""}`}
          title="Show Charm"
          className="charm-dock fixed right-0 z-(--z-float) flex items-center gap-1 rounded-l-full bg-cobalt py-1 pl-1 pr-1.5 text-primary-foreground shadow-float"
        >
          <ChevronUp className="size-4 -rotate-90" aria-hidden="true" />
          <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-on-dark/10">
            <CharmHead look={look} className="size-8" />
            {hasUnread && <span className="absolute right-0 top-0 size-2.5 rounded-full bg-lime" aria-hidden="true" />}
          </span>
        </button>
      )}
      {mode !== "open" && !tucked && (
        <div
          className="charm-dock fixed right-4 z-(--z-float) flex touch-none items-end gap-2 sm:right-6"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          title="Drag to move Charm"
        >
          <button
            type="button"
            onClick={guardClick(() => tuck(true))}
            aria-label="Minimise Charm to the side"
            title="Minimise"
            className="absolute -left-2 -top-2 z-10 grid size-6 place-items-center rounded-full border border-line bg-card text-muted-foreground shadow-float hover:text-ink"
          >
            <X className="size-3" />
          </button>
          {bubble && mode === "closed" && (
            <div className="relative mb-3 max-w-[220px] animate-rise rounded-[18px] rounded-br-[6px] border border-line bg-card p-3 pr-8 text-sm font-semibold text-ink shadow-float">
              <button type="button" onClick={open} className="text-left">
                {bubbleText}
              </button>
              <button type="button" onClick={() => setBubble(false)} aria-label="Dismiss Charm's message" className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-soft hover:text-ink">
                <X className="size-3.5" />
              </button>
            </div>
          )}
          {mode === "min" ? (
            <button
              ref={launcherRef}
              type="button"
              onClick={guardClick(open)}
              aria-label={`Open chat with Charm${hasUnread ? " (new messages)" : ""}`}
              className="flex items-center gap-2 rounded-full bg-cobalt py-1.5 pl-1.5 pr-4 text-primary-foreground shadow-float transition-transform hover:-translate-y-0.5"
            >
              <span className="relative grid size-10 place-items-center rounded-full bg-on-dark/10">
                <CharmHead look={look} className="size-10" />
                {hasUnread && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-lime ring-2 ring-cobalt" aria-hidden="true" />}
              </span>
              <span className="text-left leading-tight">
                <span className="block text-sm font-extrabold">Charm</span>
                <span className="block max-w-[150px] truncate text-[11px] font-semibold text-on-dark-muted">{statusLine}</span>
              </span>
              <ChevronUp className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              ref={launcherRef}
              type="button"
              onClick={guardClick(open)}
              aria-label={`Chat with Charm, the Enski Assistant${hasUnread ? " (new messages)" : ""}`}
              className="charm-fab group"
            >
              <span className="charm-fab-surface" aria-hidden="true">
                <CharmHead look={look} className="charm-launcher-head absolute -bottom-1 left-1/2 size-[58px] max-w-none -translate-x-1/2" />
              </span>
              {inDashboard && (
                <span className="charm-fab-label pointer-events-none absolute -bottom-3 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-midnight px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-lime ring-1 ring-lime/60 lg:block" aria-hidden="true">
                  Ask Charm
                </span>
              )}
              {hasUnread && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-lime ring-[3px] ring-midnight" aria-hidden="true">
                  <span className="size-1.5 rounded-full bg-midnight" />
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Panel */}
      {mode === "open" && thread && (
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Charm, the Enski Assistant"
          className="fixed inset-0 z-(--z-float-top) flex flex-col bg-background sm:z-(--z-float) sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(680px,calc(100dvh-5.5rem))] sm:w-[400px] sm:rounded-[28px] sm:border sm:border-line sm:shadow-float"
        >
          <header data-surface="dark" className="relative isolate shrink-0 bg-cobalt pb-3 pl-[104px] pr-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-primary-foreground sm:rounded-t-[28px] sm:pl-[118px] sm:pt-3">
            {celebrateNow && <Confetti />}
            <div className="pointer-events-none absolute bottom-0 left-2 h-[108px] w-[96px] sm:-top-12 sm:h-auto sm:w-[108px]">
              <CharmFigure look={look} pose={pose} className="absolute bottom-0 left-0 h-full w-full object-bottom drop-shadow-[0_8px_14px_rgb(0_0_0/0.25)]" alt="" />
            </div>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 pt-1">
                <p className="flex items-center gap-2 text-lg font-extrabold leading-tight">
                  Charm
                  <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-midnight">Enski Assistant</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-on-dark-muted">
                  {liveAgent ? <AgentAvatar name={liveAgent.name} className="size-5 text-[9px] ring-1" /> : <span className={cn("size-2 shrink-0 rounded-full", statusDot)} aria-hidden="true" />}
                  <span className="truncate">{statusLine}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => setPicker({ open: true, first: false })} aria-label="Change Charm's look" title="Change look" className="grid size-9 place-items-center rounded-full text-primary-foreground transition-colors hover:bg-on-dark/15">
                  <Shirt className="size-[18px]" />
                </button>
                <button type="button" onClick={() => close("min")} aria-label="Minimise chat" title="Minimise" className="grid size-9 place-items-center rounded-full text-primary-foreground transition-colors hover:bg-on-dark/15">
                  <Minus className="size-[18px]" />
                </button>
                <button type="button" onClick={() => close("closed")} aria-label="Close chat" title="Close" className="grid size-9 place-items-center rounded-full text-primary-foreground transition-colors hover:bg-on-dark/15">
                  <X className="size-[18px]" />
                </button>
              </div>
            </div>
            <nav aria-label="Charm" className="mt-3 flex gap-1 rounded-full bg-on-dark/10 p-1">
              {(
                [
                  ["chat", "Chat", 0],
                  ["threads", "Conversations", [...unreadIds].filter((id) => id !== thread.id).length],
                  ["tickets", "Tickets", ticketUpdates],
                ] as const
              ).map(([tab, label, count]) => {
                const active = view.tab === tab || (tab === "chat" && (view.tab === "ticket-form" || view.tab === "ticket-done"));
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      setView({ tab } as View);
                      if (tab === "chat") setFocusKey((k) => k + 1);
                    }}
                    className={cn(
                      "relative flex-1 rounded-full px-2 py-1.5 text-xs font-extrabold transition-colors",
                      active ? "bg-background text-brand" : "text-primary-foreground hover:bg-on-dark/10",
                    )}
                  >
                    {label}
                    {count > 0 && <span className="ml-1 inline-grid min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] text-midnight">{count}</span>}
                  </button>
                );
              })}
            </nav>
          </header>

          <div className="flex min-h-0 flex-1 flex-col sm:rounded-b-[28px]">
            {view.tab === "chat" && (
              <ChatView
                key={thread.id}
                thread={thread}
                look={look}
                audience={audience}
                pathname={pathname}
                user={user}
                typing={typing}
                setTyping={setTyping}
                onNavigate={onNavigate}
                onLeaveMessage={() => setView({ tab: "ticket-form" })}
                focusKey={focusKey}
                request={request}
                onRequestDone={() => setRequest(null)}
              />
            )}
            {view.tab === "threads" && (
              <ThreadList
                threads={threads}
                activeId={activeId}
                unreadIds={unreadIds}
                onSelect={(id) => {
                  selectThread(id);
                  setView({ tab: "chat" });
                  setFocusKey((k) => k + 1);
                }}
                onNew={newConversation}
              />
            )}
            {view.tab === "tickets" &&
              (view.ticketId && mine.find((t) => t.id === view.ticketId) ? (
                <TicketDetail ticket={mine.find((t) => t.id === view.ticketId)!} onBack={() => setView({ tab: "tickets" })} />
              ) : (
                <TicketList tickets={mine} onOpen={(id) => setView({ tab: "tickets", ticketId: id })} onNew={() => setView({ tab: "ticket-form" })} />
              ))}
            {view.tab === "ticket-form" && (
              <TicketForm
                audience={audience}
                user={user}
                threadId={thread.id}
                defaults={ticketDefaults()}
                onBack={() => setView({ tab: "chat" })}
                onDone={(ticket) => setView({ tab: "ticket-done", ticket })}
              />
            )}
            {view.tab === "ticket-done" && (
              <TicketSubmitted ticket={view.ticket} onView={() => setView({ tab: "tickets", ticketId: view.ticket.id })} onBack={() => setView({ tab: "chat" })} />
            )}
          </div>
        </section>
      )}

      <LookPicker
        open={picker.open}
        firstTime={picker.first}
        current={prefs.look}
        onOpenChange={(o) => {
          if (!o && picker.first && !prefsStore.get().look) chooseLook("classic");
          setPicker((p) => ({ ...p, open: o }));
        }}
        onChoose={(id) => {
          chooseLook(id);
          setPicker({ open: false, first: false });
          setFocusKey((k) => k + 1);
        }}
      />
    </>
  );
}
