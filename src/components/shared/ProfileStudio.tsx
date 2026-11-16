import type { ComponentType, ReactNode } from "react";
import { useRef } from "react";
import { Camera, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { cn } from "@/lib/utils";

/**
 * Premium Manage Profile layout shared by Affiliate, Creator and Learner.
 * Presentation only: each role keeps its own state, fields and validation.
 */

export type ProfileCheck = { label: string; done: boolean };

export function profileStrength(checks: ProfileCheck[]) {
  return checks.length ? Math.round((checks.filter((c) => c.done).length / checks.length) * 100) : 0;
}

function StrengthRing({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center" role="img" aria-label={`Profile ${value}% complete`}>
      <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="6" className="stroke-on-dark/15" />
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-lime transition-[stroke-dashoffset] duration-700" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="text-lg font-extrabold text-on-dark">{value}%</span>
    </div>
  );
}

export function ProfileHero({
  name, role, tagline, photo, initials, chips, checks, onPhoto, onRemovePhoto, photoHint,
}: {
  name: string;
  role: string;
  tagline: string;
  photo?: string | undefined;
  initials: string;
  chips: { icon: ComponentType<{ className?: string }>; label: string }[];
  checks: ProfileCheck[];
  onPhoto: (file?: File) => void;
  onRemovePhoto?: (() => void) | undefined;
  photoHint: string;
}) {
  const file = useRef<HTMLInputElement>(null);
  const strength = profileStrength(checks);
  return (
    <section className="bg-brand-panel profile-hero rounded-[24px] text-on-dark" data-surface="dark" aria-label="Profile summary">
      <span className="hero-dots" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative w-fit shrink-0">
            <div className="profile-avatar-ring">
              {photo ? (
                <img src={photo} alt="Your profile photo" className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28" />
              ) : (
                <span className="grid h-24 w-24 place-items-center rounded-full bg-midnight text-3xl font-extrabold text-on-dark sm:h-28 sm:w-28" aria-hidden="true">{initials || "?"}</span>
              )}
            </div>
            <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Upload profile photo" tabIndex={-1} onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            <Button type="button" size="icon" variant="lime" className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full shadow-lift" aria-label={photo ? "Change profile photo" : "Upload profile photo"} onClick={() => file.current?.click()}>
              <Camera />
            </Button>
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-lime">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />{role}
            </span>
            <h2 className="mt-2 truncate text-2xl font-extrabold text-on-dark sm:text-[28px]">{name || "Your name"}</h2>
            <p className="mt-1 text-sm text-on-dark-muted">{tagline}</p>
            {chips.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {chips.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-on-dark/20 bg-on-dark/5 px-3 py-1 text-xs font-semibold text-on-dark">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-lime" /><span className="truncate">{label}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-on-dark-muted">
              <span>{photoHint}</span>
              {photo && onRemovePhoto && (
                <button type="button" onClick={onRemovePhoto} className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold text-on-dark hover:text-lime focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]">
                  <Trash2 className="h-3.5 w-3.5" /> Remove photo
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[20px] border border-on-dark/15 bg-midnight/30 p-4 backdrop-blur-sm md:w-64">
          <StrengthRing value={strength} />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-on-dark">Profile strength</p>
            <p className="mt-0.5 text-xs text-on-dark-muted">
              {strength === 100 ? "Complete. Nicely done." : `${checks.filter((c) => !c.done).length} step${checks.filter((c) => !c.done).length === 1 ? "" : "s"} to a complete profile`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileSection({ icon: Icon, title, description, children, className }: { icon: ComponentType<{ className?: string }>; title: string; description: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface profile-section overflow-hidden", className)}>
      <header className="flex items-start gap-3 border-b px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt" aria-hidden="true"><Icon className="h-5 w-5" /></span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ProfileChecklist({ checks, note }: { checks: ProfileCheck[]; note?: string }) {
  const done = checks.filter((c) => c.done).length;
  return (
    <aside className="surface overflow-hidden" aria-label="Profile checklist">
      <div className="border-b px-5 py-4">
        <p className="text-[15px] font-extrabold">Complete your profile</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{done} of {checks.length} done</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ice" aria-hidden="true">
          <div className={cn("h-full rounded-full transition-[width] duration-700", done === checks.length ? "bg-lime" : "bg-cobalt")} style={{ width: `${profileStrength(checks)}%` }} />
        </div>
      </div>
      <ul className="space-y-1 p-3">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-3 rounded-[14px] px-2 py-2 text-sm">
            {c.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-lime-text" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
            <span className={c.done ? "text-muted-foreground line-through decoration-line" : "font-semibold"}>{c.label}</span>
          </li>
        ))}
      </ul>
      {note && <p className="border-t bg-soft/60 px-5 py-4 text-xs text-muted-foreground">{note}</p>}
    </aside>
  );
}

/** Sticky save bar: visible while there are unsaved edits. */
export function ProfileSaveBar({ dirty, onDiscard, discardLabel = "Discard", saveLabel = "Save changes" }: { dirty: boolean; onDiscard: () => void; discardLabel?: string; saveLabel?: string }) {
  return (
    <div className={cn("profile-savebar", dirty && "is-dirty")} role="region" aria-label="Save profile">
      <p className="flex min-w-0 items-center gap-2 text-sm font-bold">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", dirty ? "bg-lime" : "bg-line")} aria-hidden="true" />
        <span className="truncate">{dirty ? "You have unsaved changes" : "All changes saved"}</span>
      </p>
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="outline" disabled={!dirty} onClick={onDiscard}>{discardLabel}</Button>
        <Button type="submit" disabled={!dirty}>{saveLabel}</Button>
      </div>
    </div>
  );
}

export function ProfileLayout({ hero, main, side }: { hero: ReactNode; main: ReactNode; side: ReactNode }) {
  return (
    <div className="space-y-6">
      {hero}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">{main}</div>
        <div className="space-y-6 lg:sticky lg:top-24">{side}</div>
      </div>
    </div>
  );
}
