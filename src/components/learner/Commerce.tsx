import { DialogActions } from "@/components/shared/DialogActions";
import { removeWhere, restoreAt } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bookmark, CheckCircle2, CreditCard, Landmark, Loader2, Lock, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/dashboard-ui/radio-group";
import { Label } from "@/components/dashboard-ui/label";
import { EmptyState, PageHeader, Panel } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { cartTotals, canAddToCart, checkout, itemInfo, MAX_TICKETS, moveToCart, sameRef, setQty, toggleWishlist, type CheckoutOutcome, type Purchase } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { price } from "./shared";

function SwitchTabs({ active }: { active: "wishlist" | "cart" }) {
  const { state } = useLearner();
  const count = state.cart.reduce((a, c) => a + c.qty, 0);
  const cls = (on: boolean) => cn("flex h-9 items-center gap-2 rounded-md px-4 text-sm font-bold transition-colors", on ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-foreground");
  return (
    <nav className="mb-5 inline-flex rounded-lg border bg-card p-1" aria-label="Wishlist and cart">
      <Link to="/learner/wishlist" className={cls(active === "wishlist")} aria-current={active === "wishlist" ? "page" : undefined}><Bookmark className="h-4 w-4" /> Wishlist ({state.wishlist.length})</Link>
      <Link to="/learner/cart" className={cls(active === "cart")} aria-current={active === "cart" ? "page" : undefined}><ShoppingCart className="h-4 w-4" /> Cart ({count})</Link>
    </nav>
  );
}
const detailLink = (kind: "resource" | "event", id: string) => (kind === "resource" ? { to: "/learner/resources/$resourceId" as const, params: { resourceId: id } } : { to: "/learner/events/$eventId" as const, params: { eventId: id } });

export function WishlistPage() {
  const { state, update } = useLearner();
  return (
    <div>
      <PageHeader eyebrow="Wishlist / Cart" title="Your wishlist" description="Resources and events you've saved for later." />
      <SwitchTabs active="wishlist" />
      {!state.wishlist.length ? (
        <div className="surface"><EmptyState icon={Bookmark} title="Your wishlist is empty" description="Tap the bookmark on any resource or paid event to save it here." action={<><Button asChild><Link to="/learner/resources" search={{ view: "discover" }}>Discover resources</Link></Button><Button asChild variant="outline"><Link to="/learner/events">Browse events</Link></Button></>} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.wishlist.map((w) => {
            const info = itemInfo(w);
            if (!info) return null;
            const check = canAddToCart(state, w);
            const inCart = state.cart.some((c) => c.kind === w.kind && c.id === w.id);
            return (
              <article key={w.kind + w.id} className="surface flex min-w-0 gap-4 p-4">
                <img src={info.image} alt="" loading="lazy" width={112} height={112} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-xs font-semibold text-cobalt">{w.kind === "event" ? "Event ticket" : "Resource"}</p>
                  <Link {...detailLink(w.kind, w.id)} className="mt-0.5 line-clamp-2 text-sm font-bold hover:text-cobalt">{info.title}</Link>
                  <p className="text-xs text-muted-foreground">by {info.by}</p>
                  <p className="mt-1 font-extrabold tabular-nums">{price(info.price)}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    {inCart ? <Button asChild size="sm" variant="soft"><Link to="/learner/cart">In cart</Link></Button> : <Button size="sm" disabled={!check.ok} title={check.ok ? undefined : check.reason} onClick={() => { update((s) => moveToCart(s, w)); toast.success("Moved to cart"); }}><ShoppingCart /> Move to cart</Button>}
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { const { removed } = removeWhere(state.wishlist, (x) => sameRef(x, w)); update((s) => toggleWishlist(s, w)); if (removed) undoToast(`"${info.title}" removed from wishlist`, () => update((s) => ({ wishlist: restoreAt(s.wishlist, removed, sameRef) }))); }}><Trash2 /> Remove</Button>
                  </div>
                  {!check.ok && !inCart && <p className="mt-2 text-xs text-muted-foreground">{check.reason}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CartPage() {
  const { state, update } = useLearner();
  const { lines, subtotal, total, count } = cartTotals(state.cart);
  return (
    <div>
      <PageHeader eyebrow="Wishlist / Cart" title="Your cart" description="Review your items, then check out securely." />
      <SwitchTabs active="cart" />
      {!lines.length ? (
        <div className="surface"><EmptyState icon={ShoppingCart} title="Your cart is empty" description="Add a resource or event ticket and it will be ready for checkout here." action={<Button asChild><Link to="/learner/resources" search={{ view: "discover" }}>Continue shopping</Link></Button>} /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel title={`${count} ${count === 1 ? "item" : "items"}`} bodyClassName="p-0" actions={<Link to="/learner/resources" search={{ view: "discover" }} className="text-xs font-bold text-cobalt">Continue shopping</Link>}>
            <ul className="divide-y">
              {lines.map((l) => (
                <li key={l.kind + l.id} className="flex gap-4 p-4">
                  <img src={l.image} alt="" loading="lazy" width={96} height={72} className="h-16 w-20 shrink-0 rounded-md object-cover sm:h-20 sm:w-28" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-cobalt">{l.kind === "event" ? "Event ticket" : "Resource"}</p>
                      <Link {...detailLink(l.kind, l.id)} className="line-clamp-2 text-sm font-bold hover:text-cobalt">{l.title}</Link>
                      <p className="text-xs text-muted-foreground">{price(l.price)} {l.kind === "event" ? "each" : ""}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      {l.kind === "event" ? (
                        <div className="flex items-center rounded-lg border" role="group" aria-label={`Quantity for ${l.title}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Decrease quantity" disabled={l.qty <= 1} onClick={() => update((s) => setQty(s, l, l.qty - 1))}><Minus /></Button>
                          <span className="w-7 text-center text-sm font-bold tabular-nums" aria-live="polite">{l.qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Increase quantity" disabled={l.qty >= MAX_TICKETS} onClick={() => update((s) => setQty(s, l, l.qty + 1))}><Plus /></Button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">Qty 1</span>}
                      <p className="w-24 text-right font-extrabold tabular-nums">{price(l.line)}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={`Remove ${l.title}`} onClick={() => { const { removed } = removeWhere(state.cart, (c) => sameRef(c, l)); update((s) => ({ cart: s.cart.filter((c) => !sameRef(c, l)) })); if (removed) undoToast(`"${l.title}" removed from cart`, () => update((s) => ({ cart: restoreAt(s.cart, removed, sameRef) }))); }}><Trash2 /></Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Panel title="Order summary">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{price(subtotal)}</dd></div>
                <div className="flex justify-between border-t pt-3 text-base font-extrabold"><dt>Total</dt><dd className="tabular-nums">{price(total)}</dd></div>
              </dl>
              <Button asChild size="lg" className="mt-5 w-full"><Link to="/learner/checkout" search={{ step: "review" }}>Proceed to checkout <ArrowRight /></Link></Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Secure checkout</p>
            </Panel>
          </aside>
        </div>
      )}
    </div>
  );
}
