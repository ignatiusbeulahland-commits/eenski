import { beforeEach, describe, expect, it } from "vitest";

import { audienceForPath, HUMAN_OFFER_TEXT, respond, summarise } from "@/lib/assistant/engine";
import { seedArticles } from "@/lib/assistant/knowledge";
import { SUPPORT_CATEGORIES, suggestCategory } from "@/lib/assistant/routing";
import {
  DEFAULT_SETTINGS,
  connectToHuman,
  createTicket,
  ensureActiveThread,
  myTickets,
  resetAssistantStores,
  settingsStore,
  staffReply,
  staffSetStatus,
  supportAvailability,
  threadStore,
  ticketStore,
  userReply,
} from "@/lib/assistant/store";

const articles = seedArticles(0);
const fresh = { misses: 0, lastArticleId: undefined };

beforeEach(() => {
  localStorage.clear();
  resetAssistantStores();
});

describe("Charm answers by page", () => {
  it("treats dashboard pages as that role and everything else as public", () => {
    expect(audienceForPath("/learner/resources")).toBe("learner");
    expect(audienceForPath("/creator/products")).toBe("creator");
    expect(audienceForPath("/affiliate/wallet")).toBe("affiliate");
    expect(audienceForPath("/creators/beulahland")).toBe("public");
    expect(audienceForPath("/pricing")).toBe("public");
  });

  it("explains what Enski does to a visitor", () => {
    expect(respond("What does Enski do?", { audience: "public", articles, thread: fresh }).reply.articleId).toBe("what-is-enski");
  });

  it("helps a learner open a purchased resource", () => {
    expect(respond("How do I access my purchased resource?", { audience: "learner", articles, thread: fresh }).reply.articleId).toBe("learner-access");
  });

  it("helps a creator publish a product", () => {
    expect(respond("How do I publish my product?", { audience: "creator", articles, thread: fresh }).reply.articleId).toBe("creator-publish");
  });

  it("helps an affiliate track commissions", () => {
    expect(respond("How do I track my commissions?", { audience: "affiliate", articles, thread: fresh }).reply.articleId).toBe("affiliate-performance");
  });

  it("ignores unpublished articles", () => {
    const hidden = articles.map((a) => (a.id === "creator-publish" ? { ...a, published: false } : a));
    expect(respond("How do I publish my product?", { audience: "creator", articles: hidden, thread: fresh }).reply.articleId).not.toBe("creator-publish");
  });
});

describe("when Charm offers a person", () => {
  it("asks for clarification first, then offers a human on the second miss", () => {
    const first = respond("can you book me a flight to lagos", { audience: "public", articles, thread: fresh });
    expect(first.reply.offerHuman).toBeFalsy();
    expect(first.misses).toBe(1);
    const second = respond("a flight to lagos tomorrow", { audience: "public", articles, thread: { misses: first.misses } });
    expect(second.reply.offerHuman).toBe(true);
    expect(second.reply.text).toBe(HUMAN_OFFER_TEXT);
  });

  it("offers a human straight away when asked", () => {
    expect(respond("I want to talk to a human", { audience: "learner", articles, thread: fresh }).reply.reason).toBe("requested");
  });

  it("offers a human when the person is frustrated", () => {
    expect(respond("this is useless", { audience: "learner", articles, thread: fresh }).reply.reason).toBe("frustrated");
  });

  it("offers a human for payout and payment issues", () => {
    expect(respond("my payout hasn't arrived", { audience: "creator", articles, thread: fresh }).reply.offerHuman).toBe(true);
    expect(respond("I was charged twice", { audience: "learner", articles, thread: fresh }).reply.offerHuman).toBe(true);
  });

  it("offers a human when the same question comes back", () => {
    const again = respond("where is my referral link", { audience: "affiliate", articles, thread: { misses: 0, lastArticleId: "affiliate-links" } });
    expect(again.reply.reason).toBe("repeated");
  });
});

describe("support categories", () => {
  it("uses the brief's categories for each kind of visitor", () => {
    expect(SUPPORT_CATEGORIES.learner).toEqual(["Purchases and payments", "Course and resource access", "Events", "Certificates", "Account issues", "Technical issues", "General enquiries"]);
    expect(SUPPORT_CATEGORIES.creator).toEqual(["Product setup and publishing", "Sales and orders", "Wallet and payouts", "Verification", "Account issues", "Certificates", "Technical issues", "General enquiries"]);
    expect(SUPPORT_CATEGORIES.affiliate).toEqual(["Referral tracking", "Affiliations", "Commissions", "Wallet and payouts", "Account issues", "Technical issues", "General enquiries"]);
    expect(SUPPORT_CATEGORIES.public).toEqual(["General enquiries", "Registration", "Platform information", "Getting started", "Technical issues"]);
  });

  it("picks a matching category from the question", () => {
    expect(suggestCategory("creator", "my payout is late")).toBe("Wallet and payouts");
    expect(suggestCategory("learner", "my course won't open")).toBe("Course and resource access");
  });
});

