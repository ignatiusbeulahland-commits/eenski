import { Link, useNavigate } from "@tanstack/react-router";
import { undoToast } from "@/lib/shared/undo";
import { Award, BookOpen, CheckCircle2, Circle, Download, Eye, EyeOff, Library, Lock, PlayCircle, ShoppingCart, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, FilterSelect, PageHeader, Panel, SearchInput, StatusBadge } from "@/components/affiliate/ui";
import { categories } from "@/lib/affiliate/products";
import { findResource, isPreviewResource, resourceBuyLabel, unitWord, type LearnerResource } from "@/lib/learner/catalog";
import { addToCart, canAddToCart, ownedResourceIds, owns, resourceProgress, toggleUnit, touchResource } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { courseOutline, totalLength, unitLength } from "@/lib/learner/learning";
import { tablistKeyDown } from "@/lib/keyboard";
import { LearnerNotFound, PreviewBanner, WishlistButton, price, shortDate } from "./shared";
import { DiscoverResources } from "./Discover";
import { downloadResource, LessonPlayer } from "./LessonPlayer";

const purchaseOf = (state: ReturnType<typeof useLearner>["state"], id: string) => state.purchases.find((p) => p.status === "paid" && p.items.some((i) => i.kind === "resource" && i.id === id));
export { downloadResource };

