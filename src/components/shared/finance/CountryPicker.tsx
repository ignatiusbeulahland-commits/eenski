import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/dashboard-ui/command";
import { COUNTRIES, isCountryAvailable, type Region } from "@/lib/shared/finance/coverage";
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { cn } from "@/lib/utils";
import { Flag } from "./Marks";

const REGIONS: Region[] = ["Africa", "Europe", "Americas"];
const trigger = "flex h-12 w-full items-center gap-3 rounded-[14px] border-[1.5px] border-input bg-card px-3.5 text-left text-sm font-semibold transition-[border-color,box-shadow] hover:border-cobalt-100 focus-visible:border-cobalt focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ice aria-[invalid=true]:border-destructive";

/** Searchable country list grouped by region. `payoutOnly` marks countries we can't pay out to yet. */
export function CountryPicker({ id, label = "Country", value, onChange, payoutOnly, placeholder = "Choose a country" }: { id: string; label?: string; value: string; onChange: (code: string) => void; payoutOnly?: boolean; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const current = COUNTRIES.find((c) => c.code === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-label={label} aria-expanded={open} className={trigger}>
          {current ? <Flag code={current.code} className="h-5 w-7" /> : null}
          <span className={cn("min-w-0 flex-1 truncate", !current && "font-medium text-muted-foreground")}>{current?.name ?? placeholder}</span>
          {current && <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{current.dial ? `+${current.dial} · ` : ""}{current.currency}</span>}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search countries…" />
          <CommandList className="max-h-80">
            <CommandEmpty>No country matches that search.</CommandEmpty>
            {REGIONS.map((r) => (
              <CommandGroup key={r} heading={r}>
                {COUNTRIES.filter((c) => c.region === r).map((c) => {
                  const off = payoutOnly && !isCountryAvailable(c);
                  return (
                    <CommandItem key={c.code} value={`${c.name} ${c.currency} ${c.code} ${c.dial ?? ""}`} disabled={Boolean(off)} onSelect={() => { onChange(c.code); setOpen(false); }} className="gap-3">
                      <Flag code={c.code} className="h-4 w-6" />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      {off ? <span className="text-[11px] font-bold text-muted-foreground">Not available yet</span> : <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{c.dial ? <span className="mr-1.5 font-semibold">+{c.dial}</span> : null}{c.currency}</span>}
                      {value === c.code && <Check className="h-4 w-4 text-cobalt" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CurrencyPicker({ id, label = "Currency", value, onChange, options = [...CURRENCY_CODES] }: { id: string; label?: string; value: CurrencyCode | null; onChange: (c: CurrencyCode) => void; options?: CurrencyCode[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-label={label} aria-expanded={open} className={trigger}>
          {value && <Flag code={CURRENCIES[value].flag} className="h-5 w-7" />}
          <span className={cn("min-w-0 flex-1 truncate", !value && "font-medium text-muted-foreground")}>{value ? `${value} · ${CURRENCIES[value].name}` : "Choose a currency"}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Search currencies…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No currency matches that search.</CommandEmpty>
            <CommandGroup>
              {options.map((c) => (
                <CommandItem key={c} value={`${c} ${CURRENCIES[c].name}`} onSelect={() => { onChange(c); setOpen(false); }} className="gap-3">
                  <Flag code={CURRENCIES[c].flag} className="h-4 w-6" />
                  <span className="w-10 font-extrabold tabular-nums">{c}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{CURRENCIES[c].name}</span>
                  {value === c && <Check className="h-4 w-4 text-cobalt" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
