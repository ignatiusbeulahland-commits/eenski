import type { LucideIcon } from "lucide-react";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { ArrowLeft, ArrowRight, Clock, Search, SearchX, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { EmptyState } from "@/components/affiliate/ui";
import { BrandIcon, brandArtwork, iconArtwork } from "@/components/affiliate/BrandIcon";
import { cn } from "@/lib/utils";

/**
 * Guides and Help Centre layouts shared by Affiliate, Creator and Learner.
 * Presentation only: each role passes its own content and typed links.
 */

export type GuideCard = { id: string; title: string; summary: string; topic: string; minutes: number };
type LinkRender = (id: string, className: string, children: ReactNode) => ReactNode;

export const readMinutes = (text: string) => Math.max(2, Math.round(text.split(/\s+/).length / 180));

/** Picks matching 3D artwork for a guide or help topic by its wording. */
export function topicArt(topic: string) {
  const t = topic.toLowerCase();
  if (/payout|withdraw|wallet/.test(t)) return brandArtwork.payout;
  if (/earn|payout|money|wallet|commission|payment|purchase|billing|sale/.test(t)) return brandArtwork.cash;
  if (/link|share|promot|referr|affiliat/.test(t)) return brandArtwork.affiliations;
  if (/marketing|campaign|promo|growth|audience/.test(t)) return brandArtwork.megaphone;
  if (/market|store|product|shop/.test(t)) return brandArtwork.market;
  if (/track|perform|analytic|insight|report/.test(t)) return brandArtwork.analytics;
  if (/account|setting|profile|security/.test(t)) return brandArtwork.settings;
  if (/event|session|live|calendar|coach/.test(t)) return brandArtwork.calendar;
  if (/start|basic|launch|begin/.test(t)) return brandArtwork.overview;
  return brandArtwork.book;
}

export function GuideLibrary({ title, description, guides, link }: { title: string; description: string; guides: GuideCard[]; link: LinkRender }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("All");
  const topics = ["All", ...new Set(guides.map((g) => g.topic))];
  const list = guides.filter((g) => (topic === "All" || g.topic === topic) && (g.title + g.summary + g.topic).toLowerCase().includes(q.toLowerCase()));
  const [first, ...rest] = list;
  const minutes = guides.reduce((n, g) => n + g.minutes, 0);
  return (
    <div>
      <section data-surface="dark" className="bg-brand-panel relative mb-5 overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-8">
        <span className="hero-dots" aria-hidden="true" />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime"><span className="neon-dot" aria-hidden="true" />Knowledge centre</p>
            <h1 className="mt-2 text-2xl sm:text-[32px]">{title}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">{description}</p>
          </div>
          <BrandIcon src={brandArtwork.book} className="product-hero-art h-16 w-16 sm:h-28 sm:w-28" />
        </div>
        <div className="relative mt-5 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search guides" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guides" className="h-12 rounded-full border-0 bg-card pl-11 pr-11 text-foreground shadow-lift" />
          {q && <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground" aria-label="Clear search"><X className="h-4 w-4" /></button>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {[[guides.length, "guides"], [topics.length - 1, "topics"], [minutes, "min of reading"]].map(([n, l]) => (
            <span key={l} className="inline-flex items-center gap-1.5 rounded-full bg-on-dark/10 px-3 py-1 ring-1 ring-on-dark/15"><b className="tabular-nums">{n}</b><span className="text-on-dark-muted">{l}</span></span>
          ))}
        </div>
      </section>
      <SectionDropdown heading="Guide topic" value={topic} onChange={setTopic} options={topics.map((t) => ({ value: t, label: t, count: t === "All" ? guides.length : guides.filter((g) => g.topic === t).length }))} className="mb-5 md:hidden" />
      <div className="mb-5 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Guide topics">
        {topics.map((t) => {
          const n = t === "All" ? guides.length : guides.filter((g) => g.topic === t).length;
          return (
            <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={cn("shop-chip lime-pip inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors", topic === t ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-100 hover:text-cobalt")}>
              {t}<span className={cn("chip-count rounded-full px-1.5 text-[11px] tabular-nums", topic === t ? "bg-on-dark/20" : "bg-soft text-muted-foreground")}>{n}</span>
            </button>
          );
        })}
      </div>
      {!first ? (
        <div className="surface"><EmptyState icon={SearchX} title="No guides found" description="Try another search, or browse every guide." action={<Button variant="outline" onClick={() => { setQ(""); setTopic("All"); }}>Show all guides</Button>} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {link(first.id, "kc-card surface group relative flex flex-col overflow-hidden md:col-span-2 lg:row-span-2", (
            <>
              <div className="relative flex items-center justify-center bg-ice/70 px-6 py-8 sm:py-10">
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 text-[11px] font-extrabold text-midnight">{q || topic !== "All" ? "Top result" : "Start here"}</span>
                <BrandIcon src={topicArt(first.topic)} className="kc-art h-24 w-24 sm:h-28 sm:w-28" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-cobalt">{first.topic} · {first.minutes} min read</p>
                <h2 className="mt-2 text-xl leading-snug group-hover:text-cobalt sm:text-2xl">{first.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{first.summary}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-extrabold text-cobalt">Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </>
          ))}
          {rest.map((g) => (
            <div key={g.id} className="contents">
              {link(g.id, "kc-card surface group flex gap-4 p-4 sm:flex-col sm:p-5", (
                <>
                  <BrandIcon src={topicArt(g.topic)} className="kc-art h-12 w-12 sm:h-12 sm:w-12" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-sky-text">{g.topic}</span>
                    <span className="mt-1 font-extrabold leading-snug tracking-tight group-hover:text-cobalt">{g.title}</span>
                    <span className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{g.summary}</span>
                    <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{g.minutes} min read</span><ArrowRight className="h-4 w-4 text-cobalt transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuideArticleLayout({ topic, title, summary, minutes, children, next, footer }: {
  topic: string;
  title: string;
  summary: string;
  minutes: number;
  children: ReactNode;
  next?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl">
      <header className="settings-hero surface relative overflow-hidden p-5 sm:p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />{topic}</p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-3xl">{title}</h1>
          </div>
          <BrandIcon src={topicArt(topic)} className="h-14 w-14 sm:h-16 sm:w-16" />
        </div>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{summary}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted-foreground"><Clock className="h-3.5 w-3.5" />{minutes} min read</p>
        <div className="neon-rule absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />
      </header>
      <div className="mt-8 space-y-8 px-1">{children}</div>
      {footer && <div className="mt-10 flex flex-wrap gap-2">{footer}</div>}
      {next}
    </article>
  );
}

export const backLinkClass = "inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-cobalt";
export function BackLabel({ children }: { children: ReactNode }) {
  return <><ArrowLeft className="h-4 w-4" /> {children}</>;
}
export const nextGuideClass = "kc-card surface group mt-12 flex items-center justify-between gap-4 p-5";
export function NextGuideBody({ title }: { title: string }) {
  return (
    <>
      <div className="min-w-0"><p className="text-xs font-semibold text-muted-foreground">Next guide</p><p className="truncate font-bold group-hover:text-cobalt">{title}</p></div>
      <ArrowRight className="h-5 w-5 shrink-0 text-cobalt transition-transform group-hover:translate-x-1" />
    </>
  );
}

export function GuideSection({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <section>
      <h2 className="flex items-center gap-2.5 text-xl"><span className="h-5 w-1 shrink-0 rounded-full bg-lime" aria-hidden="true" />{heading}</h2>
      {paragraphs.map((p) => <p key={p} className="mt-3 text-[15px] leading-7 text-foreground/80">{p}</p>)}
    </section>
  );
}

export function HelpHero({ query, onQuery, title = "How can we help?", suggestions = [] }: { query: string; onQuery: (v: string) => void; title?: string; suggestions?: string[] }) {
  return (
    <section className="bg-brand-panel relative mb-5 overflow-hidden rounded-2xl px-5 py-7 text-center text-primary-foreground sm:py-10" data-surface="dark">
      <span className="hero-dots" aria-hidden="true" />
      <BrandIcon src={brandArtwork.help} className="product-hero-art mx-auto h-16 w-16 sm:h-20 sm:w-20" />
      <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime"><span className="neon-dot" aria-hidden="true" />Help centre</p>
      <h1 className="mt-1.5 text-2xl sm:text-3xl">{title}</h1>
      <div className="relative mx-auto mt-5 max-w-lg">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search help articles" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search help articles" className="h-12 rounded-full border-0 bg-card pl-11 pr-11 text-foreground shadow-lift" />
        {query && <button type="button" onClick={() => onQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground" aria-label="Clear search"><X className="h-4 w-4" /></button>}
      </div>
      {suggestions.length > 0 && (
        <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2 text-xs">
          <span className="py-1 text-on-dark-muted">Popular:</span>
          {suggestions.map((t) => <button key={t} type="button" onClick={() => onQuery(t)} className="rounded-full bg-on-dark/10 px-3 py-1 font-bold ring-1 ring-on-dark/15 hover:bg-on-dark/20">{t}</button>)}
        </div>
      )}
    </section>
  );
}

export function HelpCategoryTiles<T extends string>({ cats, active, onToggle }: { cats: { id: T; label: string; icon: LucideIcon; description?: string; count?: number }[]; active: T | null; onToggle: (id: T | null) => void }) {
  return (
    <div className={cn("mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3", cats.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")} role="group" aria-label="Help topics">
      {cats.map((c) => {
        const byTopic = topicArt(c.label);
        const art = byTopic !== brandArtwork.book ? byTopic : iconArtwork.get(c.icon) ?? byTopic;
        return (
          <button key={c.id} type="button" aria-pressed={active === c.id} onClick={() => onToggle(active === c.id ? null : c.id)} className="kc-tile kc-card surface group flex min-w-0 flex-col items-start gap-2.5 p-4 text-left">
            <BrandIcon src={art} className="kc-art h-11 w-11" />
            <span className="min-w-0 text-[13px] font-extrabold sm:text-sm">{c.label}</span>
            {c.count !== undefined && <span className="-mt-2 text-xs font-semibold text-muted-foreground">{c.count} article{c.count === 1 ? "" : "s"}</span>}
            {c.description && <span className="-mt-1.5 text-xs text-muted-foreground">{c.description}</span>}
          </button>
        );
      })}
    </div>
  );
}
