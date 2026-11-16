import { useState, type ReactNode } from "react";
import { undoToast } from "@/lib/shared/undo";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Switch } from "@/components/dashboard-ui/switch";
import { Label } from "@/components/dashboard-ui/label";
import { useCreator, activityEntry } from "@/lib/creator/store";
import type { CreatorItem, Order } from "@/lib/creator/rules";
import { cn } from "@/lib/utils";

export interface ProductProps {
  item: CreatorItem;
  /** Every order for this product, newest first. */
  orders: Order[];
}

/** Update helpers scoped to one product and its orders. */
export function useProduct(item: CreatorItem) {
  const { state, update } = useCreator();
  const patchItem = (patch: Partial<CreatorItem>, log?: string) =>
    update((s) => ({
      items: s.items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)),
      ...(log ? { activity: [...s.activity, activityEntry(`${log}: ${item.title}`)] } : {}),
    }));
  const patchOrder = (id: string, patch: Partial<Order>) =>
    update((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
  const customer = (id: string) => state.customers.find((c) => c.id === id);
  return { state, update, patchItem, patchOrder, customer };
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string | undefined }) {
  return (
    <div className="product-metric relative min-w-0 overflow-hidden rounded-2xl border bg-card p-4 sm:p-5">
      <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-lime" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-2 break-words text-xl font-extrabold tabular-nums sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
export const MetricGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
);

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-bold">
          {label}
        </Label>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** Ordered list of short text entries (objectives, intake questions, requirements). */
export function TextListEditor({
  id,
  label,
  placeholder,
  items,
  onChange,
  empty,
}: {
  id: string;
  label: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
  empty: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  const move = (i: number, d: -1 | 1) => {
    const next = items.slice();
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    onChange(next);
  };
  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <Label htmlFor={id} className="sr-only">
          {label}
        </Label>
        <Input id={id} value={draft} maxLength={200} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} />
        <Button type="submit" variant="soft" disabled={!draft.trim()}>
          <Plus />
          Add
        </Button>
      </form>
      {items.length ? (
        <ol className="mt-3 divide-y rounded-[14px] border">
          {items.map((t, i) => (
            <li key={`${i}-${t}`} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="w-5 shrink-0 font-bold text-cobalt">{i + 1}</span>
              <span className="min-w-0 flex-1 break-words">{t}</span>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move "${t}" up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Move "${t}" down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remove "${t}"`} onClick={() => { const before = items; onChange(items.filter((_, n) => n !== i)); undoToast(`"${t}" removed`, () => onChange(before)); }}>
                <X />
              </Button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

export function Pill({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warn" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "info" && "bg-ice text-cobalt",
        tone === "success" && "bg-lime-100 text-lime-text",
        tone === "warn" && "bg-warning-soft text-warning-foreground",
        tone === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
