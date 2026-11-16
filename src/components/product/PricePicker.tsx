import { ChevronDown, Globe } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { formatMoney } from "@/lib/dreamverse/normalize";
import type { Money } from "@/lib/dreamverse/types";
import { DEMO_RATES, DEMO_RATES_DATE } from "@/lib/pricing/demo-rates";
import { findPriceCountry, localPrice, PRICE_COUNTRIES, type LocalPrice } from "@/lib/pricing/local-price";

const STORAGE_KEY = "enski:price-country";

/** The visitor's country from the browser's language setting (e.g. en-NG → NG), if it names one. */
function browserCountry(): string | null {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return region ?? null;
  } catch {
    return null;
  }
}

/**
 * The country a visitor wants prices for: their saved choice, else the country we detect, else none
 * (the listing's own default currency). Saved on this device so every details page remembers it.
 */
export function useLocalPrice(prices: Money[], fallback: LocalPrice | null) {
  const [saved, setSaved] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      /* storage blocked */
    }
    setReady(true);
  }, []);

  const country = ready ? findPriceCountry(saved ?? browserCountry()) : null;
  const choose = (code: string) => {
    setSaved(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage blocked */
    }
  };

  const resolved = country ? localPrice(prices, country.currency, DEMO_RATES) : null;
  return {
    country,
    choose,
    price: resolved ?? fallback,
    /** The pick couldn't be shown (no rate yet); the listing's own price is shown instead. */
    unavailable: !!country && !resolved,
    hasRates: true,
  };
}

export function PricePicker({
  value,
  onChange,
  creatorCurrencies,
}: {
  value: string | null;
  onChange: (code: string) => void;
  /** Currencies the creator set themselves, marked as exact in the list. */
  creatorCurrencies: string[];
}) {
  const id = useId();
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        <Globe className="size-3.5" aria-hidden /> Show price for
      </label>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-full border border-line bg-soft pl-4 pr-10 text-sm font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {!value && <option value="">Choose a country or currency</option>}
          {PRICE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.currency}){creatorCurrencies.includes(c.currency) ? " · creator's price" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-brand" aria-hidden />
      </div>
    </div>
  );
}

/** One line under the price explaining an estimate, or nothing for a creator-set price. */
export function priceNote(price: LocalPrice | null, unavailable: boolean, hasRates: boolean): string | null {
  if (unavailable) return hasRates ? null : "We couldn't load today's exchange rates, so this is the creator's own price.";
  if (!price || price.exact) return null;
  return `Estimate using saved exchange rates. You'd pay ${formatMoney(price.charge.current, price.charge)} at checkout.`;
}

/** Shown with every estimate: where the saved demo rates came from. */
export function RatesCredit() {
  return (
    <p className="mt-2 text-[11px] text-muted-foreground">
      Estimates use{" "}
      <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-brand">
        Exchange Rate API
      </a>{" "}
      rates saved on {DEMO_RATES_DATE}.
    </p>
  );
}
