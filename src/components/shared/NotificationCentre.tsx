import { Link, useRouter } from "@tanstack/react-router";
import { undoToast } from "@/lib/shared/undo";
import { ArrowRight, Bell, BellOff, CheckCheck, Settings2, Trash2, X } from "lucide-react";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { cn } from "@/lib/utils";
import { tablistKeyDown } from "@/lib/keyboard";

/** `to` is the in-app page the notification opens (path, may include a query). */
export type NotificationItem = { id: string; title: string; body?: string | undefined; date: string; read: boolean; to?: string | undefined };

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

/** Shared notification centre: bell with unread count, All/Unread tabs, mark read. */
export function NotificationCentre({
  items,
  onRead,
  onReadAll,
  onDismiss,
  preferencesTo,
  emptyText,
  paused,
}: {
  items: NotificationItem[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  /** Removes notifications from the centre and returns a function that brings them back. */
  onDismiss?: (ids: string[]) => () => void;
  preferencesTo: string;
  emptyText: string;
  paused?: boolean;
}) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => !n.read).length;
  const shown = (tab === "unread" ? items.filter((n) => !n.read) : items).slice(0, 20);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const openItem = (n: NotificationItem) => {
    onRead(n.id);
    if (!n.to) return;
    setOpen(false);
    router.history.push(n.to);
  };
  const readIds = items.filter((n) => n.read).map((n) => n.id);
  const dismiss = (ids: string[], message: string) => {
    if (!onDismiss || !ids.length) return;
    undoToast(message, onDismiss(ids));
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="quiet" size="icon" className="relative" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
          <Bell />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-xs font-extrabold leading-none text-midnight ring-2 ring-card">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        aria-labelledby="notif-title"
        className="w-[min(calc(100vw-1.5rem),392px)] overflow-hidden rounded-[24px] border p-0 shadow-float"
      >
        {/* Brand header: Cobalt light panel, faint Lime dots, 3D bell, clear close button. */}
        <div data-surface="dark" className="bg-brand-panel relative isolate overflow-hidden px-4 pb-4 pt-4 text-on-dark">
          <span className="hero-dots" aria-hidden="true" />
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-on-dark/20 bg-on-dark/10 backdrop-blur-sm" aria-hidden="true">
              <img src={brandArtwork.bell} alt="" width={40} height={40} className="h-9 w-9 object-contain" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="flex items-center gap-2 text-xs font-bold text-on-dark-muted">
                <span className={cn("neon-dot", unread > 0 && "is-live")} aria-hidden="true" />
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
              <h2 id="notif-title" className="mt-1 text-lg font-extrabold leading-tight text-on-dark">Notifications</h2>
              <span className="neon-rule mt-1.5 block w-10" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-on-dark/25 bg-on-dark/15 text-on-dark transition-colors hover:border-lime/60 hover:text-lime focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              <X className="h-[18px] w-[18px]" />
              <span className="sr-only">Close notifications</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div role="tablist" aria-label="Filter notifications" onKeyDown={tablistKeyDown} className="inline-flex rounded-full bg-soft p-1">
            {(["all", "unread"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                id={`notif-tab-${t}`}
                aria-selected={tab === t}
                aria-controls="notif-panel"
                tabIndex={tab === t ? 0 : -1}
                onClick={() => setTab(t)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  tab === t ? "bg-cobalt text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-cobalt",
                )}
              >
                {tab === t && <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />}
                {t === "all" ? "All" : "Unread"}
                {t === "unread" && unread > 0 && <span className={cn("grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-extrabold", tab === t ? "bg-lime text-midnight" : "bg-cobalt-100 text-cobalt")}>{unread}</span>}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <button onClick={onReadAll} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-cobalt hover:bg-ice">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
            </button>
          )}
        </div>
        {paused && (
          <p className="flex items-center gap-2 border-b bg-warning-soft px-4 py-2.5 text-xs font-semibold text-warning-foreground">
            <BellOff className="h-3.5 w-3.5 shrink-0" />
            In-app notifications are off. Turn them on in notification settings.
          </p>
        )}
        {shown.length ? (
          <ul id="notif-panel" role="tabpanel" aria-labelledby={`notif-tab-${tab}`} className="max-h-[min(60dvh,360px)] space-y-1 overflow-y-auto p-2">
            {shown.map((n) => (
              <li key={n.id} className="relative">
                <button
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-[16px] border px-3 py-3 text-left transition-colors",
                    onDismiss && "pr-11",
                    n.read ? "border-transparent hover:bg-soft" : "border-cobalt-100 bg-ice/70 hover:bg-ice",
                  )}
                  onClick={() => openItem(n)}
                >
                  <span className={cn("relative grid h-9 w-9 shrink-0 place-items-center rounded-[12px]", n.read ? "bg-soft text-muted-foreground" : "bg-cobalt text-primary-foreground")} aria-hidden="true">
                    <Bell className="h-4 w-4" />
                    {!n.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-card" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm leading-snug", n.read ? "font-semibold text-slate" : "font-bold text-foreground")}>
                      {n.title}
                      {!n.read && <span className="sr-only"> (unread)</span>}
                    </span>
                    {n.body && <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>}
                    <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">{timeAgo(n.date)}{n.to ? <span className="inline-flex items-center gap-0.5 text-cobalt"> · Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span> : !n.read && " · Tap to mark as read"}</span>
                  </span>
                </button>
                {onDismiss && (
                  <button
                    type="button"
                    onClick={() => dismiss([n.id], "Notification cleared")}
                    className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-destructive focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                    aria-label={`Clear notification: ${n.title}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div id="notif-panel" role="tabpanel" aria-labelledby={`notif-tab-${tab}`} className="px-6 py-8 text-center">
            <img src={brandArtwork.bell} alt="" width={64} height={64} className="mx-auto h-16 w-16 object-contain" />
            <p className="mt-3 text-sm font-extrabold">{tab === "unread" && items.length ? "You're all caught up" : "No notifications yet"}</p>
            <p className="mx-auto mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
              {tab === "unread" && items.length ? "New updates will show up here the moment they happen." : emptyText}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t bg-soft/60 px-4 py-3">
          <Link to={preferencesTo} onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt hover:underline">
            <Settings2 className="h-3.5 w-3.5" /> Notification settings
          </Link>
          <span className="flex items-center gap-1.5">
            {onDismiss && readIds.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => dismiss(readIds, `${readIds.length} read notification${readIds.length === 1 ? "" : "s"} cleared`)}>
                <Trash2 />
                Clear read
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
