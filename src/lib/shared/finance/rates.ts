import { useEffect, useState } from "react";
import type { CurrencyCode } from "./currencies";
import { DEMO_RATES } from "@/lib/pricing/demo-rates";

/**
 * Indicative mid-market rates. The site is a frontend-only prototype, so instead of calling
 * ExchangeRate-API live these come from the saved demo rates in `lib/pricing/demo-rates.ts`.
 */
export type Rates = { base: CurrencyCode; rates: Partial<Record<string, number>>; updatedAt: string; source: string; sourceUrl: string };
const SOURCE = { source: "ExchangeRate-API (saved rates)", sourceUrl: "https://www.exchangerate-api.com" };
/** When the saved demo rates were taken (matches DEMO_RATES_DATE). */
const SAVED_AT = "2026-11-12T12:00:00Z";

/** Saved rates re-based to `base` (units of each currency per 1 `base`). */
export async function fetchRates(base: CurrencyCode, _signal?: AbortSignal): Promise<Rates> {
  return savedRates(base);
}

export function savedRates(base: CurrencyCode): Rates {
  const perUsd = DEMO_RATES[base];
  if (!perUsd) throw new Error("Rates unavailable");
  const rates = Object.fromEntries(Object.entries(DEMO_RATES).map(([code, v]) => [code, v / perUsd]));
  return { base, rates, updatedAt: SAVED_AT, ...SOURCE };
}

export function useRates(base: CurrencyCode, enabled = true) {
  const [state, setState] = useState<{ rates: Rates | null; error: boolean; loading: boolean }>({ rates: null, error: false, loading: enabled });
  useEffect(() => {
    if (!enabled) return;
    try {
      setState({ rates: savedRates(base), error: false, loading: false });
    } catch {
      setState({ rates: null, error: true, loading: false });
    }
  }, [base, enabled]);
  return state;
}

export const rateTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
