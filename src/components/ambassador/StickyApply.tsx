import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { links } from "@/components/site/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Phone/tablet-only Apply now bar. It slides up once the hero's Apply button has
 * scrolled away, and steps aside while the final "Apply now" section is on screen
 * so two Apply buttons never show at once.
 */
export function StickyApply({
  heroId,
  ctaId,
  href = links.apply,
  label = "Apply now",
  onClick,
}: {
  heroId: string;
  ctaId: string;
  href?: string;
  label?: string;
  /** When set, the bar is a button (e.g. opening the page's application form). */
  onClick?: () => void;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [ctaInView, setCtaInView] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const cta = document.getElementById(ctaId);
    if (!hero || !cta) return;
    const heroObs = new IntersectionObserver(([e]) => {
      if (e) setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0);
    });
    const ctaObs = new IntersectionObserver(([e]) => {
      if (e) setCtaInView(e.isIntersecting);
    });
    heroObs.observe(hero);
    ctaObs.observe(cta);
    return () => {
      heroObs.disconnect();
      ctaObs.disconnect();
    };
  }, [heroId, ctaId]);

  const show = pastHero && !ctaInView;

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-(--z-sticky) px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 motion-reduce:transition-none lg:hidden",
          "bg-gradient-to-t from-background via-background/90 to-transparent",
          show ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
        aria-hidden={!show}
        data-sticky-bottom={show ? "on" : "off"}
      >
        <Button variant="lime" size="lg" className="w-full shadow-float" asChild>
          {onClick ? (
            <button type="button" onClick={onClick} tabIndex={show ? 0 : -1} data-testid="sticky-apply">
              {label} <ArrowRight />
            </button>
          ) : (
            <a href={href} tabIndex={show ? 0 : -1} data-testid="sticky-apply">
              {label} <ArrowRight />
            </a>
          )}
        </Button>
      </div>
      {/* Keeps the bar from covering the very bottom of the footer */}
      <div className="h-24 lg:hidden" aria-hidden />
    </>
  );
}
