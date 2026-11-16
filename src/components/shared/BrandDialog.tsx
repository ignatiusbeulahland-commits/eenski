import { LogOut, ShieldCheck, X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Logo } from "@/components/affiliate/Logo";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/dashboard-ui/dialog";


/** Signature-blue top band for brand pop-ups: Enski logo, glass close, 3D art, Lime eyebrow, title and description. */
export function BrandDialogHero({ art, eyebrow, title, description, closeDisabled, children }: {
  art: string;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  closeDisabled?: boolean;
  /** Extra content shown at the bottom of the blue band. */
  children?: ReactNode;
}) {
  return (
    <div data-surface="dark" className="bg-brand-panel brand-dialog-hero relative isolate overflow-hidden px-6 pb-6 pt-5 text-on-dark sm:px-8 sm:pb-7">
      <div className="flex items-center justify-between">
        <Logo className="h-6 w-auto" />
        <DialogClose
          disabled={closeDisabled}
          className="grid h-9 w-9 place-items-center rounded-full border border-on-dark/20 bg-on-dark/10 text-on-dark transition-colors hover:border-lime/60 hover:text-lime disabled:pointer-events-none disabled:opacity-40"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>
      <div className="mt-5 flex items-start gap-4">
        <span className="brand-dialog-art grid h-16 w-16 shrink-0 place-items-center rounded-[20px] border border-on-dark/20 bg-on-dark/10 backdrop-blur-sm sm:h-[72px] sm:w-[72px]" aria-hidden="true">
          <img src={art} alt="" width={56} height={56} className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="flex items-center gap-2 text-xs font-bold text-on-dark-muted"><span className="neon-dot" aria-hidden="true" />{eyebrow}</p>
          <DialogTitle className="mt-1.5 text-xl font-extrabold leading-tight text-on-dark sm:text-2xl">{title}</DialogTitle>
          <span className="neon-rule mt-2 block w-12" aria-hidden="true" />
          <DialogDescription className="mt-2.5 text-sm leading-relaxed text-on-dark-muted">{description}</DialogDescription>
        </div>
      </div>
      {children}
    </div>
  );
}

/** Shared brand content shell so every brand pop-up has the same size, motion and corners. */
export const brandDialogContentClass =
  "max-w-[460px] gap-0 overflow-hidden p-0 shadow-float duration-300 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-4";

/** Log out confirmation used by every role's account menu. */
export function LogoutDialog({ open, onOpenChange, role, avatar, name, email, onConfirm }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "Affiliate" | "Creator" | "Learner";
  avatar: ReactNode;
  name: string;
  email: string;
  onConfirm: () => void;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  const where = role === "Learner" ? "your learning" : `your ${role.toLowerCase()} dashboard`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className={brandDialogContentClass} onOpenAutoFocus={(e) => { e.preventDefault(); cancel.current?.focus(); }}>
        <BrandDialogHero art={brandArtwork.lock} eyebrow="Account" title="Log out of Enski?" description={`You'll need to sign in again to get back to ${where}.`} />
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-3 rounded-[18px] border bg-soft p-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-midnight">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-extrabold text-lime-text">{role}</span>
          </div>
          <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cobalt" aria-hidden="true" />
            Everything you've saved stays on your account. On a shared device, logging out keeps it safe.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="outline" size="lg" ref={cancel} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" variant="destructive" size="lg" onClick={() => { onOpenChange(false); onConfirm(); }}>
              <LogOut /> Log out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


/**
 * Branded confirmation for archive, delete, remove, refund, disconnect and similar
 * choices. Cancel gets focus first so Enter never confirms by accident.
 * `onConfirm` returning `false` keeps the pop-up open (for example when a check fails).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  art,
  eyebrow,
  title,
  description,
  tone = "danger",
  confirmLabel,
  confirmIcon,
  cancelLabel = "Cancel",
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  art: string;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  /** `danger` shows a red confirm button; `default` a Cobalt one. */
  tone?: "danger" | "default";
  confirmLabel: string;
  confirmIcon?: ReactNode;
  cancelLabel?: string;
  onConfirm: () => void | boolean;
  children?: ReactNode;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={brandDialogContentClass}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          cancel.current?.focus();
        }}
      >
        <BrandDialogHero art={art} eyebrow={eyebrow} title={title} description={description} />
        <div className="space-y-4 p-6 sm:p-8">
          {children}
          <div className="flex flex-col-reverse gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3">
            <Button type="button" variant="outline" size="lg" ref={cancel} onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={tone === "danger" ? "destructive" : "default"}
              size="lg"
              onClick={() => {
                if (onConfirm() !== false) onOpenChange(false);
              }}
            >
              {confirmIcon}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** A soft note row for a confirmation's white area. */
export function ConfirmNote({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-[18px] border bg-soft p-3 text-[13px] leading-relaxed text-muted-foreground">
      <span className="mt-0.5 shrink-0 text-cobalt [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{icon ?? <ShieldCheck />}</span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}
