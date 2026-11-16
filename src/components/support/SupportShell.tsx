import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, History, LayoutDashboard, Menu, MessagesSquare, Settings, Ticket, X } from "lucide-react";

import logoWhite from "@/assets/enski-logo-white.webp";
import { cn } from "@/lib/utils";
import { chatStore, settingsStore, ticketStore } from "@/lib/assistant/store";
import { staffSession, useStaffAgentId } from "@/lib/assistant/staff";

const STATUS_DOT = { online: "bg-lime", away: "bg-warning", offline: "bg-on-dark-muted/50" } as const;

/** Support desk frame: midnight sidebar on desktop, compact top bar + menu on phones. */
export function SupportShell() {
  const chats = chatStore.use();
  const tickets = ticketStore.use();
  const settings = settingsStore.use();
  const agentId = useStaffAgentId();
  const me = settings.agents.find((a) => a.id === agentId);
  const [menu, setMenu] = useState(false);

  const links = [
    { label: "Overview", to: "/support/dashboard", Icon: LayoutDashboard, count: 0 },
    { label: "Live chat", to: "/support/live-chat", Icon: MessagesSquare, count: chats.filter((c) => c.status === "waiting").length },
    {
      label: "Tickets",
      to: "/support/tickets",
      Icon: Ticket,
      count: tickets.filter((t) => t.status !== "Resolved" && (t.status === "Open" || t.priority === "urgent")).length,
    },
    { label: "Conversations", to: "/support/conversations", Icon: History, count: 0 },
    { label: "Knowledge base", to: "/support/knowledge-base", Icon: BookOpen, count: 0 },
    { label: "Settings", to: "/support/settings", Icon: Settings, count: 0 },
  ] as const;

  const nav = (
    <nav aria-label="Support desk" className="grid gap-1">
      {links.map(({ label, to, Icon, count }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setMenu(false)}
          activeProps={{ className: "bg-cobalt text-on-dark shadow-float" }}
          inactiveProps={{ className: "text-on-dark-muted hover:bg-on-dark/10 hover:text-on-dark" }}
          className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-sm font-bold transition-colors"
        >
          <Icon className="size-[18px]" aria-hidden="true" />
          {label}
          {count > 0 && <span className="ml-auto rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight">{count}</span>}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-on-dark-muted">Working as</span>
        <span className="relative block">
          <span className={cn("pointer-events-none absolute left-3 top-1/2 size-2.5 -translate-y-1/2 rounded-full", STATUS_DOT[me?.status ?? "offline"])} aria-hidden="true" />
          <select
            value={agentId ?? ""}
            onChange={(e) => staffSession.workAs(e.target.value)}
            className="h-11 w-full cursor-pointer appearance-none rounded-[14px] border border-on-dark/20 bg-on-dark/10 pl-8 pr-3 text-sm font-bold text-on-dark outline-none focus:border-lime focus-visible:ring-2 focus-visible:ring-lime/60"
          >
            {settings.agents.map((a) => (
              <option key={a.id} value={a.id} className="text-ink">
                {a.name} ({a.status})
              </option>
            ))}
          </select>
        </span>
      </label>
      <Link to="/" className="flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-sm font-bold text-on-dark-muted hover:bg-on-dark/10 hover:text-on-dark">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to website
      </Link>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2.5">
      <img src={logoWhite} alt="Enski" width={288} height={106} className="h-7 w-auto" />
      <span className="text-sm font-extrabold text-on-dark">Support</span>
    </div>
  );

  return (
    <div data-skin="dashboard" className="min-h-screen bg-background text-ink lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside data-surface="dark" className="hidden flex-col justify-between gap-8 bg-midnight p-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="space-y-8">
          {brand}
          {nav}
        </div>
        {footer}
      </aside>

      <header data-surface="dark" className="sticky top-0 z-(--z-sticky) flex items-center justify-between gap-3 bg-midnight px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-label={menu ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full text-on-dark hover:bg-on-dark/10"
        >
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {menu && (
        <div data-surface="dark" className="sticky top-16 z-(--z-sticky) space-y-6 border-t border-on-dark/10 bg-midnight px-4 pb-5 pt-3 lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      <div className="min-w-0">
        <main id="main-content" className="mx-auto max-w-[1400px] p-4 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
