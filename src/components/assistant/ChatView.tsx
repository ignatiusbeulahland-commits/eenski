import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, ExternalLink, Headset, ImagePlus, LifeBuoy, PhoneOff, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readImageAttachment } from "@/lib/assistant/attach";
import { clock } from "@/lib/assistant/format";
import { afterUnhelpful, pageHelp, respond, summarise, UNAVAILABLE_TEXT } from "@/lib/assistant/engine";
import { suggestCategory } from "@/lib/assistant/routing";
import {
  agentById,
  appendMessages,
  chatStore,
  connectToHuman,
  endChat,
  kbStore,
  sendLiveMessage,
  setFeedback,
  settingsStore,
  supportAvailability,
  threadStore,
  updateThread,
} from "@/lib/assistant/store";
import type { Attachment, Audience, ChatMessage, HandoverReason, LiveChat, QuickAction, Thread } from "@/lib/assistant/types";
import { useNetworkState } from "@/lib/network/store";
import { AgentAvatar, CharmHead } from "./CharmFigure";
import type { CharmLook } from "./looks";
import { RichText } from "./RichText";

export type ChatUser = { name: string; email: string } | null;

type Item = ChatMessage & { live?: boolean };

const firstName = (n: string) => n.trim().split(/\s+/)[0] || n;

export function currentLiveChat(thread: Thread | undefined, chats: LiveChat[]) {
  const id = thread?.liveChatIds?.at(-1);
  return id ? (chats.find((c) => c.id === id) ?? null) : null;
}

/** Charm's messages and any live-chat lines, in time order. */
export function mergedItems(thread: Thread, chats: LiveChat[]): Item[] {
  const lines: Item[] = (thread.liveChatIds ?? []).flatMap((id) => {
    const c = chats.find((x) => x.id === id);
    return (c?.messages ?? []).map((l) => ({ id: l.id, from: l.from, text: l.text, at: l.at, agentId: l.agentId, attachment: l.attachment, live: true }));
  });
  return [...thread.messages, ...lines].sort((a, b) => a.at - b.at);
}