export function ResourcesPage({ view }: { view: "library" | "discover" }) {
  const { state, update } = useLearner();
  const [showHidden, setShowHidden] = useState(false);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recent");
  const owned = ownedResourceIds(state);
  const hiddenCount = owned.filter((id) => state.hiddenResources.includes(id)).length;
  const viewingHidden = showHidden && hiddenCount > 0;
  const setHidden = (r: LearnerResource, hide: boolean) => {
    const apply = (h: boolean) => update((s) => ({ hiddenResources: h ? [...new Set([...s.hiddenResources, r.id])] : s.hiddenResources.filter((x) => x !== r.id) }));
    apply(hide);
    if (hide) undoToast(`"${r.title}" hidden from your library`, () => apply(false), { description: "You still own it. Find it under Hidden." });
    else toast.success(`"${r.title}" is back in your library`);
  };
  const match = (r: LearnerResource) => (cat === "all" || r.category === cat) && (type === "all" || r.type === type) && (!q.trim() || [r.title, r.creator, r.description].some((t) => t.toLowerCase().includes(q.trim().toLowerCase())));
  const library = useMemo(() => {
    const list = owned.filter((id) => state.hiddenResources.includes(id) === viewingHidden).map((id) => findResource(id)!).filter(Boolean).filter(match);
    const accessed = (r: LearnerResource) => state.progress[r.id]?.lastAccessed ?? purchaseOf(state, r.id)?.date ?? "";
    return list.sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : sort === "progress" ? resourceProgress(state, b.id).pct - resourceProgress(state, a.id).pct : accessed(b).localeCompare(accessed(a))));
  }, [state, q, cat, type, sort, viewingHidden]);
  const clear = () => { setQ(""); setCat("all"); setType("all"); };
  const setView = (v: "library" | "discover") => { navigate({ to: "/learner/resources", search: v === "discover" ? { view: "discover" } : {}, replace: true }); };
  if (view === "discover") return <DiscoverResources ownedCount={owned.length} onOpenLibrary={() => setView("library")} />;
  return (
    <div>
      <PageHeader eyebrow="My Resources / Products" title="Your library" description="Everything you've purchased, ready to open, continue or download." />
      <div className="mb-5 inline-flex rounded-lg border bg-card p-1" role="tablist" aria-label="Resources view" onKeyDown={tablistKeyDown}>
        {(["library", "discover"] as const).map((v) => (
          <button key={v} role="tab" aria-selected={v === "library"} tabIndex={v === "library" ? 0 : -1} onClick={() => setView(v)} className={cn("h-9 rounded-md px-4 text-sm font-bold transition-colors", v === "library" ? "bg-cobalt text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {v === "library" ? `My library (${owned.length})` : "Discover"}
          </button>
        ))}
      </div>
      {owned.length > 0 && (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SearchInput value={q} onChange={setQ} placeholder="Search your library" />
          <FilterSelect value={cat} onChange={setCat} options={[["all", "All categories"], ...categories.map((c) => [c, c] as [string, string])]} />
          <FilterSelect value={type} onChange={setType} options={[["all", "All types"], ["Course", "Courses"], ["Ebook", "Ebooks"], ["Template", "Templates"], ["Coaching", "Coaching"]]} />
          <FilterSelect label="Sort by" value={sort} onChange={setSort} options={[["recent", "Recently used"], ["title", "Title A–Z"], ["progress", "Most progress"]]} />
          {hiddenCount > 0 && (
            <Button variant={viewingHidden ? "default" : "outline"} className="sm:ml-auto" aria-pressed={viewingHidden} onClick={() => setShowHidden(!viewingHidden)}>
              {viewingHidden ? <Eye /> : <EyeOff />}
              {viewingHidden ? "Show my library" : `Hidden (${hiddenCount})`}
            </Button>
          )}
        </div>
      )}
      {!owned.length ? (
        <div className="surface"><EmptyState icon={Library} title="Your library is empty" description="Resources and products you buy will appear here, ready to open and download." action={<Button onClick={() => setView("discover")}><BookOpen /> Discover resources</Button>} /></div>
      ) : library.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {library.map((r) => {
              const p = resourceProgress(state, r.id);
              const order = purchaseOf(state, r.id);
              return (
                <article key={r.id} className="surface flex min-w-0 gap-4 p-4">
                  <img src={r.image} alt={r.imageAlt} loading="lazy" width={128} height={128} className="h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-28" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs font-semibold text-cobalt">{r.type} · {r.category}</p>
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-bold">{r.title}</h3>
                    {order && <p className="mt-0.5 truncate text-xs text-muted-foreground">Purchased {shortDate(order.date)} · {order.orderNumber}</p>}
                    <div className="mt-2 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ice"><span className={cn("block h-full rounded-full", p.complete ? "bg-lime" : "bg-cobalt")} style={{ width: `${p.pct}%` }} /></span><span className="text-xs tabular-nums text-muted-foreground">{p.done}/{p.total}</span></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm"><Link to="/learner/resources/$resourceId" params={{ resourceId: r.id }}><Eye /> {p.done ? (p.complete ? "Review" : "Continue") : "View resource"}</Link></Button>
                      {r.downloadable && <Button size="sm" variant="outline" onClick={() => downloadResource(r)}><Download /> Download</Button>}
                      {viewingHidden
                        ? <Button size="sm" variant="ghost" onClick={() => setHidden(r, false)}><Eye /> Unhide</Button>
                        : <Button size="sm" variant="ghost" className="text-muted-foreground" aria-label={`Hide ${r.title} from library`} onClick={() => setHidden(r, true)}><EyeOff /> Hide</Button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          !viewingHidden && hiddenCount === owned.length && !q.trim() && cat === "all" && type === "all"
            ? <div className="surface"><EmptyState icon={EyeOff} title="Everything is hidden" description="You've hidden every resource from your library. You still own them all." action={<Button variant="outline" onClick={() => setShowHidden(true)}><Eye /> Show hidden</Button>} /></div>
            : <div className="surface"><EmptyState icon={BookOpen} title="Nothing matches" description="Try another search or clear your filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} /></div>
      )}
    </div>
  );
}

export function ResourceDetails({ id, view }: { id: string; view?: "quiz" | undefined }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const r = findResource(id);
  const owned = r ? owns(state, r.id) : false;
  useEffect(() => { if (r && owned) update((s) => touchResource(s, r.id)); }, [r?.id, owned]);
  if (!r) return <LearnerNotFound what="resource" />;
  const p = resourceProgress(state, r.id);
  const order = purchaseOf(state, r.id);
  const pending = state.purchases.find((x) => x.status === "pending" && x.items.some((i) => i.kind === "resource" && i.id === r.id));
  const inCart = state.cart.some((c) => c.kind === "resource" && c.id === r.id);
  const cert = state.certificates.find((c) => c.resourceId === r.id);
  const buy = (thenCart: boolean) => {
    const check = canAddToCart(state, { kind: "resource", id: r.id });
    if (!check.ok) { toast.error(check.reason); return; }
    update((s) => addToCart(s, { kind: "resource", id: r.id }));
    if (thenCart) navigate({ to: "/learner/cart" });
    else toast.success("Added to cart", { action: { label: "View cart", onClick: () => navigate({ to: "/learner/cart" }) } });
  };
  const unitLabel = unitWord(r.type);
  const preview = isPreviewResource(r);
  if (owned) {
    return (
      <div>
        {preview && <PreviewBanner what="resource" steps={[{ label: "Find it", done: true }, { label: "Add to cart", done: true }, { label: "Check out", done: true }, { label: "Start learning", done: p.done > 0 }, { label: r.certificate ? "Get certificate" : "Finish", done: r.certificate ? Boolean(cert) : p.complete }]} />}
        <LessonPlayer r={r} purchasedAt={order?.date} cert={cert} orderLink={order ? { id: order.id, number: order.orderNumber, date: order.date } : undefined} initialView={view} />
      </div>
    );
  }
  const outline = courseOutline(r);
  return (
    <div>
      {preview && (
        <PreviewBanner
          what="resource"
          steps={[
            { label: "Find it", done: true },
            { label: "Add to cart", done: inCart || owned || Boolean(pending) },
            { label: "Check out", done: owned },
            { label: "Start learning", done: p.done > 0 },
            { label: r.certificate ? "Get certificate" : "Finish", done: r.certificate ? Boolean(cert) : p.complete },
          ]}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="relative mb-5 aspect-[16/8] overflow-hidden rounded-2xl bg-ice">
            <img src={r.image} alt={r.imageAlt} width={960} height={480} className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 flex gap-1.5">
              {preview && <span className="rounded-lg bg-cobalt px-2.5 py-1 text-xs font-extrabold text-primary-foreground">Preview</span>}
              <span className="rounded-lg bg-card/95 px-2.5 py-1 text-xs font-bold">{r.type} · {r.category}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl">{r.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">by <span className="font-bold text-foreground">{r.creator}</span></p>
          <p className="mt-4 text-[15px] leading-relaxed">{r.description}</p>
          <Panel className="mt-6" title="What's inside" description={`${r.units.length} ${unitLabel}s · ${totalLength(r.units)}${r.quiz?.questions.length ? " · final quiz" : ""} · unlocked after purchase`} bodyClassName="p-0">
            {outline.map((m, mi) => (
              <div key={`${m.title}-${mi}`} className={cn(mi > 0 && "border-t")}>
                {m.title && <p className="bg-soft/70 px-5 py-2.5 text-xs font-extrabold"><span className="text-muted-foreground">Module {mi + 1} · </span>{m.title}</p>}
                <ol className="divide-y">
                  {m.items.map(({ unit: u, index: i }) => (
                    <li key={u.id} className="flex min-h-12 items-center gap-3 px-5 py-3 text-sm">
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block">{i + 1}. {u.title}</span>
                        {u.description && <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{u.description}</span>}
                      </span>
                      {u.preview && <StatusBadge tone="info">Preview</StatusBadge>}
                      <span className="shrink-0 text-xs text-muted-foreground">{unitLength(u)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </Panel>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-5">
            {owned ? (
              <>
                <StatusBadge tone="success">In your library</StatusBadge>
                <p className="mt-4 text-sm font-bold">Your progress</p>
                <div className="mt-2 flex items-center gap-2"><span className="h-2 flex-1 overflow-hidden rounded-full bg-ice"><span className={cn("block h-full rounded-full transition-all", p.complete ? "bg-lime" : "bg-cobalt")} style={{ width: `${p.pct}%` }} /></span><span className="text-sm font-bold tabular-nums">{p.pct}%</span></div>
                <div className="mt-5 flex flex-col gap-2">
                  {p.complete && <Button asChild><Link to="/learner/resources/$resourceId/complete" params={{ resourceId: r.id }}><Award /> See your completion</Link></Button>}
                  {r.downloadable && <Button variant="outline" onClick={() => downloadResource(r)}><Download /> Download</Button>}
                </div>
                {order && <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">Purchased {shortDate(order.date)} · <Link to="/learner/purchases/$purchaseId" params={{ purchaseId: order.id }} className="font-bold text-cobalt">{order.orderNumber}</Link></p>}
                {r.certificate && (cert ? (
                  <Link to="/learner/certificates/$certificateId" params={{ certificateId: cert.id }} className="mt-3 flex items-center gap-2 rounded-lg bg-lime-100 p-3 text-sm font-bold text-lime-text"><Award className="h-4 w-4" /> View your certificate</Link>
                ) : (
                  <p className="mt-3 flex gap-2 rounded-lg bg-ice p-3 text-xs text-cobalt"><Award className="h-4 w-4 shrink-0" /> Complete every lesson to receive a certificate of completion from {r.creator}.</p>
                ))}
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold tabular-nums">{price(r.price)}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-cobalt" /> {totalLength(r.units)} · {r.units.length} {unitLabel}s</li>
                  {r.quiz?.questions.length ? <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cobalt" /> Final quiz · pass mark {r.quiz.passMark}%</li> : null}
                  {r.downloadable && <li className="flex items-center gap-2"><Download className="h-4 w-4 text-cobalt" /> Downloadable</li>}
                  {r.certificate && <li className="flex items-center gap-2"><Award className="h-4 w-4 text-cobalt" /> Certificate of completion</li>}
                </ul>
                {pending ? (
                  <p className="mt-5 rounded-lg bg-warning-soft p-3 text-sm text-warning-foreground">Your order {pending.orderNumber} is awaiting transfer confirmation. <Link to="/learner/purchases/$purchaseId" params={{ purchaseId: pending.id }} className="font-bold underline">View order</Link></p>
                ) : (
                  <div className="mt-5 flex flex-col gap-2">
                    {inCart ? <Button asChild size="lg"><Link to="/learner/cart"><ShoppingCart /> In cart · Checkout</Link></Button> : <><Button size="lg" onClick={() => buy(true)}>{resourceBuyLabel(r)}</Button><Button variant="outline" onClick={() => buy(false)}><ShoppingCart /> Add to cart</Button></>}
                    <WishlistButton item={{ kind: "resource", id: r.id }} label className="w-full" />
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
