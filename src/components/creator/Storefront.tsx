import { Link } from "@tanstack/react-router";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { useState } from "react";
import { Camera, Copy, Eye, EyeOff, Globe, ImagePlus, PenLine, Plus, Search, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Switch } from "@/components/dashboard-ui/switch";
import { PageHeader, EmptyState } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { BrandIcon } from "@/components/affiliate/BrandIcon";
import { naira } from "@/lib/affiliate/products";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { kindInfo } from "@/lib/creator/data";
import { KINDS, type CreatorItem, type ItemKind } from "@/lib/creator/rules";
import { ItemLink, copyText, itemPaths } from "./shared";
import { StoreAvatar, StorefrontBranding, usePhotoPicker } from "./StorefrontBranding";
import { ProductCover, kindArt } from "./products/ProductChrome";
import { cn } from "@/lib/utils";
import { StorePageSettings } from "./StorePageSettings";

export const storeUrl = (handle: string) => `${typeof window !== "undefined" ? window.location.origin : "https://ensk.lovable.app"}/store/${handle.toLowerCase()}`;

function StoreProductCard({ item }: { item: CreatorItem }) {
  return (
    <ItemLink item={item} className="product-card surface group flex min-w-0 flex-col overflow-hidden hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-lift">
      <div className="relative">
        <ProductCover src={item.image} alt={item.title} kind={item.kind} className="aspect-[4/3] w-full" imgClassName="product-card-img group-hover:scale-105" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-extrabold text-cobalt shadow-sm">{kindInfo[item.kind].label}</span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="line-clamp-2 text-sm font-extrabold leading-snug group-hover:text-cobalt">{item.title}</p>
        {item.category && <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.category}</p>}
        <p className="mt-auto pt-3 text-[15px] font-extrabold tabular-nums">{item.price ? naira(item.price) : "Free"}</p>
      </div>
    </ItemLink>
  );
}

