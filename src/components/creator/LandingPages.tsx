import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { removeWhere, restoreAll, restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, Globe, LayoutTemplate, Monitor, Rows3, Save, Send, ShoppingBag, SlidersHorizontal, Smartphone, Plus, Pencil, Trash2, Type, Users, Copy, Download, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { naira } from "@/lib/affiliate/products";
import { ImageUpload } from "./ImageUpload";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { PageHeader, Panel, EmptyState, FilterSelect, StatCard } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { LANDING_MAX_SECTIONS, isEmail, slugify, validateLanding, type LandingPage, type LandingSection } from "@/lib/creator/rules";
import { CreatorNotFound, ItemStatus, copyText, downloadCsv, shortDate } from "./shared";
const pageUrl = (handle: string, slug: string) => `https://tryenski.com/${handle || "your-store"}/p/${slug}`;
const templates: { id: LandingPage["template"]; name: string; text: string }[] = [
  { id: "spotlight", name: "Spotlight", text: "Bold centred hero" },
  { id: "split", name: "Split", text: "Text beside image" },
  { id: "minimal", name: "Minimal", text: "Clean and text-led" },
];
const sectionPresets = [
  { title: "What you'll get", text: "List the outcomes, lessons or files people receive." },
  { title: "About me", text: "Introduce yourself and why you're the right person to learn from." },
  { title: "What people say", text: "Share a short quote from a happy customer." },
];
function TemplateThumb({ id, cover, className }: { id: LandingPage["template"]; cover?: string; className?: string }) {
  const img = cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div data-surface="dark" className="bg-brand-panel h-full w-full" />;
  return (
    <div className={cn("landing-thumb relative overflow-hidden rounded-[14px] bg-card ring-1 ring-line", className)} aria-hidden="true">
      {id === "spotlight" && (
        <div className="flex h-full flex-col">
          <div className="relative h-[58%] overflow-hidden">{img}<div className="absolute inset-0 grid place-content-center justify-items-center gap-1"><span className="h-1.5 w-16 rounded-full bg-on-dark/90" /><span className="h-1 w-10 rounded-full bg-on-dark/60" /><span className="mt-1 h-2.5 w-9 rounded-full bg-lime" /></div></div>
          <div className="grid flex-1 grid-cols-3 gap-1.5 p-2">{[0, 1, 2].map((i) => <span key={i} className="rounded-md bg-soft" />)}</div>
        </div>
      )}
      {id === "split" && (
        <div className="grid h-full grid-cols-2 gap-2 p-2.5">
          <div className="flex flex-col justify-center gap-1.5"><span className="h-1.5 w-full rounded-full bg-midnight/80" /><span className="h-1.5 w-3/4 rounded-full bg-midnight/80" /><span className="h-1 w-full rounded-full bg-line" /><span className="h-1 w-2/3 rounded-full bg-line" /><span className="mt-1 h-2.5 w-10 rounded-full bg-cobalt" /></div>
          <div className="overflow-hidden rounded-[10px]">{img}</div>
        </div>
      )}
      {id === "minimal" && (
        <div className="flex h-full flex-col items-start justify-center gap-1.5 p-3">
          <span className="h-1 w-8 rounded-full bg-lime" /><span className="h-2 w-4/5 rounded-full bg-midnight/80" /><span className="h-1 w-full rounded-full bg-line" /><span className="h-1 w-3/4 rounded-full bg-line" />
          <div className="mt-1 h-8 w-full overflow-hidden rounded-[8px]">{img}</div>
          <span className="h-2.5 w-10 rounded-full bg-cobalt" />
        </div>
      )}
    </div>
  );
}

export function LandingPagesList() {
  const { state, update } = useCreator();
  const [del, setDel] = useState<LandingPage | null>(null);
  const delLeads = del ? state.leads.filter((l) => l.pageId === del.id).length : 0;
  const deletePage = (p: LandingPage) => {
    const { removed } = removeWhere(state.landingPages, (x) => x.id === p.id);
    const leadsRemoved = state.leads.map((item, index) => ({ item, index })).filter((r) => r.item.pageId === p.id);
    update((s) => ({ landingPages: s.landingPages.filter((x) => x.id !== p.id), leads: s.leads.filter((l) => l.pageId !== p.id) }));
    setDel(null);
    if (removed) undoToast(`"${p.title}" deleted`, () => update((s) => ({ landingPages: restoreAt(s.landingPages, removed, sameId), leads: restoreAll(s.leads, leadsRemoved, sameId) })));
  };
  const create = (
    <Button asChild>
      <Link to="/creator/landing-pages/create">
        <Plus />
        Create landing page
      </Link>
    </Button>
  );
  const published = state.landingPages.filter((p) => p.status === "published").length;
  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Landing pages" description="Focused pages that collect leads or sell a single product." actions={create} />
      {state.landingPages.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-3">
          <StatCard icon={ShoppingBag} label="Pages" value={String(state.landingPages.length)} />
          <StatCard icon={Globe} label="Published" value={String(published)} tone="sky" />
          <StatCard icon={Users} label="Leads" value={String(state.leads.length)} tone="lime" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.landingPages.map((p) => {
          const leads = state.leads.filter((l) => l.pageId === p.id).length;
          return (
            <article key={p.id} className="product-card surface group flex flex-col overflow-hidden hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-lift">
              <Link to="/creator/landing-pages/$pageId/edit" params={{ pageId: p.id }} className="block bg-soft p-3" aria-label={`Edit ${p.title}`}>
                <TemplateThumb id={p.template} cover={p.cover} className="aspect-[16/10] w-full" />
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 truncate text-base">{p.title}</h2>
                  <ItemStatus status={p.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{pageUrl(state.storefront.handle, p.slug)}</p>
                <p className="mt-2 text-xs font-semibold text-muted-foreground">{templates.find((t) => t.id === p.template)?.name} · {leads} lead{leads === 1 ? "" : "s"} · Updated {shortDate(p.date)}</p>
                <div className="mt-auto flex flex-wrap gap-2 border-t pt-3.5">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/creator/landing-pages/$pageId/edit" params={{ pageId: p.id }}><Pencil />Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="soft">
                    <Link to="/creator/landing-pages/$pageId/leads" params={{ pageId: p.id }}><Users />Leads</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const status = p.status === "published" ? "draft" : "published";
                    update((s) => ({ landingPages: s.landingPages.map((x) => (x.id === p.id ? { ...x, status } : x)) }));
                    toast.success(status === "published" ? "Page published" : "Page unpublished");
                  }}>{p.status === "published" ? "Unpublish" : "Publish"}</Button>
                  <Button size="sm" variant="ghost" className="ml-auto h-9 w-9 px-0 text-muted-foreground hover:text-destructive" aria-label={`Delete ${p.title}`} onClick={() => setDel(p)}><Trash2 /></Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        art={brandArtwork.bin}
        eyebrow="Landing pages"
        title={`Delete “${del?.title ?? ""}”?`}
        description={del?.status === "published" ? "The page goes offline straight away." : "The page and its design will be removed."}
        confirmLabel="Delete page"
        confirmIcon={<Trash2 />}
        onConfirm={() => { if (del) deletePage(del); }}
      >
        <ConfirmNote>{delLeads ? `Its ${delLeads} lead${delLeads === 1 ? "" : "s"} will be deleted too, so export them first if you need them.` : "It has no leads yet."}</ConfirmNote>
      </ConfirmDialog>
      {!state.landingPages.length && (
        <section className="surface overflow-hidden">
          <EmptyState icon={ShoppingBag} title="No landing pages yet" description="Pick a template, add your images and words, and publish in minutes." action={create} />
          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3 px-5 pb-10">
            {templates.map((t) => (
              <div key={t.id} className="text-center"><TemplateThumb id={t.id} className="aspect-[4/3] w-full" /><p className="mt-2 text-xs font-extrabold">{t.name}</p></div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LandingPreview({ page, product, store, device }: { page: LandingPage; product?: { title: string; price: number } | undefined; store: string; device: "desktop" | "mobile" }) {
  const mobile = device === "mobile";
  const cover = page.cover ? <img src={page.cover} alt="Cover" className="h-full w-full object-cover" /> : null;
  const headline = page.headline || "Your headline goes here";
  const body = page.body || "Describe what people get and why it matters to them.";
  const cta = <span className="inline-flex h-11 items-center rounded-full bg-lime px-6 text-sm font-extrabold text-midnight">{page.cta || "Get access"}</span>;
  const ctaLight = <span className="inline-flex h-11 items-center rounded-full bg-cobalt px-6 text-sm font-extrabold text-primary-foreground">{page.cta || "Get access"}</span>;
  const offer = product ? (
    <div className="mt-5 inline-flex items-center gap-3 rounded-[16px] bg-card px-4 py-3 text-left text-foreground shadow-lift ring-1 ring-line">
      <span className="min-w-0"><span className="block truncate text-sm font-extrabold">{product.title}</span><span className="block text-xs text-muted-foreground">{product.price ? naira(product.price) : "Free"}</span></span>
    </div>
  ) : null;
  return (
    <div className="landing-preview bg-card text-foreground">
      {page.template === "spotlight" && (
        <div data-surface="dark" className={cn("bg-brand-panel relative overflow-hidden text-center text-on-dark", mobile ? "px-5 py-12" : "px-10 py-20")}>
          {cover && <div className="absolute inset-0 opacity-35">{cover}</div>}
          <div className="relative mx-auto max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime">{store}</p>
            <h1 className={cn("mt-3 leading-tight", mobile ? "text-2xl" : "text-4xl")}>{headline}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm text-on-dark-muted">{body}</p>
            <div className="mt-6">{cta}</div>
            {offer}
          </div>
        </div>
      )}
      {page.template === "split" && (
        <div className={cn("grid items-center gap-6", mobile ? "px-5 py-8" : "grid-cols-2 px-10 py-14")}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt">{store}</p>
            <h1 className={cn("mt-2 leading-tight", mobile ? "text-2xl" : "text-[34px]")}>{headline}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{body}</p>
            <div className="mt-5">{ctaLight}</div>
            {offer}
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-soft">{cover ?? <div data-surface="dark" className="bg-brand-panel h-full w-full" />}</div>
        </div>
      )}
      {page.template === "minimal" && (
        <div className={cn("mx-auto max-w-2xl", mobile ? "px-5 py-10" : "px-10 py-16")}>
          <span className="block h-1.5 w-12 rounded-full bg-lime" />
          <h1 className={cn("mt-4 leading-tight", mobile ? "text-2xl" : "text-4xl")}>{headline}</h1>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{body}</p>
          {cover && <div className="mt-6 aspect-[16/9] overflow-hidden rounded-[18px]">{cover}</div>}
          <div className="mt-6">{ctaLight}</div>
          {offer}
        </div>
      )}
      {page.sections.length > 0 && (
        <div className={cn("space-y-8 border-t", mobile ? "px-5 py-8" : "px-10 py-12")}>
          {page.sections.map((sec, i) => (
            <section key={sec.id} className={cn("grid items-center gap-5", !mobile && sec.image && "grid-cols-2")}>
              {sec.image && <div className={cn("aspect-[4/3] overflow-hidden rounded-[18px] bg-soft", !mobile && i % 2 === 1 && "order-2")}><img src={sec.image} alt={sec.title} className="h-full w-full object-cover" /></div>}
              <div><h2 className="text-xl">{sec.title || "Section title"}</h2>{sec.text && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{sec.text}</p>}</div>
            </section>
          ))}
        </div>
      )}
      {!product && (
        <div className={cn("border-t bg-soft/60", mobile ? "px-5 py-8" : "px-10 py-10")}>
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm font-extrabold">Join the list</p>
            <div className={cn("mt-3 flex gap-2", mobile && "flex-col")}><span className={cn("h-11 rounded-[14px] border-[1.5px] bg-card", mobile ? "w-full" : "flex-1")} /><span className="inline-flex h-11 items-center justify-center rounded-full bg-cobalt px-5 text-sm font-extrabold text-primary-foreground">{page.cta || "Get access"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "design", label: "Design", icon: LayoutTemplate },
  { id: "content", label: "Content", icon: Type },
  { id: "sections", label: "Sections", icon: Rows3 },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
] as const;

export function LandingPageEditor({ id }: { id?: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const found = state.landingPages.find((p) => p.id === id);
  const [form, setForm] = useState<LandingPage>(
    found ?? { id: "", title: "", slug: "", itemId: "", headline: "", body: "", cta: "Get access", status: "draft", date: "", template: "spotlight", cover: "", sections: [] },
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(found));
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(found ? "content" : "design");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  if (id && !found) return <CreatorNotFound what="landingPage" />;
  const products = state.items.filter((i) => i.status !== "archived");
  const product = products.find((i) => i.id === form.itemId);
  const setSection = (sid: string, patch: Partial<LandingSection>) => setForm((f) => ({ ...f, sections: f.sections.map((x) => (x.id === sid ? { ...x, ...patch } : x)) }));
  const move = (i: number, d: -1 | 1) => setForm((f) => { const next = [...f.sections]; const [x] = next.splice(i, 1); if (x) next.splice(i + d, 0, x); return { ...f, sections: next }; });
  const save = (status: LandingPage["status"]) => {
    const page = { ...form, status, id: found?.id ?? crypto.randomUUID(), title: form.title.trim(), headline: form.headline.trim(), cta: form.cta.trim(), sections: form.sections.map((x) => ({ ...x, title: x.title.trim(), text: x.text.trim() })), date: new Date().toISOString() };
    const err = validateLanding(page, state.landingPages);
    if (err) {
      setError(err);
      if (!page.title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) setTab("settings"); else if (page.sections.some((x) => !x.title)) setTab("sections"); else setTab("content");
      return;
    }
    try {
      update((s) => ({
        landingPages: found ? s.landingPages.map((p) => (p.id === page.id ? page : p)) : [...s.landingPages, page],
        activity: [...s.activity, activityEntry(`${found ? "Updated" : "Created"} landing page: ${page.title}`)],
      }));
    } catch {
      setError("Your images are too large to save. Remove or replace one and try again.");
      return;
    }
    toast.success(status === "published" ? "Landing page published" : "Landing page saved");
    navigate({ to: "/creator/landing-pages" });
  };
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Landing page builder</p>
          <h1 className="truncate text-2xl sm:text-[28px]">{form.title || (found ? found.title : "New landing page")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ItemStatus status={form.status} />
          <Button variant="outline" onClick={() => save("draft")}><Save />Save draft</Button>
          <Button onClick={() => save("published")}><Send />{form.status === "published" ? "Update page" : "Publish"}</Button>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-[14px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <section className="surface overflow-hidden lg:sticky lg:top-24">
          <div className="grid grid-cols-4 border-b p-1.5" role="tablist" aria-label="Builder panels">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("flex flex-col items-center gap-1 rounded-[14px] py-2 text-xs font-extrabold transition-colors", tab === t.id ? "bg-ice text-cobalt" : "text-muted-foreground hover:text-cobalt")}>
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>
          <div className="max-h-none space-y-5 overflow-x-hidden p-5 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto" role="tabpanel">
            {tab === "design" && (
              <>
                <div>
                  <p className="text-sm font-extrabold">Choose a template</p>
                  <p className="text-[13px] text-muted-foreground">You can switch any time; your content stays.</p>
                </div>
                <div className="grid gap-3" role="radiogroup" aria-label="Template">
                  {templates.map((t) => (
                    <button key={t.id} type="button" role="radio" aria-checked={form.template === t.id} onClick={() => setForm({ ...form, template: t.id })} className={cn("flex items-center gap-3 rounded-[18px] border-[1.5px] p-2.5 text-left transition-all", form.template === t.id ? "border-cobalt bg-ice/60 ring-1 ring-cobalt" : "border-line hover:border-cobalt-100")}>
                      <TemplateThumb id={t.id} cover={form.cover} className="aspect-[4/3] w-28 shrink-0" />
                      <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{t.name}</span><span className="block text-xs text-muted-foreground">{t.text}</span></span>
                      {form.template === t.id && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>}
                    </button>
                  ))}
                </div>
                <ImageUpload id="lp-cover" label="Cover image" value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} hint="Shown in the hero · JPG, PNG or WebP up to 5 MB" />
              </>
            )}
            {tab === "content" && (
              <>
                <Field id="lp-headline" label="Headline" hint={`${form.headline.length}/140`}>
                  <Input id="lp-headline" value={form.headline} maxLength={140} placeholder="e.g. Learn product design in 30 days" onChange={(e) => setForm({ ...form, headline: e.target.value })} />
                </Field>
                <Field id="lp-body" label="Description">
                  <Textarea id="lp-body" rows={5} value={form.body} maxLength={2000} placeholder="Who it's for and what they'll get." onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </Field>
                <Field id="lp-cta" label="Button label">
                  <Input id="lp-cta" value={form.cta} maxLength={40} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
                </Field>
                <ImageUpload id="lp-cover-2" label="Cover image" value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} />
              </>
            )}
            {tab === "sections" && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-sm font-extrabold">Page sections</p><p className="text-[13px] text-muted-foreground">{form.sections.length}/{LANDING_MAX_SECTIONS} · each can have its own image</p></div>
                </div>
                {form.sections.map((sec, i) => (
                  <div key={sec.id} className="rounded-[18px] border-[1.5px] border-line p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-ice text-xs font-extrabold text-cobalt">{i + 1}</span>
                      <p className="min-w-0 flex-1 truncate text-sm font-extrabold">{sec.title || "Untitled section"}</p>
                      <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice hover:text-cobalt disabled:opacity-30" aria-label={`Move section ${i + 1} up`}><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" disabled={i === form.sections.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-ice hover:text-cobalt disabled:opacity-30" aria-label={`Move section ${i + 1} down`}><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" onClick={() => { const removed = { item: sec, index: i }; setForm((f) => ({ ...f, sections: f.sections.filter((x) => x.id !== sec.id) })); undoToast(`Section "${sec.title || i + 1}" removed`, () => setForm((f) => ({ ...f, sections: restoreAt(f.sections, removed, sameId) }))); }} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove section ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-3">
                      <Field id={`sec-title-${sec.id}`} label="Title"><Input id={`sec-title-${sec.id}`} value={sec.title} maxLength={80} onChange={(e) => setSection(sec.id, { title: e.target.value })} /></Field>
                      <Field id={`sec-text-${sec.id}`} label="Text"><Textarea id={`sec-text-${sec.id}`} rows={3} value={sec.text} placeholder={sectionPresets.find((p) => p.title === sec.title)?.text ?? "A few sentences for this section."} maxLength={800} onChange={(e) => setSection(sec.id, { text: e.target.value })} /></Field>
                      <ImageUpload id={`sec-img-${sec.id}`} label="Section image" value={sec.image} onChange={(v) => setSection(sec.id, { image: v })} aspect="aspect-[4/3]" maxSide={900} hint="Optional · JPG, PNG or WebP up to 5 MB" />
                    </div>
                  </div>
                ))}
                {form.sections.length < LANDING_MAX_SECTIONS ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Add a section</p>
                    <div className="grid gap-2">
                      {[...sectionPresets, { title: "", text: "" }].map((pr) => (
                        <button key={pr.title || "blank"} type="button" onClick={() => setForm((f) => ({ ...f, sections: [...f.sections, { id: crypto.randomUUID(), title: pr.title, text: "", image: "" }] }))} className="flex w-full min-w-0 items-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-cobalt-100 px-3.5 py-2.5 text-left transition-colors hover:border-cobalt hover:bg-ice/50">
                          <Plus className="h-4 w-4 shrink-0 text-cobalt" />
                          <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{pr.title || "Blank section"}</span>{pr.text && <span className="block truncate text-xs text-muted-foreground">{pr.text}</span>}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-xs font-semibold text-muted-foreground">You've reached {LANDING_MAX_SECTIONS} sections.</p>}
              </>
            )}
            {tab === "settings" && (
              <>
                <Field id="lp-title" label="Page title" hint="For you and browser tabs">
                  <Input id="lp-title" value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })} />
                </Field>
                <Field id="lp-slug" label="Page address" hint={pageUrl(state.storefront.handle, form.slug || "page")}>
                  <Input id="lp-slug" value={form.slug} maxLength={60} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value.toLowerCase() }); }} />
                </Field>
                <Field id="lp-item" label="Linked product (optional)" hint={product ? "Visitors can buy this product" : "Visitors join your list"}>
                  <FilterSelect label="Product" value={form.itemId || "none"} onChange={(v) => setForm({ ...form, itemId: v === "none" ? "" : v })} className="w-full sm:w-full" options={[["none", "Collect leads only"], ...products.map((i) => [i.id, i.title] as [string, string])]} />
                </Field>
              </>
            )}
          </div>
        </section>

        <section className="min-w-0" aria-label="Live preview">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-extrabold"><Eye className="h-4 w-4 text-cobalt" />Live preview</p>
            <div className="inline-flex rounded-full border bg-card p-1" role="group" aria-label="Preview device">
              {([["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "Mobile"]] as const).map(([d, I, l]) => (
                <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition-colors", device === d ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}><I className="h-3.5 w-3.5" />{l}</button>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] bg-soft p-3 ring-1 ring-line sm:p-5">
            <div className={cn("mx-auto overflow-hidden rounded-[18px] bg-card shadow-lift ring-1 ring-line transition-[max-width] duration-300", device === "mobile" ? "max-w-[380px]" : "max-w-none")}>
              <div className="flex items-center gap-2 border-b bg-soft/60 px-3 py-2">
                <span className="flex gap-1" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /></span>
                <span className="min-w-0 flex-1 truncate rounded-full bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-line">{pageUrl(state.storefront.handle, form.slug || "page")}</span>
              </div>
              <LandingPreview page={form} product={product} store={state.storefront.name || "Your store"} device={device} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
export function LandingLeads({ id }: { id: string }) {
  const { state, update } = useCreator();
  const page = state.landingPages.find((p) => p.id === id);
  const [add, setAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  if (!page) return <CreatorNotFound what="landingPage" />;
  const leads = state.leads.filter((l) => l.pageId === id).slice().reverse();
  const url = pageUrl(state.storefront.handle, page.slug);
  return (
    <div>
      <PageHeader
        eyebrow="Leads"
        title={page.title}
        description={url}
        actions={
          <>
            <Button variant="outline" onClick={() => copyText(url)} disabled={page.status !== "published" || !state.storefront.handle}>
              <Copy />
              Copy link
            </Button>
            <Button
              variant="outline"
              disabled={!leads.length}
              onClick={() => downloadCsv(`${page.slug}-leads.csv`, [["Name", "Email", "Date"], ...leads.map((l) => [l.name, l.email, shortDate(l.date)])])}
            >
              <Download />
              Export CSV
            </Button>
          </>
        }
      />
      {page.status !== "published" && (
        <p className="mb-5 rounded-lg border bg-warning-soft p-3 text-sm text-warning-foreground">This page is a draft. Publish it to start collecting leads.</p>
      )}
      <Panel
        title="Leads"
        actions={
          page.status === "published" && (
            <Button
              size="sm"
              variant="soft"
              onClick={() => {
                setError("");
                setAdd(true);
              }}
            >
              <UserPlus />
              Add a sign-up
            </Button>
          )
        }
      >
        <div className="divide-y">
          {leads.map((l) => (
            <div key={l.id} className="flex flex-wrap justify-between gap-3 py-4 text-sm">
              <div className="min-w-0">
                <p className="font-bold">{l.name}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{l.email}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {shortDate(l.date)}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove lead ${l.name}`}
                  onClick={() => {
                    const { removed } = removeWhere(state.leads, (x) => x.id === l.id);
                    update((s) => ({ leads: s.leads.filter((x) => x.id !== l.id) }));
                    if (removed) undoToast(`${l.name} removed from leads`, () => update((s) => ({ leads: restoreAt(s.leads, removed, sameId) })));
                  }}
                >
                  <Trash2 />
                </Button>
              </span>
            </div>
          ))}
        </div>
        {!leads.length && <EmptyState icon={Users} title="No leads yet" description="People who sign up on this page will appear here." compact />}
      </Panel>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a sign-up</DialogTitle>
            <DialogDescription>Add someone who signed up with you directly. They appear in your leads.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !isEmail(email)) return setError("Enter a name and a valid email.");
              if (leads.some((l) => l.email.toLowerCase() === email.trim().toLowerCase())) return setError("This email already signed up.");
              update((s) => ({
                leads: [...s.leads, { id: crypto.randomUUID(), pageId: id, name: name.trim(), email: email.trim(), date: new Date().toISOString() }],
                activity: [...s.activity, activityEntry(`New lead on ${page.title}`)],
              }));
              setAdd(false);
              setName("");
              setEmail("");
              toast.success("Lead added");
            }}
          >
            <Field id="lead-name" label="Name">
              <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="lead-email" label="Email">
              <Input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogActions><Button type="submit">Add lead</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
