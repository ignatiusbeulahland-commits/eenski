import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, CheckCircle2, ImagePlus, Inbox, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readImageAttachment } from "@/lib/assistant/attach";
import { clock, timeAgo } from "@/lib/assistant/format";
import { SUPPORT_CATEGORIES, suggestCategory } from "@/lib/assistant/routing";
import { agentById, appendMessages, createTicket, markTicketSeen, settingsStore, userReply } from "@/lib/assistant/store";
import type { Attachment, Audience, Ticket, TicketStatus } from "@/lib/assistant/types";
import type { ChatUser } from "./ChatView";

const inputCls =
  "w-full rounded-[14px] border border-line bg-card px-3.5 py-2.5 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-sky focus:ring-4 focus:ring-sky/15";

const STATUS_STYLE: Record<TicketStatus, string> = {
  Open: "bg-ice text-brand",
  "In Progress": "bg-warning-soft text-warning-foreground",
  "Waiting for User": "bg-lime/30 text-lime-text",
  Resolved: "bg-success-soft text-success",
};

export const STATUS_HELP: Record<TicketStatus, string> = {
  Open: "We've got your message and it's in the queue.",
  "In Progress": "Someone from our support team is working on it.",
  "Waiting for User": "We need a little more from you. Reply below to keep it moving.",
  Resolved: "We've marked this as solved. Reply if you still need help.",
};

export function StatusChip({ status }: { status: TicketStatus }) {
  return <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold", STATUS_STYLE[status])}>{status}</span>;
}

function Field({ label, id, children, hint }: { label: string; id: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AttachInput({ value, onChange }: { value: Attachment | null; onChange: (a: Attachment | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return value ? (
    <div className="flex items-center gap-2 rounded-[14px] border border-line bg-soft p-1.5 pr-2">
      <img src={value.dataUrl} alt="" className="size-10 rounded-[10px] object-cover" />
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{value.name}</span>
      <button type="button" onClick={() => onChange(null)} aria-label="Remove attachment" className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-ink">
        <X className="size-4" />
      </button>
    </div>
  ) : (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            onChange(await readImageAttachment(f));
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "We couldn't add that image.");
          }
        }}
      />
      <Button type="button" variant="secondary" size="sm" onClick={() => ref.current?.click()}>
        <ImagePlus /> Add a screenshot (optional)
      </Button>
    </>
  );
}

/** Leave-a-message form used when nobody can take a live chat. */
export function TicketForm({
  audience,
  user,
  threadId,
  defaults,
  onBack,
  onDone,
}: {
  audience: Audience;
  user: ChatUser;
  threadId: string | null;
  defaults: { subject: string; description: string; summary: string };
  onBack: () => void;
  onDone: (ticket: Ticket) => void;
}) {
  const uid = useId();
  const cats = SUPPORT_CATEGORIES[audience];
  const [subject, setSubject] = useState(defaults.subject);
  const [category, setCategory] = useState(() => suggestCategory(audience, `${defaults.subject} ${defaults.description}`));
  const [description, setDescription] = useState(defaults.description);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (subject.trim().length < 3) return setError("Add a short subject so we know what it's about.");
    if (description.trim().length < 10) return setError("Tell us a little more in the description (at least 10 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Add the email we should reply to.");
    setError(null);
    const { ticket, saved } = createTicket({
      subject,
      category,
      description,
      attachment: attachment ?? undefined,
      summary: defaults.summary,
      audience,
      userName: name || "Guest",
      userEmail: email,
      threadId,
    });
    if (!saved) toast.warning("Your request is open, but only until you close this page", { description: "Your browser is out of space, so it couldn't be saved for later." });
    if (threadId) {
      appendMessages(threadId, [
        {
          from: "charm",
          pose: "celebrate",
          text: `Your message is in! Ticket **${ticket.ref}** is now **Open**. Our support team will reply as soon as possible, and you can follow it under Tickets.`,
        },
      ]);
    }
    onDone(ticket);
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
          <ArrowLeft className="size-4" /> Back to chat
        </button>
        <div>
          <h3 className="text-lg font-extrabold text-ink">Leave us a message</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">We'll reply as soon as someone from our support team is available.</p>
        </div>
        <Field label="Subject" id={`${uid}-s`}>
          <input id={`${uid}-s`} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} className={inputCls} placeholder="What do you need help with?" />
        </Field>
        <Field label="Issue category" id={`${uid}-c`}>
          <select id={`${uid}-c`} value={category} onChange={(e) => setCategory(e.target.value)} className={cn(inputCls, "cursor-pointer")}>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" id={`${uid}-d`}>
          <textarea id={`${uid}-d`} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} className={inputCls} placeholder="What happened, and what did you expect?" />
        </Field>
        {!user && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name" id={`${uid}-n`}>
              <input id={`${uid}-n`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} placeholder="Ada Okafor" />
            </Field>
            <Field label="Email for replies" id={`${uid}-e`}>
              <input id={`${uid}-e`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputCls} placeholder="you@example.com" />
            </Field>
          </div>
        )}
        <div>
          <p className="mb-1.5 text-sm font-bold text-ink">Attachment</p>
          <AttachInput value={attachment} onChange={setAttachment} />
        </div>
        <Field label="Conversation summary" id={`${uid}-sum`} hint="Shared with the support team so you don't have to repeat yourself.">
          <p id={`${uid}-sum`} className="rounded-[14px] border border-dashed border-line bg-soft p-3 text-[13px] leading-relaxed text-muted-foreground">
            {defaults.summary}
          </p>
        </Field>
        {error && (
          <p role="alert" className="rounded-[14px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-2 border-t border-line px-4 py-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Submit ticket
        </Button>
      </div>
    </form>
  );
}

