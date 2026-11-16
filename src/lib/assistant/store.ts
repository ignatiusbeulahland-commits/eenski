/**
 * Device-only state for Charm and the simulated support desk. Everything is
 * saved in this browser's localStorage; the Support dashboard reads the same
 * records, so "agents" are whoever opens /support on this device. No message,
 * ticket or file ever leaves the browser.
 */
import { localStore, newId } from "./persist";
import { seedArticles } from "./knowledge";
import { isUrgentCategory } from "./routing";
import type {
  Attachment,
  Audience,
  ChatMessage,
  KbArticle,
  LiveChat,
  LiveChatLine,
  LookId,
  SupportAgent,
  SupportSettings,
  Thread,
  Ticket,
  TicketEntry,
  TicketStatus,
} from "./types";
import { greetingFor, threadTitle } from "./engine";

const MAX_THREADS = 30;

// ——— Preferences ———

export type CharmPrefs = { look: LookId | null; seen: boolean };
const EMPTY_PREFS: CharmPrefs = { look: null, seen: false };
export const prefsStore = localStore<CharmPrefs>("enski:charm:prefs", () => EMPTY_PREFS, EMPTY_PREFS);

export function chooseLook(look: LookId) {
  prefsStore.set((p) => ({ ...p, look }));
}
export function markSeen() {
  if (!prefsStore.get().seen) prefsStore.set((p) => ({ ...p, seen: true }));
}

// ——— Conversations ———

export type ThreadState = { threads: Thread[]; activeId: string | null };
const EMPTY_THREADS: ThreadState = { threads: [], activeId: null };
export const threadStore = localStore<ThreadState>("enski:charm:threads", () => EMPTY_THREADS, EMPTY_THREADS);

function msg(partial: Omit<ChatMessage, "id" | "at"> & { at?: number }): ChatMessage {
  return { id: newId("m"), at: partial.at ?? Date.now(), ...partial };
}

export function makeThread(audience: Audience, greet: { name?: string | null | undefined; returning?: boolean | undefined }, now = Date.now()): Thread {
  const g = greetingFor(audience, greet);
  return {
    id: newId("t"),
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    audience,
    misses: 0,
    readAt: now,
    messages: [msg({ from: "charm", text: g.text, pose: g.pose, actions: g.actions, at: now })],
  };
}

/** Starts a fresh conversation and makes it the open one. */
export function startThread(audience: Audience, greet: { name?: string | null | undefined; returning?: boolean | undefined }) {
  const t = makeThread(audience, greet);
  threadStore.set((s) => ({ threads: [t, ...s.threads].slice(0, MAX_THREADS), activeId: t.id }));
  return t.id;
}

/**
 * Opens the current conversation, or the most recent one, and only creates a
 * first conversation when there are none. Safe to call repeatedly.
 */
export function ensureActiveThread(audience: Audience, greet: { name?: string | null | undefined; returning?: boolean | undefined }) {
  const s = threadStore.get();
  if (s.activeId && s.threads.some((t) => t.id === s.activeId)) return s.activeId;
  if (s.threads.length) {
    const recent = [...s.threads].sort((a, b) => b.updatedAt - a.updatedAt)[0]!;
    threadStore.set((x) => ({ ...x, activeId: recent.id }));
    return recent.id;
  }
  return startThread(audience, greet);
}

export function selectThread(id: string) {
  threadStore.set((s) => ({ ...s, activeId: id }));
}

export function updateThread(id: string, update: (t: Thread) => Thread) {
  threadStore.set((s) => ({ ...s, threads: s.threads.map((t) => (t.id === id ? update(t) : t)) }));
}

