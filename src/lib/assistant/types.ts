/** Shared shapes for Charm (the Enski Assistant) and the simulated support desk. Device-only demo data. */

export type Audience = "public" | "learner" | "creator" | "affiliate";
export type LookId = "classic" | "scholar" | "coach" | "innovator";
/**
 * Charm's expressions. idle covers listening, waiting and resting (he blinks on his own).
 * wink and laugh are face-only changes on the idle body; dance and surprised reuse
 * celebrate and think artwork with their own motion.
 */
export type Pose =
  | "idle" | "wave" | "think" | "point" | "celebrate" | "concerned"
  | "wink" | "laugh" | "thumbsup" | "clap" | "proud" | "dance" | "surprised";

/** A button under one of Charm's replies. */
export type QuickAction = {
  label: string;
  /** Opens a page on the site. */
  href?: string | undefined;
  /** Sends this text as the person's next message. */
  prompt?: string | undefined;
  /** Starts the human handover or the leave-a-message form. */
  action?: "human" | "ticket" | undefined;
};

export type HandoverReason = "requested" | "unresolved" | "frustrated" | "sensitive" | "unhelpful" | "repeated";

export type Attachment = { name: string; dataUrl: string };

export type ChatMessage = {
  id: string;
  from: "user" | "charm" | "agent" | "system";
  text: string;
  at: number;
  pose?: Pose | undefined;
  actions?: QuickAction[] | undefined;
  /** Show the "Talk to a Human Agent / Continue with Enski Assistant" choice. */
  offerHuman?: boolean | undefined;
  reason?: HandoverReason | undefined;
  /** The help article the answer came from. */
  articleId?: string | undefined;
  agentId?: string | undefined;
  attachment?: Attachment | undefined;
  feedback?: "up" | "down" | undefined;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  audience: Audience;
  messages: ChatMessage[];
  /** Questions in a row Charm couldn't answer. */
  misses: number;
  lastArticleId?: string | undefined;
  /** Live chats started from this conversation, oldest first. */
  liveChatIds?: string[] | undefined;
  /** Only the in-between moments; once a live chat exists its own status decides. */
  handover?: "connecting" | "unavailable" | undefined;
  ticketIds?: string[] | undefined;
  /** Last time the person had this conversation open, for the unread dot. */
  readAt: number;
};

export type SupportAgent = {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "offline";
};

export type LiveChatLine = {
  id: string;
  from: "user" | "agent" | "system";
  text: string;
  at: number;
  agentId?: string | undefined;
  attachment?: Attachment | undefined;
};

export type LiveChat = {
  id: string;
  threadId: string | null;
  userName: string;
  userEmail: string | null;
  audience: Audience;
  page: string;
  summary: string;
  category: string;
  status: "waiting" | "active" | "ended";
  agentId: string | null;
  createdAt: number;
  updatedAt: number;
  endedBy?: "user" | "agent" | undefined;
  /** The Charm conversation before the handover, kept for the agent. */
  transcript: { from: "user" | "charm"; text: string; at: number }[];
  messages: LiveChatLine[];
  transferNote?: string | undefined;
  /** Sample record that ships with the demo. */
  seed?: boolean | undefined;
};

export type TicketStatus = "Open" | "In Progress" | "Waiting for User" | "Resolved";

export type TicketEntry = {
  id: string;
  from: "user" | "agent";
  text: string;
  at: number;
  agentId?: string | undefined;
  /** Internal note: only staff see it. */
  internal?: boolean | undefined;
  attachment?: Attachment | undefined;
};

export type Ticket = {
  id: string;
  ref: string;
  subject: string;
  category: string;
  description: string;
  attachment?: Attachment | undefined;
  summary: string;
  audience: Audience;
  userName: string;
  userEmail: string;
  status: TicketStatus;
  priority: "normal" | "urgent";
  assigneeId: string | null;
  createdAt: number;
  updatedAt: number;
  entries: TicketEntry[];
  /** The person hasn't seen the latest staff change yet. */
  unseenUpdate?: boolean | undefined;
  threadId?: string | null | undefined;
  seed?: boolean | undefined;
};

export type KbArticle = {
  id: string;
  audience: Audience | "all";
  category: string;
  title: string;
  keywords: string[];
  answer: string;
  actions: QuickAction[];
  /** Charm only uses published articles. */
  published: boolean;
  updatedAt: number;
};

export type SupportSettings = {
  agents: SupportAgent[];
  /** When on, live chat is only offered inside the hours below. */
  enforceHours: boolean;
  hours: { open: string; close: string; days: number[] };
  /** Online agents pick up new chats straight away; off sends them to the waiting queue. */
  autoAccept: boolean;
  notifications: { sound: boolean; newChat: boolean; newTicket: boolean; email: boolean };
};
