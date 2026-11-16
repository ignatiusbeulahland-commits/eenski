import { LogoutDialog } from "@/components/shared/BrandDialog";
import { useDashboardSignOut } from "@/lib/dashboard/account";
import { restoreAll, sameId } from "@/lib/shared/listUndo";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CornerDownLeft,
  LogOut,
  Search,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { mainNav, resourceNav, settingsNav } from "@/lib/affiliate/nav";
import { products } from "@/lib/affiliate/products";
import { useAffiliate } from "@/lib/affiliate/store";
import { guides } from "@/lib/affiliate/guides";
import { faqs } from "@/lib/affiliate/help";
import { cn } from "@/lib/utils";
import { AccountMenuHeader, SwitchProfileItems, useProfileSwitch } from "@/components/shared/ProfileSwitcher";
import { handleArrowKeys } from "@/lib/keyboard";
import { NotificationCentre } from "@/components/shared/NotificationCentre";
import { affiliateNotificationLink } from "@/lib/shared/notificationLinks";
import { SidebarAccountTrigger, SidebarDock } from "@/components/shared/SidebarDock";

export const iconBtn =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border-[1.5px] border-line bg-card text-midnight transition-colors hover:border-cobalt-100 hover:bg-ice hover:text-cobalt focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]";

export function Avatar({ size = "md" }: { size?: "md" | "lg" }) {
  const { state } = useAffiliate();
  const initials = (state.profile.firstName[0] ?? "") + (state.profile.lastName[0] ?? "");
  const cls = size === "lg" ? "h-11 w-11 text-sm" : "h-10 w-10 text-[13px]";
  if (state.profile.photo)
    return (
      <img
        src={state.profile.photo}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", cls)}
      />
    );
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-cobalt font-bold text-primary-foreground ring-2 ring-lime/80",
        cls,
      )}
    >
      {initials.toUpperCase()}
    </span>
  );
}