export function appendMessages(id: string, messages: Omit<ChatMessage, "id" | "at">[], patch: Partial<Thread> = {}) {
  const now = Date.now();
  updateThread(id, (t) => {
    const added = messages.map((m, i) => msg({ ...m, at: now + i }));
    const firstUser = !t.messages.some((m) => m.from === "user") ? added.find((m) => m.from === "user") : undefined;
    return {
      ...t,
      ...patch,
      title: firstUser ? threadTitle(firstUser.text || firstUser.attachment?.name || "") : t.title,
      messages: [...t.messages, ...added],
      updatedAt: now,
    };
  });
}

export function setFeedback(threadId: string, messageId: string, feedback: "up" | "down") {
  updateThread(threadId, (t) => ({ ...t, messages: t.messages.map((m) => (m.id === messageId ? { ...m, feedback } : m)) }));
}

export function markThreadRead(id: string) {
  updateThread(id, (t) => ({ ...t, readAt: Date.now() }));
}

/** Removes a conversation; returns what's needed to put it back. */
export function deleteThread(id: string) {
  const s = threadStore.get();
  const index = s.threads.findIndex((t) => t.id === id);
  if (index < 0) return null;
  const removed = s.threads[index]!;
  threadStore.set((x) => {
    const threads = x.threads.filter((t) => t.id !== id);
    return { threads, activeId: x.activeId === id ? (threads[0]?.id ?? null) : x.activeId };
  });
  return { removed, index, wasActive: s.activeId === id };
}

export function restoreThread(removed: Thread, index: number, makeActive: boolean) {
  threadStore.set((x) => {
    if (x.threads.some((t) => t.id === removed.id)) return x;
    const threads = [...x.threads];
    threads.splice(Math.min(index, threads.length), 0, removed);
    return { threads, activeId: makeActive ? removed.id : x.activeId };
  });
}

// ——— Support settings and agents ———

export const DEFAULT_AGENTS: SupportAgent[] = [
  { id: "agent_amaka", name: "Amaka Obi", role: "Support lead", status: "online" },
  { id: "agent_tunde", name: "Tunde Bello", role: "Payments specialist", status: "away" },
  { id: "agent_zainab", name: "Zainab Musa", role: "Creator success", status: "offline" },
];

export const DEFAULT_SETTINGS: SupportSettings = {
  agents: DEFAULT_AGENTS,
  enforceHours: false,
  hours: { open: "08:00", close: "20:00", days: [1, 2, 3, 4, 5, 6] },
  autoAccept: true,
  notifications: { sound: false, newChat: true, newTicket: true, email: false },
};

export const settingsStore = localStore<SupportSettings>("enski:support:settings", () => DEFAULT_SETTINGS, DEFAULT_SETTINGS);

export function updateSettings(update: (s: SupportSettings) => SupportSettings) {
  settingsStore.set(update);
}

export function setAgentStatus(agentId: string, status: SupportAgent["status"]) {
  settingsStore.set((s) => ({ ...s, agents: s.agents.map((a) => (a.id === agentId ? { ...a, status } : a)) }));
}

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Whether a person can be connected right now. Never pretends someone is there. */
export function supportAvailability(settings: SupportSettings, now: Date = new Date()) {
  const online = settings.agents.filter((a) => a.status === "online");
  if (settings.enforceHours) {
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = settings.hours.days.includes(day) && mins >= minutes(settings.hours.open) && mins < minutes(settings.hours.close);
    if (!open) return { available: false as const, reason: "closed" as const, online };
  }
  if (!online.length) return { available: false as const, reason: "no-agents" as const, online };
  return { available: true as const, reason: null, online };
}

export function agentById(id: string | null | undefined, settings = settingsStore.get()) {
  return settings.agents.find((a) => a.id === id) ?? null;
}

// ——— Live chats ———

