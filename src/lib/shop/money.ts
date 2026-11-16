import { formatMoney } from "@/lib/dreamverse/normalize";
import type { Money } from "@/lib/dreamverse/types";

/** Whole-number percentage off the original price, or 0 when not discounted. */
export function discountPercent(price: Money | null | undefined): number {
  if (!price || !price.onSale || price.amount <= 0 || price.current >= price.amount) return 0;
  return Math.round(((price.amount - price.current) / price.amount) * 100);
}

/** Cart totals kept per currency: prices are never converted or added across currencies. */
export function subtotals(prices: (Money | null)[]): { currency: string; total: number; label: string }[] {
  const by = new Map<string, { money: Money; total: number }>();
  for (const p of prices) {
    if (!p) continue;
    const row = by.get(p.currency) ?? { money: p, total: 0 };
    row.total += p.current;
    by.set(p.currency, row);
  }
  return [...by.values()].map(({ money, total }) => ({ currency: money.currency, total, label: formatMoney(total, money) }));
}
