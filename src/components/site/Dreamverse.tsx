import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories, featuredProducts, products } from "./data";
import { fromShowcase } from "@/components/shop/adapters";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { Reveal } from "./motion";

export function Dreamverse() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const list = useMemo(
    () => (active === "All" ? featuredProducts : products.filter((p) => p.category === active).slice(0, 8)).map(fromShowcase),
    [active],
  );

  return (
    <section id="dreamverse" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sky-text">The marketplace</p>
            <h2 className="text-h2 mt-3 text-ink">
              Explore the <span className="text-brand">Dreamverse.</span>
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              Practical resources from Africa's strongest voices in tech, careers, business and
              digital creativity, helping you build the skills your dreams demand.
            </p>
          </Reveal>
          <Button asChild variant="link" className="hidden h-auto self-start lg:inline-flex lg:self-end">
            <Link to="/courses">
              See all {products.length} courses <ArrowRight />
            </Link>
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Filter by category"
          className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]"
        >
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "h-10 shrink-0 rounded-full px-5 text-sm font-extrabold transition-colors",
                active === c ? "bg-cobalt text-primary-foreground" : "bg-ice text-brand hover:bg-sky-200",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <Reveal key={active} className="mt-8">
          <ShopGrid items={list} />
        </Reveal>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to="/courses" search={active === "All" ? {} : { category: active }}>
              Tap to see more <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
