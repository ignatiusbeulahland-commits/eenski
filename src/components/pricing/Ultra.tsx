import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Headset,
  Lock,
  Mail,
  MessageCircle,
  Plug,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ultraImage } from "./creatorImages";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/motion";
import { cn } from "@/lib/utils";
import { ultraGroups } from "./content";
import { LeadFormDialog } from "./LeadFormDialog";

/** Glass chips that float around the creator. Labels are Ultra features, word for word. */
const orbit: { icon: LucideIcon; label: string; className: string; tilt: number; delay: number }[] = [
  { icon: MessageCircle, label: "WhatsApp Automations", className: "left-0 top-[46%] sm:left-[2%] sm:top-[18%] lg:left-[6%]", tilt: -6, delay: 0 },
  { icon: BarChart3, label: "Deep analytics + learner insights", className: "right-0 top-[10%] hidden sm:block lg:right-[4%]", tilt: 5, delay: 0.8 },
  { icon: Plug, label: "Advanced integrations", className: "left-[0%] bottom-[22%] hidden md:block lg:left-[10%]", tilt: 4, delay: 1.4 },
  { icon: Headset, label: "Priority support", className: "right-[2%] bottom-[30%] hidden md:block lg:right-[10%]", tilt: -4, delay: 0.4 },
];

export function Ultra() {
  return (
    <section id="ultra" className="relative overflow-hidden bg-midnight text-primary-foreground">
      {/* Light from above: soft sky glow behind the headline and the creator */}
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-[-18%] aspect-square w-[1100px] -translate-x-1/2 rounded-full bg-glow-behind opacity-60"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1200px] px-5 pt-20 lg:pt-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-on-blue/15 bg-on-blue/5 py-1.5 pl-4 pr-1.5 backdrop-blur">
            <span className="eyebrow text-sky-light">Enski Ultra</span>
            <span className="rounded-full bg-lime px-3 py-1 text-[12px] font-extrabold text-midnight">Coming soon</span>
          </div>
          <h2 className="text-h2 mt-6 lg:text-[3.25rem] lg:leading-[1.08]">
            For growing creators who want <span className="text-lime">more automation,</span> deeper insights, and
            advanced control.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-on-blue lg:text-lg">
            Unlock premium tools that help you scale faster, sell smarter, and 10x your earnings.
          </p>
          <LeadFormDialog kind="waitlist">
            <Button variant="lime" size="lg" className="mt-8 w-full sm:w-auto">
              Join the Pro waitlist <ArrowRight />
            </Button>
          </LeadFormDialog>
        </Reveal>

        {/* Stage: giant outlined wordmark, glowing ring, the creator and floating feature chips */}
        <div className="relative mx-auto mt-10 h-[420px] max-w-[980px] sm:h-[520px] lg:mt-6 lg:h-[600px]">
          <p
            aria-hidden="true"
            className="text-outline-light pointer-events-none absolute inset-x-0 top-[8%] select-none text-center text-[8rem] font-extrabold leading-none tracking-[-0.06em] sm:text-[13rem] lg:text-[17rem]"
          >
            ULTRA
          </p>
          <div
            className="absolute bottom-[-30%] left-1/2 aspect-square w-[520px] -translate-x-1/2 rounded-full border border-on-blue/10 sm:w-[700px]"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[-18%] left-1/2 aspect-square w-[360px] -translate-x-1/2 rounded-full border border-lime/25 sm:w-[480px]"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/2 aspect-square w-[420px] -translate-x-1/2 rounded-full bg-glow-behind sm:w-[620px]"
            aria-hidden="true"
          />
          <img
            {...ultraImage}
            alt="Smiling young creator in an Enski t-shirt and sky-blue shirt holding an open laptop"
            loading="lazy"
            decoding="async"
            className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
          />

          {orbit.map(({ icon: Icon, label, className, tilt, delay }) => (
            <div
              key={label}
              aria-hidden="true"
              className={cn("pointer-events-none absolute z-20 animate-float", className)}
              style={{ "--tilt": `${tilt}deg`, animationDelay: `${delay}s` } as React.CSSProperties}
            >
              <span className="glass-dark flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[13px] font-extrabold shadow-float sm:text-sm">
                <span className="grid size-8 place-items-center rounded-full bg-lime text-midnight">
                  <Icon className="size-4" strokeWidth={2.25} />
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </span>
            </div>
          ))}

          {/* Custom domain bar rises in front of the creator */}
          <div
            aria-hidden="true"
            className="absolute bottom-[6%] left-1/2 z-20 w-[min(92%,360px)] -translate-x-1/2 animate-float"
            style={{ "--tilt": "-2deg", animationDelay: "1s" } as React.CSSProperties}
          >
            <div className="flex items-center gap-2 rounded-full bg-card py-2 pl-2 pr-4 text-ink shadow-float">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ice text-brand">
                <Lock className="size-4" strokeWidth={2.25} />
              </span>
              <span className="truncate text-sm font-extrabold">understandingX.com</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight">
                <Globe className="size-3" /> Custom domain
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Three pillars, named after the promises in the headline */}
      <div className="relative z-10 -mt-px bg-midnight pb-20 lg:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-5 px-5 pt-4 md:grid-cols-3">
          {ultraGroups.map((g, i) => (
            <Reveal
              key={g.title}
              delay={i * 100}
              className="group relative overflow-hidden rounded-[28px] border border-on-blue/12 bg-on-blue/[0.04] p-6 transition-colors hover:border-lime/40 md:p-7"
            >
              <PillarVisual index={i} />
              <h3 className="mt-6 text-xl font-extrabold">
                {i === 0 ? <span className="text-lime">{g.title}</span> : g.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {g.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] font-semibold leading-snug text-on-blue">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime/15 text-lime">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Small illustrative previews (no figures) so each pillar shows what it does. */
function PillarVisual({ index }: { index: number }) {
  if (index === 0) {
    const steps: LucideIcon[] = [MessageCircle, Workflow, Mail];
    return (
      <div aria-hidden="true" className="flex h-24 items-center justify-between rounded-[20px] bg-cobalt-light px-5">
        {steps.map((Icon, i) => (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-[14px] shadow-float",
                i === 1 ? "bg-lime text-midnight" : "bg-card text-brand",
              )}
            >
              <Icon className="size-5" strokeWidth={2} />
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-0 flex-1 border-t-2 border-dashed border-on-blue/40" />}
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    const bars = [38, 52, 44, 66, 58, 80, 92];
    return (
      <div aria-hidden="true" className="flex h-24 items-end gap-2 rounded-[20px] bg-cobalt-light px-5 pb-4 pt-5">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn("bar-grow flex-1 rounded-t-[6px]", i === bars.length - 1 ? "bg-lime" : "bg-sky-light/70")}
            style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="flex h-24 flex-col justify-center gap-2.5 rounded-[20px] bg-cobalt-light px-5">
      <div className="flex items-center gap-2 rounded-full bg-card px-3 py-2 text-ink shadow-float">
        <Lock className="size-3.5 text-brand" strokeWidth={2.5} />
        <span className="truncate text-[13px] font-extrabold">understandingX.com</span>
      </div>
      <div className="flex gap-2">
        {[Plug, Globe, BarChart3].map((Icon, i) => (
          <span key={i} className="grid h-7 flex-1 place-items-center rounded-full bg-on-blue/12 text-lime">
            <Icon className="size-3.5" strokeWidth={2.25} />
          </span>
        ))}
      </div>
    </div>
  );
}
