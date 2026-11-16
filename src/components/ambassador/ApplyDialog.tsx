import type { ReactNode } from "react";
import { ArrowRight, Check, Info } from "lucide-react";

import logoBlue from "@/assets/enski-logo-white.webp";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type ApplyResult = {
  firstName: string;
  updated: boolean;
  rows: [string, string][];
  next: string[];
};

/**
 * Application pop-up shared by the campus and NYSC pages. The form itself is the
 * page's own; this frame adds the header, the demo notice and the success view.
 */
export function ApplyDialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  intro,
  result,
  onAgain,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow: string;
  title: string;
  intro: string;
  result: ApplyResult | null;
  onAgain: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-[28px] border-line bg-background p-0 text-ink sm:rounded-[28px] [&>button:last-child]:text-primary-foreground [&>button:last-child]:opacity-90">
        <div className="relative overflow-hidden rounded-t-[28px] bg-cobalt-light px-6 pb-6 pt-7 text-primary-foreground">
          <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
          <img src={logoBlue} alt="Enski" width={288} height={106} className="relative h-7 w-auto" />
          <p className="eyebrow relative mt-5 text-lime">{result ? (result.updated ? "Application updated" : "Application received") : eyebrow}</p>
          <DialogTitle className="relative mt-2 pr-8 text-2xl font-extrabold leading-tight tracking-tight">
            {result ? `You're in, ${result.firstName}.` : title}
          </DialogTitle>
          <DialogDescription className="relative mt-2 text-[15px] leading-relaxed text-on-blue">
            {result
              ? result.updated
                ? "We've replaced your earlier application for this programme with these details."
                : "Your application is in the queue. Welcome to the Dreamers Crew."
              : intro}
          </DialogDescription>
        </div>

        <div className="px-6 pb-6 pt-5">

          {result ? (
            <div role="status" aria-live="polite">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-cobalt text-primary-foreground shadow-float">
                <Check className="size-7" strokeWidth={3} />
              </span>
              <dl className="mt-5 grid gap-2 rounded-2xl border border-line p-4 text-sm">
                {result.rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="min-w-0 truncate text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <ol className="mt-5 grid gap-2 text-sm text-muted-foreground">
                {result.next.map((s, n) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ice text-xs font-extrabold text-brand dark:bg-cobalt/40 dark:text-primary-foreground">
                      {n + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button className="sm:flex-1" onClick={() => onOpenChange(false)}>
                  Back to the page <ArrowRight />
                </Button>
                <Button variant="outline" className="sm:flex-1" onClick={onAgain}>
                  Edit my answers
                </Button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
