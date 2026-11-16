import { Check, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LookId } from "@/lib/assistant/types";
import { LOOKS } from "./looks";

/** ChatGPT-style personality picker: choose how Charm looks (and sounds) in the chat. */
export function LookPicker({
  open,
  onOpenChange,
  current,
  onChoose,
  firstTime,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: LookId | null;
  onChoose: (id: LookId) => void;
  firstTime?: boolean;
}) {
  const [picked, setPicked] = useState<LookId>(current ?? "classic");
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setPicked(current ?? "classic");
        onOpenChange(o);
      }}
    >
      <DialogPortal>
        {/* Above Charm's full-screen phone panel and the site header. */}
        <DialogOverlay className="z-(--z-picker)" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-(--z-picker) max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-line bg-background shadow-float duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="relative bg-cobalt px-6 pb-5 pt-6 text-primary-foreground sm:px-8">
          <DialogClose className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-on-dark/20 bg-on-dark/10 text-primary-foreground transition-colors hover:border-lime/60 hover:text-lime">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <p className="flex items-center gap-2 text-xs font-bold text-on-dark-muted">
            <span className="neon-dot" aria-hidden="true" />
            {firstTime ? "Before we chat" : "Charm's look"}
          </p>
          <DialogTitle className="mt-1.5 text-2xl font-extrabold leading-tight text-primary-foreground">Pick your Charm</DialogTitle>
          <DialogDescription className="mt-1.5 text-sm leading-relaxed text-on-dark-muted">
            Same helpful Enski Assistant, four personalities. You can change this any time from the chat.
          </DialogDescription>
        </div>
        <div role="radiogroup" aria-label="Charm's look" className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-6">
          {LOOKS.map((l) => {
            const active = picked === l.id;
            return (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPicked(l.id)}
                onDoubleClick={() => onChoose(l.id)}
                className={cn(
                  "group relative flex flex-col items-center rounded-[20px] border bg-card px-3 pb-4 pt-3 text-center transition-all",
                  active ? "border-cobalt bg-ice ring-4 ring-cobalt/10" : "border-line hover:-translate-y-0.5 hover:border-sky",
                )}
              >
                {active && (
                  <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-cobalt text-primary-foreground">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                )}
                <img
                  src={l.poses.wave}
                  alt=""
                  width={150}
                  height={280}
                  loading="lazy"
                  decoding="async"
                  className="h-24 w-auto object-contain transition-transform duration-300 group-hover:-translate-y-1 sm:h-40"
                />
                <span className="mt-2 text-[15px] font-extrabold text-ink">{l.name}</span>
                <span className="text-xs font-bold text-brand">{l.tagline}</span>
                <span className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">{l.blurb}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {firstTime ? "Maybe later" : "Cancel"}
          </Button>
          <Button type="button" onClick={() => onChoose(picked)}>
            Chat with {LOOKS.find((l) => l.id === picked)?.name ?? "Charm"}
          </Button>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
