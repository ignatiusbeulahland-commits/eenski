import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Check, Cpu, GraduationCap, LayoutGrid, Lightbulb, Link2, PackageSearch, Palette, Search, Share2, Target, TrendingUp, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CharmFigure } from "@/components/assistant/CharmFigure";
import { lookFor } from "@/components/assistant/looks";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { Input } from "@/components/dashboard-ui/input";
import { Button } from "@/components/dashboard-ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { Skeleton } from "@/components/dashboard-ui/skeleton";
import { EmptyState, ErrorState } from "@/components/affiliate/ui";
import { CommissionChip, EarningsTiles } from "@/components/affiliate/promote/parts";
import { prefsStore } from "@/lib/assistant/store";
import { categories, estCommission, naira, products, rateFor, topRate, type Product } from "@/lib/affiliate/products";
import { useAffiliate } from "@/lib/affiliate/store";
import { cn } from "@/lib/utils";

const catIcon: Record<string, LucideIcon> = { All: LayoutGrid, Tech: Cpu, Business: Briefcase, Career: GraduationCap, Design: Palette, Creativity: Lightbulb };
const SORTS = [
  ["featured", "Featured"],
  ["rate", "Highest commission"],
  ["earn", "Highest earnings per sale"],
  ["low", "Price: low to high"],
  ["high", "Price: high to low"],
] as const;

/** Sorts the market the way the affiliate chose. */
export function sortProducts(list: Product[], sort: string): Product[] {
  if (sort === "rate") return [...list].sort((a, b) => rateFor(b) - rateFor(a) || estCommission(b) - estCommission(a));
  if (sort === "earn") return [...list].sort((a, b) => estCommission(b) - estCommission(a));
  if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
  return list;
}

