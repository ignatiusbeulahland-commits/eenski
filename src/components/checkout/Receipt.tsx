import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Printer } from "lucide-react";
import { FocusShell, OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { ShopPrice } from "@/components/shop/ShopCard";
import { ShopImage } from "@/components/shop/ShopImage";
import { ShopLink } from "@/components/shop/ShopLink";
import { useShop, useShopReady } from "@/lib/shop/store";
import { cn } from "@/lib/utils";
import { formatPayDate } from "./PaymentStatus";

const STATUS_LABEL = { processing: "Processing", pending: "Pending", successful: "Paid", failed: "Failed", cancelled: "Cancelled" } as const;

export function Receipt({ reference }: { reference: string }) {
  const ready = useShopReady();
  const payment = useShop((s) => s.payments.find((p) => p.reference === reference) ?? null);
  const order = useShop((s) => s.orders.find((o) => o.number === reference) ?? null);

  if (!ready) return <FocusShell><div className="mx-auto h-96 max-w-xl animate-pulse rounded-[28px] bg-soft" /></FocusShell>;
  if (!payment && !order) {
    return (
      <FocusShell>
        <OutcomeScreen
          tone="info"
          eyebrow="Receipt"
          title="Receipt not found"
          message={`We couldn't find an order with the reference ${reference} on this device.`}
          actions={<><Link to="/courses" className={outcomeButton.primary}>Return to marketplace</Link><Link to="/" className={outcomeButton.secondary}>Go home</Link></>}
        />
      </FocusShell>
    );
  }
  const items = payment?.items ?? order?.items ?? [];
  const totals = payment?.totals ?? order?.totals ?? [];
  const date = payment?.updatedAt ?? order?.at ?? "";
  const status = payment?.status ?? "successful";
  const events = payment?.events ?? [{ status: "successful" as const, at: date }];

  return (
    <FocusShell back={<Link to="/courses" className={outcomeButton.quiet}><ArrowLeft aria-hidden="true" /> Marketplace</Link>}>
      <article className="screen-in mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-line bg-card shadow-card print:border-0 print:shadow-none">
        <header className="bg-brand-panel relative px-6 py-7 text-on-dark sm:px-8" data-surface="dark">
          <span className="hero-dots" aria-hidden="true" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-dark-muted">Receipt</p>
              <h1 className="mt-1 font-mono text-2xl font-extrabold tracking-tight">{reference}</h1>
              <p className="mt-1 text-sm text-on-dark-muted">{date && formatPayDate(date)}</p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold", status === "successful" ? "bg-lime text-midnight" : "bg-on-dark/15 text-on-dark")}>{STATUS_LABEL[status]}</span>
          </div>
        </header>
        <div className="space-y-6 p-6 sm:p-8">
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Items</h2>
            <ul className="mt-3 divide-y divide-line">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-3">
                  <span className="block size-12 shrink-0 overflow-hidden rounded-xl print:hidden"><ShopImage image={item.image} sizes="48px" /></span>
                  <div className="min-w-0 flex-1">
                    <ShopLink route={item.route} className="line-clamp-2 text-sm font-extrabold text-ink hover:text-brand">{item.title}</ShopLink>
                    <p className="text-xs font-semibold text-muted-foreground">{item.typeLabel}{item.creator ? ` · ${item.creator.name}` : ""}</p>
                  </div>
                  <ShopPrice item={item} />
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-1 border-t border-dashed border-line pt-3">
              {totals.map((t) => (
                <div key={t.currency} className="flex justify-between text-base font-extrabold text-ink"><span>Total{totals.length > 1 ? ` (${t.currency})` : ""}</span><span>{t.label}</span></div>
              ))}
            </div>
          </section>
          <dl className="grid gap-4 rounded-[20px] bg-soft/70 p-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs font-bold text-muted-foreground">Billed to</dt><dd className="mt-0.5 font-extrabold text-ink">{payment?.buyer?.name || "Guest"}<span className="block font-semibold text-muted-foreground">{payment?.buyer?.email}</span></dd></div>
            <div><dt className="text-xs font-bold text-muted-foreground">Paid with</dt><dd className="mt-0.5 font-extrabold text-ink">{payment?.methodLabel ?? "Card"}</dd></div>
          </dl>
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Timeline</h2>
            <ol className="mt-3 space-y-3">
              {events.map((e, i) => (
                <li key={`${e.status}-${i}`} className="flex items-center gap-3 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="size-3.5" strokeWidth={3} aria-hidden="true" /></span>
                  <span className="font-extrabold text-ink">{STATUS_LABEL[e.status]}</span>
                  <span className="ml-auto text-xs font-semibold text-muted-foreground">{formatPayDate(e.at)}</span>
                </li>
              ))}
            </ol>
          </section>
          <div className="grid gap-2 print:hidden sm:flex sm:flex-row-reverse sm:justify-start">
            <button type="button" onClick={() => window.print()} className={outcomeButton.primary}><Printer aria-hidden="true" /> Print or save as PDF</button>
            <Link to="/courses" className={outcomeButton.secondary}>Return to marketplace</Link>
          </div>
          <p className="text-xs text-muted-foreground">Enski · Questions about this order? Visit the <Link to="/faq" className="font-bold text-brand hover:underline">Help Center</Link> and quote {reference}.</p>
        </div>
      </article>
    </FocusShell>
  );
}
