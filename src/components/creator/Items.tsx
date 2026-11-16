import { couponPhase, discountLabel } from "@/lib/creator/coupons";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { Link, useNavigate } from "@tanstack/react-router";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Archive,
  Eye,
  ShoppingBag,
  ArrowLeft,
  Star,
  SquarePlay,
  FileText,
  MonitorPlay,
  Wrench,
  UsersRound,
  ImageUp,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Label } from "@/components/dashboard-ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { Field } from "@/components/affiliate/Field";
import { PageHeader, Panel, EmptyState, SearchInput, FilterSelect } from "@/components/affiliate/ui";
import { naira } from "@/lib/affiliate/products";
import { creatorCovers, kindInfo } from "@/lib/creator/data";
import { COVER_TYPES, readCoverFile, validateCoverFile } from "@/lib/creator/cover";
import { PickOrType } from "./products/CourseFields";
import { PRODUCT_TOPICS, categoriesFor } from "@/lib/creator/courseMeta";
import { useCreator, activityEntry } from "@/lib/creator/store";
import {
  validateItem,
  orderAmount,
  uniqueSlug,
  isEmail,
  type CreatorItem,
  type ItemKind,
  type Order,
} from "@/lib/creator/rules";
import { CreatorNotFound, ItemLink, ItemStatus, itemPaths } from "./shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { coachingOf, downloadOf, liveOf, newId, serviceOf, ticketAvailable, typeIssue } from "@/lib/creator/products";
import { TypeOverview, cardMeta, priceLabel, productTabs, setupTab, typeChecklist } from "./products/registry";
import { useSlots } from "./products/Coaching";
import { when } from "./products/common";
import { FeatureTiles, GlassStat, ProductCover, ProgressRing, kindArt } from "./products/ProductChrome";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { BinList, BinnedNotice, MoveToBinDialog } from "./products/Bin";
import { inBin } from "@/lib/creator/bin";
import { ItemCreator } from "./products/Create";
import { CourseBuilder } from "./products/CourseBuilder";
export const kindIcon: Record<ItemKind, LucideIcon> = {
  course: SquarePlay,
  ebook: FileText,
  live: MonitorPlay,
  service: Wrench,
  coaching: UsersRound,
};
const soldLabel: Record<ItemKind, string> = {
  course: "Enrolments",
  ebook: "Sales",
  live: "Registrations",
  service: "Orders",
  coaching: "Bookings",
};
const intro: Record<ItemKind, string> = {
  course: "Teach what you know with structured lessons.",
  ebook: "Sell e-books, templates, guides and other files.",
  live: "Host live classes and workshops for your audience.",
  service: "Offer done-for-you work with a clear delivery time.",
  coaching: "Offer one-to-one sessions people can book.",
};
export function ItemCollection({ kind }: { kind: ItemKind }) {
  const { state } = useCreator();
  const info = kindInfo[kind];
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [showBin, setShowBin] = useState(false);
  const [binTarget, setBinTarget] = useState<CreatorItem | null>(null);
  const mine = state.items.filter((i) => i.kind === kind);
  const all = mine.filter((i) => !inBin(i));
  const binned = mine.filter(inBin).sort((a, b) => (b.binnedAt ?? "").localeCompare(a.binnedAt ?? ""));
  const items = all
    .filter(
      (i) =>
        i.title.toLowerCase().includes(q.toLowerCase()) && (status === "all" || i.status === status),
    )
    .slice()
    .sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt),
    );
  const create = (
    <Button asChild>
      <Link to={itemPaths[kind].create}>
        <Plus />
        Create {info.noun}
      </Link>
    </Button>
  );
  const ids = new Set(mine.map((i) => i.id));
  const paid = state.orders.filter((o) => ids.has(o.itemId) && o.status === "paid");
  return (
    <div>
      <section data-surface="dark" className="bg-brand-panel mb-6 rounded-2xl p-5 text-primary-foreground sm:p-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime">
              <span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />
              Manage Products
            </p>
            <h1 className="mt-2 text-2xl sm:text-[32px]">{info.plural}</h1>
            <p className="mt-2 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">{intro[kind]}</p>
            <Button asChild variant="lime" size="lg" className="mt-5">
              <Link to={itemPaths[kind].create}>
                <Plus />
                Create {info.noun}
              </Link>
            </Button>
          </div>
          <BrandIcon src={kindArt[kind]} className="product-hero-art h-20 w-20 sm:h-32 sm:w-32" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3 lg:grid-cols-4">
          <GlassStat label={`All ${info.nouns}`} value={all.length} />
          <GlassStat label="Published" value={all.filter((i) => i.status === "published").length} />
          <GlassStat label={soldLabel[kind]} value={paid.length} />
          <GlassStat label="Earnings" value={naira(paid.reduce((n, o) => n + o.amount, 0))} />
        </div>
      </section>
      {(all.length > 0 || binned.length > 0) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          {showBin ? (
            <Button variant="quiet" className="sm:mr-auto" onClick={() => setShowBin(false)}>
              <ArrowLeft />
              Back to {info.nouns}
            </Button>
          ) : (
          <>
          <SearchInput value={q} onChange={setQ} placeholder={`Search ${info.nouns}`} />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={[
              ["all", "All statuses"],
              ["draft", "Draft"],
              ["published", "Published"],
              ["archived", "Archived"],
            ]}
          />
          <FilterSelect label="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              ["recent", "Newest first"],
              ["title", "Title A–Z"],
            ]}
          />
          </>
          )}
          <Button
            variant={showBin ? "soft" : "quiet"}
            aria-pressed={showBin}
            className="shrink-0"
            onClick={() => setShowBin((v) => !v)}
          >
            <Trash2 />
            Bin
            <span className="chip-count">{binned.length}</span>
          </Button>
        </div>
      )}
      {showBin ? (
        <BinList kind={kind} items={binned} />
      ) : (
      <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => (
          <article key={i.id} className="product-card surface group flex min-w-0 flex-col overflow-hidden">
            <ItemLink item={i} className="relative block">
              <ProductCover
                src={i.image}
                alt={i.title + " cover"}
                kind={kind}
                className="aspect-[16/10] w-full"
                imgClassName="product-card-img"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-midnight/55 to-transparent" aria-hidden="true" />
              <span className="absolute left-3 top-3 rounded-full bg-card/95 shadow-sm backdrop-blur">
                <ItemStatus status={i.status} />
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1 text-sm font-extrabold text-foreground shadow-sm backdrop-blur">
                {priceLabel(i)}
              </span>
            </ItemLink>
            <div className="flex flex-1 flex-col p-5">
              <p className="flex items-center gap-2 text-xs font-bold text-cobalt">
                <BrandIcon src={kindArt[kind]} className="h-6 w-6" />
                <span className="truncate">{info.label} · {i.category}</span>
              </p>
              <h2 className="mt-3 text-base leading-snug">
                <ItemLink item={i} className="hover:text-cobalt">{i.title}</ItemLink>
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{i.description}</p>
              <p className="mt-4 rounded-xl bg-soft px-3 py-2 text-xs font-semibold text-muted-foreground ring-1 ring-line">
                {cardMeta(i, state.orders)}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <Button asChild variant="soft" size="sm" className="flex-1">
                  <ItemLink item={i}>
                    <Eye />
                    Manage
                  </ItemLink>
                </Button>
                <Button asChild variant="quiet" size="sm" aria-label={`Edit ${i.title}`}>
                  <ItemLink item={i} edit>
                    <Pencil />
                    Edit
                  </ItemLink>
                </Button>
                <Button
                  variant="quiet"
                  size="sm"
                  className="px-3 hover:text-destructive"
                  aria-label={`Delete ${i.title}`}
                  title="Delete (moves to Bin)"
                  onClick={() => setBinTarget(i)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && all.length > 0 && (
        <Panel>
          <EmptyState
            icon={kindIcon[kind]}
            title={`No matching ${info.nouns}`}
            description="Try another search or filter."
          />
        </Panel>
      )}
      {!all.length && (
        <section className="surface grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="text-center lg:text-left">
            <BrandIcon src={kindArt[kind]} className="mx-auto h-20 w-20 lg:mx-0" />
            <h2 className="mt-4 text-xl">No {info.nouns} yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first {info.noun} and it will appear here. Each {info.noun} comes with its own tools:
            </p>
            <div className="mt-5 flex justify-center lg:justify-start">{create}</div>
          </div>
          <FeatureTiles kind={kind} />
        </section>
      )}
      </>
      )}
      <MoveToBinDialog item={binTarget} onOpenChange={(o) => !o && setBinTarget(null)} />
    </div>
  );
}
/** Format, session type, service or focus for the non-course products. */
const subtypeOf = (f: CreatorItem) =>
  f.kind === "ebook" ? downloadOf(f).format : f.kind === "live" ? liveOf(f).sessionType : f.kind === "service" ? serviceOf(f).serviceType : f.kind === "coaching" ? coachingOf(f).focus : "";