export function StorefrontPage() {
  const { state, update } = useCreator();
  const [form, setForm] = useState(state.storefront);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<ItemKind | "all">("all");
  const [q, setQ] = useState("");
  const photo = usePhotoPicker();
  const saved = state.storefront;
  const published = state.items.filter((i) => i.status === "published");
  const ready = Boolean(saved.name && saved.handle);
  const text = (f: typeof form) => JSON.stringify([f.name, f.handle, f.tagline, f.about]);
  const dirty = text(form) !== text(saved);
  const kindsLive = KINDS.filter((k) => published.some((i) => i.kind === k));
  const shown = published.filter((i) => (kind === "all" || i.kind === kind) && (i.title + i.category).toLowerCase().includes(q.toLowerCase()));
  const sections = (kind === "all" ? kindsLive : [kind]).map((k) => ({ k, items: shown.filter((i) => i.kind === k) })).filter((s) => s.items.length);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Add a store name.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.handle) || form.handle.length < 3 || form.handle.length > 40)
      return setError("Use a 3–40 character handle with lowercase letters, numbers and hyphens.");
    update((s) => ({
      storefront: { ...s.storefront, name: form.name.trim(), handle: form.handle, tagline: form.tagline, about: form.about },
      activity: [...s.activity, activityEntry("Storefront details saved")],
    }));
    setError("");
    toast.success("Storefront saved");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your store"
        title="Storefront"
        description="Your public page where people discover and buy your products."
        actions={ready && (
          <div className="flex flex-wrap gap-2">
            {saved.published && <Button asChild><Link to="/store/$handle" params={{ handle: saved.handle.toLowerCase() }} search={{ item: undefined }}><Eye />Open live store</Link></Button>}
            <Button variant="outline" onClick={() => copyText(storeUrl(saved.handle))}><Copy />Copy store link</Button>
          </div>
        )}
      />

      {/* Live storefront preview */}
      <section className="surface mb-6 overflow-hidden" aria-label="Storefront preview">
        <div className="flex items-center gap-2 border-b bg-soft/60 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" /></span>
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-line"><Globe className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{saved.handle ? storeUrl(saved.handle) : "tryenski.com/your-store"}</span></span>
          <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold", saved.published ? "bg-success-soft text-success" : "bg-soft text-muted-foreground")}>{saved.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{saved.published ? "Live" : "Hidden"}</span>
        </div>
        <div data-surface="dark" className="bg-brand-panel relative aspect-[16/5] max-h-72 min-h-28 w-full overflow-hidden">
          {saved.banner ? (
            <img src={saved.banner} alt="Storefront banner" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-y-0 right-4 hidden items-center gap-2 sm:flex" aria-hidden="true">
              {KINDS.slice(0, 3).map((k) => <BrandIcon key={k} src={kindArt[k]} className="h-14 w-14 opacity-90" />)}
            </div>
          )}
          <a href="#store-branding" aria-label={saved.banner ? "Change banner" : "Add banner"} className="absolute right-2.5 top-2.5 inline-flex h-8 items-center gap-1.5 rounded-full bg-card/95 px-2.5 text-xs sm:right-3 sm:top-3 sm:h-9 sm:px-3.5 font-extrabold text-foreground shadow-sm backdrop-blur transition-colors hover:text-cobalt">
            <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" /><span className="hidden sm:inline">{saved.banner ? "Change banner" : "Add banner"}</span>
          </a>
        </div>
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-8 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end">
            <div className="relative w-fit">
              <div className="rounded-full bg-card p-1.5 shadow-lift [&>*]:h-16 [&>*]:w-16 [&>*]:text-xl sm:[&>*]:h-24 sm:[&>*]:text-2xl sm:[&>*]:w-24"><StoreAvatar /></div>
              <button type="button" onClick={photo.open} disabled={photo.busy} aria-label="Change profile photo" className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center sm:bottom-1 sm:right-1 sm:h-9 sm:w-9 rounded-full bg-cobalt text-primary-foreground shadow-lift ring-[3px] ring-card transition-colors hover:bg-cobalt-press disabled:opacity-60">
                <Camera className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="truncate text-2xl">{saved.name || "Your store name"}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{saved.tagline || "Add a tagline that tells people what you offer."}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-full border bg-card px-4 py-2">
              <label htmlFor="store-live" className="text-[13px] font-bold">{saved.published ? "Visible to everyone" : "Hidden"}</label>
              <Switch id="store-live" checked={saved.published} disabled={!ready} onCheckedChange={(v) => { update((s) => ({ storefront: { ...s.storefront, published: v } })); toast.success(v ? "Storefront is visible" : "Storefront hidden"); }} />
            </div>
          </div>
          {saved.about && <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{saved.about}</p>}
          {!ready && <p className="mt-4 text-xs font-semibold text-muted-foreground">Save a store name and handle below to make your storefront visible.</p>}

          {/* Catalogue */}
          <div className="mt-7 border-t pt-6">
            {published.length ? (
              <>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <SectionDropdown heading="Product type" value={kind} onChange={(v) => setKind(v as typeof kind)} options={(["all", ...kindsLive] as const).map((k) => ({ value: k, label: k === "all" ? "All products" : kindInfo[k].plural, count: k === "all" ? published.length : published.filter((i) => i.kind === k).length }))} className="md:hidden" />
                  <div className="hidden flex-wrap gap-1.5 md:flex" role="group" aria-label="Product types">
                    {(["all", ...kindsLive] as const).map((k) => (
                      <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("lime-pip h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-bold transition-colors", kind === k ? "border-midnight bg-midnight text-primary-foreground" : "bg-card hover:border-cobalt-100 hover:text-cobalt")}>
                        {k === "all" ? `All products · ${published.length}` : `${kindInfo[k].plural} · ${published.filter((i) => i.kind === k).length}`}
                      </button>
                    ))}
                  </div>
                  <div className="relative sm:ml-auto sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input aria-label="Search storefront" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="h-10 pl-10" />
                  </div>
                </div>
                {sections.length ? (
                  <div className="space-y-8">
                    {sections.map((s) => (
                      <section key={s.k} aria-label={kindInfo[s.k].plural}>
                        <div className="mb-3 flex items-center gap-2.5">
                          <BrandIcon src={kindArt[s.k]} className="h-8 w-8" />
                          <h3 className="text-base font-extrabold">{kindInfo[s.k].plural}</h3>
                          <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-bold text-muted-foreground">{s.items.length}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                          {s.items.map((i) => <StoreProductCard key={i.id} item={i} />)}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Search} title="No products match" description="Try another search or product type." compact action={<Button variant="outline" size="sm" onClick={() => { setQ(""); setKind("all"); }}>Clear filters</Button>} />
                )}
              </>
            ) : (
              <div className="text-center">
                <EmptyState icon={Store} title="No published products" description="Publish a product and it appears here, grouped by type." compact />
                <div className="mx-auto -mt-2 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-5">
                  {KINDS.map((k) => (
                    <Link key={k} to={itemPaths[k].create} className="surface group flex flex-col items-center gap-2 p-3 text-center transition-colors hover:border-cobalt-100">
                      <BrandIcon src={kindArt[k]} className="h-10 w-10 transition-transform group-hover:-translate-y-0.5" />
                      <span className="text-xs font-extrabold group-hover:text-cobalt">{kindInfo[k].label}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cobalt"><Plus className="h-3 w-3" />Create</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <StorefrontBranding photo={photo} />

      <StorePageSettings />

      {/* Editor */}
      <form noValidate onSubmit={save} className="surface overflow-hidden">
        <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt ring-1 ring-line" aria-hidden="true"><PenLine className="h-[18px] w-[18px]" /></span>
          <div><h2 className="text-[15px] font-extrabold">Store details</h2><p className="text-[13px] text-muted-foreground">What visitors see at the top of your storefront.</p></div>
        </header>
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field id="store-name" label="Store name">
            <Input id="store-name" value={form.name} maxLength={80} placeholder="e.g. Ada's Design School" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field id="store-handle" label="Store handle" hint="Lowercase letters, numbers and hyphens">
            <div className="flex h-12 items-center overflow-hidden rounded-[14px] border-[1.5px] border-input bg-card focus-within:border-cobalt focus-within:ring-4 focus-within:ring-ice">
              <span className="shrink-0 border-r bg-soft px-3 text-sm font-semibold text-muted-foreground">tryenski.com/</span>
              <input id="store-handle" value={form.handle} maxLength={40} onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium outline-none" placeholder="your-name" />
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field id="store-tagline" label="Tagline" hint={`${form.tagline.length}/120`}>
              <Input id="store-tagline" value={form.tagline} maxLength={120} placeholder="One line about what you teach or sell" onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id="store-about" label="About" hint={`${form.about.length}/800`}>
              <Textarea id="store-about" rows={4} value={form.about} maxLength={800} placeholder="Who you are, who your products are for and what people will get." onChange={(e) => setForm({ ...form, about: e.target.value })} />
            </Field>
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-destructive sm:col-span-2">{error}</p>}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t bg-soft/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[13px] font-semibold text-muted-foreground">{dirty ? "You have unsaved changes" : "All changes saved"}</p>
          <div className="flex gap-2">
            {dirty && <Button type="button" variant="quiet" onClick={() => { setForm(saved); setError(""); }}>Discard</Button>}
            <Button type="submit">Save storefront</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
