import { useState } from "react";
import { chatStore, threadStore } from "@/lib/assistant/store";
import { AUDIENCE_LABEL } from "@/lib/assistant/routing";
import { timeAgo } from "@/lib/assistant/format";
import { Button } from "@/components/ui/button";
import { Heading, Panel, Chip, Pick, Empty, Bubbles, field } from "./shared";
export function ConversationsPage() {
  const chats = chatStore.use(),
    { threads } = threadStore.use();
  const [tab, T] = useState("live"),
    [q, Q] = useState(""),
    [status, S] = useState("all"),
    [selected, I] = useState("");
  const chat = chats.find((c) => c.id === selected),
    thread = threads.find((t) => t.id === selected);
  const list = chats
    .filter(
      (c) =>
        `${c.userName} ${c.userEmail ?? ""} ${c.summary}`.toLowerCase().includes(q.toLowerCase()) &&
        (status === "all" || c.status === status),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const ts = threads.filter((t) => t.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <Heading title="Conversations" description="Past chats to read back. Replies happen in Live chat." />
      <div role="tablist" aria-label="Conversation type" className="mb-5 flex flex-wrap gap-2">
        {([
          ["live", "Live chats"],
          ["charm", "Charm chats"],
        ] as const).map(([v, label]) => (
          <Button
            key={v}
            role="tab"
            aria-selected={tab === v}
            variant={tab === v ? "default" : "outline"}
            onClick={() => {
              T(v);
              I("");
              Q("");
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel>
          <label className="block text-sm">
            Search conversations
            <input className={`${field} mt-2`} value={q} onChange={(e) => Q(e.target.value)} />
          </label>
          {tab === "live" && (
            <Pick
              label="Status"
              value={status}
              onChange={S}
              options={[{ value: "all", label: "All statuses" }, "waiting", "active", "ended"]}
            />
          )}
          <div className="space-y-2">
            {tab === "live"
              ? list.map((c) => (
                  <button key={c.id} className="block w-full rounded-xl border border-line p-3 text-left" onClick={() => I(c.id)}>
                    <strong className="text-sm">{c.userName}</strong>
                    <div className="mt-2 flex gap-2 text-xs">
                      <Chip>{c.status}</Chip>
                      <span>{timeAgo(c.updatedAt)}</span>
                    </div>
                  </button>
                ))
              : ts.map((t) => (
                  <button key={t.id} className="block w-full rounded-xl border border-line p-3 text-left" onClick={() => I(t.id)}>
                    <strong className="text-sm">{t.title}</strong>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {AUDIENCE_LABEL[t.audience]} · {t.messages.length} messages · {timeAgo(t.updatedAt)}
                    </p>
                  </button>
                ))}
            {(tab === "live" ? !list.length : !ts.length) && <Empty />}
          </div>
        </Panel>
        <Panel title="Read-only conversation">
          {tab === "live" && chat ? (
            <>
              <h3 className="font-semibold">
                {chat.userName}
              </h3>
              <p className="rounded-xl bg-ice p-4 text-sm">{chat.summary}</p>
              <h3 className="text-sm font-semibold">Charm conversation</h3>
              <Bubbles lines={chat.transcript} />
              <h3 className="text-sm font-semibold">Live messages</h3>
              <Bubbles lines={chat.messages} />
            </>
          ) : tab === "charm" && thread ? (
            <>
              <h3 className="font-semibold">{thread.title}</h3>
              <Bubbles lines={thread.messages} />
            </>
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
    </>
  );
}
