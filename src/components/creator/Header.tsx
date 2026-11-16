import { LogoutDialog } from "@/components/shared/BrandDialog";
import { useDashboardSignOut } from "@/lib/dashboard/account";
import { searchListKeyDown } from "@/lib/keyboard";
import { Link } from "@tanstack/react-router";
import { Search, UserRound, LogOut } from "lucide-react";
import { AccountMenuHeader, SwitchProfileItems, useProfileSwitch } from "@/components/shared/ProfileSwitcher";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/dashboard-ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { creatorArticles, creatorGuides } from "@/lib/creator/data";
import { creatorLinks } from "@/lib/creator/nav";
import { useCreator } from "@/lib/creator/store";
import { Character } from "./universe/Character";
import { progression } from "@/lib/creator/universe/rules";
import { ItemLink } from "./shared";
import { NotificationCentre } from "@/components/shared/NotificationCentre";
import { creatorNotificationLink } from "@/lib/shared/notificationLinks";
import { SidebarAccountTrigger, SidebarDock } from "@/components/shared/SidebarDock";
export function CreatorAvatar() {
  const { state } = useCreator();
  if (state.universe.chosen)
    return (
      <span className="grid h-10 w-10 overflow-hidden rounded-full bg-ice ring-2 ring-lime">
        <Character
          style={state.universe.style}
          level={progression(state.universe.demoEligibleEarningsUsd).level}
          className="h-10 w-10"
        />
      </span>
    );
  return state.profile.photo ? (
    <img src={state.profile.photo} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
  ) : (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-cobalt text-sm font-bold text-primary-foreground ring-2 ring-lime">
      {state.profile.firstName[0]}
      {state.profile.lastName[0]}
    </span>
  );
}
export function CreatorNotifications() {
  const { state, update } = useCreator();
  return (
    <NotificationCentre
      items={state.activity
        .slice()
        .reverse()
        .filter((a) => !state.notificationsDismissed.includes(a.id))
        .map((a) => ({ id: a.id, title: a.text, date: a.date, read: state.notificationsRead.includes(a.id), to: creatorNotificationLink(a.text) }))}
      onDismiss={(ids) => {
        update((s) => ({ notificationsDismissed: [...new Set([...s.notificationsDismissed, ...ids])] }));
        return () => update((s) => ({ notificationsDismissed: s.notificationsDismissed.filter((id) => !ids.includes(id)) }));
      }}
      onRead={(id) => update((s) => ({ notificationsRead: s.notificationsRead.includes(id) ? s.notificationsRead : [...s.notificationsRead, id] }))}
      onReadAll={() => update((s) => ({ notificationsRead: s.activity.map((a) => a.id) }))}
      preferencesTo="/creator/settings/notifications"
      emptyText="New orders, reviews, leads and payouts from your store appear here."
      paused={!state.notifications.inApp}
    />
  );
}
export function CreatorProfileMenu({ dock }: { dock?: { collapsed: boolean; onToggle: () => void } }) {
  const { state } = useCreator();
  const [logout, setLogout] = useState(false);
  const switcher = useProfileSwitch("Creator");
  const signOut = useDashboardSignOut();
  const name = `${state.profile.firstName} ${state.profile.lastName}`.trim() || "Creator";
  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {dock ? (
          <SidebarAccountTrigger collapsed={dock.collapsed} avatar={<CreatorAvatar />} name={name} role="Creator" />
        ) : (
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Account menu">
            <CreatorAvatar />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={dock ? "right" : "bottom"} sideOffset={dock ? 16 : 10} className="w-[min(92vw,304px)] p-1.5">
        <AccountMenuHeader avatar={<CreatorAvatar />} name={name} email={state.profile.email || "No email added yet"} current="Creator" />
        <DropdownMenuSeparator />
        <SwitchProfileItems current="Creator" onPick={switcher.request} />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2.5 py-2 font-semibold">
          <Link to="/creator/settings/manage-profile">
            <UserRound className="text-muted-foreground" />
            Manage Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2.5 py-2 font-semibold text-destructive focus:text-destructive" onSelect={() => setLogout(true)}>
          <LogOut />
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
        role="Creator"
        avatar={<CreatorAvatar />}
        name={name}
        email={state.profile.email || "No email added yet"}
        onConfirm={signOut}
      />
    </>
  );
}
export function CreatorSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { state } = useCreator();
  const [q, setQ] = useState("");
  const matches = (text: string) => text.toLowerCase().includes(q.toLowerCase());
  const close = () => {
    setQ("");
    onOpenChange(false);
  };
  const cls = "block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-ice focus-visible:bg-ice focus-visible:outline-offset-[-3px]";
  const pages = creatorLinks.filter((n) => matches(n.label)).slice(0, 5);
  const items = q ? state.items.filter((i) => !i.binnedAt && matches(i.title)) : [];
  const guides = q ? creatorGuides.filter((g) => matches(g.title)) : [];
  const articles = q ? creatorArticles.filter((a) => matches(a.title)) : [];
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setQ("");
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Search Enski</DialogTitle>
          <DialogDescription>Pages, products, guides and help</DialogDescription>
        </DialogHeader>
        <div className="space-y-3" onKeyDown={searchListKeyDown}>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search Enski"
            aria-describedby="creator-search-hint"
            placeholder="Search pages, products, guides…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="-mx-1 max-h-[55vh] overflow-y-auto p-1">
          {pages.map((n) => (
            <Link key={n.to} to={n.to} className={cls} onClick={close}>
              {n.label}
            </Link>
          ))}
          {items.map((i) => (
            <ItemLink key={i.id} item={i} className={cls} onClick={close}>
              {i.title}
            </ItemLink>
          ))}
          {guides.map((g) => (
            <Link
              key={g.id}
              to="/creator/guides/$guideId"
              params={{ guideId: g.id }}
              className={cls}
              onClick={close}
            >
              {g.title}
            </Link>
          ))}
          {articles.map((a) => (
            <Link
              key={a.id}
              to="/creator/help/$articleId"
              params={{ articleId: a.id }}
              className={cls}
              onClick={close}
            >
              {a.title}
            </Link>
          ))}
          {!pages.length &&
            !items.length &&
            !guides.length &&
            !articles.length && (
              <p role="status" className="p-5 text-sm text-muted-foreground">No matching results</p>
            )}
        </div>
        </div>
        <p id="creator-search-hint" className="text-xs text-muted-foreground">Use ↑ ↓ to move through results, Enter to open, Esc to close.</p>
      </DialogContent>
    </Dialog>
  );
}
