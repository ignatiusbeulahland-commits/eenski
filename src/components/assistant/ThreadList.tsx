import { MessageSquarePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/assistant/format";
import { AUDIENCE_LABEL } from "@/lib/assistant/routing";
import { deleteThread, restoreThread } from "@/lib/assistant/store";
import { undoToast } from "@/lib/shared/undo";
import type { Thread } from "@/lib/assistant/types";

/** Every conversation saved in this browser. Select and delete are separate buttons. */
export function ThreadList({
  threads,
  activeId,
  unreadIds,
  onSelect,
  onNew,
}: {
  threads: Thread[];
  activeId: string | null;
  unreadIds: Set<string>;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm font-extrabold text-ink">
          {sorted.length} conversation{sorted.length === 1 ? "" : "s"}
          <span className="block text-xs font-semibold text-muted-foreground">Saved in this browser</span>
        </p>
        <Button type="button" size="sm" onClick={onNew}>
          <MessageSquarePlus /> New conversation
        </Button>
      </div>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
        {sorted.map((t) => {
          const last = [...t.messages].reverse().find((m) => m.from !== "system");
          const active = t.id === activeId;
          return (
            <li key={t.id} className={cn("flex items-stretch gap-1 rounded-[16px] border transition-colors", active ? "border-cobalt bg-ice" : "border-line bg-card hover:border-sky")}>
              <button type="button" onClick={() => onSelect(t.id)} className="min-w-0 flex-1 px-3.5 py-3 text-left" aria-current={active ? "true" : undefined}>
                <span className="flex items-center gap-2">
                  {unreadIds.has(t.id) && <span className="size-2 shrink-0 rounded-full bg-cobalt" aria-label="New reply" />}
                  <span className="truncate text-sm font-extrabold text-ink">{t.title}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{last?.text ?? "No messages yet"}</span>
                <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                  {AUDIENCE_LABEL[t.audience]} · {timeAgo(t.updatedAt)}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete conversation: ${t.title}`}
                onClick={() => {
                  const r = deleteThread(t.id);
                  if (r) undoToast("Conversation deleted", () => restoreThread(r.removed, r.index, r.wasActive));
                }}
                className="grid w-11 shrink-0 place-items-center rounded-r-[16px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