export function TicketSubmitted({ ticket, onView, onBack }: { ticket: Ticket; onView: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center" role="status">
      <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      <h3 className="text-xl font-extrabold text-ink">Ticket submitted</h3>
      <p className="text-sm text-muted-foreground">Your reference is</p>
      <p className="rounded-full bg-ice px-4 py-1.5 text-lg font-extrabold tracking-wide text-brand">{ticket.ref}</p>
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        Status <StatusChip status={ticket.status} />
      </div>
      <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">{STATUS_HELP[ticket.status]}</p>
      <div className="mt-2 flex w-full max-w-[300px] flex-col gap-2">
        <Button type="button" onClick={onView}>
          View my tickets
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to chat
        </Button>
      </div>
    </div>
  );
}

export function TicketList({ tickets, onOpen, onNew }: { tickets: Ticket[]; onOpen: (id: string) => void; onNew: () => void }) {
  if (!tickets.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <Inbox className="size-10 text-brand" aria-hidden="true" />
        <p className="text-base font-extrabold text-ink">No tickets yet</p>
        <p className="max-w-[260px] text-sm text-muted-foreground">If you leave the support team a message, you can follow it here.</p>
        <Button type="button" variant="secondary" size="sm" onClick={onNew}>
          Leave a message
        </Button>
      </div>
    );
  }
  return (
    <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
      {tickets.map((t) => (
        <li key={t.id}>
          <button type="button" onClick={() => onOpen(t.id)} className="w-full rounded-[16px] border border-line bg-card px-3.5 py-3 text-left transition-colors hover:border-sky">
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold tracking-wide text-brand">{t.ref}</span>
              <StatusChip status={t.status} />
            </span>
            <span className="mt-1 flex items-center gap-2">
              {t.unseenUpdate && <span className="size-2 shrink-0 rounded-full bg-cobalt" aria-label="Updated" />}
              <span className="truncate text-sm font-extrabold text-ink">{t.subject}</span>
            </span>
            <span className="mt-0.5 block text-[11px] font-semibold text-muted-foreground">
              {t.category} · updated {timeAgo(t.updatedAt)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function TicketDetail({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const settings = settingsStore.use();
  const [reply, setReply] = useState("");
  const uid = useId();
  useEffect(() => {
    if (ticket.unseenUpdate) markTicketSeen(ticket.id);
  }, [ticket.id, ticket.unseenUpdate]);
  const entries = ticket.entries.filter((e) => !e.internal);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
          <ArrowLeft className="size-4" /> All tickets
        </button>
        <div>
          <p className="text-xs font-extrabold tracking-wide text-brand">{ticket.ref}</p>
          <h3 className="mt-0.5 text-lg font-extrabold leading-snug text-ink">{ticket.subject}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusChip status={ticket.status} />
            <span className="text-xs font-semibold text-muted-foreground">
              {ticket.category} · opened {timeAgo(ticket.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{STATUS_HELP[ticket.status]}</p>
        </div>
        <div className="rounded-[16px] border border-line bg-soft p-3.5">
          <p className="text-xs font-extrabold text-ink">Your message</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{ticket.description}</p>
          {ticket.attachment && <img src={ticket.attachment.dataUrl} alt={`Attachment: ${ticket.attachment.name}`} className="mt-2 max-h-40 rounded-[12px] border border-line" />}
        </div>
        <ol className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className={cn("rounded-[16px] p-3.5", e.from === "agent" ? "border border-sky/40 bg-ice" : "bg-card ring-1 ring-line")}>
              <p className="text-[11px] font-extrabold text-ink">
                {e.from === "agent" ? `${agentById(e.agentId, settings)?.name ?? "Support team"} · Support team` : "You"}
                <span className="ml-1.5 font-semibold text-muted-foreground">{clock(e.at)}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{e.text}</p>
              {e.attachment && <img src={e.attachment.dataUrl} alt="" className="mt-2 max-h-40 rounded-[12px]" />}
            </li>
          ))}
          {!entries.length && <li className="text-sm text-muted-foreground">No replies yet. We'll show them here.</li>}
        </ol>
      </div>
      <form
        className="flex items-end gap-2 border-t border-line px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          userReply(ticket.id, reply);
          setReply("");
          toast.success("Reply added to your ticket");
        }}
      >
        <label htmlFor={`${uid}-r`} className="sr-only">
          Reply to this ticket
        </label>
        <textarea id={`${uid}-r`} value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Add a reply…" className={cn(inputCls, "min-h-[44px] flex-1 resize-none")} />
        <Button type="submit" disabled={!reply.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
