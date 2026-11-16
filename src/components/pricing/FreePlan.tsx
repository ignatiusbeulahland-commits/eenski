import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";
import { links } from "@/components/site/data";
import { launchTypes, whatYouGet } from "./content";

const tilts = [-3, 2, -2, 3, -1, 2];

export function FreePlan() {
  return (
    <section id="free-plan" className="bg-background pb-20 pt-10 lg:pb-28 lg:pt-16">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-brand">Free forever plan</p>
          <h2 className="mt-4 text-[2.5rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink lg:text-[3.5rem]">
            <span className="block">
              <span className="text-brand">Start</span> for free.
            </span>
            <span className="block">
              <span className="text-brand">Create</span> for free.
            </span>
            <span className="block">
              <span className="text-brand">Sell</span> for free.
            </span>
          </h2>
          <p className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-muted-foreground lg:text-lg">
            You get every essential tool you need to launch your course or digital product in minutes without paying a
            kobo upfront.
          </p>

          <p className="mt-10 text-[15px] font-extrabold text-ink">Perfect for creators launching:</p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {launchTypes.map((t, i) => (
              <li
                key={t.label}
                className="glass-chip lift flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[15px] font-extrabold text-ink"
                style={{ rotate: `${tilts[i]}deg` }}
              >
                <Icon3D name={t.icon} className="-my-2 size-11" />
                {t.label}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="relative pt-10 lg:pt-6">
          <div className="relative rounded-[36px] bg-cobalt-light p-6 pt-10 text-primary-foreground shadow-float ring-1 ring-primary-foreground/10 md:p-10 md:pt-12">
            {/* Light from above: dots, sky glow and a soft top sheen */}
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
              <div className="absolute inset-0 bg-dots opacity-50" />
              <div className="absolute -right-28 -top-28 aspect-square w-[420px] rounded-full bg-glow-behind" />
              <div className="absolute -bottom-40 -left-32 aspect-square w-[380px] rounded-full bg-glow-behind opacity-60" />
              <div className="absolute inset-x-10 top-0 h-px bg-primary-foreground/40" />
            </div>

            {/* The three-star 3D prop, floating out of the card */}
            <div className="pointer-events-none absolute -top-14 right-4 md:-top-16 md:right-8" aria-hidden="true">
              <div className="absolute inset-[-30%] rounded-full bg-glow-behind" />
              <Icon3D
                name="stars"
                className="relative size-28 rotate-6 animate-bob drop-shadow-[0_18px_24px_color-mix(in_oklab,var(--midnight)_45%,transparent)] md:size-36"
              />
            </div>

            <div className="relative">
              <h3 className="text-[2rem] font-extrabold leading-tight tracking-[-0.02em] md:text-[2.5rem]">
                What you get
              </h3>

              <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {whatYouGet.map((f) =>
                  f.comingSoon ? (
                    <li
                      key={f.label}
                      className="flex items-center gap-3 rounded-2xl border border-dashed border-lime/60 bg-primary-foreground/5 px-3.5 py-3 text-[15px] font-semibold leading-snug"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-lime/70 text-lime">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span className="flex flex-1 flex-col items-start gap-1.5">
                        {f.label}
                        <span className="inline-flex items-center rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-extrabold text-midnight">
                          Coming soon
                        </span>
                      </span>
                    </li>
                  ) : (
                    <li
                      key={f.label}
                      className="glass-dark lift flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-semibold leading-snug"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime text-midnight shadow-[0_6px_14px_-6px_var(--lime)]">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span>{f.label}</span>
                    </li>
                  ),
                )}
              </ul>

              <Button asChild size="lg" variant="lime" className="mt-8 w-full">
                <a href={links.register}>
                  Start for free <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
