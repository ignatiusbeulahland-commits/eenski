import { useRef, useState, type KeyboardEvent, type ReactNode, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CreatorProfile } from "@/lib/dreamverse/creators";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { CreatorAvatar } from "./CreatorAvatar";

/** Clamp a deck move so the arrows stop at the first and last card (no wrap-around). */
export function stepDeck(index: number, delta: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(index + delta, 0), total - 1);
}

/** Stacked-card pose: the next cards peek from the right, the previous one slides away to the left. */
export function deckPose(offset: number) {
  const abs = Math.abs(offset);
  if (offset === 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, z: 30 };
  if (offset > 0) return { x: 28 * offset, y: 14 * offset, scale: 1 - 0.06 * offset, rotate: 2 * offset, opacity: abs > 2 ? 0 : offset === 1 ? 0.9 : 0.55, z: 30 - abs };
  return { x: -140 * abs, y: -10 * abs, scale: 1 - 0.06 * abs, rotate: -6 * abs, opacity: 0, z: 30 - abs };
}

type CreatorDeckProps = {
  creators: CreatorProfile[];
  renderCard: (creator: CreatorProfile, index: number) => ReactNode;
};

/** Farmora-style "cut in" deck: one creator at a time, arrows / swipe / keys bring the next card in. */
export function CreatorDeck({ creators, renderCard }: CreatorDeckProps) {
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  const total = creators.length;
  const index = Math.min(i, Math.max(total - 1, 0));
  const active = creators[index];
  const go = (delta: number) => setI((v) => stepDeck(v, delta, total));
  const upNext = creators.slice(index + 1, index + 4);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };
  const onTouchStart = (e: TouchEvent) => { touch.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e: TouchEvent) => {
    if (touch.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touch.current) - touch.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  if (!active) return null;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div className="order-2 hidden lg:order-1 lg:block">
        <p className="text-sm font-bold text-brand">Now in the circle</p>
        <p className="mt-2 flex items-baseline gap-2 font-extrabold text-ink" aria-hidden="true">
          <span key={index} className="animate-rise text-7xl leading-none tracking-normal sm:text-8xl">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-2xl text-muted-foreground">/ {String(total).padStart(2, "0")}</span>
        </p>
        <div key={active.slug} aria-live="polite" className="animate-rise mt-5">
          <h4 className="text-2xl leading-snug font-extrabold tracking-normal text-ink">{active.name}</h4>
          <p className="mt-2 max-w-md text-base leading-relaxed text-muted-foreground">{active.headline ?? "A new voice to discover."}</p>
        </div>
        {upNext.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-bold text-muted-foreground">Up next</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {upNext.map((c, n) => (
                <li key={c.slug}>
                  <button type="button" onClick={() => setI(index + n + 1)} className="group flex w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-brand">
                    <CreatorAvatar name={c.name} src={c.avatar} size="sm" className="size-10" />
                    <span className="flex-1 text-sm font-extrabold text-ink group-hover:text-brand">{c.name}</span>
                    <ChevronRight className="size-4 text-brand transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="order-1 lg:order-2">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Creator circle"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative mx-auto w-full max-w-md touch-pan-y select-none pr-14 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:pr-16"
        >
          <div className="relative h-[420px]">
            {creators.map((creator, n) => {
              const offset = n - index;
              if (Math.abs(offset) > 3) return null;
              const pose = deckPose(offset);
              const isActive = offset === 0;
              return (
                <div
                  key={creator.slug}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  aria-roledescription="slide"
                  aria-label={`${n + 1} of ${total}: ${creator.name}`}
                  className="absolute inset-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
                  style={{
                    transform: `translate3d(${pose.x}px, ${pose.y}px, 0) scale(${pose.scale}) rotate(${pose.rotate}deg)`,
                    opacity: pose.opacity,
                    zIndex: pose.z,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  {renderCard(creator, n)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-md items-center gap-4">
          <Button type="button" variant="outline" size="icon-sm" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous creator"><ChevronLeft aria-hidden /></Button>
          <div className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
            <p className="mt-2 text-center text-xs font-bold text-muted-foreground">Creator {index + 1} of {total}</p>
          </div>
          <Button type="button" variant={index === total - 1 ? "outline" : "default"} size="icon-sm" onClick={() => go(1)} disabled={index === total - 1} aria-label="Next creator"><ChevronRight aria-hidden /></Button>
        </div>
      </div>
    </div>
  );
}
