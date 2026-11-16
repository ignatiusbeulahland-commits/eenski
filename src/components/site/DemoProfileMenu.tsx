import { Check, ChevronDown, Heart, LayoutDashboard, LogOut, Receipt } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DASHBOARD_HOME } from "@/lib/dashboard/account";
import { demoSession, type DemoProfile } from "@/lib/demo/profile";
import { openShopPanel } from "@/lib/shop/panel";
import { cn } from "@/lib/utils";

import { accountTypes, type AccountType } from "./data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const typeLabel = (t: AccountType) => accountTypes.find((a) => a.id === t)?.label ?? "Learner";

/** Signed-in profile in the top bar: switch Learner / Creator / Affiliate, see orders, sign out. */
export function DemoProfileMenu({ profile, className }: { profile: DemoProfile; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "ml-1 inline-flex h-10 items-center gap-2 rounded-full bg-primary-foreground/10 pr-3 pl-1 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime",
          className,
        )}
        aria-label={`Your profile: ${profile.name}, ${typeLabel(profile.type)}`}
      >
        <span className="grid size-8 place-items-center rounded-full bg-lime text-xs text-midnight">{initials(profile.name)}</span>
        <span className="max-w-[9rem] truncate">{typeLabel(profile.type)}</span>
        <ChevronDown className="size-4 opacity-80" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <ProfileMenuItems profile={profile} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileMenuItems({ profile }: { profile: DemoProfile }) {
  return (
    <>
      <DropdownMenuLabel className="space-y-0.5">
        <span className="block truncate text-sm font-extrabold">{profile.name}</span>
        <span className="block truncate text-xs font-semibold text-muted-foreground">{profile.email}</span>
        <span className="mt-1 inline-block rounded-full bg-ice px-2 py-0.5 text-[11px] font-extrabold text-brand">{typeLabel(profile.type)} profile</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="font-semibold">
        <Link to={DASHBOARD_HOME[profile.type]}>
          <LayoutDashboard className="size-4" aria-hidden /> My {typeLabel(profile.type).toLowerCase()} dashboard
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">View Enski as</DropdownMenuLabel>
      {accountTypes.map((t) => (
        <DropdownMenuItem key={t.id} onSelect={() => demoSession.switchTo(t.id)} className="font-semibold">
          <Check className={cn("size-4", t.id === profile.type ? "opacity-100" : "opacity-0")} aria-hidden />
          {t.label}
          <span className="ml-auto text-xs text-muted-foreground">{t.blurb}</span>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => openShopPanel("orders")} className="font-semibold">
        <Receipt className="size-4" aria-hidden /> My orders
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="font-semibold">
        <Link to="/wishlist">
          <Heart className="size-4" aria-hidden /> Wishlist
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => demoSession.signOut()} className="font-semibold">
        <LogOut className="size-4" aria-hidden /> Sign out
      </DropdownMenuItem>
    </>
  );
}

/** Mobile menu version: same choices as plain buttons. */
export function DemoProfilePanel({ profile, onDone }: { profile: DemoProfile; onDone: () => void }) {
  return (
    <div className="mt-4 rounded-2xl bg-primary-foreground/10 p-4 text-primary-foreground">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime text-sm font-extrabold text-midnight">{initials(profile.name)}</span>
        <div className="min-w-0">
          <p className="truncate font-extrabold">{profile.name}</p>
          <p className="truncate text-sm text-on-blue-muted">{typeLabel(profile.type)} profile</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="View Enski as">
        {accountTypes.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={t.id === profile.type}
            onClick={() => demoSession.switchTo(t.id)}
            className={cn(
              "min-h-11 rounded-full text-sm font-extrabold transition-colors",
              t.id === profile.type ? "bg-lime text-midnight" : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Link
        to={DASHBOARD_HOME[profile.type]}
        onClick={onDone}
        className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-full bg-lime text-sm font-extrabold text-midnight hover:bg-lime-hover"
      >
        <LayoutDashboard className="size-4" aria-hidden /> My {typeLabel(profile.type).toLowerCase()} dashboard
      </Link>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onDone();
            openShopPanel("orders");
          }}
          className="min-h-11 rounded-full border border-primary-foreground/30 text-sm font-extrabold hover:bg-primary-foreground/10"
        >
          My orders
        </button>
        <button
          type="button"
          onClick={() => {
            demoSession.signOut();
            onDone();
          }}
          className="min-h-11 rounded-full border border-primary-foreground/30 text-sm font-extrabold hover:bg-primary-foreground/10"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