/* ---------------- Search ---------------- */
type Result = {
  group: string;
  label: string;
  hint?: string | undefined;
  to: string;
  params?: Record<string, string>;
};
const allResults: Result[] = [
  ...[...mainNav, ...settingsNav, ...resourceNav].map((n) => ({
    group: "Pages",
    label: n.label,
    hint: n.keywords,
    to: n.to,
  })),
  ...products.map((p) => ({
    group: "Market products",
    label: p.title,
    hint: p.creator + " " + p.category,
    to: "/affiliate/market/$productId",
    params: { productId: p.id },
  })),
  ...faqs.map((a) => ({
    group: "Help",
    label: a.q,
    hint: a.a,
    to: "/affiliate/help/$articleId",
    params: { articleId: a.id },
  })),
  ...guides.map((g) => ({
    group: "Guides",
    label: g.title,
    hint: g.summary,
    to: "/affiliate/guides/$slug",
    params: { slug: g.slug },
  })),
];
const suggestions = ["Market", "Referrals", "Wallet", "Bank Account", "Getting started"];

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allResults.filter((r) => r.group === "Pages").slice(0, 6);
    return allResults
      .filter((r) => (r.label + " " + (r.hint ?? "")).toLowerCase().includes(s))
      .slice(0, 10);
  }, [q]);
  useEffect(() => {
    setIdx(0);
  }, [q]);
  useEffect(() => {
    document.querySelector(`[data-search-idx="${idx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [idx]);
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);
  const go = (r: Result) => {
    onOpenChange(false);
    navigate({ to: r.to as never, params: r.params as never });
  };
  const groups = [...new Set(results.map((r) => r.group))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search pages, products and guides</DialogDescription>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && results[idx]) go(results[idx]);
            }}
            placeholder="Search pages, products, guides…"
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                inputRef.current?.focus();
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2" onKeyDown={(e) => handleArrowKeys(e, e.currentTarget, { selector: "[data-search-idx]" })}>
          {!q && (
            <div className="flex flex-wrap gap-1.5 px-2 pb-3 pt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="rounded-full bg-ice px-3 py-1 text-xs font-semibold text-cobalt hover:bg-cobalt-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-bold">No results for "{q}"</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a page name like "Wallet" or a product topic like "design".
              </p>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {q ? g : "Jump to"}
                </p>
                {results
                  .filter((r) => r.group === g)
                  .map((r) => {
                    const i = results.indexOf(r);
                    return (
                      <button
                        key={g + r.label}
                        data-search-idx={i}
                        aria-current={i === idx ? "true" : undefined}
                        onMouseEnter={() => setIdx(i)}
                        onFocus={() => setIdx(i)}
                        onClick={() => go(r)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                          i === idx ? "bg-ice text-cobalt" : "text-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate font-semibold">{r.label}</span>
                        {i === idx ? (
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-30" />
                        )}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Notifications ---------------- */
export function NotificationsButton() {
  const { state, update } = useAffiliate();
  return (
    <NotificationCentre
      items={state.notifications.map((n) => ({ ...n, to: affiliateNotificationLink(`${n.title} ${n.body ?? ""}`) }))}
      onRead={(id) => update((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }))}
      onReadAll={() => update((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }))}
      onDismiss={(ids) => {
        const removed = state.notifications.map((item, index) => ({ item, index })).filter((r) => ids.includes(r.item.id));
        update((s) => ({ notifications: s.notifications.filter((n) => !ids.includes(n.id)) }));
        return () => update((s) => ({ notifications: restoreAll(s.notifications, removed, sameId) }));
      }}
      preferencesTo="/affiliate/settings/notifications"
      emptyText="Account and affiliate updates, like new referral links, referrals and payouts, appear here."
    />
  );
}

/* ---------------- Profile menu ---------------- */
export function ProfileMenu({ dock }: { dock?: { collapsed: boolean; onToggle: () => void } }) {
  const { state } = useAffiliate();
  const fullName = `${state.profile.firstName} ${state.profile.lastName}`.trim() || "Affiliate";
  const [logout, setLogout] = useState(false);
  const navigate = useNavigate();
  const switcher = useProfileSwitch("Affiliate");
  const signOut = useDashboardSignOut();

  const menu = (
      <DropdownMenu>
        {dock ? (
          <DropdownMenuTrigger asChild>
            <SidebarAccountTrigger collapsed={dock.collapsed} avatar={<Avatar />} name={fullName} role="Affiliate" />
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger
            className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Account menu"
          >
            <Avatar />
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent align="end" side={dock ? "right" : "bottom"} sideOffset={dock ? 16 : 10} className="w-[min(92vw,304px)] p-1.5">
          <AccountMenuHeader
            avatar={<Avatar size="lg" />}
            name={`${state.profile.firstName} ${state.profile.lastName}`.trim() || "Affiliate"}
            email={state.profile.email || "No email added yet"}
            current="Affiliate"
          />
          <DropdownMenuSeparator />
          <SwitchProfileItems current="Affiliate" onPick={switcher.request} />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => navigate({ to: "/affiliate/settings/profile" })}
            className="gap-2.5 py-2 font-semibold"
          >
            <UserCog className="h-4 w-4 text-muted-foreground" />
            Manage Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setLogout(true)}
            className="gap-2.5 py-2 font-semibold text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
  return (
    <>
      {dock ? <SidebarDock collapsed={dock.collapsed} account={menu} onLogout={() => setLogout(true)} onToggle={dock.onToggle} /> : menu}
      {switcher.dialog}

      <LogoutDialog
        open={logout}
        onOpenChange={setLogout}
        role="Affiliate"
        avatar={<Avatar />}
        name={`${state.profile.firstName} ${state.profile.lastName}`.trim() || "Affiliate"}
        email={state.profile.email || "No email added yet"}
        onConfirm={signOut}
      />
    </>
  );
}
