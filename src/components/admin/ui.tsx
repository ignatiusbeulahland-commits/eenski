import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A responsive list: one card per row on phones, a tidy table from md up. */
export function AdminList<T>({ rows, columns, rowKey, empty, onRow }: {
  rows: T[];
  columns: { label: string; cell: (r: T) => ReactNode; className?: string; mobile?: boolean }[];
  rowKey: (r: T) => string;
  empty: ReactNode;
  onRow?: ((r: T) => void) | undefined;
}) {
  if (!rows.length) return <>{empty}</>;
  return (
    <div className="surface overflow-hidden">
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b bg-soft text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
          <tr>{columns.map((c) => <th key={c.label} scope="col" className={cn("px-4 py-3", c.className)}>{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={rowKey(r)} className={cn("transition-colors", onRow && "cursor-pointer hover:bg-ice")} onClick={onRow ? () => onRow(r) : undefined}>
              {columns.map((c) => <td key={c.label} className={cn("px-4 py-3 align-middle", c.className)}>{c.cell(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)}>
            <div role={onRow ? "button" : undefined} tabIndex={onRow ? 0 : undefined} onClick={onRow ? () => onRow(r) : undefined} onKeyDown={onRow ? (e) => { if (e.key === "Enter") onRow(r); } : undefined} className={cn("grid gap-1.5 p-4 text-sm", onRow && "active:bg-ice")}>
              {columns.filter((c) => c.mobile !== false).map((c) => (
                <div key={c.label} className="flex items-start justify-between gap-3"><span className="shrink-0 text-xs font-semibold text-muted-foreground">{c.label}</span><span className="min-w-0 text-right font-semibold">{c.cell(r)}</span></div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TONES = {
  good: "bg-lime-100 text-lime-text",
  wait: "bg-warning-soft text-warning-foreground",
  bad: "bg-destructive/10 text-destructive",
  plain: "bg-soft text-muted-foreground",
} as const;
export function Pill({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize", TONES[tone])}>{children}</span>;
}
export const statusTone = (s: string): keyof typeof TONES =>
  ["paid", "successful", "published", "active", "valid", "resolved"].includes(s.toLowerCase()) ? "good"
    : ["processing", "pending", "draft", "open", "in progress", "waiting for user"].includes(s.toLowerCase()) ? "wait"
    : ["failed", "revoked", "cancelled", "refunded", "suspended", "urgent"].includes(s.toLowerCase()) ? "bad" : "plain";

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-11 w-full rounded-full border-[1.5px] border-line bg-card px-4 text-sm outline-none focus:border-cobalt focus:ring-4 focus:ring-ice sm:max-w-xs" />;
}

export function Chips<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)} className={cn("min-h-9 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors", value === o.id ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-300")}>{o.label}</button>)}
    </div>
  );
}

export function AccountLink({ email, children }: { email: string; children: ReactNode }) {
  return <Link to="/admin/accounts/$email" params={{ email }} className="font-extrabold text-brand underline-offset-4 hover:underline" onClick={(e) => e.stopPropagation()}>{children}</Link>;
}
