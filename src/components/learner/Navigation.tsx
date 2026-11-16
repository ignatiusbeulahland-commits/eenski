import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { isLearnerLinkActive, learnerSections, type LearnerNavLink } from "@/lib/learner/nav";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { navKeyDown } from "@/lib/keyboard";
import { NavArt } from "@/components/shared/NavArt";
import { NavRibbon } from "@/components/shared/NavRibbon";

const row = "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-200";
const idle = "text-on-dark-muted hover:bg-sidebar-accent hover:text-on-dark";
const on = "nav-active";

export function LearnerNavigation({ collapsed = false, close }: { collapsed?: boolean; close?: () => void }) {
  const { state } = useLearner();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const view = useRouterState({ select: (s) => (s.location.search as { view?: string }).view });
  const cartCount = state.cart.reduce((a, c) => a + c.qty, 0);
  const groupActive = (children: readonly LearnerNavLink[]) => children.some((c) => isLearnerLinkActive(c, path, view));
  const activeGroups = () =>
    learnerSections.flatMap((s) => s.items).flatMap((n) => ("children" in n && groupActive(n.children) ? [n.label] : []));
  const [open, setOpen] = useState<string[]>(activeGroups);
  useEffect(() => {
    const g = activeGroups();
    if (g.length) setOpen((o) => [...new Set([...o, ...g])]);
  }, [path]);

  const wrap = (key: string, label: string, el: React.ReactElement) =>
    collapsed ? (
      <Tooltip key={key}>
        <TooltipTrigger asChild>{el}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    ) : (
      <Fragment key={key}>{el}</Fragment>
    );

  const link = (n: LearnerNavLink, sub = false) => {
    const active = isLearnerLinkActive(n, path, view);
    const count = n.to === "/learner/wishlist" && cartCount > 0 ? cartCount : 0;
    return wrap(
      n.label,
      n.label,
      <Link
        to={n.to}
        search={n.search ?? {}}
        onClick={close}
        aria-label={collapsed ? (count ? `${n.label}, ${count} in cart` : n.label) : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(row, collapsed ? "justify-center px-0" : sub && "min-h-9 pl-3 text-[13px]", active ? on : idle)}
      >
        <NavArt icon={n.icon} active={active} sub={sub && !collapsed} fallbackClassName={cn("shrink-0", sub ? "h-4 w-4" : "h-[18px] w-[18px]", active ? "text-lime" : "transition-[transform,color] group-hover:scale-110 group-hover:text-lime")} />
        {!collapsed && <span className="min-w-0 flex-1 truncate">{n.label}</span>}
        {count > 0 && (
          <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-extrabold tabular-nums", "bg-lime text-midnight", collapsed && "absolute right-1 top-0.5 h-4 min-w-4 px-1")} aria-label={collapsed ? undefined : `${count} in cart`}>
            {count}
          </span>
        )}
      </Link>,
    );
  };

  return (
    <nav aria-label="Learner navigation" onKeyDown={navKeyDown} className="relative flex flex-col px-3 pb-4">
      <NavRibbon />
      {learnerSections.map((sec, i) => (
        <div key={sec.label} className={cn(i > 0 && (collapsed ? "mt-2 border-t border-sidebar-border pt-2" : "mt-5"))}>
          {!collapsed && <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-on-dark-muted/70">{sec.label}</p>}
          <div className="flex flex-col gap-0.5">
            {sec.items.map((n) => {
              if ("href" in n)
                return wrap(
                  n.label,
                  `${n.label} (opens in a new tab)`,
                  <a href={n.href} target="_blank" rel="noopener noreferrer" aria-label={collapsed ? `${n.label} (opens in a new tab)` : undefined} className={cn(row, idle, collapsed && "justify-center px-0")}>
                    <NavArt icon={n.icon} fallbackClassName="h-[18px] w-[18px] shrink-0 transition-[transform,color] group-hover:scale-110 group-hover:text-lime" />
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">{n.label}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </>
                    )}
                  </a>,
                );
              if (!("children" in n)) return link(n);
              const childActive = groupActive(n.children);
              if (collapsed) return <Fragment key={n.label}>{n.children.map((c) => link(c, true))}</Fragment>;
              const expanded = open.includes(n.label);
              return (
                <div key={n.label}>
                  <Button
                    variant="ghost"
                    className={cn("h-10 w-full justify-start gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-sidebar-accent hover:text-on-dark", childActive ? "text-on-dark" : "text-on-dark-muted")}
                    aria-expanded={expanded}
                    data-nav-group-active={childActive}
                    onClick={() => setOpen((o) => (expanded ? o.filter((v) => v !== n.label) : [...o, n.label]))}
                  >
                    <NavArt icon={n.icon} active={childActive} fallbackClassName={cn("size-[18px]! shrink-0", childActive && "text-lime")} />
                    <span className="flex-1 text-left">{n.label}</span>
                    <ChevronDown className={cn("transition-transform duration-200", expanded && "rotate-180")} />
                  </Button>
                  {expanded && (
                    <div className="ml-[21px] mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border py-0.5 pl-2.5">{n.children.map((c) => link(c, true))}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** Bottom-of-sidebar invitation to live community learning. Points at the existing Events page. */
export function LearnerCommunityCard({ close }: { close?: () => void }) {
  return (
    <div className="mx-3 mb-4 overflow-hidden rounded-2xl bg-on-dark/10 p-4 ring-1 ring-on-dark/15">
      <div className="flex items-start gap-3">
        <BrandIcon src={brandArtwork.video} className="h-11 w-11" />
        <div className="min-w-0">
          <p className="text-sm font-extrabold leading-snug text-on-dark">Learn live with the Enski community</p>
          <p className="mt-1 text-xs leading-relaxed text-on-dark-muted">Join live sessions and meetups with creators. Attending one earns a participation badge.</p>
        </div>
      </div>
      <Button asChild size="sm" variant="lime" className="mt-3 w-full">
        <Link to="/learner/events" onClick={close}>Browse events</Link>
      </Button>
    </div>
  );
}
