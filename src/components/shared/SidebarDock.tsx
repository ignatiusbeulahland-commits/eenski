import { ChevronsUpDown, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { cn } from "@/lib/utils";

/** Round glass control used inside the dark desktop sidebar. */
export const dockBtn =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-on-dark/15 bg-on-dark/[0.06] text-on-dark-muted transition-colors hover:border-lime/50 hover:bg-sidebar-accent hover:text-on-dark focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] [&_svg]:h-[18px] [&_svg]:w-[18px]";

function Tip({ label, show, children }: { label: string; show: boolean; children: ReactNode }) {
  if (!show) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Account card that opens the role's account menu (use as a DropdownMenuTrigger child). */
export const SidebarAccountTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button"> & {
  collapsed: boolean; avatar: ReactNode; name: string; role: string;
}>(function SidebarAccountTrigger({ collapsed, avatar, name, role, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={`Account menu for ${name}`}
      className={cn(
        "group flex items-center rounded-full border border-on-dark/15 bg-on-dark/[0.06] text-left transition-colors hover:border-lime/50 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] data-[state=open]:border-lime/60 data-[state=open]:bg-sidebar-accent",
        collapsed ? "mx-auto h-12 w-12 justify-center" : "h-14 w-full gap-3 pl-1.5 pr-3",
        className,
      )}
      {...props}
    >
      {avatar}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-on-dark">{name}</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-on-dark-muted"><span className="neon-dot !h-1.5 !w-1.5" aria-hidden="true" />{role} profile</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-on-dark-muted transition-colors group-hover:text-lime" />
        </>
      )}
    </button>
  );
});

/**
 * Desktop-only foot of the sidebar: account card, theme, log out and collapse.
 * Phones and tablets keep these in the top bar, so this renders only inside the desktop aside.
 */
export function SidebarDock({ collapsed, account, onLogout, onToggle }: {
  collapsed: boolean;
  account: ReactNode;
  onLogout: () => void;
  onToggle: () => void;
}) {
  return (
    <div data-surface="dark" className="shrink-0 border-t border-sidebar-border p-3">
      {account}
      <div className={cn("mt-2.5 flex gap-1.5", collapsed ? "flex-col items-center" : "items-center")}>
        <Tip label="Theme" show={collapsed}>
          <span className="inline-flex"><ThemeToggle className={cn(dockBtn, "h-10 w-10")} /></span>
        </Tip>
        <Tip label="Log out" show={collapsed}>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className={cn(dockBtn, !collapsed && "flex w-auto flex-1 items-center justify-center gap-2 px-4 text-sm font-bold")}
          >
            <LogOut />
            {!collapsed && <span>Log out</span>}
          </button>
        </Tip>
        <Tip label="Expand sidebar" show={collapsed}>
          <button type="button" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? undefined : "Collapse sidebar"} className={dockBtn}>
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </button>
        </Tip>
      </div>
    </div>
  );
}
