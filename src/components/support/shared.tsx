import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentAvatar } from "@/components/assistant/CharmFigure";
import { clock } from "@/lib/assistant/format";
import type { Attachment } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";

export const field =
  "w-full rounded-[14px] border border-line bg-card px-3.5 py-2.5 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-sky focus:ring-4 focus:ring-sky/15 disabled:opacity-60";

/** "In Progress" / "waiting" -> "In progress" / "Waiting": labels read in sentence case. */
export function sentenceCase(text: string): string {
  const t = text.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function Pick({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: (string | { value: string; label: string })[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-w-0 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            return (
              <SelectItem key={v} value={v}>
                {typeof o === "string" ? (CHIP_TONE[o] ? sentenceCase(o) : o) : o.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </label>
  );
}

export function Panel({
  children,
  title,
  description,
  actions,
  className,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface min-w-0 overflow-hidden", className)}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2.5 text-[15px] font-bold text-ink">
              <span className="lime-tick" aria-hidden="true" />
              {title}
            </h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

export function Heading({ title, description, actions, eyebrow = "Support workspace" }: { title: string; description: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
          <span className="size-1.5 rounded-sm bg-lime" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="text-2xl text-ink sm:text-[28px]">{title}</h1>
        <span className="lime-underline" aria-hidden="true" />
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

const CHIP_TONE: Record<string, string> = {
  Resolved: "bg-success-soft text-success",
  ended: "bg-soft text-muted-foreground",
  urgent: "bg-destructive/10 text-destructive",
  "In Progress": "bg-warning-soft text-warning-foreground",
  active: "bg-success-soft text-success",
  Open: "bg-ice text-brand",
  waiting: "bg-warning-soft text-warning-foreground",
  "Waiting for User": "bg-midnight text-lime",
  online: "bg-success-soft text-success",
  away: "bg-warning-soft text-warning-foreground",
  offline: "bg-soft text-muted-foreground",
  normal: "bg-soft text-muted-foreground",
};

/** Status, priority and presence chips with a matching dot. */
export function Chip({ children }: { children: ReactNode }) {
  const s = String(children);
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold first-letter:uppercase", CHIP_TONE[s] ?? "bg-soft text-ink")}>
      <span className={cn("size-1.5 rounded-full bg-current", s === "urgent" && "animate-pulse")} aria-hidden="true" />
      <span>{CHIP_TONE[s] ? sentenceCase(s) : children}</span>
    </span>
  );
}

export function ImageAttachment({ attachment }: { attachment?: Attachment | undefined }) {
  return attachment ? (
    <a href={attachment.dataUrl} target="_blank" rel="noreferrer" className="block">
      <img src={attachment.dataUrl} alt={attachment.name} className="mt-2 max-h-52 max-w-full rounded-xl" />
    </a>
  ) : null;
}

const WHO: Record<string, string> = { user: "Customer", charm: "Charm", agent: "Agent" };

/** Chat lines: customer and Charm on the left, the team on the right, with avatars and times. */
export function Bubbles({ lines, names }: { lines: { from: string; text: string; at: number; attachment?: Attachment | undefined }[]; names?: Partial<Record<string, string>> }) {
  return (
    <ol className="space-y-3">
      {lines.map((m, i) =>
        m.from === "system" ? (
          <li key={i} className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            {m.text}
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </li>
        ) : (
          <li key={i} className={cn("flex gap-2.5", m.from === "agent" && "flex-row-reverse")}>
            <AgentAvatar name={names?.[m.from] ?? WHO[m.from] ?? m.from} className={cn("size-8 shrink-0 text-[10px]", m.from === "charm" && "bg-lime text-midnight")} />
            <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-3.5 py-2.5", m.from === "agent" ? "rounded-tr-md bg-cobalt text-primary-foreground" : "rounded-tl-md bg-soft text-ink")}>
              <p className={cn("text-[11px] font-bold", m.from === "agent" ? "text-on-dark-muted" : "text-muted-foreground")}>
                {names?.[m.from] ?? WHO[m.from] ?? m.from} · {clock(m.at)}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-6">{m.text}</p>
              <ImageAttachment attachment={m.attachment} />
            </div>
          </li>
        ),
      )}
    </ol>
  );
}

export function Empty({ title = "All clear for now", text = "New chats and requests appear here as soon as they arrive." }: { title?: string; text?: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-ice text-brand ring-1 ring-line">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

export function supportMeta(title: string, description: string) {
  const full = `${title} — Enski Support`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  };
}
