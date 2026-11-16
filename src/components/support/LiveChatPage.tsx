import { useState } from "react";
import { useSearch, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Paperclip, X } from "lucide-react";
import {
  chatStore,
  ticketStore,
  settingsStore,
  acceptChat,
  sendLiveMessage,
  transferChat,
  endChat,
  createTicket,
} from "@/lib/assistant/store";
import { useStaffAgentId } from "@/lib/assistant/staff";
import { AUDIENCE_LABEL } from "@/lib/assistant/routing";
import { readImageAttachment } from "@/lib/assistant/attach";
import type { Attachment, LiveChat } from "@/lib/assistant/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heading, Panel, Chip, Empty, Pick, Bubbles, field, ImageAttachment } from "./shared";
export function LiveChatPage() {
  const chats = chatStore.use(),
    id = useStaffAgentId();
  const { chat } = useSearch({ from: "/support/live-chat" });
  const navigate = useNavigate();
  const selected = chats.find((c) => c.id === chat);
  const today = new Date().toDateString();
  const groups = [
    ["Incoming / Waiting queue", chats.filter((c) => c.status === "waiting")],
    ["Active chats", chats.filter((c) => c.status === "active").sort((a, b) => Number(b.agentId === id) - Number(a.agentId === id))],
    ["Ended today", chats.filter((c) => c.status === "ended" && new Date(c.updatedAt).toDateString() === today)],
  ] as const;
  return (
    <>
      <Heading title="Live chat" description="Pick up chats where Charm left off." />
      <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)_240px]">
        <Panel>
          {groups.map(([title, list]) => (
            <section key={title} className="space-y-3">
              <h2 className="text-sm font-semibold">
                {title} <Chip>{list.length}</Chip>
              </h2>
              {!list.length && <p className="text-xs text-muted-foreground">No chats</p>}
              {list.map((c) => (
                <div key={c.id} className={`rounded-xl border p-3 ${c.id === chat ? "border-brand bg-ice" : "border-line"}`}>
                  <button
                    className="w-full text-left text-sm"
                    onClick={() => navigate({ to: "/support/live-chat", search: { chat: c.id } })}
                  >
                    {c.userName}
                    <span className="mt-1 block truncate text-xs text-muted-foreground">{c.category}</span>
                  </button>
                  {c.status === "waiting" && (
                    <Button className="mt-2" size="sm" disabled={!id} onClick={() => id && acceptChat(c.id, id)}>
                      Accept
                    </Button>
                  )}
                </div>
              ))}
            </section>
          ))}
        </Panel>
        {selected ? (
          <ChatWorkspace key={selected.id} chat={selected} />
        ) : (
          <Panel>
            <Empty />
          </Panel>
        )}
      </div>
    </>
  );
}
function ChatWorkspace({ chat: c }: { chat: LiveChat }) {
  const id = useStaffAgentId(),
    settings = settingsStore.use(),
    chats = chatStore.use(),
    tickets = ticketStore.use();
  const [text, setText] = useState(""),
    [attachment, setAttachment] = useState<Attachment>(),
    [busy, setBusy] = useState(false),
    [transfer, setTransfer] = useState(false),
    [to, setTo] = useState(""),
    [note, setNote] = useState("");
  const enabled = c.status === "active" && !!id;
  function send() {
    if (!enabled || (!text.trim() && !attachment) || !id) return;
    const saved = sendLiveMessage(c.id, "agent", text.trim(), { agentId: id, attachment });
    if (!saved) toast.warning("Message sent, but your browser is out of space", { description: "It will be lost if you refresh or close this page." });
    setText("");
    setAttachment(undefined);
  }
  return (
    <>
      <Panel>
        <header>
          <h2 className="text-xl font-bold">
            {c.userName}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip>{AUDIENCE_LABEL[c.audience]}</Chip>
            <Chip>{c.status}</Chip>
            <span className="break-all text-xs text-muted-foreground">{c.page}</span>
          </div>
        </header>
        <div className="rounded-xl bg-ice p-4">
          <h3 className="mb-2 text-sm font-semibold text-brand">Summary from Charm</h3>
          <p className="text-sm">{c.summary}</p>
        </div>
        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-semibold">Charm conversation</summary>
          <div className="mt-4">
            <Bubbles lines={c.transcript} />
          </div>
        </details>
        <div className="max-h-[480px] overflow-y-auto" aria-live="polite">
          <Bubbles lines={c.messages} />
        </div>
        {c.transferNote && <p className="rounded-xl bg-warning-soft p-3 text-sm">Transfer note: {c.transferNote}</p>}
        <div className="space-y-3">
          <label className="block text-sm">
            Message
            <textarea
              aria-label="Message"
              className={`${field} mt-2`}
              disabled={!enabled}
              value={text}
              rows={3}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
            />
          </label>
          <ImageAttachment attachment={attachment} />
          {attachment && (
            <Button size="sm" variant="ghost" onClick={() => setAttachment(undefined)}>
              <X size={14} />
              Remove attachment
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm ${!enabled ? "opacity-50" : ""}`}
            >
              <Paperclip size={16} />
              Screenshot
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                disabled={!enabled || busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setBusy(true);
                  try {
                    setAttachment(await readImageAttachment(file));
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Image failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            <Button disabled={!enabled || busy || (!text.trim() && !attachment)} onClick={send}>
              Send
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          {c.status === "waiting" && (
            <Button disabled={!id} onClick={() => id && acceptChat(c.id, id)}>
              Accept chat
            </Button>
          )}
          <Button variant="outline" disabled={c.status !== "active"} onClick={() => setTransfer(true)}>
            Transfer
          </Button>
          <Button
            variant="outline"
            disabled={c.status === "ended"}
            onClick={() => {
              endChat(c.id, "agent");
              toast.success("Chat ended");
            }}
          >
            End chat
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const { ticket, saved } = createTicket({
                subject: c.transcript.find((m) => m.from === "user")?.text || c.messages.find((m) => m.from === "user")?.text || c.category,
                category: c.category,
                description: c.summary,
                summary: c.summary,
                audience: c.audience,
                userName: c.userName,
                userEmail: c.userEmail ?? "",
                threadId: c.threadId,
              });
              saved ? toast.success(`Ticket ${ticket.ref} created`) : toast.warning(`Ticket ${ticket.ref} created, but your browser is out of space`);
            }}
          >
            Create ticket
          </Button>
        </div>
        <Dialog open={transfer} onOpenChange={setTransfer}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer chat</DialogTitle>
            </DialogHeader>
            <Pick
              label="Agent"
              value={to}
              options={settings.agents.filter((a) => a.id !== c.agentId).map((a) => ({ value: a.id, label: `${a.name} · ${a.status}` }))}
              onChange={setTo}
            />
            <label>
              Handover note
              <textarea className={field} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <Button
              disabled={!to}
              onClick={() => {
                transferChat(c.id, to, note);
                setTransfer(false);
                toast.success("Chat transferred");
              }}
            >
              Transfer chat
            </Button>
          </DialogContent>
        </Dialog>
      </Panel>
      <div className="space-y-4">
        <Panel title="User profile">
          <dl className="space-y-3 text-sm">
            {[
              ["Name", c.userName],
              ["Email", c.userEmail || "Guest"],
              ["Role", AUDIENCE_LABEL[c.audience]],
              ["Current page", c.page],
              ["Category", c.category],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Previous history">
          {!c.userEmail ? (
            <p className="text-sm text-muted-foreground">Guest history is not matched.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {chats
                .filter((x) => x.id !== c.id && x.userEmail?.toLowerCase() === c.userEmail?.toLowerCase())
                .map((x) => (
                  <Link key={x.id} to="/support/live-chat" search={{ chat: x.id }} className="block text-brand">
                    {x.category} · {x.status}
                  </Link>
                ))}
              {tickets
                .filter((t) => t.userEmail.toLowerCase() === c.userEmail?.toLowerCase())
                .map((t) => (
                  <Link key={t.id} to="/support/tickets/$ticketId" params={{ ticketId: t.id }} className="block text-brand">
                    {t.ref} · {t.subject}
                  </Link>
                ))}
            </div>
          )}
        </Panel>
        <Panel title="Quick replies">
          {[
            "Thanks for reaching out. I’m looking into this for you.",
            "Could you share a screenshot of what you see?",
            "Is there anything else I can help you with?",
          ].map((reply) => (
            <button
              key={reply}
              disabled={!enabled}
              className="block w-full rounded-xl bg-soft p-3 text-left text-xs disabled:opacity-50"
              onClick={() => setText((v) => (v ? `${v}\n${reply}` : reply))}
            >
              {reply}
            </button>
          ))}
        </Panel>
      </div>
    </>
  );
}
