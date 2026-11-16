import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/dashboard-ui/button";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { usd, STYLES } from "@/lib/creator/universe/rules";
import { Character, Emblem } from "./Character";
import { showcase } from "@/lib/creator/universe/showroom";
export function Journey({ full = false }: { full?: boolean }) {
  const { universe: u, progress: p } = useUniverse();
  const shown = showcase(u).dashboard;
  const shownStyle = shown?.style ?? u.style;
  const style = STYLES.find((s) => s.id === shownStyle);
  return (
    <section
      className={`universe-stage accent-${u.accent} ${full ? "universe-hero" : "mt-6"}`}
      aria-label="Your Creator Journey"
    >
      <div className="universe-stage-lines" aria-hidden="true" />
      <div className="relative z-10 px-4 pt-4 sm:px-8 sm:pt-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime">
          <BrandMark className="h-4 w-4" />
          {full ? "Enski Creator Universe" : "Your Creator Journey"}
        </p>
        {full && (
          <h1 className="mt-2 max-w-xl text-[22px] leading-tight sm:mt-3 sm:text-4xl">
            Your creator milestones
          </h1>
        )}
        <p className="mt-1.5 text-[13px] text-on-dark-muted max-sm:hidden sm:mt-2 sm:text-sm">
          Each milestone you reach brings your character's next evolution.
        </p>
      </div>
      <div className="universe-journey-grid relative z-10 px-4 pb-4 sm:px-8 md:pb-7">
        <div className="universe-display [grid-area:char]">
          <span className="universe-watermark" aria-hidden="true">
            {String(p.level).padStart(2, "0")}
          </span>
          <Character
            style={shownStyle}
            level={shown?.level ?? p.level}
            priority
            className="relative z-10 universe-float"
          />
          <p className="relative z-10 text-center text-[11px] font-semibold leading-tight text-on-dark-muted md:text-xs">
            {u.alias || style?.persona} · {style?.label}
          </p>
        </div>
        <div className="universe-journey-head min-w-0 py-3 [grid-area:head] md:pl-6 md:pt-5 md:pb-0">
          <div className="flex items-center gap-2.5 md:gap-3">
            <Emblem level={Math.max(1, p.level)} on={p.level > 0} className="max-md:h-10 max-md:w-9" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-tight text-on-dark-muted md:text-xs">
                {p.level ? `Level ${p.level} · milestone` : "Starter · your story begins"}
              </p>
              <h2 className="mt-1 text-xl leading-tight md:text-3xl">{p.current?.title ?? "New horizons"}</h2>
            </div>
          </div>
          <p className="mt-3 text-xs text-on-dark-muted md:mt-5">Eligible earnings · USD</p>
          <p className="mt-0.5 text-xl font-extrabold tabular-nums md:mt-1 md:text-2xl">{usd(p.amount)}</p>
        </div>
        <div className="universe-journey-rest min-w-0 pb-3 pt-2 [grid-area:rest] md:pl-6 md:pb-5 md:pt-0">
          <div className="md:mt-5">
            <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs">
              <span>
                {p.next
                  ? `Next: ${p.next.title} · ${usd(p.next.threshold)}`
                  : "Legend achieved"}
              </span>
              <span className="font-bold text-lime">{p.percent.toFixed(1)}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progress to next milestone"
              aria-valuenow={p.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-sidebar-accent"
            >
              <div
                className="h-full rounded-full bg-lime transition-all duration-700"
                style={{ width: `${p.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-on-dark-muted">
              {p.next
                ? `${usd(p.remaining)} remaining to ${p.next.title}`
                : "All nine evolutions unlocked"}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 md:mt-6">
            <Button asChild variant="lime" className="max-sm:w-full">
              <Link to={full ? "/creator/settings/character" : "/creator/milestones"}>
                {full ? "Personalise character" : "View Creator Journey"}
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-on-dark-muted sm:text-xs md:mt-4">
            {u.demoVerificationConfirmed
              ? "Official profile character"
              : "Official profile character pending verification"}
          </p>
        </div>
        {p.next && (
          <div className="min-w-0 border-t border-sidebar-border pt-3 text-left [grid-area:next] md:border-l md:border-t-0 md:pl-4 md:pt-0 md:text-center">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-on-dark-muted md:justify-center md:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />Next evolution
            </p>
            <div className="mt-1.5 flex items-center gap-3 md:mt-0 md:block">
              <span className="block h-12 w-12 shrink-0 md:my-3 md:h-auto md:w-full">
                <Character style={u.style} level={p.next.level} className="h-full w-full object-contain opacity-80 md:h-auto" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {p.next.title}
                  <ArrowRight className="ml-1 inline h-3 w-3" />
                </p>
                <p className="mt-0.5 text-xs text-on-dark-muted md:mt-1">Locked · {usd(p.next.threshold)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
