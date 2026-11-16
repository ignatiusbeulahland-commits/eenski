import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Layers, Users } from "lucide-react";
import artwork from "@/assets/courses/vibe-coding.webp";
import productArtwork from "@/assets/courses/product-management.webp";
import visibilityArtwork from "@/assets/courses/linkedin-visibility.webp";
import creativeArtwork from "@/assets/courses/product-design.webp";
import buildWithBeulah from "@/assets/dreamverse/build-with-beulah.webp";
import { Reveal } from "@/components/site/motion";
import { BEULAHLAND_SLUG, creatorDirectory, type CreatorProfile } from "@/lib/dreamverse/creators";
import type { Product } from "@/lib/dreamverse/types";
import { Button } from "./button";
import { CreatorAvatar } from "./CreatorAvatar";
import { CreatorDeck } from "./CreatorDeck";
import { CreatorStatusTag } from "./CreatorCard";

type View = "all" | "enski" | "nigeria";
const directoryArtwork = [artwork, productArtwork, visibilityArtwork, creativeArtwork];

export function CreatorDiscovery({ products }: { products: Product[] }) {
  const [view, setView] = useState<View>("all");
  const directory = creatorDirectory(products);
  const filtered = directory.filter((c) => view === "all" || (view === "enski" ? c.status === "enski" : c.region === "nigeria"));
  const liveCount = directory.filter((c) => c.status === "enski").length;

  return (
    <section id="nigerian-creators" aria-labelledby="nigerian-creators-title" className="scroll-mt-20">
      <div className="bg-cobalt text-on-blue">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
          <Reveal className="flex flex-col justify-center">
            <p className="flex items-center gap-2 text-sm font-bold text-sky-light"><AudioLines className="size-5" aria-hidden /> Popular Nigerian creators · Enski originals</p>
            <h2 id="nigerian-creators-title" className="mt-5 text-4xl leading-tight font-extrabold tracking-normal sm:text-5xl">Big ideas.<br />Real voices.<br /><span className="text-lime">Your next chapter.</span></h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-on-blue-muted">Meet the people turning what they know into what you can do. From Nigeria’s creative voices to the creators already building on Enski.</p>
            <div className="mt-7"><Button asChild variant="lime"><a href="#creator-directory">Meet the creators <ArrowDown aria-hidden /></a></Button></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-on-blue/20 pt-5 text-sm text-on-blue-muted">
              <span className="flex items-center gap-2"><Users className="size-4" aria-hidden /> {directory.length} creator profiles</span>
              <span className="flex items-center gap-2"><Layers className="size-4" aria-hidden /> {liveCount} on Enski</span>
            </div>
          </Reveal>
          <Reveal className="relative flex flex-col justify-center">
            <div className="relative">
              <img src={buildWithBeulah} alt="Build with Beulah logo" loading="lazy" decoding="async" width={800} height={800} className="aspect-[4/3] w-full rounded-lg object-cover shadow-float" />
              <span className="absolute -top-3 right-4 rotate-3 rounded-full bg-lime px-4 py-2 text-xs font-extrabold text-midnight">Builder spotlight</span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold text-sky-light">Ideas → products → possibilities</p><h3 className="mt-2 text-2xl font-extrabold tracking-normal">Beulahland Ignatius</h3><p className="mt-1 text-sm text-on-blue-muted">UI/UX Product Manager &amp; AI builder</p><p className="mt-2 text-xs text-on-blue-muted">Courses &amp; eBooks · Available now</p></div>
              <Button asChild variant="outline-on-blue" size="icon-sm"><Link to="/creators/$slug" params={{ slug: BEULAHLAND_SLUG }} aria-label="View Beulahland Ignatius’s profile"><ArrowRight aria-hidden /></Link></Button>
            </div>
          </Reveal>
        </div>
      </div>
      <div id="creator-directory" className="scroll-mt-24 bg-soft py-12 lg:py-16">
        <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-7 border-b border-line pb-8">
          <div className="max-w-2xl"><p className="flex items-center gap-2 text-sm font-bold text-brand"><span className="h-0.5 w-8 bg-brand" aria-hidden /> The creator circle</p><h3 className="mt-4 text-4xl leading-tight font-extrabold tracking-normal sm:text-5xl">Find your people.<br /><span className="text-brand">Fuel your next move.</span><ArrowUpRight className="ml-2 inline size-9 text-brand sm:size-12" aria-hidden /></h3><p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">The builders, thinkers and doers worth knowing. Find a voice that speaks to where you’re going.</p></div>
          <div className="flex items-center gap-3 pb-1"><span className="grid size-14 -rotate-6 place-items-center rounded-lg bg-cobalt text-lime"><Users className="size-7" aria-hidden /></span><div><p className="text-2xl font-extrabold text-ink">{directory.length}</p><p className="text-xs font-semibold text-muted-foreground">voices to discover</p></div></div>
        </Reveal>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter creators" className="flex max-w-full flex-wrap gap-1 rounded-full border border-line bg-card p-1">
            {([{ value: "all", label: "All creators" }, { value: "enski", label: "On Enski" }, { value: "nigeria", label: "Nigerian voices" }] as const).map((tab) => <Button key={tab.value} size="sm" variant={view === tab.value ? "default" : "ghost"} aria-pressed={view === tab.value} onClick={() => setView(tab.value)}>{tab.label}</Button>)}
          </div>
          <p className="flex items-center gap-2 text-xs font-bold text-brand"><AudioLines className="size-4" aria-hidden /> Different voices. Shared ambition.</p>
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">“On Enski” creators have listings in the current catalogue. Preview profiles are not confirmed partnerships; their resources remain marked as coming soon or draft.</p>
        <Reveal className="mt-10">
          {filtered.length > 0 ? <CreatorDeck key={view} creators={filtered} renderCard={(creator, i) => <DiscoveryCard creator={creator} products={products} index={i} />} /> : <p className="border-y border-line py-10 text-muted-foreground">No live creator listings are available right now.</p>}
        </Reveal>
        </div>
      </div>
    </section>
  );
}

