import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { posts } from "./data";
import { Reveal } from "./motion";

export function Insights() {
  return (
    <section id="insights" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sky-text">Resources</p>
            <h2 className="text-h2 mt-3 text-ink">
              Insights to help you <span className="text-brand">grow.</span>
            </h2>
            <p className="mt-4 text-[17px] text-muted-foreground">
              Articles, guides and stories that help you learn faster and build smarter.
            </p>
          </Reveal>
          <Button asChild variant="link" className="h-auto self-start sm:self-end">
            <Link to="/blog">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={i * 80} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="lift group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ice">
                  <img
                    src={p.image}
                    alt={p.imageAlt}
                    loading="lazy" decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-background text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[13px] font-semibold">
                  <span className="rounded-md bg-ice px-2 py-0.5 text-brand">{p.tag}</span>
                  <span className="text-muted-foreground">{p.read}</span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold leading-snug text-ink group-hover:text-brand">
                  {p.title}
                </h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
