import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Heart, Receipt, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { subtotals } from "@/lib/shop/money";
import { onShopPanel, openCheckout, type ShopPanel } from "@/lib/shop/panel";
import { shop, useShop } from "@/lib/shop/store";
import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

import { ShopPrice } from "./ShopCard";
import { ShopGrid } from "./ShopGrid";
import { ShopImage } from "./ShopImage";
import { ShopLink } from "./ShopLink";

/** Header wishlist and cart buttons with live counts, plus their side panels. */
export function ShopButtons({ className, wishlistClassName }: { className?: string | undefined; wishlistClassName?: string }) {
  const wishCount = useShop((s) => s.wishlist.length);
  const cartCount = useShop((s) => s.cart.length);
  const orderCount = useShop((s) => s.orders.length);
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const show = (p: ShopPanel) => {
    // The "Added to your cart" note would sit on top of the panel's checkout button.
    toast.dismiss();
    setPanel(p);
  };
  useEffect(() => onShopPanel(show), []);
  // Tapping a card inside the panel opens its page; close the panel behind it.
  const path = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => setPanel(null), [path]);

  return (
    <div className={cn("flex items-center", className)}>
      <CountButton label="Wishlist" count={wishCount} onClick={() => show("wishlist")} className={wishlistClassName}>
        <Heart />
      </CountButton>
      <CountButton label="Cart" count={cartCount} onClick={() => show("cart")}>
        <ShoppingBag />
      </CountButton>
      <Sheet open={panel !== null} onOpenChange={(o) => !o && setPanel(null)}>
        <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 p-0">
          <PanelTabs panel={panel ?? "cart"} onPick={setPanel} cartCount={cartCount} wishCount={wishCount} orderCount={orderCount} />
          {panel === "wishlist" ? <WishlistPanel /> : panel === "orders" ? <OrdersPanel close={() => setPanel(null)} /> : <CartPanel close={() => setPanel(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CountButton({
  label,
  count,
  onClick,
  children,
  className,
}: {
  label: string;
  count: number;
  onClick: () => void;
  children: ReactNode;
  className?: string | undefined;
}) {
  // Bump the badge whenever the count goes up.
  const prev = useRef(count);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count > prev.current) setBump((n) => n + 1);
    prev.current = count;
  }, [count]);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count ? `${label}, ${count} ${count === 1 ? "item" : "items"}` : label}
      title={label}
      className={cn(
        "relative grid size-10 place-items-center rounded-full text-on-blue transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime [&_svg]:size-5",
        className,
      )}
    >
      {children}
      {count > 0 && (
        <span
          key={bump}
          className={cn(
            "absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-lime px-1 text-[11px] leading-5 font-extrabold text-midnight",
            bump > 0 && "shop-pop",
          )}
          aria-hidden
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

function PanelTabs({
  panel,
  onPick,
  cartCount,
  wishCount,
  orderCount,
}: {
  panel: ShopPanel;
  onPick: (p: ShopPanel) => void;
  cartCount: number;
  wishCount: number;
  orderCount: number;
}) {
  const tabs: { id: ShopPanel; label: string; count: number }[] = [
    { id: "cart", label: "Cart", count: cartCount },
    { id: "wishlist", label: "Wishlist", count: wishCount },
    { id: "orders", label: "Orders", count: orderCount },
  ];
  return (
    <div role="tablist" aria-label="Cart, wishlist and orders" className="flex gap-1.5 px-5 pt-5 pr-14">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={panel === t.id}
          onClick={() => onPick(t.id)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold transition-colors",
            panel === t.id ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand hover:bg-cobalt-100",
          )}
        >
          {t.label}
          {t.count > 0 && <span className="text-xs opacity-80">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function PanelHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="border-b border-line px-5 pt-3 pb-4">
      <SheetTitle className="text-xl font-extrabold text-ink">{title}</SheetTitle>
      <SheetDescription className="mt-1 text-sm text-muted-foreground">{note}</SheetDescription>
    </div>
  );
}

function Empty({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-ice text-brand [&_svg]:size-7">{icon}</span>
      <p className="font-extrabold text-ink">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Line({ item, close, action }: { item: ShopItem; close: () => void; action: ReactNode }) {
  return (
    <li className="flex gap-3 p-4">
      <ShopLink route={item.route} onClick={close} className="block size-20 shrink-0 overflow-hidden rounded-[14px]" tabIndex={-1}>
        <ShopImage image={item.image} sizes="80px" />
      </ShopLink>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-extrabold text-brand">{item.typeLabel}</p>
        <ShopLink route={item.route} onClick={close} className="line-clamp-2 text-[15px] leading-snug font-extrabold text-ink hover:text-brand">
          {item.title}
        </ShopLink>
        {item.creator && <p className="truncate text-xs font-semibold text-muted-foreground">{item.creator.name}</p>}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <ShopPrice item={item} />
          {action}
        </div>
      </div>
    </li>
  );
}

function CartPanel({ close }: { close: () => void }) {
  const items = useShop((s) => s.cart);
  const totals = subtotals(items.map((i) => i.price));
  return (
    <>
      <PanelHead title="Your cart" note="Ready when you are." />
      {items.length === 0 ? (
        <Empty icon={<ShoppingBag />} title="Your cart is empty" body="Tap the bag on any course, eBook or resource to add it here." />
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto">
            {items.map((item) => (
              <Line
                key={item.key}
                item={item}
                close={close}
                action={
                  <button
                    type="button"
                    onClick={() => shop.removeFromCart(item.key)}
                    aria-label={`Remove ${item.title} from cart`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-soft hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                }
              />
            ))}
          </ul>
          <div className="space-y-3 border-t border-line p-5">
            <dl className="space-y-1">
              {totals.map((t) => (
                <div key={t.currency} className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm font-semibold text-muted-foreground">
                    Subtotal{totals.length > 1 ? ` (${t.currency})` : ""} · {items.filter((i) => i.price?.currency === t.currency).length} items
                  </dt>
                  <dd className="text-lg font-extrabold text-ink">{t.label}</dd>
                </div>
              ))}
            </dl>
            {totals.length > 1 && <p className="text-xs text-muted-foreground">Items priced in different currencies are totalled separately.</p>}
            <button
              type="button"
              onClick={() => {
                close();
                openCheckout(items);
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cobalt px-5 text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-cobalt-hover"
            >
              Check out <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </>
      )}
    </>
  );
}

function WishlistPanel() {
  const items = useShop((s) => s.wishlist);
  return (
    <>
      <PanelHead title="Your wishlist" note="Tap a heart to remove an item, or the bag to add it to your cart." />
      {items.length === 0 ? (
        <Empty icon={<Heart />} title="Nothing saved yet" body="Tap the heart on anything you like to keep it here while you explore." />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <ShopGrid items={items} />
          </div>
          <div className="border-t border-line p-5">
            <Link
              to="/wishlist"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-line bg-background px-5 text-[15px] font-extrabold text-brand transition-colors hover:bg-ice"
            >
              Open full wishlist <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </>
      )}
    </>
  );
}

function OrdersPanel({ close }: { close: () => void }) {
  const orders = useShop((s) => s.orders);
  return (
    <>
      <PanelHead title="Your orders" note="Everything you've bought, newest first." />
      {orders.length === 0 ? (
        <Empty icon={<Receipt />} title="No orders yet" body="When you buy a course, eBook or session, your order shows up here." />
      ) : (
        <ul className="flex-1 space-y-3 overflow-y-auto p-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-line p-4">
              <div className="flex items-baseline justify-between gap-3">
                <Link to="/orders/$reference" params={{ reference: o.number }} onClick={close} className="font-extrabold text-ink hover:text-brand hover:underline">{o.number}</Link>
                <p className="text-xs font-semibold text-muted-foreground">
                  {new Date(o.at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className="mt-1 inline-block rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight">Paid</span>
              <ul className="mt-3 space-y-1.5">
                {o.items.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
                    <ShopLink route={item.route} onClick={close} className="min-w-0 truncate font-semibold text-ink hover:text-brand">
                      {item.title}
                    </ShopLink>
                    <span className="shrink-0">
                      <ShopPrice item={item} />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-2 text-right text-sm font-extrabold text-ink">
                Total {o.totals.map((t) => t.label).join(" + ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