const withSubtype = (f: CreatorItem, v: string): CreatorItem =>
  f.kind === "ebook" ? { ...f, download: { ...downloadOf(f), format: v } }
  : f.kind === "live" ? { ...f, live: { ...liveOf(f), sessionType: v } }
  : f.kind === "service" ? { ...f, service: { ...serviceOf(f), serviceType: v } }
  : f.kind === "coaching" ? { ...f, coaching: { ...coachingOf(f), focus: v } }
  : f;
export function ItemEditor({ kind, id, step, onStep }: { kind: ItemKind; id?: string; step?: number; onStep?: (step: number, opts?: { replace?: boolean }) => void }) {
  const { state } = useCreator();
  if (kind === "course") {
    // New courses and unfinished course drafts use the three-step course builder.
    if (!id) return <CourseBuilder step={step} onStep={onStep} />;
    const found = state.items.find((i) => i.id === id && i.kind === "course");
    if (found?.status === "draft" && found.builder) return <CourseBuilder key={found.id} existing={found} />;
  }
  return id ? <ItemEditForm kind={kind} id={id} /> : <ItemCreator kind={kind} step={step} onStep={onStep} />;
}
function ItemEditForm({ kind, id }: { kind: ItemKind; id?: string }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const info = kindInfo[kind];
  const found = state.items.find((i) => i.id === id && i.kind === kind);
  const [form, setForm] = useState<CreatorItem>(
    found ?? {
      id: "",
      kind,
      title: "",
      description: "",
      category: "",
      price: 0,
      status: "draft",
      image: creatorCovers[0] ?? "",
      lessons: [],
      date: "",
      capacity: 30,
      duration: kind === "coaching" ? 60 : kind === "service" ? 7 : 0,
      createdAt: "",
    },
  );
  const [error, setError] = useState("");
  const [coverError, setCoverError] = useState("");
  const [coverBusy, setCoverBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  if (id && !found) return <CreatorNotFound what="product" />;
  const uploaded = form.image.startsWith("data:");
  const onCoverFile = async (file: File | undefined) => {
    if (!file) return;
    const problem = validateCoverFile(file);
    if (problem) {
      setCoverError(problem);
      return;
    }
    setCoverError("");
    setCoverBusy(true);
    try {
      const image = await readCoverFile(file);
      setForm((f) => ({ ...f, image }));
      toast.success("Cover image added");
    } catch {
      setCoverError("We couldn't read that image. Try another file.");
    } finally {
      setCoverBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err = !form.title.trim() || !form.description.trim()
      ? "Add a title and description."
      : !Number.isFinite(form.price) || form.price < 0
        ? "Enter a valid non-negative price."
        : "";
    if (err) {
      setError(err);
      return;
    }
    const item: CreatorItem = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || "General",
      id: found?.id ?? uniqueSlug(form.title, state.items.map((i) => i.id)),
      createdAt: found?.createdAt ?? new Date().toISOString(),
    };
    update((s) => ({
      items: found ? s.items.map((i) => (i.id === found.id ? item : i)) : [...s.items, item],
      activity: [...s.activity, activityEntry(`${found ? "Updated" : "Created"} ${info.noun}: ${item.title}`)],
    }));
    toast.success(`${info.label} saved`, found ? undefined : { description: "Now finish setting it up." });
    navigate({ to: itemPaths[kind].detail, params: { slug: item.id }, search: found ? {} : { tab: setupTab[kind] } });
  };
  return (
    <div>
      <PageHeader
        eyebrow="Manage Products"
        title={`${id ? "Edit" : "Create"} ${info.label}`}
        description={intro[kind]}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Panel title={`${info.label} details`}>
        <form onSubmit={save} className="space-y-5" noValidate>
          <Field id="item-title" label="Title">
            <Input
              id="item-title"
              value={form.title}
              maxLength={120}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field id="item-description" label="Description">
            <Textarea
              id="item-description"
              value={form.description}
              maxLength={3000}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="item-price" label="Price (₦) · 0 for free">
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={Number.isNaN(form.price) ? "" : form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value === "" ? NaN : Number(e.target.value) })
                }
              />
            </Field>
            <Field id="item-category" label="Category">
              <PickOrType
                id="item-category"
                value={form.category === "General" ? "" : form.category}
                options={categoriesFor(kind)}
                placeholder="Choose a category"
                otherPlaceholder="Type your category"
                onChange={(category) => setForm((f) => ({ ...f, category }))}
              />
            </Field>
            {kind !== "course" && (
              <Field id="create-subtype" label={PRODUCT_TOPICS[kind].sub.label}>
                <PickOrType
                  key={form.category}
                  id="create-subtype"
                  value={subtypeOf(form)}
                  options={PRODUCT_TOPICS[kind].sub.options(form.category)}
                  placeholder={PRODUCT_TOPICS[kind].sub.placeholder}
                  otherPlaceholder={PRODUCT_TOPICS[kind].sub.otherPlaceholder}
                  onChange={(v) => setForm((f) => withSubtype(f, v))}
                />
              </Field>
            )}
          </div>
          <div>
            <Label htmlFor="item-cover">Cover image</Label>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border bg-muted sm:w-64">
                {form.image ? (
                  <img src={form.image} alt="Selected cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageUp className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  id="item-cover"
                  type="file"
                  accept={COVER_TYPES.join(",")}
                  className="sr-only"
                  aria-describedby="item-cover-hint"
                  onChange={(e) => onCoverFile(e.target.files?.[0])}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="soft"
                    disabled={coverBusy}
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImageUp />
                    {coverBusy ? "Adding image…" : uploaded ? "Replace image" : "Upload image"}
                  </Button>
                  {uploaded && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForm({ ...form, image: creatorCovers[0] ?? "" })}
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  )}
                </div>
                <p id="item-cover-hint" className="text-xs text-muted-foreground">
                  JPG, PNG or WebP, up to 5 MB. A wide 16:9 image works best.
                </p>
                {coverError && (
                  <p role="alert" className="text-xs font-semibold text-destructive">
                    {coverError}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-muted-foreground">Or pick a ready-made cover</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {creatorCovers.slice(0, 6).map((src, n) => (
                <Button
                  key={src}
                  type="button"
                  variant="outline"
                  aria-label={`Choose cover ${n + 1}`}
                  aria-pressed={form.image === src}
                  className={
                    form.image === src
                      ? "h-auto overflow-hidden rounded-xl border-cobalt p-1 ring-2 ring-lime"
                      : "h-auto overflow-hidden rounded-xl p-1"
                  }
                  onClick={() => setForm({ ...form, image: src })}
                >
                  <img src={src} alt="" className="aspect-video w-full rounded-lg object-cover" />
                </Button>
              ))}
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2 border-t pt-5">
            <Button type="submit">{id ? "Save changes" : "Save draft"}</Button>
            <Button asChild variant="outline">
              {found ? (
                <ItemLink item={found}>Cancel</ItemLink>
              ) : (
                <Link to={itemPaths[kind].list}>Cancel</Link>
              )}
            </Button>
          </div>
        </form>
      </Panel>
      <aside className="lg:sticky lg:top-24" aria-label="Card preview">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt">
          <span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />
          Storefront preview
        </p>
        <article className="surface overflow-hidden">
          <div className="relative">
            <ProductCover src={form.image} alt="Cover preview" kind={kind} className="aspect-[16/10] w-full" />
            <span className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1 text-sm font-extrabold text-foreground shadow-sm">
              {Number.isFinite(form.price) && form.price > 0 ? naira(form.price) : "Free"}
            </span>
          </div>
          <div className="p-5">
            <p className="flex items-center gap-2 text-xs font-bold text-cobalt">
              <BrandIcon src={kindArt[kind]} className="h-6 w-6" />
              <span className="truncate">{info.label} · {form.category.trim() || "General"}</span>
            </p>
            <h2 className="mt-3 break-words text-base leading-snug">{form.title.trim() || `Your ${info.noun} title`}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {form.description.trim() || "A short description helps buyers understand what they get."}
            </p>
          </div>
        </article>
      </aside>
      </div>
    </div>
  );
}
export function ItemDetails({
  kind,
  id,
  tab = "overview",
  onTab,
}: {
  kind: ItemKind;
  id: string;
  tab?: string | undefined;
  onTab?: (tab: string) => void;
}) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const info = kindInfo[kind];
  const item = state.items.find((i) => i.id === id && i.kind === kind);
  const tabs = productTabs[kind];
  const current = tabs.some((t) => t.id === tab) ? tab : "overview";
  const [local, setLocal] = useState(current);
  const active = onTab ? current : local;
  const go = (t: string) => (onTab ? onTab(t) : setLocal(t));
  if (!item) return <CreatorNotFound what="product" />;
  const orders = state.orders.filter((o) => o.itemId === id).slice().reverse();
  const binnedItem = inBin(item);
  const issue = validateItem(item) || typeIssue(item);
  const paidOrders = orders.filter((o) => o.status === "paid");
  const paidCount = paidOrders.length;
  const earned = paidOrders.reduce((n, o) => n + o.amount, 0);
  const reviewCount = state.reviews.filter((r) => r.itemId === id).length;
  const setStatus = (status: CreatorItem["status"]) => {
    if (status === "published" && issue) {
      toast.error(issue);
      return;
    }
    update((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, status } : i)),
      activity: [...s.activity, activityEntry(`${info.label} ${status}: ${item.title}`)],
    }));
    if (status === "published") {
      window.__lovableEvents?.track?.("project.product_published", { product_kind: kind, price_type: item.price > 0 ? "paid" : "free" });
    }
    if (status === "published" || item.status === "published") {
      void navigate({ to: "/creator/products/result/$itemId", params: { itemId: id }, search: status === "published" ? { fresh: true } : { fresh: true, change: "unpublished" } });
      return;
    }
    toast.success(`${info.label} ${status}`);
  };
  return (
    <div>
      <SetupCompletionWatcher item={item} />
      {binnedItem && <BinnedNotice item={item} />}
      <section data-surface="dark" className="bg-brand-panel mb-6 rounded-2xl p-4 text-primary-foreground sm:p-6">
        <span className="hero-dots" aria-hidden="true" />
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <ProductCover
            src={item.image}
            alt={`${item.title} cover`}
            kind={kind}
            className="aspect-video w-full shrink-0 rounded-xl shadow-lg ring-1 ring-on-dark/20 md:w-64"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime">
              <BrandIcon src={kindArt[kind]} className="h-7 w-7" />
              <span className="truncate">{info.label} · {item.category}</span>
            </p>
            <h1 className="mt-2 break-words text-2xl sm:text-[28px]">{item.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-card">
                <ItemStatus status={binnedItem ? "in Bin" : item.status} />
              </span>
              <span className="rounded-full border border-on-dark/20 bg-on-dark/10 px-3 py-0.5 text-sm font-extrabold">
                {priceLabel(item)}
              </span>
            </div>
            <div className={`mt-5 flex flex-wrap gap-2 ${binnedItem ? "hidden" : ""}`}>
              <Button
                variant={item.status === "published" ? "glass" : "lime"}
                onClick={() => setStatus(item.status === "published" ? "draft" : "published")}
              >
                {item.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button asChild variant="glass">
                <ItemLink item={item} edit>
                  <Pencil />
                  Edit details
                </ItemLink>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-56 md:grid-cols-1">
            <GlassStat label={soldLabel[kind]} value={paidCount} />
            <GlassStat label="Earnings" value={naira(earned)} />
            <GlassStat label="Reviews" value={reviewCount} />
          </div>
        </div>
      </section>
      <Tabs value={active} onValueChange={go}>
        <SectionDropdown
          heading={`${info.label} management`}
          value={active}
          onChange={go}
          options={[{ value: "overview", label: "Overview" }, ...tabs.map((t) => ({ value: t.id, label: t.label }))]}
          className="mb-6 md:hidden"
        />
        <div className="mb-6 hidden md:block">
          <TabsList aria-label={`${info.label} management`} className="h-auto max-w-full flex-wrap justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="overview" className="mt-0">
          <ProductOverview item={item} orders={orders} issue={issue} onTab={go} setStatus={setStatus} />
        </TabsContent>
        {tabs.map(({ id: tid, Component }) => (
          <TabsContent key={tid} value={tid} className="mt-0">
            <Component item={item} orders={orders} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ProductOverview({
  item,
  orders,
  issue,
  onTab,
  setStatus,
}: {
  item: CreatorItem;
  orders: Order[];
  issue: string;
  onTab: (t: string) => void;
  setStatus: (s: CreatorItem["status"]) => void;
}) {
  const { state, update } = useCreator();
  const kind = item.kind;
  const info = kindInfo[kind];
  const id = item.id;
  const [archive, setArchive] = useState(false);
  const [binTarget, setBinTarget] = useState<CreatorItem | null>(null);
  const [order, setOrder] = useState(false);
  const [review, setReview] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promo, setPromo] = useState("");
  const [error, setError] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [ticket, setTicket] = useState("");
  const [pkg, setPkg] = useState("");
  const [slot, setSlot] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const slots = useSlots(item);
  const sales = orders.filter((o) => o.status === "paid");
  const buyers = state.customers.filter((c) => sales.some((o) => o.customerId === c.id));
  const checklist = typeChecklist(item, state);
  const live = liveOf(item);
  const service = serviceOf(item);
  const coaching = coachingOf(item);
  const questions = kind === "service" ? service.requirements : kind === "coaching" ? coaching.intake : [];
  const today = new Date().toISOString().slice(0, 10);
  const promotions = state.promotions.filter(
    (p) => p.itemId === id && couponPhase(p, state.orders.filter((o) => o.promotionId === p.id && o.status === "paid").length) === "active",
  );
  const selected = promotions.find((p) => p.id === promo);
  const base =
    kind === "live" && live.tickets.length
      ? (live.tickets.find((t) => t.id === ticket)?.price ?? item.price)
      : kind === "service" && service.packages.length
        ? (service.packages.find((p) => p.id === pkg)?.price ?? item.price)
        : item.price;
  const amount = orderAmount({ ...item, price: base }, selected, new Date().toISOString());
  const openOrder = () => {
    setError("");
    setTicket(live.tickets.find((t) => ticketAvailable(item, orders, t))?.id ?? "");
    setPkg(service.packages[0]?.id ?? "");
    setSlot("");
    setAnswers(questions.map(() => ""));
    setOrder(true);
  };
  const simulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.status !== "published") return setError("Publish this product before adding an order.");
    if (kind === "live" && sales.length >= item.capacity) return setError("This live session is full.");
    if (kind === "live" && live.tickets.length) {
      const t = live.tickets.find((x) => x.id === ticket);
      if (!t || !ticketAvailable(item, orders, t)) return setError("Choose a ticket that still has seats.");
    }
    if (kind === "service" && service.packages.length && !pkg) return setError("Choose a package.");
    if (kind === "coaching" && !slot) return setError("Choose a session time.");
    if (!name.trim() || !isEmail(email)) return setError("Enter the buyer's name and a valid email.");
    const existing = state.customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    const buyer = existing ?? {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      source: "purchase" as const,
      date: new Date().toISOString(),
    };
    const trimmed = answers.map((a) => a.trim());
    const extra: Partial<Order> =
      kind === "course"
        ? { completed: [] }
        : kind === "ebook"
          ? { downloads: 0 }
          : kind === "live"
            ? { checkedIn: false, ...(ticket ? { ticketId: ticket } : {}) }
            : kind === "service"
              ? { stage: questions.length ? "requirements" : "in_progress", answers: trimmed, ...(pkg ? { packageId: pkg } : {}) }
              : { sessionAt: slot, booking: "scheduled", answers: trimmed };
    update((s) => ({
      customers: existing
        ? s.customers.map((c) => (c.id === existing.id ? { ...c, source: "purchase" as const } : c))
        : [...s.customers, buyer],
      orders: [
        ...s.orders,
        {
          id: newId(),
          itemId: id,
          itemTitle: item.title,
          customerId: buyer.id,
          amount,
          date: new Date().toISOString(),
          status: "paid" as const,
          currency: "NGN" as const,
          ...(selected ? { promotionId: selected.id } : {}),
          ...extra,
        },
      ],
      activity: [...s.activity, activityEntry(`Order recorded: ${item.title}`)],
    }));
    setOrder(false);
    setError("");
    setName("");
    setEmail("");
    toast.success("Order added", { description: "Your wallet, subscribers and sales figures now include it." });
    if (kind === "course") {
      window.__lovableEvents?.track?.("project.course_enrolled", { price_type: amount > 0 ? "paid" : "free", has_promotion: !!selected });
    } else if (kind === "coaching") {
      window.__lovableEvents?.track?.("project.coaching_booked", { price_type: amount > 0 ? "paid" : "free", has_intake_answers: trimmed.some(Boolean) });
    }
  };
  const addReview = (e: React.FormEvent) => {
    e.preventDefault();
    const buyer = buyers.find((b) => b.id === name) ?? buyers[0];
    if (!buyer) return;
    if (!comment.trim()) return setError("Write a short review comment.");
    update((s) => ({
      reviews: [
        ...s.reviews,
        {
          id: crypto.randomUUID(),
          itemId: id,
          itemTitle: item.title,
          customerName: buyer.name,
          rating: Number(rating),
          comment: comment.trim(),
          date: new Date().toISOString(),
          hidden: false,
          reported: false,
        },
      ],
      activity: [...s.activity, activityEntry(`New review on ${item.title}`)],
    }));
    setReview(false);
    setComment("");
    setError("");
    toast.success("Review added", { description: "See it under Reviews." });
  };
  const done = checklist.filter((c) => c.done).length;
  return (
    <div className="space-y-6">
      <TypeOverview item={item} orders={orders} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="surface overflow-hidden">
            <header className="flex items-center gap-4 border-b px-5 py-4">
              <ProgressRing value={checklist.length ? (done / checklist.length) * 100 : 0} />
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold">Setup</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {done} of {checklist.length} done{issue ? ` · ${issue}` : " · Ready to publish"}
                </p>
              </div>
            </header>
            <ol className="space-y-2 p-3 sm:p-4">
              {checklist.map((c, n) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={() => onTab(c.tab)}
                    className={
                      "setup-step group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm " +
                      (c.done ? "border-transparent bg-soft" : "bg-card hover:border-cobalt-100 hover:bg-ice")
                    }
                  >
                    {c.done ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-lime-text" />
                    ) : (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ice text-xs font-extrabold text-cobalt ring-1 ring-line">
                        {n + 1}
                      </span>
                    )}
                    <span className={"min-w-0 flex-1 " + (c.done ? "text-muted-foreground line-through decoration-line" : "font-semibold")}>
                      {c.label}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </section>
          <section className="surface overflow-hidden">
            <header className="border-b px-5 py-4">
              <h2 className="text-[15px] font-bold">About this {info.noun}</h2>
            </header>
            <p className="line-clamp-6 whitespace-pre-wrap p-5 text-sm leading-6 text-muted-foreground">{item.description}</p>
          </section>
        </div>
        <section className="surface overflow-hidden lg:sticky lg:top-24">
          <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <h2 className="text-[15px] font-bold">Sales & testing</h2>
            <ItemStatus status={item.status} />
          </header>
          <div className="p-5">
            <div className="rounded-2xl bg-ice p-4 ring-1 ring-line">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-cobalt">Price</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{priceLabel(item)}</p>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border p-3">
                <dt className="truncate text-[11px] font-semibold text-muted-foreground">{soldLabel[kind]}</dt>
                <dd className="mt-0.5 font-extrabold tabular-nums">{sales.length}</dd>
              </div>
              <div className="rounded-xl border p-3">
                <dt className="truncate text-[11px] font-semibold text-muted-foreground">Earnings</dt>
                <dd className="mt-0.5 truncate font-extrabold tabular-nums">{naira(sales.reduce((n, o) => n + o.amount, 0))}</dd>
              </div>
              <div className="rounded-xl border p-3">
                <dt className="truncate text-[11px] font-semibold text-muted-foreground">Reviews</dt>
                <dd className="mt-0.5 font-extrabold tabular-nums">{state.reviews.filter((r) => r.itemId === id).length}</dd>
              </div>
            </dl>
            <Button className="mt-5 w-full" disabled={item.status !== "published"} onClick={openOrder}>
              <ShoppingBag />
              {kind === "course" ? "Add an enrolment" : kind === "live" ? "Add a registration" : kind === "coaching" ? "Add a booking" : "Add an order"}
            </Button>
            {item.status !== "published" && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Publish it to start taking orders.</p>
            )}
            {buyers.length > 0 && (
              <Button
                className="mt-3 w-full"
                variant="soft"
                onClick={() => {
                  setError("");
                  setName(buyers[0]?.id ?? "");
                  setReview(true);
                }}
              >
                <Star />
                Add a buyer's review
              </Button>
            )}
            <Button
              className="mt-3 w-full"
              variant="quiet"
              disabled={item.status === "archived"}
              onClick={() => setArchive(true)}
            >
              <Archive />
              Archive {info.noun}
            </Button>
            {!inBin(item) && (
              <Button
                className="mt-2 w-full hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                variant="quiet"
                onClick={() => setBinTarget(item)}
              >
                <Trash2 />
                Delete {info.noun}
              </Button>
            )}
          </div>
        </section>
      </div>
      <MoveToBinDialog item={binTarget} onOpenChange={(o) => !o && setBinTarget(null)} />
      <ConfirmDialog
        open={archive}
        onOpenChange={setArchive}
        art={brandArtwork.archive}
        eyebrow={info.label}
        tone="default"
        title={`Archive this ${info.noun}?`}
        description="It will be removed from your storefront and buyers can no longer find it."
        confirmLabel="Archive"
        confirmIcon={<Archive />}
        onConfirm={() => setStatus("archived")}
      >
        <ConfirmNote>Past orders are kept, and you can publish it again later.</ConfirmNote>
      </ConfirmDialog>
      <Dialog open={order} onOpenChange={setOrder}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{kind === "course" ? "Add an enrolment" : kind === "live" ? "Add a registration" : kind === "coaching" ? "Add a booking" : "Add an order"}</DialogTitle>
            <DialogDescription>Record a sale made outside Enski, such as a bank transfer or cash payment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={simulate} className="space-y-4" noValidate>
            <Field id="customer-name" label="Buyer name">
              <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="customer-email" label="Buyer email">
              <Input
                id="customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="buyer@example.com"
              />
            </Field>
            {kind === "live" && live.tickets.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold">Ticket</Label>
                <FilterSelect label="Ticket"
                  value={ticket || "none"}
                  onChange={(v) => setTicket(v === "none" ? "" : v)}
                  className="w-full sm:w-full"
                  options={[["none", "Choose a ticket"], ...live.tickets.filter((t) => ticketAvailable(item, orders, t)).map((t) => [t.id, `${t.name} · ${t.price ? naira(t.price) : "Free"}`] as [string, string])]}
                />
              </div>
            )}
            {kind === "service" && service.packages.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold">Package</Label>
                <FilterSelect label="Package"
                  value={pkg || "none"}
                  onChange={(v) => setPkg(v === "none" ? "" : v)}
                  className="w-full sm:w-full"
                  options={[["none", "Choose a package"], ...service.packages.map((p) => [p.id, `${p.name} · ${naira(p.price)} · ${p.days} days`] as [string, string])]}
                />
              </div>
            )}
            {kind === "coaching" && (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold">Session time</Label>
                {slots.length ? (
                  <FilterSelect label="Session time"
                    value={slot || "none"}
                    onChange={(v) => setSlot(v === "none" ? "" : v)}
                    className="w-full sm:w-full"
                    options={[["none", "Choose a time"], ...slots.map((s) => [s, when(s)] as [string, string])]}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No open times. Turn on days in Availability first.</p>
                )}
              </div>
            )}
            {questions.map((q, n) => (
              <Field key={n} id={`answer-${n}`} label={q}>
                <Input id={`answer-${n}`} value={answers[n] ?? ""} onChange={(e) => setAnswers(answers.map((a, i) => (i === n ? e.target.value : a)))} />
              </Field>
            ))}
            {promotions.length > 0 && (
              <>
                <Label>Coupon</Label>
                <FilterSelect label="Coupon"
                  value={promo || "none"}
                  onChange={(v) => setPromo(v === "none" ? "" : v)}
                  className="w-full sm:w-full"
                  options={[
                    ["none", "No coupon"],
                    ...promotions.map((p) => [p.id, `${p.code} · ${discountLabel(p)}`] as [string, string]),
                  ]}
                />
              </>
            )}
            <p className="text-lg font-bold">Total: {naira(amount)}</p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogActions><Button type="submit">Record order</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a buyer's review</DialogTitle>
            <DialogDescription>Add a review a buyer sent you directly, for example by email or WhatsApp.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addReview} className="space-y-4">
            <Label>Buyer</Label>
            <FilterSelect label="Buyer"
              value={name}
              onChange={setName}
              className="w-full sm:w-full"
              options={buyers.map((b) => [b.id, b.name] as [string, string])}
            />
            <Label>Rating</Label>
            <FilterSelect label="Rating"
              value={rating}
              onChange={setRating}
              className="w-full sm:w-full"
              options={["5", "4", "3", "2", "1"].map((r) => [r, `${r} star${r === "1" ? "" : "s"}`] as [string, string])}
            />
            <Field id="review-comment" label="Comment">
              <Textarea id="review-comment" value={comment} maxLength={600} onChange={(e) => setComment(e.target.value)} />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogActions><Button type="submit">Add review</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Fires once when a product's setup checklist goes from incomplete to complete during this visit. */
function SetupCompletionWatcher({ item }: { item: CreatorItem }) {
  const { state } = useCreator();
  const checklist = typeChecklist(item, state);
  const complete = checklist.length > 0 && checklist.every((c) => c.done) && !(validateItem(item) || typeIssue(item));
  const prev = useRef(complete);
  useEffect(() => {
    if (complete && !prev.current) {
      window.__lovableEvents?.track?.("project.product_setup_completed", { product_kind: item.kind, checklist_items: checklist.length });
    }
    prev.current = complete;
  }, [complete, item.kind, checklist.length]);
  return null;
}