describe("live support availability", () => {
  it("is available when an agent is online", () => {
    expect(supportAvailability(DEFAULT_SETTINGS).available).toBe(true);
  });

  it("is unavailable when nobody is online", () => {
    const s = { ...DEFAULT_SETTINGS, agents: DEFAULT_SETTINGS.agents.map((a) => ({ ...a, status: "offline" as const })) };
    expect(supportAvailability(s).reason).toBe("no-agents");
  });

  it("is closed outside support hours when hours are enforced", () => {
    const s = { ...DEFAULT_SETTINGS, enforceHours: true, hours: { open: "08:00", close: "20:00", days: [1, 2, 3, 4, 5] } };
    expect(supportAvailability(s, new Date(2026, 10, 16, 22, 0)).reason).toBe("closed"); // Monday 10pm
    expect(supportAvailability(s, new Date(2026, 10, 16, 10, 0)).available).toBe(true); // Monday 10am
  });

  it("never connects anyone when support is unavailable", () => {
    settingsStore.set((s) => ({ ...s, agents: s.agents.map((a) => ({ ...a, status: "offline" as const })) }));
    const threadId = ensureActiveThread("learner", { name: "Ada" });
    const chat = connectToHuman({ threadId, userName: "Ada", userEmail: null, audience: "learner", page: "/learner", summary: "", category: "Events" });
    expect(chat).toBeNull();
    expect(threadStore.get().threads[0]?.handover).toBe("unavailable");
  });

  it("connects an online agent with a summary when available", () => {
    const threadId = ensureActiveThread("learner", { name: "Ada" });
    const chat = connectToHuman({ threadId, userName: "Ada Obi", userEmail: "ada@x.com", audience: "learner", page: "/learner", summary: "Learner on /learner.", category: "Events" });
    expect(chat?.status).toBe("active");
    expect(chat?.agentId).toBe("agent_amaka");
    expect(chat?.summary).toBe("Learner on /learner.");
  });
});

describe("conversations", () => {
  it("creates only one first conversation however often it's opened", () => {
    ensureActiveThread("public", {});
    ensureActiveThread("public", {});
    expect(threadStore.get().threads).toHaveLength(1);
  });
});

describe("tickets", () => {
  const base = { subject: "Help", category: "Wallet and payouts", description: "Payout missing", summary: "", audience: "creator" as const, userName: "Ada", userEmail: "Ada@X.com" };

  it("opens with status Open, a reference, and urgent priority for payouts", () => {
    const { ticket } = createTicket(base);
    expect(ticket.status).toBe("Open");
    expect(ticket.ref).toMatch(/^ENS-\d{6}$/);
    expect(ticket.priority).toBe("urgent");
    expect(ticket.userEmail).toBe("ada@x.com");
  });

  it("shows the person their own tickets only, not the demo samples", () => {
    const { ticket } = createTicket(base);
    expect(myTickets(ticketStore.get()).map((t) => t.id)).toEqual([ticket.id]);
  });

  it("flags staff updates for the person and moves Open to In Progress on reply", () => {
    const { ticket } = createTicket(base);
    staffReply(ticket.id, "agent_amaka", "Looking into it", false);
    let t = ticketStore.get().find((x) => x.id === ticket.id)!;
    expect(t.status).toBe("In Progress");
    expect(t.unseenUpdate).toBe(true);
    staffSetStatus(ticket.id, "Resolved");
    t = ticketStore.get().find((x) => x.id === ticket.id)!;
    expect(t.status).toBe("Resolved");
  });

  it("keeps internal notes from flagging an update", () => {
    const { ticket } = createTicket(base);
    staffReply(ticket.id, "agent_amaka", "note", true);
    expect(ticketStore.get().find((x) => x.id === ticket.id)!.unseenUpdate).toBeFalsy();
  });

  it("reopens a ticket waiting for the person when they reply", () => {
    const { ticket } = createTicket(base);
    staffSetStatus(ticket.id, "Waiting for User");
    userReply(ticket.id, "Here you go");
    expect(ticketStore.get().find((x) => x.id === ticket.id)!.status).toBe("Open");
  });
});

describe("handover summary", () => {
  it("names the visitor type, page and recent questions", () => {
    const s = summarise({ audience: "learner", messages: [{ id: "1", from: "user", text: "where is my course", at: 1 }] }, "/learner/resources", articles, "unresolved");
    expect(s).toContain("Learner on /learner/resources.");
    expect(s).toContain("“where is my course”");
  });
});