export function ChatView({
  thread,
  look,
  audience,
  pathname,
  user,
  typing,
  setTyping,
  onNavigate,
  onLeaveMessage,
  focusKey,
  request,
  onRequestDone,
}: {
  thread: Thread;
  look: CharmLook;
  audience: Audience;
  pathname: string;
  user: ChatUser;
  typing: boolean;
  setTyping: (t: boolean) => void;
  onNavigate: (href: string) => void;
  onLeaveMessage: () => void;
  focusKey: number;
  /** One-shot request from a page: send a question or ask for a person. */
  request?: { prompt?: string | undefined; human?: boolean | undefined; key: number } | null | undefined;
  onRequestDone?: (() => void) | undefined;
}) {
  const chats = chatStore.use();
  const settings = settingsStore.use();
  const network = useNetworkState();
  const offline = network.status !== "online";
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const chat = currentLiveChat(thread, chats);
  const live = chat && chat.status !== "ended" ? chat : null;
  const agent = live ? agentById(live.agentId, settings) : null;
  const items = useMemo(() => mergedItems(thread, chats), [thread, chats]);
  const lastCharm = [...thread.messages].reverse().find((m) => m.from === "charm");
  const connecting = thread.handover === "connecting";
  const help = pageHelp(pathname, audience);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [items.length, typing, connecting]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [focusKey, thread.id, live?.status]);

  function charmReply(text: string) {
    const delay = import.meta.env.MODE === "test" ? 0 : 650 + Math.min(900, text.length * 12);
    setTyping(true);
    window.setTimeout(() => {
      const t = threadStore.get().threads.find((x) => x.id === thread.id);
      if (!t) return setTyping(false);
      const r = respond(text, { audience, articles: kbStore.get(), thread: t });
      appendMessages(
        thread.id,
        [{ from: "charm", text: r.reply.text, pose: r.reply.pose, actions: r.reply.actions, offerHuman: r.reply.offerHuman, reason: r.reply.reason, articleId: r.reply.articleId }],
        { misses: r.misses, lastArticleId: r.lastArticleId },
      );
      setTyping(false);
    }, delay);
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text && !attachment) return;
    if (live) {
      sendLiveMessage(live.id, "user", text, { attachment: attachment ?? undefined });
      setDraft("");
      setAttachment(null);
      inputRef.current?.focus();
      return;
    }
    if (typing) return;
    appendMessages(thread.id, [{ from: "user", text }], { handover: undefined });
    setDraft("");
    inputRef.current?.focus();
    charmReply(text);
  }

  function requestHuman(reason: HandoverReason = "requested") {
    if (connecting || live) return;
    if (offline) {
      appendMessages(thread.id, [
        {
          from: "charm",
          pose: "concerned",
          text: "You're offline right now, so I can't reach our support team. You can leave us a message and we'll help you as soon as possible.",
          actions: [{ label: "Leave a message", action: "ticket" }],
        },
      ]);
      return;
    }
    appendMessages(thread.id, [{ from: "system", text: "Connecting you to our support team…" }], { handover: "connecting" });
    window.setTimeout(() => {
      const t = threadStore.get().threads.find((x) => x.id === thread.id);
      if (!t) return;
      const s = settingsStore.get();
      const avail = supportAvailability(s);
      if (!avail.available) {
        appendMessages(
          thread.id,
          [{ from: "charm", pose: "concerned", text: UNAVAILABLE_TEXT, actions: [{ label: "Leave a message", action: "ticket" }] }],
          { handover: "unavailable" },
        );
        return;
      }
      const who = s.autoAccept ? avail.online[0] : null;
      appendMessages(thread.id, [
        who
          ? {
              from: "charm",
              pose: "wave",
              text: `Meet ${firstName(who.name)} from our support team. ${firstName(who.name)} has a short summary of our chat, so you won't need to repeat yourself. I'll be right here if you need me again.`,
            }
          : {
              from: "charm",
              pose: "idle",
              text: "You're in the queue. The next available agent will join shortly. You can keep browsing; I'll show a dot on my button when they reply.",
            },
      ]);
      const asked = t.messages.filter((m) => m.from === "user").map((m) => m.text).join(" ");
      connectToHuman(
        {
          threadId: thread.id,
          userName: user?.name ?? "Guest",
          userEmail: user?.email ?? null,
          audience,
          page: pathname,
          summary: summarise(t, pathname, kbStore.get(), reason),
          category: suggestCategory(audience, asked),
        },
        new Date(Date.now() + 5),
      );
    }, import.meta.env.MODE === "test" ? 0 : 1800);
  }

  // A page asked for something (e.g. a suggested question in the support centre): do it once.
  const handled = useRef<number | null>(null);
  useEffect(() => {
    if (!request || handled.current === request.key) return;
    handled.current = request.key;
    if (request.human) requestHuman("requested");
    else if (request.prompt) send(request.prompt);
    onRequestDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.key]);

  function continueWithCharm() {
    appendMessages(thread.id, [
      {
        from: "charm",
        pose: "point",
        text: "No problem, let's keep going. Tell me a bit more, or try one of these:",
        actions: help.suggestions.map((q) => ({ label: q, prompt: q })),
      },
    ]);
  }

  function runAction(a: QuickAction) {
    if (a.action === "human") return requestHuman("requested");
    if (a.action === "ticket") return onLeaveMessage();
    if (a.prompt) return send(a.prompt);
    if (a.href) onNavigate(a.href);
  }

  function feedback(m: ChatMessage, value: "up" | "down") {
    setFeedback(thread.id, m.id, value);
    if (value === "up") {
      appendMessages(thread.id, [{ from: "charm", pose: "celebrate", text: "Glad that helped! Anything else I can do for you?" }], { misses: 0 });
    } else {
      const r = afterUnhelpful();
      appendMessages(thread.id, [{ from: "charm", text: r.text, pose: r.pose, offerHuman: true, reason: r.reason }]);
    }
  }

  async function pickFile(file: File | undefined) {
    if (!file) return;
    try {
      setAttachment(await readImageAttachment(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "We couldn't add that image.");
    }
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(draft);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {offline && (
        <p role="status" className="border-b border-line bg-warning-soft px-4 py-2 text-xs font-semibold text-warning-foreground">
          You're offline. Charm can still answer from saved help; live support needs a connection.
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite" aria-relevant="additions">
        <ol className="space-y-4">
          {items.map((m) => (
            <li key={m.id}>
              <MessageRow
                m={m}
                look={look}
                agentName={m.agentId ? (agentById(m.agentId, settings)?.name ?? "Support agent") : undefined}
                isLastCharm={m.id === lastCharm?.id}
                busy={typing || connecting || !!live}
                onAction={runAction}
                onHuman={() => requestHuman(m.reason ?? "requested")}
                onContinue={continueWithCharm}
                onFeedback={(v) => feedback(m, v)}
              />
            </li>
          ))}
          {typing && (
            <li className="flex items-center gap-2.5" aria-label="Charm is typing">
              <CharmHead look={look} className="size-8" />
              <span className="flex items-center gap-1 rounded-full bg-soft px-3 py-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="charm-dot block size-1.5 rounded-full bg-brand" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Charm is thinking…</span>
            </li>
          )}
          {connecting && (
            <li className="flex flex-col items-center gap-2 py-2 text-center" role="status">
              <span className="relative grid size-12 place-items-center">
                <span className="charm-ring absolute inset-0 rounded-full border-2 border-sky" aria-hidden="true" />
                <Headset className="size-5 text-brand" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-ink">Checking who's available…</span>
            </li>
          )}
        </ol>
        <div ref={endRef} />
      </div>

      {live && (
        <div className="border-t border-line bg-ice px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            {agent ? <AgentAvatar name={agent.name} className="size-7 text-[10px]" /> : <Headset className="size-5 text-brand" aria-hidden="true" />}
            <p className="min-w-0 flex-1 text-xs font-bold text-ink">
              {live.status === "active" && agent ? (
                <>
                  Connected to {agent.name} <span className="font-semibold text-muted-foreground">· Support team</span>
                </>
              ) : (
                "Waiting for the next available agent…"
              )}
            </p>
            <Button type="button" size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => endChat(live.id, "user")}>
              <PhoneOff /> {live.status === "active" ? "End chat" : "Cancel"}
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            Replies come from the{" "}
            <a href={`/support/live-chat?chat=${live.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-bold text-brand underline-offset-2 hover:underline">
              Support dashboard <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            .
          </p>
        </div>
      )}

      {!live && !typing && !connecting && (
        <div className="flex flex-wrap gap-1.5 border-t border-line px-3 pt-2.5">
          {help.suggestions.slice(0, 3).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-sky hover:bg-ice"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="px-3 pb-3 pt-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        {attachment && (
          <div className="mb-2 flex items-center gap-2 rounded-[14px] border border-line bg-soft p-1.5 pr-2">
            <img src={attachment.dataUrl} alt="" className="size-10 rounded-[10px] object-cover" />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{attachment.name}</span>
            <button type="button" onClick={() => setAttachment(null)} aria-label="Remove screenshot" className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-[20px] border border-line bg-card p-1.5 pl-3 focus-within:border-sky focus-within:ring-4 focus-within:ring-sky/15">
          <label className="sr-only" htmlFor={`charm-input-${thread.id}`}>
            {live ? "Message the support team" : "Message Charm"}
          </label>
          <textarea
            id={`charm-input-${thread.id}`}
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            maxLength={1500}
            placeholder={live ? (live.status === "active" ? `Message ${agent ? firstName(agent.name) : "support"}…` : "Write while you wait…") : "Ask Charm anything…"}
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] font-medium text-ink outline-none [field-sizing:content] placeholder:text-muted-foreground/80"
          />
          {live && (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void pickFile(e.target.files?.[0]); e.target.value = ""; }} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach a screenshot"
                title="Attach a screenshot"
                className="grid size-10 shrink-0 place-items-center rounded-full text-brand transition-colors hover:bg-ice"
              >
                <ImagePlus className="size-5" />
              </button>
            </>
          )}
          <Button type="submit" size="icon" className="size-10 shrink-0 rounded-full" disabled={(!draft.trim() && !attachment) || (!live && typing)} aria-label="Send message">
            <ArrowUp className="size-5" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <p className="text-[11px] font-semibold text-muted-foreground">{live ? "You're chatting with a person" : "Charm is an automated assistant"}</p>
          {!live && (
            <button
              type="button"
              onClick={() => requestHuman("requested")}
              disabled={connecting}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-extrabold text-brand transition-colors hover:bg-ice disabled:opacity-50"
            >
              <LifeBuoy className="size-3.5" aria-hidden="true" /> Talk to a human
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function MessageRow({
  m,
  look,
  agentName,
  isLastCharm,
  busy,
  onAction,
  onHuman,
  onContinue,
  onFeedback,
}: {
  m: Item;
  look: CharmLook;
  agentName?: string | undefined;
  isLastCharm: boolean;
  busy: boolean;
  onAction: (a: QuickAction) => void;
  onHuman: () => void;
  onContinue: () => void;
  onFeedback: (v: "up" | "down") => void;
}) {
  if (m.from === "system") {
    return (
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-px flex-1 bg-line" />
        {m.text}
        <span className="h-px flex-1 bg-line" />
      </p>
    );
  }

  if (m.from === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        {m.attachment && <img src={m.attachment.dataUrl} alt={`Screenshot: ${m.attachment.name}`} className="max-h-40 rounded-[16px] border border-line object-cover" />}
        {m.text && <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-[6px] bg-cobalt px-3.5 py-2.5 text-[15px] font-medium text-primary-foreground">{m.text}</p>}
        <span className="text-[10px] font-semibold text-muted-foreground">{clock(m.at)}</span>
      </div>
    );
  }

  if (m.from === "agent") {
    return (
      <div className="flex items-start gap-2.5">
        <AgentAvatar name={agentName ?? "Support"} />
        <div className="min-w-0 max-w-[85%]">
          <p className="mb-1 text-[11px] font-extrabold text-ink">
            {agentName ?? "Support agent"} <span className="ml-1 rounded-full bg-sky/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">Support team</span>
          </p>
          {m.attachment && <img src={m.attachment.dataUrl} alt={`Screenshot: ${m.attachment.name}`} className="mb-1 max-h-40 rounded-[16px] border border-line object-cover" />}
          {m.text && <p className="whitespace-pre-wrap break-words rounded-[20px] rounded-tl-[6px] border border-sky/40 bg-ice px-3.5 py-2.5 text-[15px] font-medium text-ink">{m.text}</p>}
          <span className="mt-1 block text-[10px] font-semibold text-muted-foreground">{clock(m.at)}</span>
        </div>
      </div>
    );
  }

  // Charm
  const showOffer = m.offerHuman && isLastCharm && !busy;
  return (
    <div className="flex items-start gap-2.5">
      <CharmHead look={look} className="size-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-extrabold text-ink">
          Charm <span className="ml-1 rounded-full bg-lime/30 px-1.5 py-0.5 text-[10px] font-bold text-lime-text">Assistant</span>
        </p>
        <div className="text-[15px] leading-relaxed text-ink">
          <RichText text={m.text} />
        </div>
        {!!m.actions?.length && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {m.actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => onAction(a)}
                className="rounded-full border-[1.5px] border-brand/70 px-3 py-1.5 text-xs font-extrabold text-brand transition-colors hover:bg-ice"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        {showOffer && (
          <div className="mt-3 grid gap-2 rounded-[18px] border border-line bg-soft p-3 sm:grid-cols-2">
            <Button type="button" size="sm" onClick={onHuman}>
              <Headset /> Talk to a Human Agent
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onContinue}>
              Continue with Enski Assistant
            </Button>
          </div>
        )}
        {m.articleId && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            {m.feedback ? (
              <span>{m.feedback === "up" ? "Thanks for the thumbs up!" : "Thanks for letting me know."}</span>
            ) : (
              <>
                <span>Did this help?</span>
                <button type="button" onClick={() => onFeedback("up")} aria-label="Yes, this helped" className={cn("grid size-7 place-items-center rounded-full hover:bg-ice hover:text-brand")}>
                  <ThumbsUp className="size-3.5" />
                </button>
                <button type="button" onClick={() => onFeedback("down")} aria-label="No, this didn't help" className="grid size-7 place-items-center rounded-full hover:bg-ice hover:text-brand">
                  <ThumbsDown className="size-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