function DiscoveryCard({ creator, products, index }: { creator: CreatorProfile; products: Product[]; index: number }) {
  const resources = products.filter((p) => p.creator?.slug === creator.slug);
  const skills = creator.expertise.length ? creator.expertise : [...new Set(resources.flatMap((p) => p.skills))];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-card transition-colors duration-300 hover:border-brand focus-within:ring-2 focus-within:ring-brand">
      <div className="relative h-40 shrink-0 overflow-hidden bg-cobalt">
        <img src={directoryArtwork[index % directoryArtwork.length]} alt="" loading="lazy" decoding="async" width={640} height={360} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none" />
        <span className="absolute left-4 top-4 rounded-full bg-cobalt px-3 py-1 text-xs font-extrabold text-on-blue">{String(index + 1).padStart(2, "0")} / Creator circle</span>
        <span className="absolute bottom-3 right-3 grid size-10 -rotate-6 place-items-center rounded-lg bg-lime text-midnight"><ArrowUpRight className="size-6" aria-hidden /></span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="relative -mt-7 flex items-end justify-between gap-3"><CreatorAvatar name={creator.name} src={creator.avatar} size="lg" className="size-16 border-4 border-card text-xl" /><div className="pb-1"><CreatorStatusTag status={creator.status} /></div></div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground">{creator.country ?? (creator.status === "enski" ? "Enski creator" : "Creator")}</p>
        <h4 className="mt-2 text-xl leading-snug font-extrabold tracking-normal text-ink"><Link to="/creators/$slug" params={{ slug: creator.slug }} className="after:absolute after:inset-0 focus-visible:outline-none">{creator.name}</Link></h4>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{creator.headline ?? resources[0]?.title ?? "A new voice to discover."}</p>
        {skills.length > 0 && <p className="mt-4 line-clamp-2 text-xs font-bold leading-relaxed text-brand">{skills.slice(0, 3).join(" · ")}</p>}
        <div className="mt-auto pt-5"><div className="flex items-center justify-between gap-2 border-t border-line pt-4 text-xs font-semibold text-muted-foreground"><span>{resources.length ? `${resources.length} ${creator.status === "enski" ? "resources" : "planned resources"}` : "Profile preview"}</span><span className="flex items-center gap-1 font-extrabold text-brand">Meet creator<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span></div></div>
      </div>
    </article>
  );
}