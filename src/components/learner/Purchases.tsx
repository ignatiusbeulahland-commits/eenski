import { DialogActions } from "@/components/shared/DialogActions";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Eye, Printer, Receipt as ReceiptIcon, ReceiptText, RotateCw, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge } from "@/components/affiliate/ui";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { formatMoney } from "@/lib/shared/finance/currencies";
import { TxHistory } from "@/components/shared/finance/TxHistory";
import { learnerTransactions, retryPurchase, type Purchase } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { Logo } from "@/components/affiliate/Logo";
import { LearnerNotFound, price, shortDate } from "./shared";

export const PurchaseStatus = ({ status }: { status: Purchase["status"] }) => (
  <StatusBadge tone={status === "paid" ? "success" : status === "pending" ? "pending" : "neutral"}>{status === "paid" ? "Paid" : status === "pending" ? "Pending" : "Failed"}</StatusBadge>
);
const methodLabel = { card: "Card", transfer: "Bank transfer" };

export function PurchasesPage() {
  const { state } = useLearner();
  const rows = useMemo(() => learnerTransactions(state.purchases), [state.purchases]);
  const paid = state.purchases.filter((p) => p.status === "paid");
  const pending = state.purchases.filter((p) => p.status === "pending");
  return (
    <div>
      <PageHeader eyebrow="Purchases" title="Purchase history" description="Every order you've placed, with references, receipts and access to what you bought." />
      {!state.purchases.length ? (
        <div className="surface"><EmptyState icon={ShoppingBag} title="No purchases yet" description="When you buy a resource or event ticket, your order and receipt will appear here." action={<Button asChild><Link to="/learner/resources" search={{ view: "discover" }}>Discover resources</Link></Button>} /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="Purchase summary">
            <StatCard icon={ReceiptIcon} art={brandArtwork.receipt} label="Total spent" value={formatMoney(paid.reduce((n, p) => n + p.total, 0), "NGN")} hint={`${paid.length} paid order${paid.length === 1 ? "" : "s"}`} featured />
            <StatCard icon={Clock} art={brandArtwork.pending} label="Awaiting payment" value={formatMoney(pending.reduce((n, p) => n + p.total, 0), "NGN")} hint={`${pending.length} pending transfer${pending.length === 1 ? "" : "s"}`} />
            <div className="col-span-2 lg:col-span-1"><StatCard icon={ShoppingBag} art={brandArtwork.bag} label="Orders placed" value={String(state.purchases.length)} hint="Including failed attempts" /></div>
          </div>
          <TxHistory title="Purchase history" description="Open an order for its receipt and access." rows={rows} directions={false}
            empty={null} />
        </div>
      )}
    </div>
  );
}

function Receipt({ p, name, email }: { p: Purchase; name: string; email: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-sm print:border-0">
      <div className="flex items-start justify-between gap-3 rounded-lg bg-sidebar p-4"><Logo className="h-7 w-auto" /><p className="text-right text-xs font-bold text-on-dark-muted">Receipt</p></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div><p className="text-muted-foreground">Billed to</p><p className="font-bold">{name}</p>{email && <p className="break-all">{email}</p>}</div>
        <div className="text-right"><p className="text-muted-foreground">Order</p><p className="font-bold">{p.orderNumber}</p><p>{new Date(p.date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p></div>
      </div>
      <table className="mt-4 w-full text-xs">
        <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 font-semibold">Item</th><th className="py-2 text-right font-semibold">Qty</th><th className="py-2 text-right font-semibold">Amount</th></tr></thead>
        <tbody>{p.items.map((i) => <tr key={i.kind + i.id} className="border-b"><td className="py-2 pr-2">{i.title}</td><td className="py-2 text-right tabular-nums">{i.qty}</td><td className="py-2 text-right tabular-nums">{price(i.price * i.qty)}</td></tr>)}</tbody>
      </table>
      <div className="mt-3 flex justify-between font-extrabold"><span>Total</span><span className="tabular-nums">{price(p.total)}</span></div>
      <p className="mt-1 text-xs text-muted-foreground">{methodLabel[p.method]} · {p.status === "paid" ? "Paid" : p.status === "pending" ? "Awaiting payment" : "Payment failed"}</p>
    </div>
  );
}

export function PurchaseDetails({ id }: { id: string }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(false);
  const p = state.purchases.find((x) => x.id === id);
  if (!p) return <LearnerNotFound what="purchase" />;
  return (
    <div>
      <PageHeader eyebrow="Order details" title={p.orderNumber} description={`Placed ${new Date(p.date).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" })}`} actions={<Button variant="outline" onClick={() => setReceipt(true)}><ReceiptText /> View receipt</Button>} />
      {p.status === "pending" && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-warning-soft p-4 text-sm text-warning-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Waiting for your bank transfer. Open the transfer details to see where to pay, then tell us once you've sent it.</p>
          <Button asChild size="sm"><Link to="/learner/checkout/$purchaseId" params={{ purchaseId: p.id }}>Transfer details</Link></Button>
        </div>
      )}
      {p.status === "failed" && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-muted p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>This payment didn't go through. Nothing was charged.</p>
          <Button size="sm" onClick={() => { update((s) => retryPurchase(s, p.id)); navigate({ to: "/learner/cart" }); }}><RotateCw /> Try again</Button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel title="Items" bodyClassName="p-0">
          <ul className="divide-y">
            {p.items.map((i) => (
              <li key={i.kind + i.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {i.image && <img src={i.image} alt="" loading="lazy" width={80} height={56} className="h-14 w-20 shrink-0 rounded-md object-cover" />}
                  <div className="min-w-0"><p className="text-sm font-bold">{i.title}</p><p className="text-xs text-muted-foreground">{i.kind === "event" ? `Event ticket × ${i.qty}` : "Digital resource"} · {price(i.price * i.qty)}</p></div>
                </div>
                {p.status === "paid" && (i.kind === "resource" ? <Button asChild size="sm"><Link to="/learner/resources/$resourceId" params={{ resourceId: i.id }}><Eye /> Access resource</Link></Button> : <Button asChild size="sm" variant="outline"><Link to="/learner/events/$eventId" params={{ eventId: i.id }}>View event</Link></Button>)}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Summary">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><PurchaseStatus status={p.status} /></dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Payment</dt><dd className="text-right">{methodLabel[p.method]}</dd></div>
            <div className="flex justify-between border-t pt-2 font-extrabold"><dt>Total</dt><dd className="tabular-nums">{price(p.total)}</dd></div>
          </dl>
        </Panel>
      </div>
      <Dialog open={receipt} onOpenChange={setReceipt}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader><DialogTitle>Receipt</DialogTitle><DialogDescription>{p.orderNumber}</DialogDescription></DialogHeader>
          <Receipt p={p} name={state.profile.fullName} email={state.profile.email} />
          <DialogActions cancelLabel="Close"><Button variant="outline" onClick={() => window.print()}><Printer /> Print receipt</Button></DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
}
