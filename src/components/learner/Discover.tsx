import { Link } from "@tanstack/react-router";
import { Award, BookOpen, CalendarDays, Eye, Infinity as InfinityIcon, Library, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { EmptyState } from "@/components/affiliate/ui";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { categories } from "@/lib/affiliate/products";
import { isPreviewResource, publishedResources, resources, type LearnerResource, type ResourceType } from "@/lib/learner/catalog";
import { cn } from "@/lib/utils";
import { PreviewSwitch, ResourceCard } from "./shared";

const types: { value: ResourceType; label: string; art: string }[] = [
  { value: "Course", label: "Courses", art: brandArtwork.video },
  { value: "Ebook", label: "Ebooks", art: brandArtwork.book },
  { value: "Template", label: "Templates", art: brandArtwork.package },
  { value: "Coaching", label: "Coaching", art: brandArtwork.chat },
];
const sorts = [["featured", "Featured"], ["price-low", "Price: low to high"], ["price-high", "Price: high to low"], ["title", "Title A–Z"]] as const;
const previewList = resources.filter((r) => isPreviewResource(r));

type Filters = { q: string; cat: string; type: string };
const matches = (r: LearnerResource, f: Filters) => {
  const q = f.q.trim().toLowerCase();
  return (f.cat === "all" || r.category === f.cat) && (f.type === "all" || r.type === f.type) && (!q || [r.title, r.creator, r.description].some((t) => t.toLowerCase().includes(q)));
};

/** Learner Discover: shopping-style browsing of published resources, with preview pages kept separate. */
export function DiscoverResources({ ownedCount, onOpenLibrary }: { ownedCount: number; onOpenLibrary: () => void }) {
  const [f, setF] = useState<Filters>({ q: "", cat: "all", type: "all" });
  const [sort, setSort] = useState<string>("featured");
  const [show, setShow] = useState<"live" | "preview">("live");
  const base = show === "preview" ? previewList : publishedResources;
  const list = useMemo(() => base.filter((r) => matches(r, f)).sort((a, b) => (sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "title" ? a.title.localeCompare(b.title) : 0)), [base, f, sort]);
  const typeCount = (t: string) => base.filter((r) => matches(r, { ...f, type: t })).length;
  const catCount = (c: string) => base.filter((r) => matches(r, { ...f, cat: c })).length;
  const set = (k: keyof Filters, v: string) => setF((cur) => ({ ...cur, [k]: v }));
  const clear = () => setF({ q: "", cat: "all", type: "all" });
  const chips = [
    f.q.trim() && { key: "q" as const, label: `“${f.q.trim()}”` },
    f.type !== "all" && { key: "type" as const, label: types.find((t) => t.value === f.type)?.label ?? f.type },
    f.cat !== "all" && { key: "cat" as const, label: f.cat },
  ].filter(Boolean) as { key: keyof Filters; label: string }[];
  const empty = !base.length;

  return (
    <div>
      {/* Hero with search */}
      <section data-surface="dark" aria-labelledby="discover-title" className="bg-brand-panel relative mb-5 overflow-hidden rounded-[24px] p-5 text-on-dark sm:p-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-lime"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Discover</p>
            <h1 id="discover-title" className="mt-2 max-w-xl text-2xl leading-tight sm:text-[34px]">Find your next course, ebook or coach</h1>
            <p className="mt-2 max-w-lg text-sm text-on-dark-muted sm:text-[15px]">Learn from Enski creators. Buy once and it lives in your library.</p>
            <form role="search" aria-label="Search resources" onSubmit={(e) => e.preventDefault()} className="relative mt-5 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cobalt" aria-hidden="true" />
              <Input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search resources or creators" aria-label="Search resources or creators" className="h-12 rounded-full border-transparent bg-card pl-12 pr-12 text-[15px] text-foreground shadow-lg" />
              {f.q && <button type="button" onClick={() => set("q", "")} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-soft hover:text-foreground"><X className="h-4 w-4" /></button>}
            </form>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="What you get with Enski resources">
              {[[InfinityIcon, "Buy once, keep it"], [BookOpen, "Courses, ebooks and more"], [Award, "Earn certificates"]].map(([Icon, label]) => {
                const I = Icon as typeof BookOpen;
                return <li key={label as string} className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-2.5 py-1 text-xs font-bold ring-1 ring-on-dark/15 sm:px-3 sm:py-1.5 sm:text-[13px]"><I className="h-3.5 w-3.5 text-lime" aria-hidden="true" />{label as string}</li>;
              })}
            </ul>
          </div>
          <div className="relative hidden h-52 lg:block" aria-hidden="true">
            <div className="absolute inset-x-6 inset-y-4 rotate-6 rounded-[24px] border border-on-dark/15 bg-on-dark/5" />
            <div className="absolute inset-x-2 inset-y-2 grid grid-cols-2 place-items-center gap-2 rounded-[24px] border border-on-dark/20 bg-on-dark/10 p-4 backdrop-blur-md">
              {types.map((t) => <BrandIcon key={t.value} src={t.art} className="h-16 w-16 drop-shadow-xl" />)}
            </div>
          </div>
        </div>
      </section>

      {/* Showing + library */}
      <div className="mb-5 flex items-center justify-between gap-2">
        <PreviewSwitch value={show} onChange={setShow} liveLabel="Live resources" liveCount={publishedResources.length} previewCount={previewList.length} className="min-w-0 flex-1 sm:max-w-xs" />
        <Button variant="quiet" onClick={onOpenLibrary} className="h-12 shrink-0 px-4"><Library aria-hidden="true" /><span className="sr-only sm:not-sr-only">My library</span><span className="chip-count rounded-full bg-soft px-1.5 text-[11px] font-extrabold tabular-nums text-muted-foreground">{ownedCount}</span></Button>
      </div>

      {empty ? (
        <div className="surface">
          <EmptyState icon={BookOpen} title="No resources yet" description="Creators haven't published any courses, ebooks or templates yet. New resources will show up here as soon as they go live." action={<>
            <Button variant="soft" onClick={() => setShow("preview")}><Eye /> Open preview pages</Button>
            <Button asChild variant="outline"><Link to="/learner/events"><CalendarDays /> Browse events</Link></Button>
          </>} />
        </div>
      ) : (
        <>
          {/* Browse by type */}
          <section aria-labelledby="types-title" className="mb-5">
            <h2 id="types-title" className="mb-3 flex items-center gap-2.5 text-base font-extrabold sm:text-lg"><span className="lime-tick" aria-hidden="true" />Browse by type</h2>
            <div className="grid grid-cols-4 gap-2 sm:gap-3" role="group" aria-label="Resource type">
              {types.map((t) => {
                const on = f.type === t.value;
                const n = typeCount(t.value);
                return (
                  <button key={t.value} type="button" aria-pressed={on} onClick={() => set("type", on ? "all" : t.value)}
                    className={cn("surface group relative flex min-w-0 flex-col items-center gap-1.5 px-1.5 py-3 text-center transition-[border-color,background-color,transform] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:flex-row sm:gap-3 sm:px-4 sm:py-3.5 sm:text-left",
                      on ? "border-cobalt bg-ice/70" : "hover:border-cobalt-100")}>
                    <BrandIcon src={t.art} className="h-10 w-10 sm:h-12 sm:w-12" />
                    <span className="min-w-0 sm:flex-1">
                      <span className={cn("block truncate text-[13px] font-extrabold sm:text-sm", on && "text-cobalt")}>{t.label}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">{n} {n === 1 ? "item" : "items"}</span>
                    </span>
                    {on && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime shadow-[0_0_8px_var(--lime)]" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Topic + sort */}
          <section aria-label="Filter resources" className="mb-4">
            <div>
              <SectionDropdown heading="Topic" value={f.cat} onChange={(v) => set("cat", v)} options={["all", ...categories].map((c) => ({ value: c, label: c === "all" ? "All topics" : c, count: catCount(c) }))} className="md:hidden" />
              <div className="hidden flex-wrap gap-2 md:flex" role="group" aria-label="Topic">
                {["all", ...categories].map((c) => (
                  <button key={c} type="button" onClick={() => set("cat", c)} aria-pressed={f.cat === c} className={cn("lime-pip inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors", f.cat === c ? "border-cobalt bg-cobalt text-primary-foreground" : "bg-card hover:border-cobalt hover:text-cobalt")}>
                    {c === "all" ? "All topics" : c}
                    <span className="chip-count rounded-full bg-soft px-1.5 text-[11px] font-extrabold tabular-nums text-muted-foreground">{catCount(c)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Results */}
          <section aria-labelledby="results-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="results-title" className="flex min-w-0 items-center gap-2.5 text-base font-extrabold sm:text-lg" aria-live="polite">
                <span className="lime-tick" aria-hidden="true" />
                <span className="truncate">{show === "preview" ? "Preview pages" : "All resources"}</span>
                <span className="shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">· {list.length}</span>
              </h2>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-[13px] font-bold text-muted-foreground sm:inline" id="sort-label">Sort</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-10 w-40 bg-card sm:w-48" aria-label="Sort resources"><SelectValue /></SelectTrigger>
                  <SelectContent align="end">{sorts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className={cn("flex flex-wrap items-center gap-2", chips.length && "mb-3")}>
              {chips.map((c) => (
                <button key={c.key} type="button" onClick={() => set(c.key, c.key === "q" ? "" : "all")} className="inline-flex h-8 items-center gap-1 rounded-full border border-cobalt/30 bg-ice px-3 text-[13px] font-bold text-cobalt transition-colors hover:border-cobalt" aria-label={`Remove filter: ${c.label}`}>
                  {c.label}<X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ))}
              {chips.length > 1 && <button type="button" onClick={clear} className="h-8 rounded-full px-2 text-[13px] font-bold text-cobalt underline-offset-2 hover:underline">Clear all</button>}
            </div>
            {show === "preview" && <p className="-mt-1 mb-4 text-sm text-muted-foreground">Open any resource to see what's inside, then buy it to start learning.</p>}
            {list.length ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">{list.map((r) => <ResourceCard key={r.id} r={r} />)}</div>
            ) : (
              <div className="surface"><EmptyState icon={BookOpen} title="No resources match" description="Try another search or clear your filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} /></div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
