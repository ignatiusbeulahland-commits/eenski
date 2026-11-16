import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/dashboard-ui/sheet";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";
import { Logo } from "@/components/affiliate/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PageSkeleton } from "@/components/affiliate/ui";
import { useCreator } from "@/lib/creator/store";
import { CreatorNavigation } from "./Navigation";
import { CreatorNotifications, CreatorProfileMenu, CreatorSearch, CreatorAvatar } from "./Header";
import { UniverseCelebration } from "./universe/Celebration";
import { cn } from "@/lib/utils";
import { creatorLinks } from "@/lib/creator/nav";
import { BackBar } from "@/components/shared/BackBar";
import { Kbd, OfflineBanner, useSearchHotkey, SkipLink } from "@/components/shared/ShellExtras";
export function CreatorShell() {
  const { state, update, ready, storageError } = useCreator();
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setDrawer(false);
  }, [path]);
  useSearchHotkey(() => setSearch(true));
  return (
    <TooltipProvider>
      <SkipLink />
      <div className="flex min-h-screen w-full">
        <aside
          aria-label="Sidebar"
          className={cn(
            "desk-rail sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar bg-sidebar-lit transition-[width] duration-300 ease-out lg:flex",
            state.collapsed ? "w-[84px]" : "w-[264px]",
          )}
        >
          <div className="flex h-16 shrink-0 items-center px-5">
            <Link to="/creator/dashboard" aria-label="Enski Creator home">
              <Logo
                className={state.collapsed ? "h-8 w-9 object-cover object-left" : "h-8 w-auto"}
              />
            </Link>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pt-3 [scrollbar-width:thin]">
            <CreatorNavigation collapsed={state.collapsed} />
          </div>
          <CreatorProfileMenu dock={{ collapsed: state.collapsed, onToggle: () => update({ collapsed: !state.collapsed }) }} />
        </aside>
        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent
            side="left"
            className="flex w-[86vw] max-w-[320px] flex-col gap-0 border-sidebar-border bg-sidebar bg-sidebar-lit p-0 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Creator navigation</SheetTitle>
            <SheetDescription className="sr-only">Enski Creator pages</SheetDescription>
            <div className="flex h-16 shrink-0 items-center justify-between px-5">
              <Logo className="h-8 w-auto" />
              <Button
                variant="ghost"
                size="icon"
                className="text-on-dark hover:bg-sidebar-accent hover:text-on-dark"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
              >
                <X />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <CreatorNavigation close={() => setDrawer(false)} />
            </div>
            <div className="flex items-center gap-3 border-t border-sidebar-border p-4">
              <CreatorAvatar />
              <div className="min-w-0 text-on-dark">
                <p className="truncate text-sm font-bold">
                  {state.profile.firstName} {state.profile.lastName}
                </p>
                <p className="text-xs text-on-dark-muted">Creator profile</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-header">
            <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
              <Button
                variant="quiet"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
                onClick={() => setDrawer(true)}
              >
                <Menu />
              </Button>
              <Button
                variant="quiet"
                className="hidden h-11 w-full max-w-md justify-start rounded-[14px] bg-soft font-semibold text-muted-foreground md:flex"
                onClick={() => setSearch(true)}
              >
                <Search />
                Search pages, products, guides…
                <span className="ml-auto"><Kbd>⌘K</Kbd></span>
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="quiet"
                  size="icon"
                  className="md:hidden"
                  aria-label="Search"
                  onClick={() => setSearch(true)}
                >
                  <Search />
                </Button>
                <ThemeToggle className="lg:hidden" />
                <CreatorNotifications />
                <div className="contents lg:hidden"><CreatorProfileMenu /></div>
              </div>
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1200px] flex-1 scroll-mt-20 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {storageError && (
              <p
                role="alert"
                className="mb-4 rounded-lg border bg-warning-soft p-3 text-sm text-warning-foreground"
              >
                Browser storage is unavailable. Changes may not survive a refresh.
              </p>
            )}
            <OfflineBanner />
            {ready ? (
              <div key={path} className="animate-rise">
                <BackBar home="/creator/dashboard" links={creatorLinks} />
                <Outlet />
              </div>
            ) : (
              <PageSkeleton />
            )}
          </main>
        </div>
        {ready && <UniverseCelebration />}
        <CreatorSearch open={search} onOpenChange={setSearch} />
      </div>
    </TooltipProvider>
  );
}
