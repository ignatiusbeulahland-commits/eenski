import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ShopGrid } from "@/components/shop/ShopGrid";
import { BuyButton } from "@/components/site/checkout/BuyGate";
import { Button } from "@/components/ui/button";
import { findStore, storeShopItem, type PublicStore } from "@/lib/creator/publicStore";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** A creator's public store: their published products, bought through the sitewide checkout. */
export function PublicStorefront({ handle, itemId }: { handle: string; itemId?: string | undefined }) {
  const [store, setStore] = useState<PublicStore | null | undefined>(undefined);
  useEffect(() => setStore(findStore(handle)), [handle]);
  const items = useMemo(() => (store ? store.items.map((i) => storeShopItem(store, i)) : []), [store]);
  const picked = store?.items.find((i) => i.id === itemId) ?? null;
  const pickedShop = picked && store ? storeShopItem(store, picked) : null;

  useEffect(() => {
    if (picked) document.getElementById("store-item")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [picked]);

  if (store === undefined) {
    return <div className="mx-auto max-w-6xl px-5 py-16" aria-busy="true"><div className="h-48 animate-pulse rounded-[28px] bg-soft" /><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-soft" />)}</div></div>;
  }

  if (!store) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center px-5 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-soft text-brand"><Store className="h-7 w-7" aria-hidden="true" /></span>
        <h1 className="mt-5 text-3xl font-extrabold text-ink">This store isn't open</h1>
        <p className="mt-3 text-muted-foreground">There's no live store at @{handle}. The creator may have hidden it or changed their store link.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/dreamverse">Explore creators</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/courses">Browse courses</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-in">
      <section data-surface="dark" className="bg-brand-panel relative overflow-hidden">
        {store.banner && <img src={store.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-5 pb-10 pt-12 sm:flex-row sm:items-end sm:pt-16">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-card text-2xl font-extrabold text-brand ring-4 ring-card sm:h-24 sm:w-24">
            {store.photo ? <img src={store.photo} alt={store.owner} className="h-full w-full object-cover" /> : (store.name || store.owner).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-lime">@{store.handle}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-on-dark sm:text-4xl">{store.name || store.owner}</h1>
            {store.tagline && <p className="mt-2 max-w-2xl text-on-dark-muted">{store.tagline}</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {store.about && <p className="mb-8 max-w-3xl whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{store.about}</p>}

        {picked && pickedShop && (
          <section id="store-item" className="surface mb-10 scroll-mt-24 overflow-hidden" aria-label={picked.title}>
            <div className="grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <img src={pickedShop.image.src} alt={picked.title} className="aspect-[4/3] h-full w-full object-cover" />
              <div className="flex flex-col p-6 sm:p-8">
                <Link to="/store/$handle" params={{ handle: store.handle }} search={{ item: undefined }} className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />All products</Link>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand">{pickedShop.typeLabel}{picked.category ? ` · ${picked.category}` : ""}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">{picked.title}</h2>
                {picked.description && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{picked.description}</p>}
                <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                  {picked.kind === "course" && picked.lessons.filter(Boolean).length > 0 && <li className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />{picked.lessons.filter(Boolean).length} lessons</li>}
                  {picked.duration > 0 && (picked.kind === "coaching" || picked.kind === "service") && <li className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{picked.kind === "coaching" ? `${picked.duration}-minute sessions` : `Delivered in ${picked.duration} days`}</li>}
                  <li className="rounded-full bg-soft px-3 py-1">By {store.owner}</li>
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                  <p className="text-2xl font-extrabold tabular-nums text-ink">{picked.price ? naira(picked.price) : "Free"}</p>
                  {picked.price > 0 && <BuyButton label={picked.kind === "course" ? "Enrol now" : "Buy now"} price={naira(picked.price)} item={pickedShop} />}
                </div>
              </div>
            </div>
          </section>
        )}

        <h2 className="mb-5 text-xl font-extrabold text-ink">{items.length ? `Everything from ${store.name || store.owner}` : "No products yet"}</h2>
        {items.length ? <ShopGrid items={items} /> : <p className="text-muted-foreground">New products will appear here as soon as they're published.</p>}
      </div>
    </div>
  );
}
