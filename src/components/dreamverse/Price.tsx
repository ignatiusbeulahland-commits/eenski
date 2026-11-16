import { formatMoney } from "@/lib/dreamverse/normalize";
import type { Money } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

export function Price({ price, className, prefix }: { price: Money | null; className?: string; prefix?: string }) {
  if (!price) {
    return <span className={cn("text-sm font-semibold text-muted-foreground", className)}>Price on request</span>;
  }
  const now = formatMoney(price.current, price);
  const was = formatMoney(price.amount, price);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="text-lg font-extrabold text-ink">
        {prefix && <span className="mr-1 text-sm font-semibold text-muted-foreground">{prefix}</span>}
        {now}
      </span>
      {price.onSale && (
        <span className="text-sm font-semibold text-muted-foreground line-through">
          <span className="sr-only">Was </span>
          {was}
        </span>
      )}
    </span>
  );
}
