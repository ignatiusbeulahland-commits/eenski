import { ArrowDown, ArrowUp, Check, Plus, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { InfoTip } from "@/components/creator/universe/InfoTip";
import { handleArrowKeys } from "@/lib/keyboard";
import { cn } from "@/lib/utils";

/** One numbered card of the create form. Turns into a lime tick when complete. */
export function CreateSection({ n, id, title, text, tip, done, optional, eyebrow, children }: {
  n: number; id: string; title: string; text?: string | undefined; tip?: string | undefined; done?: boolean | undefined; optional?: boolean | undefined; eyebrow?: string | undefined; children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="create-section surface scroll-mt-36">
      <header className="flex items-start gap-3.5 border-b border-line/70 px-5 py-4 sm:px-6 sm:py-5">
        <span className={cn("create-badge grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold", done && "is-done")} aria-hidden="true">
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
        </span>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-cobalt">{eyebrow}</p>}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 id={`${id}-title`} className="text-[17px] leading-tight sm:text-lg">{title}</h2>
            {optional && <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-bold text-muted-foreground">Optional</span>}
            {done && <span className="sr-only">(complete)</span>}
            {tip && <InfoTip label={`About ${title}`}>{tip}</InfoTip>}
          </div>
          {text && <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{text}</p>}
        </div>
      </header>
      <div className="@container space-y-6 px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

/** Label row with required marker, optional tooltip and counter, plus hint or inline error. */
export function CreateField({ id, label, required, tip, hint, count, error, children }: {
  id: string; label: string; required?: boolean; tip?: string | undefined; hint?: ReactNode; count?: string | undefined; error?: string | undefined; children: ReactNode;
}) {
  return (
    <div className="space-y-1.5" data-invalid={error ? "" : undefined}>
      <div className="flex min-h-5 items-center gap-1.5">
        <Label htmlFor={id} className="text-[13px] font-bold">
          {label}
          {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </Label>
        {tip && <InfoTip label={`About ${label}`}>{tip}</InfoTip>}
        {count && <span className="ml-auto text-[11px] font-semibold tabular-nums text-muted-foreground">{count}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Compact pill radio group for short choices (length, notice, limits). */
export function Segmented<T extends string | number>({ label, value, options, onChange, tip, id }: {
  label: string; value: T; options: [T, string][]; onChange: (v: T) => void; tip?: string | undefined; id?: string;
}) {
  return (
    <div id={id}>
      <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold">{label}{tip && <InfoTip label={`About ${label}`}>{tip}</InfoTip>}</p>
      <div
        className="create-segmented inline-flex max-w-full flex-wrap gap-1 rounded-[16px] bg-soft p-1"
        role="radiogroup"
        aria-label={label}
        onKeyDown={(e) => handleArrowKeys(e, e.currentTarget, { selector: '[role="radio"]', orientation: "horizontal", loop: true, activate: true })}
      >
        {options.map(([v, l]) => {
          const on = value === v;
          return (
            <button key={String(v)} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => onChange(v)}
              className={cn("create-seg inline-flex h-9 items-center gap-1.5 rounded-[12px] px-3.5 text-[13px] font-extrabold transition-all", on ? "is-on bg-card text-cobalt shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {on && <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />}
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Larger radio cards with an icon and one line of explanation, for decisions that matter. */
export function OptionCards<T extends string>({ label, value, options, onChange, columns = 2 }: {
  label: string; value: T; options: { value: T; title: string; text: string; icon: LucideIcon }[]; onChange: (v: T) => void; columns?: 2 | 3;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn("grid gap-2.5", columns === 3 ? "@md:grid-cols-2 @lg:grid-cols-3" : "@md:grid-cols-2")}
        onKeyDown={(e) => handleArrowKeys(e, e.currentTarget, { selector: '[role="radio"]', orientation: "horizontal", loop: true, activate: true }) || handleArrowKeys(e, e.currentTarget, { selector: '[role="radio"]', loop: true, activate: true })}
      >
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => onChange(o.value)}
              className={cn("create-option relative flex min-w-0 items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 text-left transition-all", on ? "is-on border-cobalt bg-ice/60" : "border-line bg-card hover:border-cobalt-100")}>
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[12px] transition-colors", on ? "bg-cobalt text-primary-foreground" : "bg-soft text-cobalt")}><o.icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 pr-5">
                <span className="block text-sm font-extrabold">{o.title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{o.text}</span>
              </span>
              <span className={cn("absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-[1.5px] transition-colors", on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line")} aria-hidden="true">
                {on && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Naira amount field with a currency prefix. */
export function PriceInput({ id, value, onChange, placeholder = "15000", invalid, describedBy, disabled }: {
  id: string; value: number; onChange: (v: number) => void; placeholder?: string; invalid?: boolean; describedBy?: string; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center border-r border-line text-sm font-extrabold text-cobalt" aria-hidden="true">₦</span>
      <Input id={id} type="number" inputMode="decimal" min="0" step="1" placeholder={placeholder} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy}
        className="pl-14 text-[15px] font-extrabold tabular-nums" value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))} />
    </div>
  );
}

/** Ordered list of short text entries. Uses no nested <form>, so it is safe inside the create form. */
export function ListEditor({ id, label, placeholder, items, onChange, empty, max = 10, examples = [] }: {
  id: string; label: string; placeholder: string; items: string[]; onChange: (next: string[]) => void; empty: string; max?: number; examples?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (v = draft) => {
    const t = v.trim();
    if (!t || items.length >= max || items.includes(t)) return;
    onChange([...items, t]);
    setDraft("");
  };
  const move = (i: number, d: -1 | 1) => {
    const next = items.slice();
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    onChange(next);
  };
  const unused = examples.filter((e) => !items.includes(e));
  return (
    <div>
      <div className="flex gap-2">
        <Label htmlFor={id} className="sr-only">{label}</Label>
        <Input id={id} value={draft} maxLength={200} placeholder={placeholder} disabled={items.length >= max}
          onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="soft" disabled={!draft.trim() || items.length >= max} onClick={() => add()}><Plus />Add</Button>
      </div>
      {unused.length > 0 && items.length < max && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Try</span>
          {unused.slice(0, 3).map((e) => (
            <button key={e} type="button" onClick={() => add(e)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-cobalt-100 px-2.5 py-1 text-xs font-bold text-cobalt hover:bg-ice"><Plus className="h-3 w-3" />{e}</button>
          ))}
        </div>
      )}
      {items.length ? (
        <ol className="mt-3 divide-y divide-line/70 overflow-hidden rounded-[14px] border border-line">
          {items.map((t, i) => (
            <li key={`${i}-${t}`} className="flex items-center gap-2 bg-card px-3 py-2 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ice text-[11px] font-extrabold text-cobalt">{i + 1}</span>
              <span className="min-w-0 flex-1 break-words font-semibold">{t}</span>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move "${t}" up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move "${t}" down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remove "${t}"`} onClick={() => onChange(items.filter((_, n) => n !== i))}><X /></Button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 rounded-[14px] border border-dashed border-line px-4 py-3 text-[13px] text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

/** Switch-style row for yes/no settings inside a section. */
export { ToggleRow } from "./common";
