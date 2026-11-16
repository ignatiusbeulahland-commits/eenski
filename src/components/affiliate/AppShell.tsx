import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X, ArrowLeftRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/dashboard-ui/sheet";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NavList } from "./Nav";
import { mainNav, resourceNav, settingsNav } from "@/lib/affiliate/nav";
const backLinks = [...mainNav, ...settingsNav, ...resourceNav];
import { BackBar } from "@/components/shared/BackBar";
import { Kbd, OfflineBanner, SkipLink, useSearchHotkey } from "@/components/shared/ShellExtras";
import { Avatar, iconBtn, NotificationsButton, ProfileMenu, SearchDialog } from "./HeaderMenus";
import { useAffiliate } from "@/lib/affiliate/store";
import { PageSkeleton } from "./ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/dashboard-ui/button";

export function AppShell() {
  const { state, update, ready } = useAffiliate();
  const collapsed = state.sidebarCollapsed;
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const loading = useRouterState({ select: (s) => s.isLoading });

  useSearchHotkey(() => setSearch(true));
  useEffect(() => { setDrawer(false); }, [path]);

  return (
    <TooltipProvider delayDuration={150}>
      <SkipLink />
      <div className="flex min-h-screen w-full">
        {/* Desktop sidebar */}
        <aside aria-label="Sidebar" className={cn("desk-rail sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar bg-sidebar-lit transition-[width] duration-300 ease-out lg:flex", collapsed ? "w-[84px]" : "w-[264px]")}>
          <div className={cn("flex h-16 items-center", collapsed ? "justify-center" : "px-6")}>
            <Link to="/affiliate/dashboard" aria-label="Enski home">
              {collapsed ? <Logo className="h-8 w-9 object-cover object-left" /> : <Logo className="h-8 w-auto" />}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:thin]"><NavList collapsed={collapsed} /></div>
          <ProfileMenu dock={{ collapsed, onToggle: () => update({ sidebarCollapsed: !collapsed }) }} />
        </aside>

        {/* Mobile drawer */}
        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent side="left" className="flex w-[86vw] max-w-[320px] flex-col gap-0 border-sidebar-border bg-sidebar bg-sidebar-lit p-0 [&>button]:hidden">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Affiliate navigation</SheetDescription>
            <div className="flex h-16 shrink-0 items-center justify-between px-5">
              <Logo className="h-8 w-auto" />
              <button onClick={() => setDrawer(false)} className="grid h-10 w-10 place-items-center rounded-lg text-on-dark hover:bg-sidebar-accent" aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain pb-6"><NavList onNavigate={() => setDrawer(false)} /></div>
            <div className="flex items-center gap-3 border-t border-sidebar-border p-4">
              <Avatar />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-on-dark">{state.profile.firstName} {state.profile.lastName}</p>
                <p className="truncate text-xs text-on-dark-muted">{state.role} profile</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-header">
            <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
              <button className={cn(iconBtn, "lg:hidden")} onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
              <button onClick={() => setSearch(true)} aria-keyshortcuts="Control+K Meta+K /" className="hidden h-11 w-full max-w-md items-center gap-2.5 rounded-[14px] border-[1.5px] bg-soft px-4 font-semibold text-sm text-muted-foreground transition-colors hover:border-cobalt-100 hover:bg-card md:flex">
                <Search className="h-4 w-4" /><span className="flex-1 text-left">Search pages, products, guides…</span>
                <Kbd>⌘K</Kbd>
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button className={cn(iconBtn, "md:hidden")} onClick={() => setSearch(true)} aria-label="Search"><Search className="h-[18px] w-[18px]" /></button>
                <ThemeToggle className="lg:hidden" />
                <NotificationsButton />
                <div className="contents lg:hidden"><ProfileMenu /></div>
              </div>
            </div>
            <div className={cn("h-0.5 origin-left bg-sky transition-transform duration-500", loading ? "scale-x-75" : "scale-x-0")} />
          </header>

          {state.role !== "Affiliate" && (
            <div data-surface="dark" className="flex flex-wrap items-center gap-3 border-b bg-midnight px-4 py-2.5 text-sm text-on-dark sm:px-6 lg:px-8">
              <ArrowLeftRight className="h-4 w-4 shrink-0 text-lime" />
              <p className="min-w-0 flex-1">You're on the <b>{state.role}</b> profile. That experience is coming in a later phase — affiliate pages are shown below.</p>
              <Button size="sm" variant="lime" onClick={() => update({ role: "Affiliate" })}>Back to Affiliate</Button>
            </div>
          )}

          <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1200px] flex-1 scroll-mt-20 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <OfflineBanner />
            {ready ? <div key={path} className="animate-rise"><BackBar home="/affiliate/dashboard" links={backLinks} /><Outlet /></div> : <PageSkeleton />}
          </main>
        </div>
      </div>
      <SearchDialog open={search} onOpenChange={setSearch} />
    </TooltipProvider>
  );
}
