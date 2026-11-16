import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/dreamverse/button";
import { TYPE_LABELS, productKey } from "@/lib/dreamverse/catalog";
import type { Product, ResourceType } from "@/lib/dreamverse/types";
import { ENSKI } from "@/lib/enski-links";
import { cn } from "@/lib/utils";

import { HeroSlides } from "./HeroSlides";
import { Icon3D, type Icon3DName } from "./icons3d";
import { Price } from "./Price";

// 3D props from the main Enski site's set, one per resource type.
const TYPE_ICON: Record<ResourceType, Icon3DName> = {
  course: "ebook",
  ebook: "ebook",
  digital_product: "salespage",
  live_training: "video",
  coaching: "chat",
  gig: "megaphone",
};

/** Floating pill around the people, styled like the main Enski and Enski Stays heroes. */
function FloatChip({
  children,
  className,
  tilt = "0deg",
  fast = false,
  solid = false,
}: {
  children: ReactNode;
  className?: string | undefined;
  tilt?: string | undefined;
  fast?: boolean | undefined;
  solid?: boolean | undefined;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2",
        solid ? "bg-card text-ink shadow-float" : "glass-on-blue text-on-blue shadow-float",
        fast ? "animate-float-fast" : "animate-float-slow",
        className,
      )}
      style={{ ["--tilt" as string]: tilt }}
    >
      {children}
    </div>
  );
}

export function Hero({ products, spotlight }: { products: Product[]; spotlight: Product | null }) {
  // The two resource types with the most listings, with their real counts.
  const counts = new Map<ResourceType, number>();
  for (const p of products) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
  const topTypes = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-cobalt-light pt-[72px] text-on-blue">
      <div aria-hidden className="texture-dots absolute inset-0 -z-10 opacity-60" />
      {/* Soft studio glow behind the people (kept faint so the photos stand out) */}
      <div
        aria-hidden
        className="halo-sky absolute top-[38%] -right-40 -z-10 size-[520px] rounded-full opacity-30 md:top-16 md:right-[-60px] md:size-[680px] lg:right-0"
      />

      <div className="container-page grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div className="relative z-10 pt-12 pb-8 md:pt-16 lg:pt-24 lg:pb-36">
          <p className="dv-eyebrow animate-rise text-lime">Dreamverse by Enski</p>
          <h1 id="hero-title" className="dv-display mt-5 max-w-[13ch] animate-rise [animation-delay:80ms]">
            Your next <span className="text-lime">big dream</span> starts here.
          </h1>
          <p className="mt-6 max-w-[520px] animate-rise text-[17px] leading-[1.6] font-medium text-on-blue/85 [animation-delay:160ms] sm:text-lg">
            Discover courses, digital resources, expert coaching and experiences created to help you learn new
            skills, grow your career and bring your dreams to life.
          </p>
          <div className="mt-9 flex animate-rise flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <Button asChild variant="lime" size="lg">
              <a href="#marketplace">
                Explore resources <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline-on-blue" size="lg">
              <a href={ENSKI.register}>Become a creator</a>
            </Button>
          </div>
          <p className="mt-10 animate-rise text-sm font-bold tracking-wide text-on-blue/90 [animation-delay:320ms]">
            Discover. Learn. Grow. <em className="text-lime">Become.</em> Earn.
          </p>
        </div>

        {/* People + floating props */}
        {/* On phones the photo starts 48px lower so the chips sit above the heads, and the photo fits the screen width */}
        <div className="relative z-0 -mt-2 h-[430px] sm:h-[500px] lg:mt-0 lg:h-auto">
          <div
            aria-hidden
            className="absolute top-[8%] left-1/2 aspect-square w-[min(92%,520px)] -translate-x-1/2 rounded-full border border-on-blue/15 lg:top-[14%]"
          />
          <HeroSlides className="top-12 sm:top-0" />

          {products.length > 0 && (
            <FloatChip className="top-0 left-0 sm:top-8 sm:left-4 lg:top-32 lg:left-[-28px]" tilt="-4deg">
              <Icon3D name="stars" eager className="-my-2 size-11" />
              <span>
                <span className="block text-xs font-semibold text-on-blue/75">On Dreamverse</span>
                <span className="block text-[15px] font-extrabold">
                  {products.length} {products.length === 1 ? "resource" : "resources"}
                </span>
              </span>
            </FloatChip>
          )}

          {topTypes[0] && (
            <FloatChip solid fast className="top-1 right-0 sm:top-28 sm:right-4 lg:top-52 lg:right-[-12px]" tilt="3deg">
              <Icon3D name={TYPE_ICON[topTypes[0][0]]} eager className="-my-2 size-10" />
              <span>
                <span className="block text-sm font-extrabold">{TYPE_LABELS[topTypes[0][0]].plural}</span>
                <span className="block text-xs font-semibold text-muted-foreground">{topTypes[0][1]} listed</span>
              </span>
            </FloatChip>
          )}

          {topTypes[1] && (
            <FloatChip
              solid
              className="bottom-36 left-0 hidden sm:left-8 sm:flex lg:bottom-48 lg:left-[-8px]"
              tilt="2deg"
            >
              <Icon3D name={TYPE_ICON[topTypes[1][0]]} eager className="-my-2 size-10" />
              <span>
                <span className="block text-sm font-extrabold">{TYPE_LABELS[topTypes[1][0]].plural}</span>
                <span className="block text-xs font-semibold text-muted-foreground">{topTypes[1][1]} listed</span>
              </span>
            </FloatChip>
          )}

          {spotlight && (
            <Link
              to="/dreamverse/$slug"
              params={{ slug: productKey(spotlight) }}
              className="animate-float-slow absolute right-0 bottom-12 z-10 flex w-[232px] sm:bottom-20 sm:w-[248px] items-center gap-3 rounded-[22px] bg-card p-2.5 pr-4 text-ink shadow-float transition-shadow hover:shadow-card sm:right-6 lg:right-[-16px] lg:bottom-28"
              style={{ ["--tilt" as string]: "-2deg" }}
            >
              <Icon3D name="flame" eager className="size-11 shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs font-extrabold text-brand">Trending</span>
                <span className="block truncate text-sm font-extrabold">{spotlight.title}</span>
                <Price price={spotlight.price} className="[&>span:first-child]:text-sm" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Soft curve into the page, like the other Enski heroes */}
      <div aria-hidden className="relative h-10 rounded-t-[40px] bg-background md:h-14 md:rounded-t-[56px]" />
    </section>
  );
}
