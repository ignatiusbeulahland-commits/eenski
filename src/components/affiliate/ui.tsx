import type { LucideIcon } from "lucide-react";
import { AlertTriangle, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Skeleton } from "@/components/dashboard-ui/skeleton";
import { cn } from "@/lib/utils";
import { BrandIcon, iconArtwork } from "./BrandIcon";



export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />{eyebrow}</p>}
        <h1 className="text-2xl text-foreground sm:text-[28px]">{title}</h1>
        <span className="lime-underline" aria-hidden="true" />
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName }: { title?: string; description?: string | undefined; actions?: ReactNode; children: ReactNode; className?: string | undefined; bodyClassName?: string | undefined }) {
  return (
    <section className={cn("surface overflow-hidden", className)}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2.5 text-[15px] font-bold"><span className="lime-tick" aria-hidden="true" />{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, description, action, compact }: { icon: LucideIcon; title: string; description: string; action?: ReactNode; compact?: boolean }) {
  const artwork = iconArtwork.get(Icon);
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-8" : "py-12 sm:py-16")}>
      <div className="relative mb-5">
        {artwork ? <><BrandIcon src={artwork} /><span className="lime-pedestal" aria-hidden="true" /></> : <><div className="relative grid h-14 w-14 place-items-center rounded-xl bg-ice text-cobalt ring-1 ring-line">
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-sm bg-lime ring-4 ring-card" /></>}
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = "cobalt", art, featured }: { icon: LucideIcon; label: string; value: string; hint?: string | undefined; tone?: "cobalt" | "sky" | "lime" | "midnight"; art?: string | undefined; featured?: boolean }) {
  const artwork = art ?? iconArtwork.get(Icon);
  const tones = {
    cobalt: "bg-ice text-cobalt",
    sky: "bg-ice text-sky",
    lime: "bg-lime text-midnight",
    midnight: "bg-midnight text-lime",
  };
  return (
    <div className={cn("stat-card surface group @container relative min-w-0 overflow-hidden p-3.5 sm:p-5", featured && "is-featured")}>
      <div className="flex flex-col-reverse items-start gap-2 @[10.5rem]:flex-row @[10.5rem]:justify-between">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:text-[13px]">
          {featured && <span className="neon-dot shrink-0" aria-hidden="true" />}
          <span className="min-w-0">{label}</span>
        </p>
        {artwork ? <BrandIcon src={artwork} className="stat-art h-10 w-10 @[10.5rem]:-mr-1 @[10.5rem]:-mt-1 sm:h-11 sm:w-11" /> : <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>}
      </div>
      <p className="mt-2 truncate text-xl font-extrabold tabular-nums @[10.5rem]:text-2xl sm:mt-2.5 sm:text-[28px]">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="stat-card-bar absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
    </div>
  );
}

export function StatusBadge({ tone, children }: { tone: "pending" | "success" | "neutral" | "info"; children: ReactNode }) {
  const t = {
    pending: "bg-warning-soft text-warning-foreground",
    success: "bg-lime-100 text-lime-text",
    neutral: "bg-muted text-muted-foreground",
    info: "bg-ice text-cobalt",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", t)}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}

export function PageSkeleton() {
  return (
    <div className="animate-in fade-in" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="mt-6 h-64 rounded-xl" />
    </div>
  );
}

export function ErrorState({ onRetry, title = "Something didn't load" }: { onRetry: () => void; title?: string }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-warning-soft text-warning-foreground"><AlertTriangle className="h-5 w-5" /></div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">This didn't load. Check your connection and try again.</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}><RotateCw /> Try again</Button>
    </div>
  );
}

/** Responsive filter row: search + selects */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:p-4">{children}</div>;
}

import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/dashboard-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-10" />
    </div>
  );
}

/** Name a dropdown for screen readers: pass `label`, or it's worked out from a "All …" first option or the date ranges. */
export function filterName(options: [string, string][], label?: string) {
  if (label) return label;
  if (options === dateRanges) return "Date range";
  const first = options[0]?.[1] ?? "";
  const m = /^(?:All|Any) (.+)$/.exec(first);
  if (!m) return "Choose an option";
  const w = m[1] ?? "";
  const one = w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.endsWith("uses") ? w.slice(0, -2) : w.endsWith("us") ? w : w.replace(/s$/, "");
  return `Filter by ${one}`;
}

export function FilterSelect({ value, onChange, options, className, label }: { value: string; onChange: (v: string) => void; options: [string, string][]; className?: string; label?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={filterName(options, label)} className={cn("bg-card sm:w-40", className)}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export const dateRanges: [string, string][] = [["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["all", "All time"]];

/** Table with real column headers and an empty body state */
export function EmptyTable({ columns, empty }: { columns: string[]; empty: ReactNode }) {
  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-soft">{columns.map((c) => <th key={c} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{c}</th>)}</tr></thead>
        </table>
      </div>
      {empty}
    </div>
  );
}