function seedChats(now: number): LiveChat[] {
  const h = 3600_000;
  return [
    {
      id: "chat_seed_queue",
      threadId: null,
      userName: "Kelechi Nwosu",
      userEmail: "kelechi@example.com",
      audience: "affiliate",
      page: "/affiliate/referrals",
      summary: "Affiliate on /affiliate/referrals. Asked: “my referral sale isn't showing”. Charm suggested: Tracking commissions and performance. Why: same question came up again.",
      category: "Referral tracking",
      status: "waiting",
      agentId: null,
      createdAt: now - 6 * 60_000,
      updatedAt: now - 6 * 60_000,
      transcript: [
        { from: "user", text: "my referral sale isn't showing", at: now - 8 * 60_000 },
        { from: "charm", text: "Track how your links are doing in Performance, Referrals and Transactions.", at: now - 8 * 60_000 + 1 },
      ],
      messages: [{ id: "l_seed_1", from: "system", text: "Waiting for an agent", at: now - 6 * 60_000 }],
      seed: true,
    },
    {
      id: "chat_seed_done",
      threadId: null,
      userName: "Funmi Adeyemi",
      userEmail: "funmi@example.com",
      audience: "learner",
      page: "/learner/certificates",
      summary: "Learner on /learner/certificates. Asked: “my name is wrong on my certificate”. Charm suggested: Certificates and badges.",
      category: "Certificates",
      status: "ended",
      endedBy: "agent",
      agentId: "agent_amaka",
      createdAt: now - 26 * h,
      updatedAt: now - 25.5 * h,
      transcript: [{ from: "user", text: "my name is wrong on my certificate", at: now - 26 * h }],
      messages: [
        { id: "l_seed_2", from: "agent", agentId: "agent_amaka", text: "Hi Funmi, I'm Amaka. I can see you'd like your name corrected. What should it say?", at: now - 26 * h + 60_000 },
        { id: "l_seed_3", from: "user", text: "Funmilayo Adeyemi please", at: now - 26 * h + 120_000 },
        { id: "l_seed_4", from: "agent", agentId: "agent_amaka", text: "Done! Update your profile name in Settings and download it again.", at: now - 25.5 * h },
        { id: "l_seed_5", from: "system", text: "Amaka ended the chat", at: now - 25.5 * h + 1 },
      ],
      seed: true,
    },
  ];
}

export const chatStore = localStore<LiveChat[]>("enski:support:chats", () => seedChats(Date.now()), []);

export function updateChat(id: string, update: (c: LiveChat) => LiveChat) {
  return chatStore.set((list) => list.map((c) => (c.id === id ? { ...update(c), updatedAt: Date.now() } : c)));
}

function line(partial: Omit<LiveChatLine, "id" | "at">): LiveChatLine {
  return { id: newId("l"), at: Date.now(), ...partial };
}

function firstName(name: string) {
  const n = name.trim().split(/\s+/)[0];
  return !n || n.toLowerCase() === "guest" ? "there" : n;
}

export function agentGreeting(agent: SupportAgent, chat: Pick<LiveChat, "userName" | "transcript">) {
  const asked = chat.transcript.filter((m) => m.from === "user").slice(-1)[0]?.text;
  const about = asked ? ` I've read your chat with Charm about “${asked.length > 70 ? `${asked.slice(0, 67)}…` : asked}”.` : "";
  return `Hi ${firstName(chat.userName)}, I'm ${firstName(agent.name)} from the Enski support team.${about} How can I help?`;
}

export type HumanRequest = {
  threadId: string;
  userName: string;
  userEmail: string | null;
  audience: Audience;
  page: string;
  summary: string;
  category: string;
};

/**
 * Tries to connect a person. Returns the chat (active or queued) when someone
 * is online, or null when support is unavailable.
 */
