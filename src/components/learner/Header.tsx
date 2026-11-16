import { LogoutDialog } from "@/components/shared/BrandDialog";
import { useDashboardSignOut } from "@/lib/dashboard/account";
import { restoreAll, sameId } from "@/lib/shared/listUndo";
import { Link } from "@tanstack/react-router";
import { LogOut, Search, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/dashboard-ui/dropdown-menu";
import { SidebarAccountTrigger, SidebarDock } from "@/components/shared/SidebarDock";
import { AccountMenuHeader, SwitchProfileItems, useProfileSwitch } from "@/components/shared/ProfileSwitcher";
import { events, resources } from "@/lib/learner/catalog";
import { helpArticles, learnerGuides } from "@/lib/learner/help";
import { learnerLinks } from "@/lib/learner/nav";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { searchListKeyDown } from "@/lib/keyboard";
import { NotificationCentre } from "@/components/shared/NotificationCentre";
import { learnerNotificationLink } from "@/lib/shared/notificationLinks";

export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "L";
export function LearnerAvatar({ size = "md" }: { size?: "md" | "lg" }) {
  const { state } = useLearner();
  const cls = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return state.profile.photo ? (
    <img src={state.profile.photo} alt="" className={cn("shrink-0 rounded-full object-cover ring-2 ring-lime", cls)} />
  ) : (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-cobalt font-bold text-primary-foreground ring-2 ring-lime", cls)}>{initials(state.profile.fullName)}</span>
  );
}

export function NotificationsMenu() {
  const { state, update } = useLearner();
  return (
    <NotificationCentre
      items={state.notifications.map((n) => ({ ...n, to: learnerNotificationLink(n) }))}
      onRead={(id) => update((s) => ({ notifications: s.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)) }))}
      onReadAll={() => update((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }))}
      onDismiss={(ids) => {
        const removed = state.notifications.map((item, index) => ({ item, index })).filter((r) => ids.includes(r.item.id));
        update((s) => ({ notifications: s.notifications.filter((n) => !ids.includes(n.id)) }));
        return () => update((s) => ({ notifications: restoreAll(s.notifications, removed, sameId) }));
      }}
      preferencesTo="/learner/settings/notifications"
      emptyText="Updates about your purchases, events and achievements appear here."
    />
  );
}

export function CartButton() {
  const { state } = useLearner();
  const count = state.cart.reduce((a, c) => a + c.qty, 0);
  return (
    <Button asChild variant="quiet" size="icon" className="relative">
      <Link to="/learner/cart" aria-label={count ? `Cart, ${count} items` : "Cart"}>
        <ShoppingCart />
        {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cobalt px-1 text-xs font-extrabold text-primary-foreground">{count}</span>}
      </Link>
    </Button>
  );
}

export function LearnerProfileMenu({ dock }: { dock?: { collapsed: boolean; onToggle: () => void } }) {
  const { state } = useLearner();
  const [logout, setLogout] = useState(false);
  const switcher = useProfileSwitch("Learner");
  const signOut = useDashboardSignOut();
  const name = state.profile.fullName || "Learner";
  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {dock
          ? <SidebarAccountTrigger collapsed={dock.collapsed} avatar={<LearnerAvatar />} name={name} role="Learner" />
          : <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Account menu"><LearnerAvatar /></Button>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={dock ? "right" : "bottom"} sideOffset={dock ? 16 : 10} className="w-[min(92vw,304px)] p-1.5">
        <AccountMenuHeader avatar={<LearnerAvatar />} name={name} email={state.profile.email || "No email added yet"} current="Learner" />
        <DropdownMenuSeparator />
        <SwitchProfileItems current="Learner" onPick={switcher.request} />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2.5 py-2 font-semibold"><Link to="/learner/settings/profile"><UserRound className="text-muted-foreground" /> Manage Profile</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2.5 py-2 font-semibold text-destructive focus:text-destructive" onSelect={() => setLogout(true)}><LogOut /> Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return (
    <>
      {dock ? <SidebarDock collapsed={dock.collapsed} account={menu} onLogout={() => setLogout(true)} onToggle={dock.onToggle} /> : menu}
      {switcher.dialog}
      <LogoutDialog open={logout} onOpenChange={setLogout} role="Learner" avatar={<LearnerAvatar />} name={name} email={state.profile.email || "No email added yet"} onConfirm={signOut} />
    </>
  );
}

export function LearnerSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const m = (t: string) => t.toLowerCase().includes(q.trim().toLowerCase());
  const close = () => { setQ(""); onOpenChange(false); };
  const cls = "flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-ice focus-visible:bg-ice focus-visible:outline-offset-[-3px]";
  const tag = (t: string) => <span className="shrink-0 text-xs font-semibold text-muted-foreground">{t}</span>;
  const pages = q ? learnerLinks.filter((n) => m(n.label)) : learnerLinks.slice(0, 6);
  const rs = q ? resources.filter((r) => m(r.title) || m(r.creator)).slice(0, 5) : [];
  const es = q ? events.filter((e) => m(e.title) || m(e.host)).slice(0, 5) : [];
  const gs = q ? learnerGuides.filter((g) => m(g.title)).slice(0, 4) : [];
  const as = q ? helpArticles.filter((a) => m(a.title)).slice(0, 4) : [];
  const none = !pages.length && !rs.length && !es.length && !gs.length && !as.length;
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setQ(""); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Search Enski</DialogTitle>
          <DialogDescription>Pages, resources, events, guides and help</DialogDescription>
        </DialogHeader>
        <div className="space-y-3" onKeyDown={searchListKeyDown}>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input aria-describedby="learner-search-hint" aria-label="Search Enski" placeholder="Search resources, events, guides…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="-mx-1 max-h-[55vh] overflow-y-auto p-1">
          {pages.map((n) => <Link key={n.label} to={n.to} search={n.search ?? {}} className={cls} onClick={close}><span className="truncate">{n.label}</span>{tag("Page")}</Link>)}
          {rs.map((r) => <Link key={r.id} to="/learner/resources/$resourceId" params={{ resourceId: r.id }} className={cls} onClick={close}><span className="truncate">{r.title}</span>{tag(r.type)}</Link>)}
          {es.map((e) => <Link key={e.id} to="/learner/events/$eventId" params={{ eventId: e.id }} className={cls} onClick={close}><span className="truncate">{e.title}</span>{tag("Event")}</Link>)}
          {gs.map((g) => <Link key={g.id} to="/learner/guides/$guideId" params={{ guideId: g.id }} className={cls} onClick={close}><span className="truncate">{g.title}</span>{tag("Guide")}</Link>)}
          {as.map((a) => <Link key={a.id} to="/learner/help/$articleId" params={{ articleId: a.id }} className={cls} onClick={close}><span className="truncate">{a.title}</span>{tag("Help")}</Link>)}
          {none && <p role="status" className="p-5 text-center text-sm text-muted-foreground">No results for “{q}”</p>}
        </div>
        </div>
        <p id="learner-search-hint" className="text-xs text-muted-foreground">Use ↑ ↓ to move through results, Enter to open, Esc to close.</p>
      </DialogContent>
    </Dialog>
  );
}
