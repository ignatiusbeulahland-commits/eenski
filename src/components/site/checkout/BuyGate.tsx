import { ArrowRight, Bell, BellRing, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import type { Money } from "@/lib/dreamverse/types";
import { openCheckout } from "@/lib/shop/panel";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

type Size = "lg" | "md" | "sm";

const NO_PRICE_NOTE = "This listing has no price yet, so it can't be bought right now.";

interface BuyButtonProps {
  /** e.g. "Buy course", "Enroll now", "Get eBook free". */
  label: string;
  /** Shown under the label on larger sizes, e.g. "₦5,000". */
  price?: string | null | undefined;
  /** What's being bought; opens in the demo checkout. */
  item: ShopItem;
  /** The price checkout charges (the creator's own), when it differs from the item's default. */
  charge?: Money | null | undefined;
  size?: Size | undefined;
  className?: string | undefined;
  tabIndex?: number | undefined;
  testId?: string | undefined;
}

/** The main buy button: goes straight to the (simulated) checkout, no sign-up and no account needed. */
export function BuyButton({ label, price, item, charge, size = "lg", className, tabIndex, testId }: BuyButtonProps) {
  const buy = () => {
    const toBuy = charge ? { ...item, price: charge } : item;
    if (!toBuy.price) {
      toast(item.title, { description: NO_PRICE_NOTE });
      return;
    }
    openCheckout([toBuy]);
  };
  return (
    <>
      <button
        type="button"
        onClick={buy}
        tabIndex={tabIndex}
        data-testid={testId}
        className={cn(
          "group/buy relative z-10 inline-flex items-center justify-between gap-3 overflow-hidden rounded-full bg-cobalt text-left font-extrabold text-primary-foreground shadow-[0_14px_30px_-12px_var(--cobalt)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-cobalt-hover active:translate-y-0 active:bg-cobalt-press focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          size === "lg" && "min-h-16 py-2 pr-2 pl-2",
          size === "md" && "min-h-14 py-1.5 pr-1.5 pl-1.5",
          size === "sm" && "min-h-11 py-1 pr-1 pl-1",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-full bg-lime text-midnight",
              size === "lg" ? "size-12" : size === "md" ? "size-11" : "size-9",
            )}
          >
            <ShoppingBag className={size === "sm" ? "size-4" : "size-5"} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className={cn("block whitespace-nowrap leading-tight", size === "lg" ? "text-[17px]" : size === "md" ? "text-base" : "text-sm")}>{label}</span>
            {price && size !== "sm" && (
              <span className="block text-[13px] leading-tight font-semibold text-on-blue">{price}</span>
            )}
          </span>
        </span>
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-primary-foreground/15 transition-transform duration-200 group-hover/buy:translate-x-0.5 motion-reduce:transition-none",
            size === "lg" ? "size-12" : size === "md" ? "size-11" : "size-9",
          )}
          aria-hidden
        >
          <ArrowRight className="size-5" />
        </span>
      </button>
    </>
  );
}

/** "Coming soon" in the same shape as the buy button, so unreleased items still feel deliberate. */
export function ComingSoonButton({
  onClick,
  saved = false,
  size = "lg",
  className,
}: {
  onClick?: (() => void) | undefined;
  saved?: boolean | undefined;
  size?: Size | undefined;
  className?: string | undefined;
}) {
  const Icon = saved ? BellRing : Bell;
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground",
            size === "lg" ? "size-12" : size === "md" ? "size-11" : "size-9",
          )}
        >
          <Icon className={size === "sm" ? "size-4" : "size-5"} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className={cn("block leading-tight text-brand", size === "lg" ? "text-[17px]" : size === "md" ? "text-base" : "text-sm")}>
            Coming soon
          </span>
          {size !== "sm" && (
            <span className="block text-[13px] leading-tight font-semibold text-muted-foreground">
              {onClick ? (saved ? "Saved. It'll be waiting for you" : "Tap to save it for launch day") : "Opening on Enski soon"}
            </span>
          )}
        </span>
      </span>
      {onClick && (
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-card text-brand ring-1 ring-line",
            size === "lg" ? "size-12" : size === "md" ? "size-11" : "size-9",
          )}
          aria-hidden
        >
          {saved ? <Check className="size-5" /> : <ArrowRight className="size-5" />}
        </span>
      )}
    </>
  );
  const shape = cn(
    "relative z-10 inline-flex items-center justify-between gap-3 rounded-full border-2 border-dashed border-cobalt/35 bg-ice text-left font-extrabold",
    size === "lg" && "min-h-16 py-2 pr-2 pl-2",
    size === "md" && "min-h-14 py-1.5 pr-1.5 pl-1.5",
    size === "sm" && "min-h-11 py-1 pr-1 pl-1",
    className,
  );
  if (!onClick) return <div className={shape}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={cn(shape, "transition-colors hover:border-cobalt/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/50")}
    >
      {body}
    </button>
  );
}