export function connectToHuman(req: HumanRequest, now = new Date()): LiveChat | null {
  const settings = settingsStore.get();
  const avail = supportAvailability(settings, now);
  const thread = threadStore.get().threads.find((t) => t.id === req.threadId);
  if (!avail.available) {
    if (thread) updateThread(req.threadId, (t) => ({ ...t, handover: "unavailable" }));
    return null;
  }
  const at = now.getTime();
  const agent = settings.autoAccept ? avail.online[0] : null;
  const transcript = (thread?.messages ?? [])
    .filter((m): m is ChatMessage & { from: "user" | "charm" } => m.from === "user" || m.from === "charm")
    .map((m) => ({ from: m.from, text: m.text, at: m.at }));
  const chat: LiveChat = {
    id: newId("chat"),
    threadId: req.threadId,
    userName: req.userName,
    userEmail: req.userEmail,
    audience: req.audience,
    page: req.page,
    summary: req.summary,
    category: req.category,
    status: agent ? "active" : "waiting",
    agentId: agent?.id ?? null,
    createdAt: at,
    updatedAt: at,
    transcript,
    messages: agent
      ? [
          { id: newId("l"), from: "system", text: `${firstName(agent.name)} joined the chat`, at },
          { id: newId("l"), from: "agent", agentId: agent.id, text: agentGreeting(agent, { userName: req.userName, transcript }), at: at + 1 },
        ]
      : [{ id: newId("l"), from: "system", text: "Waiting for an agent", at }],
  };
  chatStore.set((list) => [chat, ...list]);
  updateThread(req.threadId, (t) => ({ ...t, handover: undefined, liveChatIds: [...(t.liveChatIds ?? []), chat.id], updatedAt: at }));
  return chat;
}

export function sendLiveMessage(chatId: string, from: "user" | "agent", text: string, opts: { agentId?: string | undefined; attachment?: Attachment | undefined } = {}) {
  return updateChat(chatId, (c) => ({ ...c, messages: [...c.messages, line({ from, text, agentId: opts.agentId, attachment: opts.attachment })] }));
}

export function acceptChat(chatId: string, agentId: string) {
  const agent = agentById(agentId);
  if (!agent) return;
  updateChat(chatId, (c) => ({
    ...c,
    status: "active",
    agentId,
    messages: [
      ...c.messages,
      line({ from: "system", text: `${firstName(agent.name)} joined the chat` }),
      { ...line({ from: "agent", agentId, text: agentGreeting(agent, c) }), at: Date.now() + 1 },
    ],
  }));
}

export function transferChat(chatId: string, toAgentId: string, note: string) {
  const agent = agentById(toAgentId);
  if (!agent) return;
  updateChat(chatId, (c) => ({
    ...c,
    agentId: toAgentId,
    transferNote: note.trim() || undefined,
    messages: [...c.messages, line({ from: "system", text: `Transferred to ${firstName(agent.name)}` })],
  }));
}

export function endChat(chatId: string, by: "user" | "agent") {
  const c = chatStore.get().find((x) => x.id === chatId);
  if (!c || c.status === "ended") return;
  const who = by === "user" ? "You" : firstName(agentById(c.agentId)?.name ?? "The agent");
  updateChat(chatId, (x) => ({
    ...x,
    status: "ended",
    endedBy: by,
    messages: [...x.messages, line({ from: "system", text: by === "user" ? `${who} ended the chat` : `${who} ended the chat` })],
  }));
}

// ——— Tickets ———

