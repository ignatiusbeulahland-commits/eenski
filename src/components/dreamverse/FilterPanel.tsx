import { Check } from "lucide-react";
import type { ReactNode } from "react";

import {
  ACCESS,
  CURRENCIES,
  FORMATS,
  REGIONS,
  PRICE_RANGES,
  TOPICS,
  TYPE_LABELS,
  type CatalogFilters,
  type CurrencyCode,
} from "@/lib/dreamverse/catalog";
import type { ResourceType } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

type Update = (patch: Partial<CatalogFilters>) => void;

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-5 last:border-0">
      <legend className="mb-2 text-sm font-extrabold text-ink">{legend}</legend>
      <div className="flex flex-col gap-0.5">{children}</div>
    </fieldset>
  );
}

function Option({
  name,
  checked,
  onSelect,
  children,
  count,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
  count?: number | undefined;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 text-[15px] font-semibold text-slate transition-colors hover:bg-soft has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-sky-light",
        checked && "bg-ice text-brand",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-background",
          checked && "border-brand bg-cobalt text-primary-foreground",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="text-xs font-bold text-muted-foreground">{count}</span>}
    </label>
  );
}

export function FilterPanel({
  filters,
  update,
  types,
  creators,
  typeCounts,
  currencies,
  currencyCounts,
  idPrefix,
}: {
  filters: CatalogFilters;
  update: Update;
  types: ResourceType[];
  creators: string[];
  typeCounts: Record<string, number>;
  currencies: CurrencyCode[];
  currencyCounts: Record<string, number>;
  idPrefix: string;
}) {
  const cur = filters.currency;
  const curInfo = cur ? CURRENCIES.find((c) => c.code === cur) : undefined;
  return (
    <div className="flex flex-col gap-5">
      <Group legend="Currency and price">
        <CurrencySwitch
          name={`${idPrefix}-currency`}
          value={cur}
          options={currencies}
          counts={currencyCounts}
          // Price bands differ per currency, so switching currency clears the band.
          onChange={(c) => update({ currency: c, price: undefined })}
        />
        <p className="mt-2 mb-1 px-1 text-[13px] leading-snug text-muted-foreground">
          {curInfo
            ? `Showing resources priced in ${curInfo.name}. Prices are never converted.`
            : "Prices stay in the creator's currency. Pick one to compare and filter by price."}
        </p>
        {cur && (
          <>
            <Option name={`${idPrefix}-price`} checked={!filters.price} onSelect={() => update({ price: undefined })}>
              Any price
            </Option>
            {PRICE_RANGES[cur].map((r) => (
              <Option
                key={r.id}
                name={`${idPrefix}-price`}
                checked={filters.price === r.id}
                onSelect={() => update({ price: r.id })}
              >
                {r.label}
              </Option>
            ))}
          </>
        )}
      </Group>

      <Group legend="Free or paid">
        <Option name={`${idPrefix}-access`} checked={!filters.access} onSelect={() => update({ access: undefined })}>
          Free and paid
        </Option>
        {ACCESS.map((a) => (
          <Option
            key={a.id}
            name={`${idPrefix}-access`}
            checked={filters.access === a.id}
            onSelect={() => update({ access: a.id })}
          >
            {a.label}
          </Option>
        ))}
      </Group>

      <Group legend="Format">
        <Option name={`${idPrefix}-format`} checked={!filters.format} onSelect={() => update({ format: undefined })}>
          Any format
        </Option>
        {FORMATS.map((f) => (
          <Option
            key={f.id}
            name={`${idPrefix}-format`}
            checked={filters.format === f.id}
            onSelect={() => update({ format: f.id })}
          >
            {f.label}
          </Option>
        ))}
      </Group>

      <Group legend="Creator's country">
        <Option name={`${idPrefix}-region`} checked={!filters.region} onSelect={() => update({ region: undefined })}>
          Anywhere
        </Option>
        {REGIONS.map((r) => (
          <Option
            key={r.id}
            name={`${idPrefix}-region`}
            checked={filters.region === r.id}
            onSelect={() => update({ region: r.id })}
          >
            {r.label}
          </Option>
        ))}
        <p className="mt-1 px-1 text-[13px] leading-snug text-muted-foreground">
          Only creators who've shared their country are included.
        </p>
      </Group>

      <Group legend="Resource type">
        <Option name={`${idPrefix}-type`} checked={!filters.type} onSelect={() => update({ type: undefined })}>
          All types
        </Option>
        {types.map((t) => (
          <Option
            key={t}
            name={`${idPrefix}-type`}
            checked={filters.type === t}
            onSelect={() => update({ type: t })}
            count={typeCounts[t]}
          >
            {TYPE_LABELS[t].plural}
          </Option>
        ))}
      </Group>

      <Group legend="Topic">
        <Option name={`${idPrefix}-topic`} checked={!filters.topic} onSelect={() => update({ topic: undefined })}>
          Any topic
        </Option>
        {TOPICS.map((t) => (
          <Option
            key={t.id}
            name={`${idPrefix}-topic`}
            checked={filters.topic === t.id}
            onSelect={() => update({ topic: t.id })}
          >
            {t.name}
          </Option>
        ))}
      </Group>

      {creators.length > 0 && (
        <Group legend="Creator">
          <Option
            name={`${idPrefix}-creator`}
            checked={!filters.creator}
            onSelect={() => update({ creator: undefined })}
          >
            All creators
          </Option>
          {creators.map((c) => (
            <Option
              key={c}
              name={`${idPrefix}-creator`}
              checked={filters.creator === c}
              onSelect={() => update({ creator: c })}
            >
              {c}
            </Option>
          ))}
        </Group>
      )}
    </div>
  );
}

/** Segmented pill control: all currencies, or one currency at a time. */
export function CurrencySwitch({
  name,
  value,
  options,
  counts,
  onChange,
  unit = "resources",
}: {
  unit?: string | undefined;
  name: string;
  value: CurrencyCode | undefined;
  options: CurrencyCode[];
  counts: Record<string, number>;
  onChange: (c: CurrencyCode | undefined) => void;
}) {
  const items: { code: CurrencyCode | undefined; label: string; title: string }[] = [
    { code: undefined, label: "All", title: "All currencies" },
    ...options.map((code) => {
      const c = CURRENCIES.find((x) => x.code === code)!;
      return { code, label: `${c.symbol} ${c.label}`, title: `${c.name}, ${counts[code] ?? 0} ${unit}` };
    }),
  ];
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-soft p-1">
      {items.map((it) => {
        const checked = value === it.code;
        return (
          <label
            key={it.code ?? "all"}
            title={it.title}
            className={cn(
              "flex h-10 cursor-pointer items-center justify-center rounded-full px-2 text-sm font-extrabold whitespace-nowrap transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-sky-light",
              checked ? "bg-cobalt text-primary-foreground" : "text-slate hover:bg-ice hover:text-brand",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(it.code)}
              className="sr-only"
              aria-label={it.title}
            />
            {it.label}
          </label>
        );
      })}
    </div>
  );
}
