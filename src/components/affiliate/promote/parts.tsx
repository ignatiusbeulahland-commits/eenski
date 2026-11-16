import { Check, Copy, Link2, Percent } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { FlowSteps } from "@/components/shared/outcome";
import { estCommission, naira, rateFor, type Product } from "@/lib/affiliate/products";
import { linkFor, recordCopy } from "@/lib/affiliate/promotions";
import { useAffiliate } from "@/lib/affiliate/store";
import { cn } from "@/lib/utils";

export const PROMOTE_STEPS = ["Details", "Your link", "Share", "Done"];

/** Steps 2–6 of promoting a product share one progress bar. */
export function PromoteSteps({ current, className }: { current: number; className?: string }) {
  return <FlowSteps steps={PROMOTE_STEPS} current={current} className={cn("mx-auto mb-6 max-w-xl", className)} />;
}

/** This affiliate's current link for a product (stable until they regenerate it). */
export function usePromoLink(id: string) {
  const { state } = useAffiliate();
  return linkFor(state.promotions, id);
}

/** Copies the product's link and counts it. Resolves false when the browser blocks copying. */
export function useCopyPromo() {
  const { state, update } = useAffiliate();
  return async (id: string, text?: string) => {
    const url = text ?? linkFor(state.promotions, id).url;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return false;
    }
    update((s) => ({ promotions: recordCopy(s.promotions ?? {}, id), linkCopied: true }));
    return true;
  };
}

/** "25% commission" chip, readable on light or dark surfaces. */
export function CommissionChip({ product, dark, className }: { product: Product; dark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums",
        dark ? "bg-midnight text-lime ring-1 ring-lime/40" : "bg-cobalt text-primary-foreground",
        className,
      )}
    >
      <Percent className="size-3" strokeWidth={3} aria-hidden="true" />
      {rateFor(product)}% commission
    </span>
  );
}

/** Thumbnail, title and creator in one line, used across the promotion screens. */
export function ProductMini({ product, className, children }: { product: Product; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <img src={product.image} alt="" width={128} height={96} className="h-16 w-20 shrink-0 rounded-[14px] object-cover ring-1 ring-line sm:h-[72px] sm:w-24" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-sky-text">{product.type === "Ebook" ? "eBook" : "Course"} · {product.category}</p>
        <p className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink">{product.title}</p>
        <p className="truncate text-xs text-muted-foreground">by <span className="font-bold text-foreground">{product.creator}</span></p>
        {children}
      </div>
    </div>
  );
}

/** Price, rate and the estimated commission per sale, as three tiles. */
export function EarningsTiles({ product, className }: { product: Product; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-3 gap-px overflow-hidden rounded-[18px] border border-line bg-line", className)}>
      <div className="min-w-0 bg-card p-3 sm:p-3.5">
        <dt className="text-[11px] font-bold text-muted-foreground">Price</dt>
        <dd className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums text-ink sm:text-base">{naira(product.price)}</dd>
      </div>
      <div className="min-w-0 bg-card p-3 sm:p-3.5">
        <dt className="text-[11px] font-bold text-muted-foreground">Commission</dt>
        <dd className="mt-0.5 text-[15px] font-extrabold tabular-nums text-brand sm:text-base">{rateFor(product)}%</dd>
      </div>
      <div className="min-w-0 bg-ice p-3 sm:p-3.5">
        <dt className="text-[11px] font-bold text-muted-foreground">Per sale, est.</dt>
        <dd className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums text-brand sm:text-base">≈ {naira(estCommission(product))}</dd>
      </div>
    </dl>
  );
}

/**
 * The referral link in a roomy box that wraps instead of overflowing, with one big Copy button.
 * Copying flips the button to "Copied!" for a moment; it can be copied again any time.
 */
export function LinkBox({ productId, label = "Your referral link", onCopied, className }: { productId: string; label?: string; onCopied?: () => void; className?: string }) {
  const { url } = usePromoLink(productId);
  const copy = useCopyPromo();
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [tick, setTick] = useState(0);
  const field = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state !== "copied") return;
    const t = window.setTimeout(() => setState("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [state, tick]);
  const onCopy = async () => {
    if (await copy(productId)) {
      setState("copied");
      setTick((n) => n + 1);
      onCopied?.();
    } else {
      // Copying was blocked: select the link so it can be copied by hand.
      const el = field.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setState("manual");
    }
  };
  return (
    <div className={cn("link-box rounded-[22px] border-[1.5px] border-sky/40 bg-ice p-1.5", className)}>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 items-start gap-3 rounded-[17px] bg-card px-3.5 py-3 ring-1 ring-line">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground" aria-hidden="true"><Link2 className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p ref={field} className="mt-0.5 select-all [overflow-wrap:anywhere] font-mono text-[13px] font-bold leading-snug text-ink sm:text-sm">{url.split(/(?<=[/-])/).map((part, i) => <Fragment key={i}>{part}<wbr /></Fragment>)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCopy}
          data-copied={state === "copied" || undefined}
          className={cn(
            "copy-link-btn inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-extrabold transition-[background-color,color,transform] duration-200 active:scale-[0.97] sm:min-w-40 sm:self-center [&_svg]:size-4",
            state === "copied" ? "bg-midnight text-lime" : "bg-cobalt text-primary-foreground hover:bg-cobalt-hover",
          )}
        >
          {state === "copied" ? <><Check key={tick} className="copy-check" strokeWidth={3} aria-hidden="true" /> Copied!</> : <><Copy aria-hidden="true" /> Copy link</>}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{state === "copied" ? "Link copied" : ""}</p>
      {state === "manual" && (
        <p role="status" className="px-3 pb-1.5 pt-2 text-xs font-semibold text-muted-foreground">
          Your browser didn't allow copying, so the link is selected. Press and hold it (or use Ctrl+C) to copy.
        </p>
      )}
    </div>
  );
}