function seedTickets(now: number): Ticket[] {
  const h = 3600_000;
  const base = { attachment: undefined, threadId: null, seed: true, unseenUpdate: false } as const;
  return [
    {
      ...base,
      id: "tk_seed_1",
      ref: "ENS-204817",
      subject: "Course won't open after payment",
      category: "Course and resource access",
      description: "I paid for the UI/UX course this morning but it isn't in my Resources.",
      summary: "Learner on /learner/resources. Asked: “where is my course”. Charm suggested: Opening something you bought; A purchase won't open.",
      audience: "learner",
      userName: "Chiamaka Eze",
      userEmail: "chiamaka@example.com",
      status: "Open",
      priority: "normal",
      assigneeId: null,
      createdAt: now - 2 * h,
      updatedAt: now - 2 * h,
      entries: [],
    },
    {
      ...base,
      id: "tk_seed_2",
      ref: "ENS-204655",
      subject: "Payout still pending",
      category: "Wallet and payouts",
      description: "My payout request from Monday still says pending.",
      summary: "Creator on /creator/payouts. Asked: “payout pending since monday”. Why: account or money issue.",
      audience: "creator",
      userName: "Ifeanyi Okoro",
      userEmail: "ifeanyi@example.com",
      status: "In Progress",
      priority: "urgent",
      assigneeId: "agent_tunde",
      createdAt: now - 20 * h,
      updatedAt: now - 5 * h,
      entries: [
        { id: "e_seed_1", from: "agent", agentId: "agent_tunde", text: "Thanks Ifeanyi, I'm checking this with our payments partner now.", at: now - 5 * h },
        { id: "e_seed_2", from: "agent", agentId: "agent_tunde", text: "Bank name on the account matches the profile.", at: now - 5 * h + 1, internal: true },
      ],
    },
    {
      ...base,
      id: "tk_seed_3",
      ref: "ENS-204512",
      subject: "Referral not tracked",
      category: "Referral tracking",
      description: "A friend bought with my link but I don't see it in Referrals.",
      summary: "Affiliate on /affiliate/referrals. Asked: “friend bought with my link”.",
      audience: "affiliate",
      userName: "Halima Sani",
      userEmail: "halima@example.com",
      status: "Waiting for User",
      priority: "normal",
      assigneeId: "agent_amaka",
      createdAt: now - 44 * h,
      updatedAt: now - 30 * h,
      entries: [{ id: "e_seed_3", from: "agent", agentId: "agent_amaka", text: "Could you share the date of the purchase and the product name?", at: now - 30 * h }],
    },
    {
      ...base,
      id: "tk_seed_4",
      ref: "ENS-204390",
      subject: "Which profile should I choose?",
      category: "Getting started",
      description: "I want to learn and also sell later. Which profile first?",
      summary: "Visitor on /. Asked: “learn and sell later”. Charm suggested: Learner, Creator and Affiliate profiles.",
      audience: "public",
      userName: "Daniel Ojo",
      userEmail: "daniel@example.com",
      status: "Resolved",
      priority: "normal",
      assigneeId: "agent_zainab",
      createdAt: now - 72 * h,
      updatedAt: now - 70 * h,
      entries: [{ id: "e_seed_4", from: "agent", agentId: "agent_zainab", text: "Start as a Learner; you can switch to Creator from the top bar whenever you're ready.", at: now - 70 * h }],
    },
  ];
}

export const ticketStore = localStore<Ticket[]>("enski:support:tickets", () => seedTickets(Date.now()), []);

export const TICKET_STATUSES: TicketStatus[] = ["Open", "In Progress", "Waiting for User", "Resolved"];

export function makeTicketRef(existing: string[], now = Date.now()) {
  let n = now % 1_000_000;
  let ref = `ENS-${String(n).padStart(6, "0")}`;
  while (existing.includes(ref)) {
    n = (n + 1) % 1_000_000;
    ref = `ENS-${String(n).padStart(6, "0")}`;
  }
  return ref;
}

export type NewTicket = {
  subject: string;
  category: string;
  description: string;
  attachment?: Attachment | undefined;
  summary: string;
  audience: Audience;
  userName: string;
  userEmail: string;
  threadId?: string | null | undefined;
};

