import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/affiliate/Logo";
import { Button } from "@/components/dashboard-ui/button";

/** Branded shell for public certificate pages: signature-blue hero with content lifted over its edge. */
export function PublicShell({ eyebrow, title, text, skipTo, skipLabel, aside, highlights, children }: {
  eyebrow: string; title: ReactNode; text: string; skipTo: string; skipLabel: string;
  /** Optional hero artwork, shown beside the title on large screens. */
  aside?: ReactNode;
  /** Short, true facts shown as chips under the hero text. */
  highlights?: string[];
  children: ReactNode;
}) {
  return (
    <div data-skin="dashboard" className="flex min-h-screen flex-col bg-background text-foreground">
      <a href={`#${skipTo}`} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-cobalt">{skipLabel}</a>
      <header className="bg-brand-panel relative pb-28 sm:pb-32" data-surface="dark">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-5 sm:px-6">
          <Link to="/" aria-label="Enski home" className="rounded-md"><Logo className="h-7 w-auto sm:h-8" /></Link>
          <Button asChild variant="glass" size="sm">
            <Link to="/"><ArrowLeft aria-hidden="true" /> Back to Enski</Link>
          </Button>
        </div>
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 pt-10 text-on-dark sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-on-dark/20 bg-on-dark/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
              <span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" /> {eyebrow}
            </p>
            <h1 className="max-w-2xl break-words text-3xl font-extrabold leading-tight sm:text-[42px]">{title}</h1>
            <p className="mt-3 max-w-xl text-sm text-on-dark-muted sm:text-base">{text}</p>
            {highlights?.length ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="At a glance">
                {highlights.map((h) => (
                  <li key={h} className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1.5 text-[13px] font-bold ring-1 ring-on-dark/15">
                    <Check className="h-3.5 w-3.5 text-lime" strokeWidth={3} aria-hidden="true" />{h}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {aside ? <div className="hidden lg:block" aria-hidden="true">{aside}</div> : null}
        </div>
      </header>
      <main className="relative z-10 mx-auto -mt-20 w-full max-w-5xl flex-1 px-4 pb-16 sm:-mt-24 sm:px-6">{children}</main>
      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-4 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span className="flex items-center gap-2.5"><Logo variant="color" className="h-6 w-auto dark:hidden" /><span className="hidden font-extrabold text-foreground dark:inline">Enski</span><span>Certificates of completion</span></span>
          <nav aria-label="Certificate links" className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
            <Link to="/verify" className="hover:text-cobalt">Verify a certificate</Link>
            <Link to="/" className="hover:text-cobalt">Back to Enski</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
