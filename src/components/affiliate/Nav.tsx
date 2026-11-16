import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { mainNav, resourceNav, settingsIcon as SettingsIcon, settingsNav, type NavItem } from "@/lib/affiliate/nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { cn } from "@/lib/utils";
import { navKeyDown } from "@/lib/keyboard";
import { NavRibbon } from "@/components/shared/NavRibbon";
import { Button } from "@/components/dashboard-ui/button";
import { BrandIcon, iconArtwork } from "./BrandIcon";

function Item({ item, collapsed, active, sub, onNavigate }: { item: NavItem; collapsed?: boolean | undefined; active: boolean; sub?: boolean; onNavigate?: (() => void) | undefined }) {
  const link = (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 text-sm font-semibold transition-colors",
        sub ? "h-9 pl-10" : "h-10",
        collapsed && "justify-center px-0",
        active ? "nav-active" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      {iconArtwork.has(item.icon)
        ? <BrandIcon src={iconArtwork.get(item.icon)!} className={cn("nav-art", sub ? "h-5 w-5" : "h-6 w-6", active && "is-active")} />
        : <item.icon className={cn("shrink-0", sub ? "h-4 w-4" : "h-[18px] w-[18px]", active ? "text-lime" : "transition-colors group-hover:text-lime")} />}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SectionLabel({ children, collapsed }: { children: string; collapsed?: boolean | undefined }) {
  if (collapsed) return <div className="mx-3 my-3 h-px bg-sidebar-border" />;
  return <p className="px-3 pb-1.5 pt-5 text-xs font-bold uppercase tracking-[0.14em] text-on-dark-muted/60">{children}</p>;
}

export function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const is = (to: string) => path === to || path.startsWith(to + "/");
  const inSettings = path.startsWith("/affiliate/settings");
  const [open, setOpen] = useState(inSettings);
  const expanded = open || (collapsed ?? false);

  return (
    <nav className="relative flex flex-col gap-0.5 px-3" aria-label="Affiliate navigation" onKeyDown={navKeyDown}>
      <NavRibbon />
      <SectionLabel collapsed={collapsed}>Main menu</SectionLabel>
      {mainNav.map((i) => <Item key={i.to} item={i} collapsed={collapsed} active={is(i.to)} onNavigate={onNavigate} />)}
      <SectionLabel collapsed={collapsed}>Account</SectionLabel>
      {!collapsed && (
        <Button variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="affiliate-settings-nav"
          data-nav-group-active={inSettings}
          className={cn("flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", inSettings ? "text-sidebar-accent-foreground" : "text-sidebar-foreground")}
        >
          {iconArtwork.has(SettingsIcon) ? <BrandIcon src={iconArtwork.get(SettingsIcon)!} className={cn("nav-art h-6 w-6", inSettings && "is-active")} /> : <SettingsIcon className={cn("h-[18px] w-[18px]", inSettings && "text-lime")} />}
          <span className="flex-1 text-left">Settings</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
        </Button>
      )}
      <div id="affiliate-settings-nav" inert={!expanded} className={cn("grid transition-all duration-300 ease-out", expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        {/* Hidden links leave the Tab order (inert); padding keeps focus rings from being clipped. */}
        <div className={cn("-mx-1 flex flex-col gap-0.5 overflow-hidden px-1", expanded && "-my-1 py-1")}>
          {settingsNav.map((i) => <Item key={i.to} item={i} sub={!collapsed} collapsed={collapsed} active={is(i.to)} onNavigate={onNavigate} />)}
        </div>
      </div>
      <SectionLabel collapsed={collapsed}>Support</SectionLabel>
      {resourceNav.map((i) => <Item key={i.to} item={i} collapsed={collapsed} active={is(i.to)} onNavigate={onNavigate} />)}
    </nav>
  );
}