export function createTicket(input: NewTicket): { ticket: Ticket; saved: boolean } {
  const now = Date.now();
  const ticket: Ticket = {
    id: newId("tk"),
    ref: makeTicketRef(ticketStore.get().map((t) => t.ref), now),
    subject: input.subject.trim(),
    category: input.category,
    description: input.description.trim(),
    attachment: input.attachment,
    summary: input.summary,
    audience: input.audience,
    userName: input.userName.trim() || "Guest",
    userEmail: input.userEmail.trim().toLowerCase(),
    status: "Open",
    priority: isUrgentCategory(input.category) ? "urgent" : "normal",
    assigneeId: null,
    createdAt: now,
    updatedAt: now,
    entries: [],
    threadId: input.threadId ?? null,
  };
  const saved = ticketStore.set((list) => [ticket, ...list]);
  if (input.threadId) updateThread(input.threadId, (t) => ({ ...t, handover: undefined, ticketIds: [...(t.ticketIds ?? []), ticket.id] }));
  return { ticket, saved };
}

export function updateTicket(id: string, update: (t: Ticket) => Ticket) {
  ticketStore.set((list) => list.map((t) => (t.id === id ? update(t) : t)));
}

/** Staff changes; anything the person can see flags an update for them. */
export function staffSetStatus(id: string, status: TicketStatus) {
  updateTicket(id, (t) => (t.status === status ? t : { ...t, status, updatedAt: Date.now(), unseenUpdate: !t.seed }));
}

export function staffAssign(id: string, agentId: string | null) {
  updateTicket(id, (t) => ({ ...t, assigneeId: agentId, updatedAt: Date.now() }));
}

export function staffSetPriority(id: string, priority: Ticket["priority"]) {
  updateTicket(id, (t) => ({ ...t, priority, updatedAt: Date.now() }));
}

export function staffReply(id: string, agentId: string, text: string, internal: boolean) {
  const entry: TicketEntry = { id: newId("e"), from: "agent", agentId, text: text.trim(), at: Date.now(), internal: internal || undefined };
  updateTicket(id, (t) => ({
    ...t,
    entries: [...t.entries, entry],
    status: !internal && t.status === "Open" ? "In Progress" : t.status,
    assigneeId: t.assigneeId ?? agentId,
    updatedAt: Date.now(),
    unseenUpdate: internal ? t.unseenUpdate : !t.seed,
  }));
}

export function userReply(id: string, text: string, attachment?: Attachment) {
  const entry: TicketEntry = { id: newId("e"), from: "user", text: text.trim(), at: Date.now(), attachment };
  updateTicket(id, (t) => ({
    ...t,
    entries: [...t.entries, entry],
    status: t.status === "Waiting for User" || t.status === "Resolved" ? "Open" : t.status,
    updatedAt: Date.now(),
  }));
}

export function markTicketSeen(id: string) {
  const t = ticketStore.get().find((x) => x.id === id);
  if (t?.unseenUpdate) updateTicket(id, (x) => ({ ...x, unseenUpdate: false }));
}

/** Tickets raised from this device (the demo samples are staff-only). */
export function myTickets(list: Ticket[]) {
  return list.filter((t) => !t.seed).sort((a, b) => b.updatedAt - a.updatedAt);
}

// ——— Knowledge base ———

export const kbStore = localStore<KbArticle[]>("enski:support:kb", () => seedArticles(), []);

export function saveArticle(article: KbArticle) {
  kbStore.set((list) => {
    const next = { ...article, updatedAt: Date.now() };
    return list.some((a) => a.id === article.id) ? list.map((a) => (a.id === article.id ? next : a)) : [next, ...list];
  });
}

export function removeArticle(id: string) {
  const list = kbStore.get();
  const index = list.findIndex((a) => a.id === id);
  if (index < 0) return null;
  const removed = list[index]!;
  kbStore.set((l) => l.filter((a) => a.id !== id));
  return { removed, index };
}

export function restoreArticle(removed: KbArticle, index: number) {
  kbStore.set((l) => {
    if (l.some((a) => a.id === removed.id)) return l;
    const next = [...l];
    next.splice(Math.min(index, next.length), 0, removed);
    return next;
  });
}

/** Tests only. */
export function resetAssistantStores() {
  for (const s of [prefsStore, threadStore, settingsStore, chatStore, ticketStore, kbStore]) s.reset();
}
