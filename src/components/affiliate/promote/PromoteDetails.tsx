import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Info, Link2, Megaphone, Share2, ShoppingBag, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/affiliate/ui";
import { outcomeButton } from "@/components/shared/outcome";
import { estCommission, naira, rateFor, rateSource, type Product } from "@/lib/affiliate/products";
import { useAffiliate } from "@/lib/affiliate/store";
import { cn } from "@/lib/utils";
import { CommissionChip, EarningsTiles, LinkBox, PromoteSteps } from "./parts";

export function promoStatus(promoting: boolean, termsAccepted: boolean) {
  if (!promoting) return { tone: "neutral" as const, label: "Not promoting yet" };
  return termsAccepted ? { tone: "success" as const, label: "Promoting · link active" } : { tone: "pending" as const, label: "Promoting · accept terms to earn" };
}

/** Step 2: everything about promoting one product, with the generate-link action. */
export function PromoteDetails({ product: p }: { product: Product }) {
  const { state } = useAffiliate();
  const navigate = useNavigate();
  const promoting = state.joined.includes(p.id);
  const status = promoStatus(promoting, state.termsAccepted);
  const what = p.type === "Ebook" ? "eBook" : "course";
  return (
    <div className="screen-in">
      <PromoteSteps current={promoting ? 1 : 0} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-muted shadow-card">
            <img src={p.image} alt={p.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" aria-hidden="true" />
            <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-xs font-extrabold text-foreground shadow-sm">{p.type === "Ebook" ? "eBook" : "Course"}</span>
            <CommissionChip product={p} dark className="absolute bottom-3 left-3 text-xs" />
          </div>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-text">{p.category}</p>
          <h1 className="mt-1 text-balance text-[26px] font-extrabold leading-tight text-ink sm:text-[32px]">{p.title}</h1>
          <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-line bg-card p-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cobalt text-sm font-extrabold text-primary-foreground" aria-hidden="true">
              {p.creator.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Created by</span>
              <span className="block truncate font-extrabold text-ink">{p.creator}</span>
              {p.creatorRole && <span className="block truncate text-xs text-muted-foreground">{p.creatorRole}</span>}
            </span>
          </div>
          <h2 className="mt-6 text-sm font-extrabold text-ink">What buyers get</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{p.promise}</p>
        </div>

        <aside aria-labelledby="promo-card-title" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <section className="overflow-hidden rounded-[24px] border border-line bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
              <h2 id="promo-card-title" className="flex items-center gap-2 text-base font-extrabold text-ink"><Megaphone className="size-4 text-cobalt" aria-hidden="true" />Promote this {what}</h2>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </div>
            <div className="p-5">
              <EarningsTiles product={p} />
              <p className="mt-2 text-xs text-muted-foreground">{rateSource(p)} · estimate at the full price of {naira(p.price)}</p>

              <h3 className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">How your link works</h3>
              <ol className="mt-2 grid gap-2.5">
                {([
                  [Share2, "You share your personal link", "Post it, send it or add it to your bio."],
                  [ShoppingBag, "Someone buys through it", `Your link tells Enski the purchase of this ${what} came from you.`],
                  [Wallet, `You earn ${rateFor(p)}% of the price`, `About ${naira(estCommission(p))} per sale, once the purchase clears.`],
                ] as const).map(([Icon, t, d], i) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-ice text-cobalt">
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="sr-only">Step {i + 1}</span>
                    </span>
                    <span className="min-w-0"><span className="block text-sm font-extrabold text-ink">{t}</span><span className="block text-xs text-muted-foreground">{d}</span></span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-soft p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Refunded purchases and purchases through your own link don't earn commission.
              </p>

              <div className="mt-5">
                {promoting ? (
                  <div className="grid gap-3">
                    <LinkBox productId={p.id} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Link to="/affiliate/promote/$productId" params={{ productId: p.id }} search={{ step: "share" }} className={cn(outcomeButton.primary, "sm:w-full")}><Share2 aria-hidden="true" />Share it</Link>
                      <Link to="/affiliate/my-affiliations" className={cn(outcomeButton.secondary, "sm:w-full")}><Link2 aria-hidden="true" />Promoted products</Link>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => void navigate({ to: "/affiliate/promote/$productId", params: { productId: p.id }, search: { step: "generating" } })} className={cn(outcomeButton.primary, "sm:w-full")}>
                    Generate my link <ArrowRight aria-hidden="true" />
                  </button>
                )}
                {!state.termsAccepted && (
                  <p className="mt-2 text-center text-xs font-semibold text-warning-foreground">Accept the affiliate terms on your overview page so your link can earn commission.</p>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
