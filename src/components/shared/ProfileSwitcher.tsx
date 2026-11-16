import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeftRight, ArrowRight, ChevronDown, ChevronRight, Eye, EyeOff, GraduationCap, Handshake, Loader2, Store, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Dialog, DialogContent } from "@/components/dashboard-ui/dialog";
import { BrandDialogHero, brandDialogContentClass } from "@/components/shared/BrandDialog";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { DropdownMenuItem } from "@/components/dashboard-ui/dropdown-menu";
import { Input } from "@/components/dashboard-ui/input";
import { checkSwitchPassword, isTrusted, readTrust, rememberTrust, type Profile } from "@/lib/profileSwitch";
import { cn } from "@/lib/utils";

type ProfileInfo = { id: Profile; to: "/learner/dashboard" | "/affiliate/dashboard" | "/creator/dashboard"; icon: LucideIcon; blurb: string };
export const profileInfo: Record<Profile, ProfileInfo> = {
  Learner: { id: "Learner", to: "/learner/dashboard", icon: GraduationCap, blurb: "Learn, save and buy from creators" },
  Affiliate: { id: "Affiliate", to: "/affiliate/dashboard", icon: Handshake, blurb: "Promote products and earn commission" },
  Creator: { id: "Creator", to: "/creator/dashboard", icon: Store, blurb: "Sell courses, downloads and sessions" },
};

const profileArt: Record<Profile, string> = { Learner: brandArtwork.graduate, Affiliate: brandArtwork.affiliations, Creator: brandArtwork.market };

/** Same account header in every role's profile menu. */
export function AccountMenuHeader({ avatar, name, email, current }: { avatar: ReactNode; name: string; email: string; current: Profile }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5">
      {avatar}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-text">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-text" aria-hidden="true" />
          Active: {current}
        </span>
      </div>
    </div>
  );
}

/** "Switch profile" item that reveals all three profiles, with the active one marked. Render inside DropdownMenuContent. */
export function SwitchProfileItems({ current, onPick }: { current: Profile; onPick: (p: Profile) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenuItem
        aria-expanded={open}
        onSelect={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="gap-2.5 py-2 font-semibold"
      >
        <ArrowLeftRight className="text-muted-foreground" />
        <span className="flex-1">Switch profile</span>
        <ChevronDown className={cn("text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </DropdownMenuItem>
      {open && (
        <div role="group" aria-label="Available profiles" className="mx-1 mb-1 flex flex-col gap-0.5 rounded-xl bg-soft p-1 animate-in fade-in-0 slide-in-from-top-1">
          {(Object.values(profileInfo)).map((p) => {
            const active = p.id === current;
            return (
              <DropdownMenuItem
                key={p.id}
                aria-current={active ? "true" : undefined}
                onSelect={(e) => {
                  if (active) {
                    e.preventDefault();
                    return;
                  }
                  onPick(p.id);
                }}
                className={cn("gap-3 py-2", active && "bg-card shadow-soft")}
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px]", active ? "bg-cobalt text-primary-foreground" : "bg-ice text-cobalt")}>
                  <p.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{p.id}</span>
                  <span className="block truncate text-xs font-medium text-muted-foreground">{p.blurb}</span>
                </span>
                {active ? (
                  <span className="shrink-0 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-text">Active</span>
                ) : (
                  <ChevronRight className="text-muted-foreground" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      )}
    </>
  );
}

/** Shared switching flow: asks for confirmation unless the learner chose "Don't ask again for 30 minutes". */
export function useProfileSwitch(current: Profile) {
  const navigate = useNavigate();
  const [target, setTarget] = useState<Profile | null>(null);
  const go = (p: Profile) => {
    navigate({ to: profileInfo[p].to });
    toast.success(`Switched to ${p} profile`);
  };
  const request = (p: Profile) => {
    if (p === current) return;
    if (isTrusted(readTrust())) go(p);
    else setTarget(p);
  };
  const dialog = (
    <ConfirmProfileSwitch
      current={current}
      target={target}
      onCancel={() => setTarget(null)}
      onConfirmed={(remember) => {
        if (remember) rememberTrust();
        const t = target;
        setTarget(null);
        if (t) go(t);
      }}
    />
  );
  return { request, dialog };
}

export function ConfirmProfileSwitch({ current, target, onCancel, onConfirmed }: { current: Profile; target: Profile | null; onCancel: () => void; onConfirmed: (remember: boolean) => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => {
    // Fresh, empty form every time; the password only ever lives in this component's memory.
    setPassword("");
    setShow(false);
    setRemember(false);
    setError(null);
    setBusy(false);
  }, [target]);
  const shown = target ?? "Learner";
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && !busy && onCancel()}>
      <DialogContent
        hideClose
        className={brandDialogContentClass}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          input.current?.focus();
        }}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const problem = checkSwitchPassword(password);
            if (problem) {
              setError(problem);
              input.current?.focus();
              return;
            }
            setBusy(true);
            window.setTimeout(() => {
              setPassword("");
              onConfirmed(remember);
            }, 650);
          }}
        >
          <BrandDialogHero art={brandArtwork.shield} eyebrow="Security check" title="Confirm profile switch" description="Confirm it's you before we switch your profile." closeDisabled={busy}>
            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-[18px] border border-on-dark/15 bg-on-dark/10 p-2.5 backdrop-blur-sm">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-on-dark/10"><img src={profileArt[current]} alt="" width={32} height={32} className="h-8 w-8 object-contain opacity-80" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold text-on-dark-muted">From</span><span className="block truncate text-sm font-bold text-on-dark">{current}</span></span>
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-midnight" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-on-dark ring-2 ring-lime"><img src={profileArt[shown]} alt="" width={32} height={32} className="h-8 w-8 object-contain" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold text-on-dark-muted">To</span><span className="block truncate text-sm font-bold text-on-dark">{shown}</span></span>
              </span>
            </div>
          </BrandDialogHero>
          <div className="p-6 sm:p-8">
          <div className="space-y-2">
            <label htmlFor={`${id}-pw`} className="text-sm font-bold text-midnight">Password</label>
            <div className="relative">
              <Input
                ref={input}
                id={`${id}-pw`}
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                disabled={busy}
                aria-invalid={!!error}
                aria-describedby={`${id}-msg`}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="h-[52px] pr-14"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-ice hover:text-cobalt"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error ? (
              <p id={`${id}-msg`} role="alert" className="flex items-start gap-1.5 text-sm font-semibold text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            ) : (
              <p id={`${id}-msg`} className="text-xs text-muted-foreground">Use the password for your Enski account.</p>
            )}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Checkbox id={`${id}-trust`} checked={remember} disabled={busy} onCheckedChange={(v) => setRemember(v === true)} />
            <label htmlFor={`${id}-trust`} className="cursor-pointer text-sm font-semibold text-midnight">Don't ask again for 30 minutes</label>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={onCancel}>Cancel</Button>
            <Button type="submit" size="lg" disabled={!password || busy}>
              {busy ? <><Loader2 className="animate-spin" /> Switching…</> : `Switch to ${shown}`}
            </Button>
          </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
