import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Eye, Link2, MousePointerClick, Plus, RefreshCw, Search, Share2, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { CommissionChip, LinkBox, ProductMini } from "@/components/affiliate/promote/parts";
import { promoStatus } from "@/components/affiliate/promote/PromoteDetails";
import { EmptyState, PageHeader, StatusBadge } from "@/components/affiliate/ui";
import { TermsNotice } from "@/components/affiliate/TermsNotice";
import { estCommission, naira, products, type Product } from "@/lib/affiliate/products";
import { linkFor, promotionOf, regeneratePromotion, shareCount } from "@/lib/affiliate/promotions";
import { useAffiliate } from "@/lib/affiliate/store";
import { meta } from "@/lib/affiliate/meta";
import { undoToast } from "@/lib/shared/undo";

export const Route = createFileRoute("/affiliate/my-affiliations")({
  head: () => meta("Promoted products", "Products you promote, their personal links, commission and activity."),
  component: Affiliations,
});

function Affiliations() {
  const { state, update } = useAffiliate();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [remove, setRemove] = useState<Product | null>(null);
  const [renew, setRenew] = useState<Product | null>(null);
  const mine = state.joined.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  const list = mine.filter((p) => (p.title + p.creator).toLowerCase().includes(q.trim().toLowerCase()));
  const copies = mine.reduce((n, p) => n + promotionOf(state.promotions, p.id).copies, 0);
  const shares = mine.reduce((n, p) => n + shareCount(promotionOf(state.promotions, p.id)), 0);

  return (
    <div>
      {!state.termsAccepted && <TermsNotice />}
      <PageHeader eyebrow="My Affiliations" title="Promoted products" description="Everything you promote, with your personal link for each. Links stay the same unless you create a new one." actions={<Button asChild><Link to="/affiliate/market"><Plus /> Discover more products</Link></Button>} />
      {mine.length === 0 ? (
        <section className="surface overflow-hidden">
          <EmptyState icon={Link2} title="You haven't promoted any products yet" description="Explore the market, pick something your audience will love and generate your personal link." action={<Button asChild><Link to="/affiliate/market">Browse the market</Link></Button>} />
        </section>
      ) : (
        <>
          <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              [Link2, "Promoting", String(mine.length)],
              [Copy, "Link copies", String(copies)],
              [Share2, "Shares", String(shares)],
              [MousePointerClick, "Clicks", "0"],
            ] as const).map(([Icon, l, v]) => (
              <div key={l} className="flex items-center gap-3 rounded-[18px] border border-line bg-card p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ice text-cobalt"><Icon className="size-4" aria-hidden="true" /></span>
                <div className="min-w-0"><dt className="text-[11px] font-bold text-muted-foreground">{l}</dt><dd className="text-lg font-extrabold tabular-nums text-ink">{v}</dd></div>
              </div>
            ))}
          </dl>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label="Search your promoted products" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your products" className="h-11 rounded-full pl-9" /></div>
            <p className="ml-auto hidden text-xs font-semibold text-muted-foreground sm:block">{mine.length} product{mine.length > 1 ? "s" : ""}</p>
          </div>
          {list.length === 0 && <section className="surface"><EmptyState compact icon={Search} title="No matching products" description="Try a different search term." /></section>}
          <ul className="grid gap-4 2xl:grid-cols-2">
            {list.map((p) => {
              const promo = promotionOf(state.promotions, p.id);
              const { tracking } = linkFor(state.promotions, p.id);
              const status = promoStatus(true, state.termsAccepted);
              return (
                <li key={p.id} className="surface flex min-w-0 flex-col gap-4 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <ProductMini product={p} className="min-w-0 flex-1 basis-64">
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <CommissionChip product={p} />
                        <span className="text-xs font-bold text-brand">≈ {naira(estCommission(p))} per sale</span>
                      </div>
                    </ProductMini>
                    <StatusBadge tone={status.tone}>{state.termsAccepted ? "Active" : "Awaiting terms"}</StatusBadge>
                  </div>
                  <LinkBox productId={p.id} />
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line text-center sm:grid-cols-4">
                    {([
                      [Copy, "Copied", promo.copies],
                      [Share2, "Shared", shareCount(promo)],
                      [MousePointerClick, "Clicks", 0],
                      [ShoppingBag, "Sales", 0],
                    ] as const).map(([Icon, l, v]) => (
                      <div key={l} className="bg-card px-2 py-2.5">
                        <dt className="flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground"><Icon className="size-3" aria-hidden="true" />{l}</dt>
                        <dd className="text-base font-extrabold tabular-nums text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="-mt-2 text-xs text-muted-foreground">Tracking ID <span className="font-mono font-bold text-ink">{tracking}</span>{promo.startedAt ? ` · promoting since ${new Date(promo.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}. Clicks and sales appear here as people use your link.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm"><Link to="/affiliate/promote/$productId" params={{ productId: p.id }} search={{ step: "share" }}><Share2 /> Share</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link to="/affiliate/market/$productId" params={{ productId: p.id }}><Eye /> View product</Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => setRenew(p)}><RefreshCw /> New link</Button>
                    <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" aria-label={`Stop promoting ${p.title}`} onClick={() => setRemove(p)}><Trash2 /> <span className="sm:hidden">Stop</span><span className="hidden sm:inline">Stop promoting</span></Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <ConfirmDialog
        open={!!renew}
        onOpenChange={(o) => !o && setRenew(null)}
        art={brandArtwork.affiliations}
        eyebrow="Promoted products"
        title="Create a new link?"
        description={`Your current link for “${renew?.title ?? ""}” will stop working, and anyone who opens it won't be matched to you.`}
        confirmLabel="Create new link"
        onConfirm={() => {
          const target = renew;
          if (!target) return;
          update((s) => ({ promotions: regeneratePromotion(s.promotions ?? {}, target.id) }));
          void navigate({ to: "/affiliate/promote/$productId", params: { productId: target.id }, search: { step: "link", renewed: true } });
        }}
      >
        <ConfirmNote>Only do this if your old link was shared somewhere you no longer want it.</ConfirmNote>
      </ConfirmDialog>
      <ConfirmDialog
        open={!!remove}
        onOpenChange={(o) => !o && setRemove(null)}
        art={brandArtwork.affiliations}
        eyebrow="Promoted products"
        title="Stop promoting this product?"
        description={`Your link for “${remove?.title ?? ""}” stops earning commission while you aren't promoting it.`}
        confirmLabel="Stop promoting"
        onConfirm={() => {
          const target = remove;
          if (!target) return;
          const index = state.joined.indexOf(target.id);
          update((s) => ({ joined: s.joined.filter((j) => j !== target.id) }));
          undoToast("Product removed from your promoted products", () => update((s) => (s.joined.includes(target.id) ? {} : { joined: [...s.joined.slice(0, index), target.id, ...s.joined.slice(index)] })));
        }}
      >
        <ConfirmNote>You can promote it again any time from the market, and you'll get the same link back.</ConfirmNote>
      </ConfirmDialog>
    </div>
  );
}
