import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { creatorNav, type CreatorNavLink } from "@/lib/creator/nav";
import { cn } from "@/lib/utils";
import { navKeyDown } from "@/lib/keyboard";
import { NavArt } from "@/components/shared/NavArt";
import { NavRibbon } from "@/components/shared/NavRibbon";
const isActive = (path: string, to: string) => path === to || path.startsWith(to + "/");
export function CreatorNavigation({
  collapsed = false,
  close,
}: {
  collapsed?: boolean;
  close?: () => void;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const groupFor = (p: string) =>
    creatorNav.find((n) => "children" in n && n.children.some((c) => isActive(p, c.to)))?.label;
  const [open, setOpen] = useState<string[]>(() => {
    const g = groupFor(path);
    return g ? [g] : [];
  });
  useEffect(() => {
    const g = groupFor(path);
    if (g) setOpen((o) => (o.includes(g) ? o : [...o, g]));
  }, [path]);
  const item = (n: CreatorNavLink, sub = false) => {
    const active = isActive(path, n.to);
    const link = (
      <Link
        to={n.to}
        onClick={close}
        aria-label={collapsed ? n.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
          collapsed ? "justify-center" : sub && "pl-7",
          active ? "nav-active" : "text-on-dark-muted hover:bg-sidebar-accent hover:text-on-dark",
        )}
      >
        <NavArt icon={n.icon} active={active} sub={sub && !collapsed} fallbackClassName={cn("h-[18px] w-[18px] shrink-0", active ? "text-lime" : "transition-colors group-hover:text-lime")} />
        {!collapsed && <span>{n.label}</span>}
      </Link>
    );
    return collapsed ? (
      <Tooltip key={n.to}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{n.label}</TooltipContent>
      </Tooltip>
    ) : (
      <div key={n.to}>{link}</div>
    );
  };
  return (
    <nav aria-label="Creator navigation" onKeyDown={navKeyDown} className="relative flex flex-col gap-1 px-3 pb-4">
      <NavRibbon />
      {creatorNav.map((n) => {
        if (!("children" in n)) return item(n);
        const expanded = open.includes(n.label);
        const childActive = n.children.some((c) => isActive(path, c.to));
        if (collapsed)
          return (
            <div key={n.label} className="my-1 flex flex-col gap-1 border-y border-sidebar-border py-1">
              {n.children.map((c) => item(c, true))}
            </div>
          );
        return (
          <div key={n.label}>
            <Button
              variant="ghost"
              className={cn(
                "h-10 w-full justify-start gap-3 px-3 text-sm font-semibold hover:bg-sidebar-accent hover:text-on-dark",
                childActive ? "text-on-dark" : "text-on-dark-muted",
              )}
              aria-expanded={expanded}
              data-nav-group-active={childActive}
              onClick={() =>
                setOpen((o) => (expanded ? o.filter((v) => v !== n.label) : [...o, n.label]))
              }
            >
              <NavArt icon={n.icon} active={childActive} fallbackClassName={cn("h-[18px] w-[18px] shrink-0", childActive && "text-lime")} />
              <span className="flex-1 text-left">{n.label}</span>
              <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
            </Button>
            {expanded && (
              <div className="mt-1 flex flex-col gap-1">{n.children.map((c) => item(c, true))}</div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