/** Step 1 of promoting: discover products, with what each one pays at a glance. */
export function MarketPage() {
  const { state, update } = useAffiliate();
  const look = lookFor(prefsStore.use().look);
  const [mine, setMine] = useState(false);
  const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("featured");

  const load = (fail = false) => { setStatus("loading"); setTimeout(() => setStatus(fail ? "error" : "ok"), 650); };
  useEffect(() => { update({ visitedMarket: true }); load(new URLSearchParams(window.location.search).get("simulate") === "error"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const l = products.filter((p) => (cat === "All" || p.category === cat) && (type === "all" || p.type === type) && (p.title + p.creator + p.promise + p.category).toLowerCase().includes(term));
    return sortProducts(l, sort);
  }, [q, cat, type, sort]);

  const creators = new Set(products.map((p) => p.creator)).size;
  const count = (c: string) => products.filter((p) => (c === "All" || p.category === c) && (type === "all" || p.type === type)).length;
  const typeCount = (t: string) => products.filter((p) => (cat === "All" || p.category === cat) && (t === "all" || p.type === t)).length;
  const filtered = Boolean(q) || cat !== "All" || type !== "all" || mine;
  const shown = mine ? list.filter((p) => state.joined.includes(p.id)) : list;
  const spotlight = [...products].filter((p) => !state.joined.includes(p.id)).sort((a, b) => estCommission(b) - estCommission(a))[0];
  const grid = !filtered && spotlight ? shown.filter((p) => p.id !== spotlight.id) : shown;
  const clear = () => { setQ(""); setCat("All"); setType("all"); setMine(false); };
  return (
    <div>
      <section data-surface="dark" className="bg-brand-panel relative isolate mb-5 overflow-hidden rounded-[28px] p-5 text-primary-foreground sm:p-8 lg:pr-72">
        <span className="hero-dots" aria-hidden="true" />
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-lime"><span className="neon-dot is-live" aria-hidden="true" />Promote & earn</p>
        <h1 className="mt-2 max-w-2xl text-balance text-[26px] leading-tight sm:text-[36px]">
          Share work you believe in. <span className="text-lime">Earn up to {topRate()}%</span> on every qualifying sale.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">Courses and eBooks from Enski creators. Pick one, get your personal link and share it with your audience.</p>
        <div className="relative mt-5 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, topic or creator" className="h-12 rounded-full border-0 bg-card pl-11 pr-11 text-foreground shadow-lift" />
          {q && <Button variant="ghost" size="icon" onClick={() => setQ("")} className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full text-muted-foreground" aria-label="Clear search"><X className="h-4 w-4" /></Button>}
        </div>
        <dl className="mt-4 flex flex-wrap gap-2 text-xs">
          {([[products.length, "products"], [creators, "creators"], [`${topRate()}%`, "top commission"]] as const).map(([n, l]) => (
            <div key={l} className="flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1 ring-1 ring-on-dark/15"><dt className="order-2 text-on-dark-muted">{l}</dt><dd className="order-1 font-extrabold tabular-nums">{n}</dd></div>
          ))}
        </dl>
        <div className="pointer-events-none absolute bottom-0 right-6 hidden h-[88%] max-h-72 lg:block" aria-hidden="true">
          <span className="charm-pedestal" />
          <CharmFigure look={look} pose="point" then="idle" thenAfter={3000} className="relative h-full w-auto drop-shadow-[0_12px_18px_rgb(0_0_0/0.3)]" />
        </div>
      </section>

      <ol aria-label="How promoting works" className="mb-6 grid gap-2 sm:grid-cols-3">
        {([
          [Target, "Pick a product", "Choose something your audience will genuinely use."],
          [Link2, "Get your link", "One personal link per product. It stays the same."],
          [Share2, "Share and earn", "Earn commission on qualifying purchases through it."],
        ] as const).map(([Icon, t, d], i) => (
          <li key={t} className="flex items-start gap-3 rounded-[20px] border border-line bg-card p-3.5">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-ice text-cobalt">
              <Icon className="size-5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-midnight text-[10px] font-extrabold text-lime">{i + 1}</span>
            </span>
            <span className="min-w-0"><span className="block text-sm font-extrabold text-ink">{t}</span><span className="block text-xs text-muted-foreground">{d}</span></span>
          </li>
        ))}
      </ol>

      <SectionDropdown heading="Category" value={cat} onChange={setCat} options={["All", ...categories].map((c) => ({ value: c, label: c, icon: catIcon[c] ?? LayoutGrid, count: count(c) }))} className="mb-3 md:hidden" />
      <div className="mb-3 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Categories">
        {["All", ...categories].map((c) => {
          const Icon = catIcon[c] ?? LayoutGrid;
          return (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("shop-chip inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors", cat === c ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card text-foreground hover:border-cobalt-100 hover:text-cobalt")}>
              <Icon className="h-4 w-4" aria-hidden="true" />{c}
              <span className={cn("chip-count rounded-full px-1.5 text-[11px] tabular-nums", cat === c ? "bg-on-dark/20" : "bg-soft text-muted-foreground")}>{count(c)}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border bg-card p-1" role="group" aria-label="Product type">
          {([["all", "All"], ["Course", "Courses"], ["Ebook", "eBooks"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={type === v} onClick={() => setType(v)} className={cn("h-9 rounded-full px-3 text-xs font-extrabold transition-colors", type === v ? "bg-midnight text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}>{l} <span className="tabular-nums opacity-70">{typeCount(v)}</span></button>
          ))}
        </div>
        <button type="button" aria-pressed={mine} onClick={() => setMine((m) => !m)} className={cn("inline-flex h-11 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-xs font-extrabold transition-colors", mine ? "border-midnight bg-midnight text-lime" : "border-line bg-card text-muted-foreground hover:text-cobalt")}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />Promoting <span className="tabular-nums">{state.joined.length}</span>
        </button>
        <div className="w-full sm:ml-auto sm:w-auto">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort products" className="h-11 w-full rounded-full bg-card text-xs font-bold sm:w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>{SORTS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground" aria-live="polite">{status === "ok" ? `${shown.length} product${shown.length === 1 ? "" : "s"}${cat !== "All" ? ` in ${cat}` : ""}` : "Loading products…"}</p>
        {filtered && <button type="button" onClick={clear} className="min-h-9 text-xs font-extrabold text-cobalt hover:underline">Clear filters</button>}
      </div>

      {status === "loading" && <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="surface overflow-hidden"><Skeleton className="aspect-[4/3] rounded-none" /><div className="space-y-2 p-3 sm:p-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-2/3" /><Skeleton className="h-9 w-full rounded-full" /></div></div>)}</div>}
      {status === "error" && <div className="surface"><ErrorState title="The marketplace didn't load" onRetry={() => load(false)} /></div>}
      {status === "ok" && (shown.length ? (
        <>
          {!filtered && spotlight && <Spotlight product={spotlight} />}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{grid.map((p) => <PromoteCard key={p.id} product={p} promoting={state.joined.includes(p.id)} />)}</div>
        </>
      ) : (
        <div className="surface"><EmptyState icon={PackageSearch} title={mine && !state.joined.length ? "You're not promoting anything yet" : "No products match your search"} description={mine && !state.joined.length ? "Open any product and choose Promote product to get your link." : "Try a different keyword, or clear the filters to see the full catalogue."} action={<Button variant="outline" onClick={clear}>Clear filters</Button>} /></div>
      ))}
    </div>
  );
}

/** The best-paying product the affiliate isn't promoting yet, shown big. */
function Spotlight({ product: p }: { product: Product }) {
  return (
    <Link to="/affiliate/market/$productId" params={{ productId: p.id }} className="shop-card group mb-5 grid overflow-hidden rounded-[24px] border border-line bg-card shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted md:aspect-auto md:min-h-72">
        <img src={p.image} alt={p.imageAlt} className="shop-card-img absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/10 to-transparent" aria-hidden="true" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-midnight px-2.5 py-1 text-[11px] font-extrabold text-lime ring-1 ring-lime/40"><TrendingUp className="size-3" aria-hidden="true" />Top earner</span>
        <CommissionChip product={p} dark className="absolute bottom-3 left-3" />
      </div>
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-sky-text">{p.type === "Ebook" ? "eBook" : "Course"} · {p.category}</p>
        <h2 className="mt-1 text-balance text-xl font-extrabold leading-snug text-ink group-hover:text-cobalt sm:text-2xl">{p.title}</h2>
        <CreatorLine product={p} className="mt-2" />
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.promise}</p>
        <EarningsTiles product={p} className="mt-4" />
        <span className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cobalt px-6 text-[15px] font-extrabold text-primary-foreground transition-colors group-hover:bg-cobalt-hover sm:self-start">
          Promote product <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

function CreatorLine({ product: p, className }: { product: Product; className?: string }) {
  return (
    <p className={cn("flex min-w-0 items-center gap-2 text-xs text-muted-foreground", className)}>
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ice text-[10px] font-extrabold text-cobalt ring-1 ring-line" aria-hidden="true">{initials(p.creator)}</span>
      <span className="min-w-0 truncate"><span className="font-bold text-foreground">{p.creator}</span>{p.creatorRole && <span className="hidden sm:inline"> · {p.creatorRole}</span>}</span>
    </p>
  );
}

/** One product in the market: what it is, who made it, its price, what it pays and how to promote it. */
export function PromoteCard({ product: p, promoting }: { product: Product; promoting: boolean }) {
  return (
    <Link
      to="/affiliate/market/$productId"
      params={{ productId: p.id }}
      aria-label={`${p.title} by ${p.creator}. ${naira(p.price)}, ${rateFor(p)}% commission${promoting ? ", promoting" : ""}`}
      className={cn("shop-card surface group flex min-w-0 flex-col overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", promoting && "is-promoting")}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        <img src={p.image} alt={p.imageAlt} loading="lazy" className="shop-card-img h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-midnight/70 to-transparent" aria-hidden="true" />
        <span className="absolute left-2 top-2 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-extrabold text-foreground shadow-sm sm:left-3 sm:top-3">{p.type === "Ebook" ? "eBook" : "Course"}</span>
        {promoting && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight shadow-sm sm:right-3 sm:top-3"><Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />Promoting</span>}
        <CommissionChip product={p} dark className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-text sm:text-[11px]">{p.category}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[13px] font-extrabold leading-snug text-ink group-hover:text-cobalt sm:min-h-[2.75rem] sm:text-[15px]">{p.title}</h3>
        <CreatorLine product={p} className="mt-1.5" />
        <p className="mt-2 hidden line-clamp-2 text-[13px] leading-5 text-muted-foreground sm:block">{p.promise}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-dashed border-line pt-2.5 sm:mt-3">
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Price</span>
            <span className="block truncate text-[13px] font-extrabold tabular-nums text-ink sm:text-base">{naira(p.price)}</span>
          </span>
          <span className="min-w-0 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">You earn</span>
            <span className="block truncate text-[13px] font-extrabold tabular-nums text-brand sm:text-base">≈ {naira(estCommission(p))}</span>
          </span>
        </div>
        <span className={cn("mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition-colors sm:text-sm", promoting ? "border-[1.5px] border-line bg-card text-brand group-hover:border-sky" : "bg-cobalt text-primary-foreground group-hover:bg-cobalt-hover")} aria-hidden="true">
          {promoting ? <><Link2 className="size-4" />View your link</> : <>Promote product</>}
        </span>
      </div>
    </Link>
  );
}
