import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Check, ChevronRight, Clock, Headset, ImagePlus, Inbox, Loader2, Mail, MessageCircleMore, MessagesSquare, Search, Send, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AgentAvatar, CharmHead } from "@/components/assistant/CharmFigure";
import { CharmStage, CharmTip } from "@/components/assistant/CharmStage";
import { mergedItems } from "@/components/assistant/ChatView";
import { lookFor } from "@/components/assistant/looks";
import { RichText } from "@/components/assistant/RichText";
import { STATUS_HELP } from "@/components/assistant/TicketViews";
import { OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { readImageAttachment } from "@/lib/assistant/attach";
import { clock, timeAgo } from "@/lib/assistant/format";
import { openCharm } from "@/lib/assistant/open";
import { agentById, chatStore, createTicket, markTicketSeen, prefsStore, settingsStore, ticketStore, userReply } from "@/lib/assistant/store";
import type { Attachment, Ticket, TicketStatus } from "@/lib/assistant/types";
import { TOPICS, searchArticles, topicById, type HelpRole, type TopicId } from "@/lib/help-centre/content";
import { cn } from "@/lib/utils";
import { AvailabilityPill, ContactChannels, Crumbs, HelpMissing, helpPaths, useHelpArticles, useSupportPerson, useTeamStatus } from "./parts";
import { STATUS_LABEL, STATUS_ORDER, STATUS_TONE } from "./status";

const inputCls =
  "w-full rounded-[14px] border border-line bg-card px-4 py-3 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-sky focus:ring-4 focus:ring-sky/15 aria-[invalid=true]:border-destructive";

function StatusTag({ status }: { status: TicketStatus }) {
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold", STATUS_TONE[status])}>{STATUS_LABEL[status]}</span>;
}

function topicOfCategory(role: HelpRole, category: string) {
  return TOPICS.find((t) => t.requestCategory[role] === category) ?? topicById("general")!;
}

/* ———————————————————————— Contact ———————————————————————— */

export function ContactPage({ role }: { role: HelpRole }) {
  const paths = helpPaths(role);
  const articles = useHelpArticles(role);
  const team = useTeamStatus();
  const settings = settingsStore.use();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const open = settings.hours.days.map((d) => days[d]).join(", ");
  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: "Contact support" }]} />
      <section data-surface="dark" className="bg-brand-panel relative mb-6 overflow-visible rounded-3xl px-5 pt-7 text-primary-foreground sm:px-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
          <div className="pb-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime">Contact support</p>
            <h1 className="mt-2 text-[28px] leading-tight sm:text-4xl">Talk to us your way</h1>
            <p className="mt-2 max-w-lg text-sm text-on-dark-muted sm:text-[15px]">Charm answers instantly. For anything about your money, your account or a tricky problem, a person on our team will take it from there.</p>
            <AvailabilityPill dark className="mt-5" />
          </div>
          <CharmStage pose="point" size="sm" className="-mt-10 hidden md:flex" />
        </div>
      </section>
      <ContactChannels role={role} />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="surface p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold">
            <CalendarClock className="size-4 text-brand" aria-hidden="true" />
            Support hours
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Charm</dt><dd className="font-bold">Every day, any time</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Live chat with a person</dt><dd className="text-right font-bold">{open} · {settings.hours.open}–{settings.hours.close}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Email requests</dt><dd className="font-bold">Reply within one working day</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Right now</dt><dd className={cn("font-bold", team.available ? "text-success" : "text-warning-foreground")}>{team.available ? "Team online" : "Team away"}</dd></div>
          </dl>
        </section>
        <section className="surface p-5">
          <h2 className="text-[15px] font-bold">Before you get in touch</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">These answers solve most questions in under a minute.</p>
          <ul className="mt-3 divide-y">
            {articles.filter((a) => a.faq).slice(0, 4).map((a) => (
              <li key={a.id}>
                <Link to={paths.article} params={{ articleId: a.id }} className="group flex items-center justify-between gap-3 py-2.5 text-sm font-semibold hover:text-brand">
                  {a.title}
                  <ChevronRight className="size-4 shrink-0 text-brand" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ———————————————————————— New request ———————————————————————— */

export function NewRequestPage({ role, topic: initialTopic }: { role: HelpRole; topic?: string | undefined }) {
  const paths = helpPaths(role);
  const navigate = useNavigate();
  const person = useSupportPerson(role);
  const articles = useHelpArticles(role);
  const uid = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState<TopicId | "">(topicById(initialTopic ?? "")?.id ?? "");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState(person.email);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [errors, setErrors] = useState<Partial<Record<"topic" | "subject" | "details" | "email", string>>>({});
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (!email && person.email) setEmail(person.email);
  }, [person.email, email]);
  const hints = useMemo(() => (subject.trim().length >= 4 ? searchArticles(articles, subject).slice(0, 3) : []), [articles, subject]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!topic) er.topic = "Choose what this is about";
    if (subject.trim().length < 4) er.subject = "Add a short subject (at least 4 characters)";
    if (details.trim().length < 20) er.details = "Tell us a little more (at least 20 characters) so we can help first time";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) er.email = "Enter the email we should reply to";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`${uid}-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    const t = topicById(topic)!;
    setSending(true);
    window.setTimeout(() => {
      const { ticket, saved } = createTicket({
        subject,
        category: t.requestCategory[role],
        description: details,
        attachment: attachment ?? undefined,
        summary: `${role[0]!.toUpperCase()}${role.slice(1)} sent this from the support centre (${t.label}).`,
        audience: role,
        userName: person.name || "Enski member",
        userEmail: email,
      });
      if (!saved) {
        setSending(false);
        toast.error("Your request wasn't saved because your browser is out of space. Copy your message, free up some space, then try again.");
        return;
      }
      void navigate({ to: paths.sent, params: { ticketId: ticket.id } });
    }, import.meta.env.MODE === "test" ? 0 : 900);
  };

  const pick = async (f: File | undefined) => {
    if (!f) return;
    try {
      setAttachment(await readImageAttachment(f));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't add that image.");
    }
  };

  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: "New request" }]} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <form onSubmit={submit} noValidate className="surface overflow-hidden" aria-busy={sending}>
          <header className="settings-hero relative border-b p-5 sm:p-7">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              <span className="size-1.5 rounded-sm bg-lime" aria-hidden="true" />
              Create a support request
            </p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">Tell us what's going on</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">A person on our team reads every request and replies by email, usually within one working day.</p>
          </header>
          <fieldset disabled={sending} className="space-y-5 p-5 sm:p-7">
            <div>
              <p id={`${uid}-topic-label`} className="mb-2 text-sm font-bold text-ink">
                What is it about? <span className="text-destructive">*</span>
              </p>
              <div id={`${uid}-topic`} tabIndex={-1} role="radiogroup" aria-labelledby={`${uid}-topic-label`} className="grid grid-cols-2 gap-2 outline-none sm:grid-cols-4">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={topic === t.id}
                    onClick={() => setTopic(t.id)}
                    className={cn(
                      "min-h-12 rounded-[14px] border-[1.5px] px-3 py-2 text-left text-[13px] font-bold leading-snug transition-colors",
                      topic === t.id ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card text-ink hover:border-sky",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {errors.topic && <p className="mt-1.5 text-[13px] font-semibold text-destructive">{errors.topic}</p>}
            </div>
            <div>
              <label htmlFor={`${uid}-subject`} className="mb-1.5 block text-sm font-bold text-ink">
                Subject <span className="text-destructive">*</span>
              </label>
              <input id={`${uid}-subject`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. My payout hasn't arrived" aria-invalid={Boolean(errors.subject)} className={inputCls} maxLength={120} />
              {errors.subject && <p className="mt-1.5 text-[13px] font-semibold text-destructive">{errors.subject}</p>}
              {hints.length > 0 && (
                <div className="mt-2 rounded-[14px] bg-ice/70 p-3 ring-1 ring-line">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-brand">These might answer it</p>
                  <ul className="mt-1.5 space-y-1">
                    {hints.map((a) => (
                      <li key={a.id}>
                        <Link to={paths.article} params={{ articleId: a.id }} className="inline-flex items-center gap-1 text-sm font-bold text-ink hover:text-brand">
                          {a.title} <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label htmlFor={`${uid}-details`} className="mb-1.5 block text-sm font-bold text-ink">
                What happened? <span className="text-destructive">*</span>
              </label>
              <textarea id={`${uid}-details`} rows={6} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What were you trying to do, what did you see, and what did you expect?" aria-invalid={Boolean(errors.details)} className={cn(inputCls, "resize-y")} />
              <p className={cn("mt-1.5 text-[13px] font-semibold", errors.details ? "text-destructive" : "text-muted-foreground")}>{errors.details ?? "Include order numbers, dates or the page you were on if you have them."}</p>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-ink">Screenshot (optional)</p>
              {attachment ? (
                <div className="flex items-center gap-3 rounded-[14px] border border-line bg-card p-2.5">
                  <img src={attachment.dataUrl} alt="" className="size-14 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{attachment.name}</span>
                  <button type="button" onClick={() => setAttachment(null)} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-soft" aria-label="Remove screenshot">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-line bg-soft/60 px-4 py-4 text-sm font-bold text-brand transition-colors hover:border-sky hover:bg-ice">
                  <ImagePlus className="size-4" aria-hidden="true" /> Add a screenshot
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            <div>
              <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-bold text-ink">
                Reply to <span className="text-destructive">*</span>
              </label>
              <input id={`${uid}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} className={inputCls} autoComplete="email" />
              {errors.email && <p className="mt-1.5 text-[13px] font-semibold text-destructive">{errors.email}</p>}
            </div>
          </fieldset>
          <footer className="flex flex-col-reverse gap-2 border-t bg-soft/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <Link to={paths.home} className={outcomeButton.quiet}>
              Cancel
            </Link>
            <button type="submit" disabled={sending} className={outcomeButton.primary}>
              {sending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
              {sending ? "Sending your request…" : "Send request"}
            </button>
          </footer>
        </form>
        <aside className="space-y-4">
          <CharmTip pose="point" title="Want an answer right now?" actions={<button type="button" onClick={() => openCharm({ fresh: true, prompt: subject.trim() || undefined })} className="inline-flex h-9 items-center rounded-full bg-cobalt px-4 text-sm font-extrabold text-primary-foreground hover:bg-cobalt-hover">Ask Charm</button>}>
            I can usually help straight away, and I'll pass you to a person if I can't.
          </CharmTip>
          <section className="surface p-5 text-sm">
            <h2 className="text-[15px] font-bold">What happens next</h2>
            <ol className="mt-3 space-y-3">
              {["You get a reference straight away", "Someone on our team picks it up and replies by email", "Follow every update under My requests"].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ice text-xs font-extrabold text-brand">{i + 1}</span>
                  <span className="pt-0.5 text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ———————————————————————— Sent ———————————————————————— */

export function RequestSentPage({ role, ticketId }: { role: HelpRole; ticketId: string }) {
  const paths = helpPaths(role);
  const tickets = ticketStore.use();
  const t = tickets.find((x) => x.id === ticketId);
  if (!t) return <HelpMissing role={role} />;
  const topic = topicOfCategory(role, t.category);
  return (
    <div className="py-2">
      <OutcomeScreen
        tone="success"
        eyebrow="Request received"
        title="We've got your request"
        message={
          <>
            Thanks for telling us. A person on our support team will reply to <b className="text-ink">{t.userEmail}</b>, usually within one working day.
          </>
        }
        details={[
          { label: "Reference", value: t.ref, copy: t.ref, mono: true },
          { label: "Subject", value: t.subject },
          { label: "Topic", value: topic.label },
          { label: "Status", value: STATUS_LABEL[t.status] },
          { label: "Expected reply", value: "Within one working day" },
        ]}
        actions={
          <>
            <Link to={paths.ticket} params={{ ticketId: t.id }} className={outcomeButton.primary}>
              Track this request <ArrowRight aria-hidden="true" />
            </Link>
            <Link to={paths.home} className={outcomeButton.secondary}>
              Back to support centre
            </Link>
          </>
        }
        footer="Keep the reference handy if you write to us again about this."
      />
    </div>
  );
}

/* ———————————————————————— History ———————————————————————— */

type Filter = "all" | "active" | "Waiting for User" | "Resolved";

export function RequestsPage({ role }: { role: HelpRole }) {
  const paths = helpPaths(role);
  const person = useSupportPerson(role);
  const chats = chatStore.use();
  const [tab, setTab] = useState<"requests" | "chats">("requests");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const tickets = person.tickets.filter(
    (t) =>
      (filter === "all" || (filter === "active" ? t.status === "Open" || t.status === "In Progress" : t.status === filter)) &&
      (!needle || `${t.ref} ${t.subject} ${t.category}`.toLowerCase().includes(needle)),
  );
  const threads = person.conversations.filter((c) => !needle || `${c.title} ${c.messages.map((m) => m.text).join(" ")}`.toLowerCase().includes(needle));
  const counts: Record<Filter, number> = {
    all: person.tickets.length,
    active: person.tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length,
    "Waiting for User": person.tickets.filter((t) => t.status === "Waiting for User").length,
    Resolved: person.tickets.filter((t) => t.status === "Resolved").length,
  };
  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: "My requests and chats" }]} />
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-[28px]">My requests and chats</h1>
          <span className="lime-underline" aria-hidden="true" />
          <p className="mt-1.5 text-sm text-muted-foreground">Follow every request and pick up any conversation where you left off.</p>
        </div>
        <Link to={paths.request} search={{ about: undefined }} className={cn(outcomeButton.primary, "sm:w-auto")}>
          <Send aria-hidden="true" /> New request
        </Link>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="History" className="inline-flex rounded-full bg-soft p-1 ring-1 ring-line">
          {(
            [
              ["requests", `Requests (${person.tickets.length})`],
              ["chats", `Chats (${person.conversations.length})`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("rounded-full px-4 py-2 text-sm font-extrabold transition-colors", tab === id ? "bg-card text-brand shadow-soft" : "text-muted-foreground hover:text-ink")}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "requests" ? "Search reference or subject" : "Search your chats"} aria-label="Search history" className={cn(inputCls, "h-11 py-0 pl-10")} />
        </div>
      </div>

      {tab === "requests" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {(
              [
                ["all", "All"],
                ["active", "Open"],
                ["Waiting for User", "Waiting for you"],
                ["Resolved", "Resolved"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={cn("inline-flex h-9 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors", filter === id ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-sky")}>
                {label}
                <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", filter === id ? "bg-on-dark/20" : "bg-soft text-muted-foreground")}>{counts[id]}</span>
              </button>
            ))}
          </div>
          {tickets.length ? (
            <ul className="surface divide-y overflow-hidden">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link to={paths.ticket} params={{ ticketId: t.id }} className="group flex items-center gap-4 p-4 transition-colors hover:bg-soft sm:px-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-ice text-brand">
                      <Mail className="size-[18px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        {t.unseenUpdate && <span className="size-2 shrink-0 rounded-full bg-cobalt" aria-label="New update" />}
                        <span className="truncate font-bold text-ink group-hover:text-brand">{t.subject}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {t.ref} · {topicOfCategory(role, t.category).label} · updated {timeAgo(t.updatedAt)}
                      </span>
                    </span>
                    <StatusTag status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <HistoryEmpty role={role} kind={person.tickets.length ? "filtered" : "requests"} onClear={() => { setFilter("all"); setQ(""); }} />
          )}
        </>
      ) : threads.length ? (
        <ul className="surface divide-y overflow-hidden">
          {threads.map((c) => {
            const items = mergedItems(c, chats);
            const last = items.at(-1);
            const live = (c.liveChatIds ?? []).map((id) => chats.find((x) => x.id === id)).filter(Boolean);
            const status = live.some((x) => x!.status === "active") ? "With an agent" : live.some((x) => x!.status === "waiting") ? "Waiting for an agent" : live.length ? "Chat ended" : "With Charm";
            return (
              <li key={c.id}>
                <Link to={paths.conversation} params={{ threadId: c.id }} className="group flex items-center gap-4 p-4 transition-colors hover:bg-soft sm:px-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-midnight text-lime">
                    <MessagesSquare className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink group-hover:text-brand">{c.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{last ? last.text.replace(/\*\*/g, "") : "No messages"}</span>
                  </span>
                  <span className="hidden shrink-0 text-right text-xs sm:block">
                    <span className="block font-bold text-ink">{status}</span>
                    <span className="text-muted-foreground">{timeAgo(c.updatedAt)}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-brand" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <HistoryEmpty role={role} kind={person.conversations.length ? "filtered" : "chats"} onClear={() => setQ("")} />
      )}
    </div>
  );
}

function HistoryEmpty({ role, kind, onClear }: { role: HelpRole; kind: "requests" | "chats" | "filtered"; onClear: () => void }) {
  const paths = helpPaths(role);
  if (kind === "filtered")
    return (
      <div className="surface flex flex-col items-center px-6 py-10 text-center">
        <Inbox className="size-10 text-brand" aria-hidden="true" />
        <p className="mt-3 font-bold">Nothing matches that</p>
        <p className="mt-1 text-sm text-muted-foreground">Try another word or show everything.</p>
        <button type="button" onClick={onClear} className={cn(outcomeButton.secondary, "mt-4 min-h-10")}>
          Show all
        </button>
      </div>
    );
  return (
    <div className="surface flex flex-col items-center px-6 pb-10 pt-6 text-center">
      <CharmStage pose="idle" size="sm" />
      <p className="mt-3 text-lg font-extrabold">{kind === "requests" ? "No requests yet" : "No chats yet"}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {kind === "requests" ? "When you send the support team a request, you'll follow its progress here." : "Conversations with Charm and our team are kept here so you can come back to them."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {kind === "requests" ? (
          <Link to={paths.request} search={{ about: undefined }} className={cn(outcomeButton.primary, "min-h-11")}>
            Create a request
          </Link>
        ) : (
          <button type="button" onClick={() => openCharm({ fresh: true })} className={cn(outcomeButton.primary, "min-h-11")}>
            Start a chat
          </button>
        )}
      </div>
    </div>
  );
}

/* ———————————————————————— Request status ———————————————————————— */

export function RequestDetailPage({ role, ticketId }: { role: HelpRole; ticketId: string }) {
  const paths = helpPaths(role);
  const tickets = ticketStore.use();
  const settings = settingsStore.use();
  const t = tickets.find((x) => x.id === ticketId);
  const [reply, setReply] = useState("");
  const [err, setErr] = useState("");
  const uid = useId();
  useEffect(() => {
    if (t?.unseenUpdate) markTicketSeen(t.id);
  }, [t?.id, t?.unseenUpdate]);
  if (!t) return <HelpMissing role={role} />;
  const topic = topicOfCategory(role, t.category);
  const agent = agentById(t.assigneeId, settings);
  const entries = t.entries.filter((e) => !e.internal);
  const step = STATUS_ORDER.indexOf(t.status);
  const send = (e: FormEvent) => {
    e.preventDefault();
    if (reply.trim().length < 2) return setErr("Write a short reply first");
    userReply(t.id, reply);
    setReply("");
    setErr("");
    toast.success("Reply added to your request");
  };
  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: "My requests", to: <Link to={paths.requests} className="hover:text-brand">My requests</Link> }, { label: t.ref }]} />
      <header className="settings-hero surface relative mb-6 overflow-hidden p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-extrabold tracking-wide text-brand">{t.ref}</span>
          <StatusTag status={t.status} />
        </div>
        <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">{t.subject}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{STATUS_HELP[t.status]}</p>
        <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Request progress">
          {STATUS_ORDER.map((s, i) => (
            <li key={s} className="min-w-0">
              <span className={cn("block h-1.5 rounded-full transition-colors", i <= step ? (s === "Resolved" ? "bg-success" : "bg-cobalt") : "bg-line")} />
              <span className={cn("mt-1.5 block truncate text-[11px] font-bold sm:text-xs", i === step ? "text-ink" : "text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                {i < step && <Check className="mr-0.5 inline size-3" aria-hidden="true" />}
                {STATUS_LABEL[s]}
              </span>
            </li>
          ))}
        </ol>
        <div className="neon-rule absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby={`${uid}-conv`} className="surface overflow-hidden">
          <h2 id={`${uid}-conv`} className="flex items-center gap-2.5 border-b px-5 py-4 text-[15px] font-bold">
            <span className="lime-tick" aria-hidden="true" />
            Conversation
          </h2>
          <ol className="space-y-4 p-5">
            <TimelineEntry who={t.userName} mine at={t.createdAt} text={t.description} attachment={t.attachment} />
            {entries.map((e) => (
              <TimelineEntry key={e.id} who={e.from === "agent" ? (agentById(e.agentId, settings)?.name ?? "Enski support") : t.userName} mine={e.from === "user"} at={e.at} text={e.text} attachment={e.attachment} />
            ))}
            {!entries.some((e) => e.from === "agent") && (
              <li className="flex items-center gap-3 rounded-2xl bg-soft px-4 py-3 text-sm text-muted-foreground">
                <span className="flex gap-1" aria-hidden="true">
                  <span className="charm-dot size-1.5 rounded-full bg-brand" />
                  <span className="charm-dot size-1.5 rounded-full bg-brand [animation-delay:0.15s]" />
                  <span className="charm-dot size-1.5 rounded-full bg-brand [animation-delay:0.3s]" />
                </span>
                Waiting for the support team to reply. We'll email you and mark it here.
              </li>
            )}
          </ol>
          <form onSubmit={send} className="border-t bg-soft/60 p-4 sm:p-5">
            <label htmlFor={`${uid}-reply`} className="mb-1.5 block text-sm font-bold">
              {t.status === "Resolved" ? "Still need help? Reply to reopen it" : "Add a reply"}
            </label>
            <textarea id={`${uid}-reply`} rows={3} value={reply} onChange={(e) => setReply(e.target.value)} aria-invalid={Boolean(err)} className={cn(inputCls, "resize-y")} placeholder="Add details or answer the team's question" />
            {err && <p className="mt-1 text-[13px] font-semibold text-destructive">{err}</p>}
            <div className="mt-3 flex justify-end">
              <button type="submit" className={cn(outcomeButton.primary, "min-h-11 sm:w-auto")}>
                <Send aria-hidden="true" /> Send reply
              </button>
            </div>
          </form>
        </section>
        <aside className="space-y-4">
          <section className="surface p-5">
            <h2 className="text-[15px] font-bold">Request details</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Reference", t.ref],
                ["Topic", topic.label],
                ["Opened", new Date(t.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })],
                ["Last update", timeAgo(t.updatedAt)],
                ["Handled by", agent ? agent.name : "Being assigned"],
                ["Replies go to", t.userEmail],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 break-words text-right font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="surface p-5">
            <h2 className="text-[15px] font-bold">Need it sooner?</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Quote {t.ref} in a live chat and the team will pick it up.</p>
            <button type="button" onClick={() => openCharm({ human: true })} className={cn(outcomeButton.secondary, "mt-3 min-h-11")}>
              <Headset aria-hidden="true" /> Talk to a person
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TimelineEntry({ who, mine, at, text, attachment }: { who: string; mine: boolean; at: number; text: string; attachment?: Attachment | undefined }) {
  return (
    <li className={cn("flex gap-3", mine && "flex-row-reverse")}>
      <AgentAvatar name={who} className={cn("size-8 shrink-0 text-[11px]", mine && "bg-midnight text-lime")} />
      <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-4 py-3", mine ? "rounded-tr-md bg-cobalt text-primary-foreground" : "rounded-tl-md bg-soft text-ink")}>
        <p className={cn("text-xs font-bold", mine ? "text-on-dark-muted" : "text-muted-foreground")}>
          {mine ? "You" : who} · {new Date(at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{text}</p>
        {attachment && <img src={attachment.dataUrl} alt={attachment.name} className="mt-2 max-h-48 rounded-xl" />}
      </div>
    </li>
  );
}

/* ———————————————————————— Conversation details ———————————————————————— */

export function ConversationPage({ role, threadId }: { role: HelpRole; threadId: string }) {
  const paths = helpPaths(role);
  const person = useSupportPerson(role);
  const chats = chatStore.use();
  const settings = settingsStore.use();
  const tickets = ticketStore.use();
  const prefs = prefsStore.use();
  const look = lookFor(prefs.look);
  const c = person.conversations.find((x) => x.id === threadId);
  if (!c) return <HelpMissing role={role} />;
  const items = mergedItems(c, chats);
  const lives = (c.liveChatIds ?? []).map((id) => chats.find((x) => x.id === id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const current = lives.at(-1);
  const agent = current ? agentById(current.agentId, settings) : null;
  const status = current?.status === "active" ? `With ${agent?.name ?? "an agent"}` : current?.status === "waiting" ? "Waiting for an agent" : current ? "Chat with the team ended" : "Chat with Charm";
  const linked = (c.ticketIds ?? []).map((id) => tickets.find((t) => t.id === id)).filter((t): t is Ticket => Boolean(t));
  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: "My chats", to: <Link to={paths.requests} className="hover:text-brand">My chats</Link> }, { label: "Conversation" }]} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="surface overflow-hidden">
          <header data-surface="dark" className="flex items-center gap-3 bg-cobalt px-5 py-4 text-primary-foreground">
            {agent && current?.status !== "ended" ? <AgentAvatar name={agent.name} className="size-10 text-xs ring-2" /> : <CharmHead look={look} className="size-11" />}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-extrabold">{c.title}</h1>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-on-dark-muted">
                <span className={cn("size-2 rounded-full", current?.status === "active" ? "bg-lime" : current?.status === "waiting" ? "bg-warning" : "bg-on-dark-muted")} aria-hidden="true" />
                {status} · started {timeAgo(c.createdAt)}
              </p>
            </div>
          </header>
          <ol className="max-h-[60vh] space-y-3 overflow-y-auto bg-soft/40 p-4 sm:p-5">
            {items.map((m) =>
              m.from === "system" ? (
                <li key={m.id} className="text-center text-xs font-semibold text-muted-foreground">
                  {m.text}
                </li>
              ) : (
                <li key={m.id} className={cn("flex gap-2.5", m.from === "user" && "flex-row-reverse")}>
                  {m.from === "charm" ? <CharmHead look={look} className="size-8 shrink-0" /> : m.from === "agent" ? <AgentAvatar name={agentById(m.agentId, settings)?.name ?? "Agent"} className="size-8 shrink-0 text-[10px]" /> : null}
                  <div className={cn("min-w-0 max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6", m.from === "user" ? "rounded-tr-md bg-cobalt text-primary-foreground" : "rounded-tl-md bg-card text-ink ring-1 ring-line")}>
                    {m.from === "user" ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : <div className="space-y-1.5"><RichText text={m.text} /></div>}
                    {m.attachment && <img src={m.attachment.dataUrl} alt={m.attachment.name} className="mt-2 max-h-40 rounded-xl" />}
                    <p className={cn("mt-1 text-[11px] font-semibold", m.from === "user" ? "text-on-dark-muted" : "text-muted-foreground")}>
                      <Clock className="mr-1 inline size-3" aria-hidden="true" />
                      {clock(m.at)}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ol>
          <footer className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end sm:p-5">
            <button type="button" onClick={() => openCharm({ threadId: c.id })} className={cn(outcomeButton.primary, "min-h-11")}>
              <MessageCircleMore aria-hidden="true" /> Continue this conversation
            </button>
          </footer>
        </section>
        <aside className="space-y-4">
          <section className="surface p-5">
            <h2 className="text-[15px] font-bold">Conversation details</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Status", status],
                ["Messages", String(items.filter((m) => m.from !== "system").length)],
                ["Started", new Date(c.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })],
                ["Last message", timeAgo(c.updatedAt)],
                ["Team members", lives.length ? [...new Set(lives.map((l) => agentById(l.agentId, settings)?.name).filter(Boolean))].join(", ") || "Waiting" : "None yet"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 text-right font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          {linked.length > 0 && (
            <section className="surface p-5">
              <h2 className="text-[15px] font-bold">Requests from this chat</h2>
              <ul className="mt-2 divide-y">
                {linked.map((t) => (
                  <li key={t.id}>
                    <Link to={paths.ticket} params={{ ticketId: t.id }} className="flex items-center justify-between gap-3 py-2.5 text-sm font-semibold hover:text-brand">
                      <span className="min-w-0 truncate">{t.ref} · {t.subject}</span>
                      <StatusTag status={t.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <ContactChannels role={role} compact />
        </aside>
      </div>
    </div>
  );
}
