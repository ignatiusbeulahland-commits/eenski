import { Link, useMatchRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/dashboard-ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Phone/tablet replacement for sideways-scrolling pill rows.
 * Callers hide this at `md` and up, where their pill rows wrap instead of scrolling.
 */
export type SectionOption = { value: string; label: string; count?: ReactNode | undefined; icon?: LucideIcon | undefined; done?: boolean | undefined };
export type SectionLink = { to: string; label: string; count?: ReactNode | undefined; icon?: LucideIcon | undefined; exact?: boolean | undefined };

function Trigger({ heading, current, compact }: { heading: string; current?: SectionOption | SectionLink | undefined; compact?: boolean | undefined }) {
  const Icon = current?.icon;
  return (
    <DropdownMenuTrigger className={cn(
      "section-dropdown-trigger group flex min-w-0 items-center rounded-full border-[1.5px] border-line bg-card text-left shadow-sm transition-colors hover:border-cobalt-100 data-[state=open]:border-cobalt",
      compact ? "h-10 max-w-full gap-2 py-1 pl-1.5 pr-3" : "h-12 w-full gap-3 px-4",
    )}>
      {Icon && (
        <span className={cn("grid shrink-0 place-items-center rounded-full bg-ice text-cobalt", compact ? "h-7 w-7" : "h-7 w-7")} aria-hidden="true">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <span className={cn("min-w-0 flex-1 leading-tight", compact && !Icon && "pl-2")}>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />{heading}</span>
        <span className="block truncate text-sm font-extrabold text-foreground">{current?.label ?? "Choose"}</span>
      </span>
      {!compact && current?.count !== undefined && (
        <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-muted-foreground">{current.count}</span>
      )}
      <ChevronDown className="h-4 w-4 shrink-0 text-cobalt transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
    </DropdownMenuTrigger>
  );
}

function Row({ item, on }: { item: SectionOption | SectionLink; on: boolean }) {
  const Icon = item.icon;
  const done = "done" in item && item.done;
  return (
    <>
      {Icon && <Icon className={cn("h-4 w-4 shrink-0", on ? "text-cobalt" : "text-muted-foreground")} aria-hidden="true" />}
      <span className={cn("min-w-0 flex-1 truncate", on && "font-extrabold text-cobalt")}>{item.label}</span>
      {done && <span className="text-[11px] font-bold text-success">Done</span>}
      {item.count !== undefined && <span className="text-xs font-bold tabular-nums text-muted-foreground">{item.count}</span>}
      <Check className={cn("h-4 w-4 shrink-0 text-cobalt", !on && "invisible")} aria-hidden="true" />
    </>
  );
}

const menuClass =
  "max-h-[min(70vh,420px)] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-2xl p-1.5";
const itemClass = "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold";

/** Dropdown that switches local state (filters, tabs, families). */
export function SectionDropdown({ heading, menuHeading, options, value, onChange, className }: {
  heading: string;
  menuHeading?: string;
  options: readonly SectionOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className={cn("section-dropdown", className)}>
      <DropdownMenu>
        <Trigger heading={heading} current={current} />
        <DropdownMenuContent align="start" className={menuClass}>
          <DropdownMenuLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{menuHeading ?? heading}</DropdownMenuLabel>
          {options.map((o) => (
            <DropdownMenuItem key={o.value} className={itemClass} aria-current={o.value === value ? "true" : undefined} onSelect={() => onChange(o.value)}>
              <Row item={o} on={o.value === value} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Dropdown of page links (settings sections, sub-pages). `compact` suits the top-right page slot. */
export function SectionNavDropdown({ heading, links, className, compact }: {
  heading: string;
  links: readonly SectionLink[];
  className?: string;
  compact?: boolean;
}) {
  const match = useMatchRoute();
  const isOn = (l: SectionLink) => Boolean(match({ to: l.to as "/", fuzzy: !l.exact }));
  const current = links.find(isOn);
  return (
    <nav aria-label={heading} className={cn("section-dropdown", className)}>
      <DropdownMenu>
        <Trigger heading={heading} current={current} compact={compact} />
        <DropdownMenuContent align={compact ? "end" : "start"} className={cn(menuClass, compact && "w-[min(18rem,calc(100vw-2rem))]")}>
          {links.map((l) => {
            const on = isOn(l);
            return (
              <DropdownMenuItem key={l.to} asChild className={itemClass}>
                <Link to={l.to as "/"} aria-current={on ? "page" : undefined}>
                  <Row item={l} on={on} />
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
